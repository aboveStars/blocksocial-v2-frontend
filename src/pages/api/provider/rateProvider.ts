import getDisplayName from "@/apiUtils";
import { firestore } from "@/firebase/adminApp";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { score } = req.body;

  console.log(score);

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!score) return res.status(422).json({ error: "Invalid Prop or Props" });

  let provider;
  try {
    provider = (
      await firestore
        .doc(`users/${operationFromUsername}/provider/currentProvider`)
        .get()
    ).data()?.name;
  } catch (error) {
    console.error(
      "Error while updating rate. (We were looking for current provider of user.)",
      error
    );
    return res.status(503).json({ error: "Firebase Error" });
  }

  console.log(provider);

  // update current user doc
  try {
    await firestore
      .doc(`users/${operationFromUsername}/provider/currentProvider`)
      .update({
        userScore: score,
      });
  } catch (error) {
    console.error(
      "Error while rating provider. (We were updating current provide doc",
      error
    );
    return res.status(503).json({ error: "Firebase Error" });
  }

  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_TO_PROVIDER_PANEL_FOR_NORMAL_BLOCKSOCIAL}/client/takeRate`,
      {
        method: "POST",
        headers: {
          authorization: process.env
            .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: score,
          provider: provider,
          username: operationFromUsername,
        }),
      }
    );
  } catch (error) {
    console.error(
      "Error while rating provider. (We were fetching the getRate API...",
      error
    );
    return res.status(503).json({ error: "Internal Server Error" });
  }

  return res.status(200).json({});
}
