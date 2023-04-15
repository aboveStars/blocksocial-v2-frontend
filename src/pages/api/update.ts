import type { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore } from "../../firebase/adminApp";

// Updating "auth" object for now, in future other updates can be managed from here.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
  }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const idToken = authorization.split("Bearer ")[1];
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const username = (
        await firestore.collection("users").where("uid", "==", uid).get()
      ).docs[0].id;

      await auth.updateUser(uid, {
        displayName: username,
      });

      return res.status(200).json({
        createdDisplayName: username,
      });
    } catch (error) {
      console.error("Error while update operation:", error);
      return res.status(401).json({ error: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
