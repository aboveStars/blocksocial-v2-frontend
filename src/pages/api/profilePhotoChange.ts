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

const auth = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    let operationFromUsername: string = "";

    if (!displayName) {
      // old user means, user who signed-up before update.
      const oldUserUsername = (
        await firestore.collection("users").where("uid", "==", uid).get()
      ).docs[0].id;

      await auth.updateUser(uid, {
        displayName: oldUserUsername,
      });

      operationFromUsername = oldUserUsername;
    } else {
      operationFromUsername = displayName;
    }

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
      const { image: imageDataURL } = req.body;

      // Upload file to storage

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
