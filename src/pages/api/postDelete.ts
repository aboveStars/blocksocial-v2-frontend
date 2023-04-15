import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, bucket } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization} = req.headers;
  const { postDocPath } = req.body;

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
      if (!postDocPath) {
        res.status(405).json({ error: "Missing Prop" });
        console.error("Missing Prop");
        return;
      }

      const ps = await firestore.doc(postDocPath).get();
      const data = ps.data();

      if (data && data.senderUsername !== deleteRequestSender) {
        throw new Error("Only owner can delete its post");
      }

      if (data && data.nftUrl) {
        const metadataPath = `users/${postDocPath.split("/")[1]}/nftMetadatas/${
          postDocPath.split("/")[3]
        }`;

        const oldNftMetadataFile = bucket.file(metadataPath);
        await oldNftMetadataFile.delete();
      }

      await firestore.doc(postDocPath).delete();

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while deleting post", error);
    res.status(401).json({ error: error });
  }
}
