import getDisplayName from "@/apiUtils";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { unSeenNotificationsDocsIds } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  let updateNotificationDocsPromises = [];
  for (const unSeenNotificationDocId of unSeenNotificationsDocsIds) {
    updateNotificationDocsPromises.push(
      updateNotificationDoc(unSeenNotificationDocId, operationFromUsername)
    );
  }

  try {
    await Promise.all(updateNotificationDocsPromises);
  } catch (error) {
    console.error(
      "Error while seenNotification. (We were updating notification doc)",
      error
    );
    return res.status(502).json({ error: "Firebase Error" });
  }

  return res.status(200).json({});
}

async function updateNotificationDoc(
  docId: string,
  operationFromUsername: string
) {
  await firestore
    .doc(`users/${operationFromUsername}/notifications/${docId}`)
    .update({
      seen: true,
    });
}
