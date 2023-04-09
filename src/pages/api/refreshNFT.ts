import { NFTMetadata } from "@/components/types/NFT";
import * as admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import safeJsonStringify from "safe-json-stringify";

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
  if (req.method === "POST") {
    const { username, postDocId } = req.body;

    if (!username || !postDocId) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }
    try {
      const oldMetadataFile = bucket.file(
        `users/${username}/nftMetadatas/${postDocId}`
      );

      const oldMetadata: NFTMetadata = JSON.parse(
        (await oldMetadataFile.download())[0].toString("utf-8")
      );

      const pd = (
        await firestore.doc(`users/${username}/posts/${postDocId}`).get()
      ).data();

      if (!pd) {
        console.error(
          "Unexpected Error. User doc doesn't exist while refreshing NFT."
        );
        res.status(405).json({
          error:
            "Unexpected Error. User doc doesn't exist while refreshing NFT.",
        });
        return;
      }

      const refreshedMetadata: NFTMetadata = {
        ...oldMetadata,
        attributes: [
          {
            trait_type: "Likes",
            value: pd.likeCount,
          },
          {
            trait_type: "Comments",
            value: pd.commentCount,
          },
        ],
      };

      const buffer = Buffer.from(safeJsonStringify(refreshedMetadata));

      const refreshedMetadataFile = bucket.file(
        `users/${username}/nftMetadatas/${postDocId}`
      );

      await refreshedMetadataFile.save(buffer, {
        contentType: "application/json",
      });

      await refreshedMetadataFile.makePublic();

      res.status(200).json({});
    } catch (error) {
      console.error("Error while refreshing nft", error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    console.error("Method Not Allowed");
    res.status(405).json({ error: "Method not allowed" });
  }
}
