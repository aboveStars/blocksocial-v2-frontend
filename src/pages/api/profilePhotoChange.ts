import { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore, bucket } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { image: imageDataURL } = req.body;

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

    let operationFromUsername = displayName;

    if (req.method === "DELETE") {
      if (!operationFromUsername) {
        res.status(405).json({ error: "Missing Prop" });
        console.error("Missing Prop");
        return;
      }

      await firestore
        .doc(`users/${operationFromUsername}`)
        .update({ profilePhoto: "" });

      res.status(200).json({});
    } else if (req.method === "POST") {
      const photoId = Date.now().toString();
      const file = bucket.file(
        `users/${operationFromUsername}/profilePhotos/${photoId}`
      );
      const buffer = Buffer.from(imageDataURL.split(",")[1], "base64");

      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
        },
      });

      await file.makePublic();
      const publicURL = file.publicUrl();

      await firestore.doc(`users/${operationFromUsername}`).update({
        profilePhoto: publicURL,
      });

      res.status(200).json({
        newProfilePhotoURL: publicURL,
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while post upload operation:", error);
    return res.status(401).json({ error: error });
  }
}
