import { NextApiRequest, NextApiResponse } from "next";

import { CommentData } from "@/components/types/Post";

import safeJsonStringify from "safe-json-stringify";

import { firestore, auth, fieldValue } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { comment, postDocPath } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
  }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const displayName = (await auth.getUser(uid)).displayName;

    let commentSenderUsername = displayName;

    if (req.method === "POST") {
      if (!comment || !commentSenderUsername || !postDocPath) {
        throw new Error("Missing Prop");
      }

      const newCommentData: CommentData = {
        comment: comment,
        commentSenderUsername: commentSenderUsername,
        creationTime: Date.now(),
      };
      const serializableNewCommentData = JSON.parse(
        safeJsonStringify(newCommentData)
      );

      await firestore
        .collection(`${postDocPath}/comments`)
        .add(serializableNewCommentData);
      await firestore.doc(postDocPath).update({
        commentCount: fieldValue.increment(1),
      });

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while sending comment:", error);
    res.status(401).json({ error: error });
  }
}
