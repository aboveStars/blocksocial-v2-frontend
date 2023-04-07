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
const bucket = admin.storage().bucket();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { username } = req.body;

    try {
      await firestore.doc(`users/${username}`).update({ profilePhoto: "" });
    } catch (error) {
      console.error("Error while deleting profilePhoto: ", error);
      res.status(500).json({ firebaseError: error });
    }
    res.status(200).json({ username: username });
  } else if (req.method === "POST") {
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
