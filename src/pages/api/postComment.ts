import { NextApiRequest, NextApiResponse } from "next";

import { CommentData } from "@/components/types/Post";
import * as admin from "firebase-admin";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { comment, username: commentSenderUsername, postDocPath } = req.body;

    if (!comment || !commentSenderUsername || !postDocPath) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }

    const newCommentData: CommentData = {
      comment: comment,
      commentSenderUsername: commentSenderUsername,
      creationTime: Date.now(),
    };
    const serializableNewCommentData = JSON.parse(
      safeJsonStringify(newCommentData)
    );

    try {
      await firestore
        .collection(`${postDocPath}/comments`)
        .add(serializableNewCommentData);
      await firestore.doc(postDocPath).update({
        commentCount: admin.firestore.FieldValue.increment(1),
      });

      res.status(200).json({});
    } catch (error) {
      console.error("Error while sending comment", error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
