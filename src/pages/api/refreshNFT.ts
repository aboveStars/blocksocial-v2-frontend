import { NFTMetadata } from "@/components/types/NFT";
import { auth, bucket, firestore } from "../../firebase/adminApp";
import { NextApiRequest, NextApiResponse } from "next";
import safeJsonStringify from "safe-json-stringify";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId } = req.body;

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

  if (!operationFromUsername || !postDocId) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  let oldMetadata: NFTMetadata;
  try {
    const oldMetadataFile = bucket.file(
      `users/${operationFromUsername}/postsFiles/${postDocId}/nftMetadata`
    );

    oldMetadata = JSON.parse(
      (await oldMetadataFile.download())[0].toString("utf-8")
    );
  } catch (error) {
    console.error(
      "Error while refreshingNFT.(We were on downloading old metadata.)",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  let pd;

  try {
    pd = (
      await firestore
        .doc(`users/${operationFromUsername}/posts/${postDocId}`)
        .get()
    ).data();
  } catch (error) {
    console.error(
      "Error while refreshingNFT.(We were on getting new comment and post count.))",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  if (!pd) {
    console.error(
      "Error while refreshingNFT.(We were checking if postDocExist. It is not null)"
    );
    return res.status(503).json({ error: "Firebase error" });
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
    `users/${operationFromUsername}/postsFiles/${postDocId}/nftMetadata`
  );

  try {
    await refreshedMetadataFile.save(buffer, {
      contentType: "application/json",
    });
  } catch (error) {
    console.error(
      "Error while refreshingNFT.(We were on saving new metadata).",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }
  try {
    await refreshedMetadataFile.makePublic();
  } catch (error) {
    console.error(
      "Error while refreshingNFT.(We were making new metadata public.)",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
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
