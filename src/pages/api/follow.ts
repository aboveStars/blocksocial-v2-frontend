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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      operationFrom: operationFromUsername,
      operationTo: operationToUsername,
      opCode,
    } = req.body;

    try {
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
    } catch (error) {
      console.error("Firebase Error while follow process", error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
