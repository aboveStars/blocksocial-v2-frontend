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
const bucket = admin
  .storage()
  .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { postDocPath } = req.body;

    if (!postDocPath) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }

    try {
      await firestore.doc(postDocPath).delete();

      // Delete NFT Metadata if this post has. THIS PROCESS SHOULD BE AUTOMATED
      const ps = await firestore.doc(postDocPath).get();
      const data = ps.data();

      if (data && data.nftUrl) {
        const metadataPath = `users/${postDocPath.split("/")[1]}/nftMetadatas/${
          postDocPath.split("/")[3]
        }`;

        const oldNftMetadataFile = bucket.file(metadataPath);
        await oldNftMetadataFile.delete();
      }

      res.status(200).json({});
    } catch (error) {
      console.error("Error while deleting doc", error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
