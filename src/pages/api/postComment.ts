import { NextApiRequest, NextApiResponse } from "next";

import { CommentData } from "@/components/types/Post";

import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { auth, fieldValue, firestore } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { comment, postDocPath } = req.body;

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

  if (!comment || !operationFromUsername || !postDocPath) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  const newCommentData: CommentData = {
    comment: comment,
    commentSenderUsername: operationFromUsername,
    creationTime: Date.now(),
  };

  try {
    await Promise.all([
      sendComment(postDocPath, newCommentData),
      increaseCommentCount(postDocPath),
    ]);
  } catch (error) {
    console.error("Error while commenting:", error);
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

async function sendComment(postDocPath: string, newCommentData: CommentData) {
  try {
    await firestore.collection(`${postDocPath}/comments`).add(newCommentData);
  } catch (error) {
    throw new Error(
      `Error while commenting from sendComment function: ${error}`
    );
  }
}

async function increaseCommentCount(postDocPath: string) {
  try {
    await firestore.doc(postDocPath).update({
      commentCount: fieldValue.increment(1),
    });
  } catch (error) {
    throw new Error(
      `Error while commenting from increaseComment function: ${error}`
    );
  }
}
