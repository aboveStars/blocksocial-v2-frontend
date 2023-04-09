import * as admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

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
    const { opCode, postDocPath, username: likerUsername } = req.body;
    if (!opCode || !postDocPath || !likerUsername) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }
    try {
      await firestore.doc(postDocPath).update({
        likeCount: admin.firestore.FieldValue.increment(opCode as number),
      });
      await firestore.doc(postDocPath).update({
        whoLiked:
          opCode === 1
            ? admin.firestore.FieldValue.arrayUnion(likerUsername)
            : admin.firestore.FieldValue.arrayRemove(likerUsername),
      });

      

      res.status(200).json({});
    } catch (error) {
      console.error(error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
