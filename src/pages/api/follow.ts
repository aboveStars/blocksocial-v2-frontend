import { NextApiRequest, NextApiResponse } from "next";

import * as admin from "firebase-admin";

const buffer = Buffer.from(
  process.env.NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS_BASE64 as string,
  "base64"
);

const decryptedService = buffer.toString("utf-8");
const decryptedServiceJson = JSON.parse(decryptedService);

const serviceAccount = decryptedServiceJson;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
const auth = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron } = req.headers;
  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const displayName = (await auth.getUser(uid)).displayName;

    let operationFromUsername = displayName;

    if (req.method === "POST") {
      const { operationTo: operationToUsername, opCode } = req.body;

      if (!operationFromUsername || !operationToUsername) {
        res.status(405).json({ error: "Missing Prop" });
        throw new Error("Missing Prop");
      }

      await firestore.doc(`users/${operationFromUsername}`).update({
        followingCount: admin.firestore.FieldValue.increment(opCode),
        followings:
          opCode === 1
            ? admin.firestore.FieldValue.arrayUnion(operationToUsername)
            : admin.firestore.FieldValue.arrayRemove(operationToUsername),
      });

      await firestore.doc(`users/${operationToUsername}`).update({
        followerCount: admin.firestore.FieldValue.increment(opCode),
        followers:
          opCode === 1
            ? admin.firestore.FieldValue.arrayUnion(operationFromUsername)
            : admin.firestore.FieldValue.arrayRemove(operationFromUsername),
      });
      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while follow operation:", error);
    return res.status(401).json({ error: error });
  }
}
