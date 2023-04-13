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

const auth = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
      const { postDocId } = req.body;

      if (!operationFromUsername || !postDocId) {
        throw new Error("Missing Prop");
      }

      const oldMetadataFile = bucket.file(
        `users/${operationFromUsername}/nftMetadatas/${postDocId}`
      );

      const oldMetadata: NFTMetadata = JSON.parse(
        (await oldMetadataFile.download())[0].toString("utf-8")
      );

      const pd = (
        await firestore
          .doc(`users/${operationFromUsername}/posts/${postDocId}`)
          .get()
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
        `users/${operationFromUsername}/nftMetadatas/${postDocId}`
      );

      await refreshedMetadataFile.save(buffer, {
        contentType: "application/json",
      });

      await refreshedMetadataFile.makePublic();

      res.status(200).json({});
    } else {
      console.error("Method Not Allowed");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error at refresh NFT operation:", error);
    return res.status(401).json({ error: error });
  }
}
