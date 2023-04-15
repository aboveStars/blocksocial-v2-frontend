import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, bucket } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocPath } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
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

  if (req.method !== "DELETE")
    return res.status(405).json("Method not allowed");

  if (!postDocPath) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  let isOwner = false;
  try {
    isOwner = await isOwnerOfPost(postDocPath, operationFromUsername);
  } catch (error) {
    console.error("Error while deleting post from 'isOwner' function", error);
    return res.status(503).json({ error: "Firebase error" });
  }

  if (!isOwner) {
    console.error("Not owner of the comment");
    return res.status(522).json({ error: "Not-Owner" });
  }

  try {
    const postDocData = (await firestore.doc(postDocPath).get()).data();
    if (postDocData?.nftUrl) {
      const metadataPath = `users/${postDocPath.split("/")[1]}/nftMetadatas/${
        postDocPath.split("/")[3]
      }`;

      const oldNftMetadataFile = bucket.file(metadataPath);
      await oldNftMetadataFile.delete();
    }
  } catch (error) {
    console.error(
      "Errow while deleting post (we were deleting NFT Metadata)",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  try {
    await firestore.doc(postDocPath).delete();
  } catch (error) {
    console.error("Error while deleting post.(We were deleting post):", error);
    return res.status(503).json({ error: "Firebase error" });
  }

  res.status(200).json({});
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

async function isOwnerOfPost(
  postDocPath: string,
  operationFromUsername: string
) {
  const ss = await firestore.doc(postDocPath).get();
  return ss.data()?.senderUsername === operationFromUsername;
}
