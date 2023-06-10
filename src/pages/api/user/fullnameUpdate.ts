import getDisplayName from "@/apiUtils";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { newRequestedUsername } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
  if (!fullnameRegex.test(newRequestedUsername)) {
    console.error(
      "Error while updating fullname. (fullname regex couldn't pass)"
    );
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`fullnameUpdateAPI-${operationFromUsername}`, async () => {
    try {
      await firestore.doc(`users/${operationFromUsername}`).update({
        fullname: newRequestedUsername,
      });
    } catch (error) {
      console.error(
        "Error while updating username. (We were updating userdoc)",
        error
      );
      return res.status(503).json({ error: "firebase error" });
    }

    return res.status(200).json({});
  });
}
