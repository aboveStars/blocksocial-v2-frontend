import getDisplayName from "@/apiUtils";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";

import { fieldValue, firestore } from "../../../../firebase/adminApp";

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

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

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
