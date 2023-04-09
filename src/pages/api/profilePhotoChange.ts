import { NextApiRequest, NextApiResponse } from "next";

import * as admin from "firebase-admin";

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
const bucket = admin
  .storage()
  .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { username } = req.body;

    if (!username) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }

    try {
      await firestore.doc(`users/${username}`).update({ profilePhoto: "" });
    } catch (error) {
      console.error("Error while deleting profilePhoto: ", error);
      res.status(500).json({ firebaseError: error });
    }
    res.status(200).json({ username: username });
  } else if (req.method === "POST") {
    const { username } = req.body;
    const { image: imageDataURL } = req.body;

    // Upload file to storage

    try {
      const photoId = Date.now().toString();
      const file = bucket.file(`users/${username}/profilePhotos/${photoId}`);
      const buffer = Buffer.from(imageDataURL.split(",")[1], "base64");

      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
        },
      });

      await file.makePublic();
      const publicURL = file.publicUrl();

      await firestore.doc(`users/${username}`).update({
        profilePhoto: publicURL,
      });

      res
        .status(200)
        .json({ username: username, newProfilePhotoURL: publicURL });
    } catch (error) {
      console.error(error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
