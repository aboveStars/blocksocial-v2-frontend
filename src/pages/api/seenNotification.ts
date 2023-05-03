import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, fieldValue, firestore } from "../../firebase/adminApp";

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

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await verifyToken(authorization as string);
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  let operationFromUsername = "";
  try {
    operationFromUsername = await getDisplayName(decodedToken);
  } catch (error) {
    console.error("Error while getting display name", error);
    return res.status(401).json({ error: "Unautorized" });
  }

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

/**
 * @param authorization
 * @returns
 */
async function verifyToken(authorization: string) {
  const idToken = authorization.split("Bearer ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  return decodedToken;
}

/**
 * @param decodedToken
 */
async function getDisplayName(decodedToken: DecodedIdToken) {
  const uid = decodedToken.uid;
  const displayName = (await auth.getUser(uid)).displayName;
  return displayName as string;
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
