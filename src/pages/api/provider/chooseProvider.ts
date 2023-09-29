import getDisplayName from "@/apiUtils";

import { firestore } from "@/firebase/adminApp";
import AsyncLock from "async-lock";

import { NextApiRequest, NextApiResponse } from "next";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { providerName } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!providerName)
    return res.status(422).json({ error: "Invalid prop or props" });

  await lock.acquire(`chooseProvider-${operationFromUsername}`, async () => {
    let response;
    try {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT_TO_APIDON_PROVIDER_SERVER}/client/deal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: process.env
              .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
          },
          body: JSON.stringify({
            username: operationFromUsername,
            provider: providerName,
          }),
        }
      );
    } catch (error) {
      console.error("Error while fetching deal api", error);
      return res.status(503).json({ error: "Internal Server Error" });
    }

    if (!response.ok) {
      console.error("Error from deal api", await response.text());
      return res.status(503).json({ error: "Internal Server Error" });
    }

    const { dealResult } = await response.json();

    try {
      await firestore
        .doc(`users/${operationFromUsername}/provider/currentProvider`)
        .set({
          ...dealResult,
        });
    } catch (error) {
      console.error("Error while creating doc for choosen proivder", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    return res.status(200).json({});
  });
}
