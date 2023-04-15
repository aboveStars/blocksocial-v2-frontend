import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, fieldValue } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { commentDocPath, postDocPath } = req.body;

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

    let deleteRequestSender = displayName;

    if (req.method === "DELETE") {
      if (!commentDocPath || !postDocPath) {
        throw new Error("Missing Prop");
      }

      const ss = await firestore.doc(commentDocPath).get();
      if (!ss.exists) {
        throw new Error("Could't be accessed the comment, comment not exists");
      }

      if (ss.data()?.commentSenderUsername !== deleteRequestSender) {
        throw new Error("Not-Owner of the comment");
      }

      await firestore.doc(commentDocPath).delete();
      await firestore.doc(postDocPath).update({
        commentCount: fieldValue.increment(-1),
      });

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while deleting comment", error);
    res.status(401).json({ error: error });
  }
}
