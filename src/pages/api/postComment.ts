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
const auth = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { cron } = req.headers;
  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
  }

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

    let commentSenderUsername = displayName;

    if (req.method === "POST") {
      const { comment, postDocPath } = req.body;

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
        commentCount: admin.firestore.FieldValue.increment(1),
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
