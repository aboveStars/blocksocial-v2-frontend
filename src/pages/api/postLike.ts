import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, fieldValue } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { opCode, postDocPath } = req.body;

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

    let likerUsername = displayName;

    if (req.method === "POST") {
      if (!opCode || !postDocPath || !likerUsername) {
        throw new Error("Missing Prop");
      }

      await firestore.doc(postDocPath).update({
        likeCount: fieldValue.increment(opCode as number),
      });
      await firestore.doc(postDocPath).update({
        whoLiked:
          opCode === 1
            ? fieldValue.arrayUnion(likerUsername)
            : fieldValue.arrayRemove(likerUsername),
      });

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while like operation", error);
    res.status(401).json({ error: error });
  }
}
