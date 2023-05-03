import AsyncLock from "async-lock";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, fieldValue } from "../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { commentDocPath, postDocPath } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
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

  if (req.method !== "DELETE")
    return res.status(405).json("Method not allowed");

  if (!commentDocPath || !postDocPath) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`postCommentDelete-${operationFromUsername}`, async () => {
    let isOwner = false;
    try {
      isOwner = await isOwnerOfComment(commentDocPath, operationFromUsername);
    } catch (error) {
      console.error(
        "Error while deleting comment from 'isOwner' function",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    if (!isOwner) {
      console.error("Not owner of the comment");
      return res.status(522).json({ error: "Not-Owner" });
    }

    try {
      await Promise.all([
        commentDelete(commentDocPath),
        commentCountUpdate(postDocPath),
      ]);
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: "Firebase error" });
    }

    // send notification
    try {
      const postSenderUsername = (await firestore.doc(postDocPath).get()).data()
        ?.senderUsername;

      const notificationDoc = (
        await firestore
          .collection(`users/${postSenderUsername}/notifications`)
          .where("cause", "==", "comment")
          .where("sender", "==", operationFromUsername)
          .where("commentDocPath", "==", commentDocPath)
          .get()
      ).docs[0];
      if (notificationDoc) await notificationDoc.ref.delete();
    } catch (error) {
      console.error(
        "Error while sending comment. (We were sending notification)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    return res.status(200).json({});
  });
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

async function isOwnerOfComment(
  commentDocPath: string,
  operationFromUsername: string
) {
  const ss = await firestore.doc(commentDocPath).get();
  return ss.data()?.commentSenderUsername === operationFromUsername;
}

async function commentDelete(commentDocPath: string) {
  try {
    await firestore.doc(commentDocPath).delete();
  } catch (error) {
    throw new Error(
      `Error while deleting comment from 'commentDelete' function: ${error}`
    );
  }
}
async function commentCountUpdate(postDocPath: string) {
  try {
    await firestore.doc(postDocPath).update({
      commentCount: fieldValue.increment(-1),
    });
  } catch (error) {
    throw new Error(
      `Error while deleting comment from 'commentCountUpdate' function: ${error}`
    );
  }
}
