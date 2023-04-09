import { NextApiRequest, NextApiResponse } from "next";

import { PostServerData } from "@/components/types/Post";
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
const bukcet = admin
  .storage()
  .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { description, image: imageDataURL, username } = req.body;

    if (description.length === 0 && imageDataURL.length === 0) {
      console.error("Empty Post Creation Attempt, aborting...");
      res.status(400).json({ error: "Empty Post Creation Attempt" });
      return;
    }

    if (!username) {
      res.status(405).json({ error: "Missing Prop" });
      console.error("Missing Prop");
      return;
    }

    try {
      let postImagePublicURL = "";
      if (imageDataURL.length !== 0) {
        const postImageId = Date.now().toString();
        const file = bukcet.file(
          `users/${username}/postsPhotos/${postImageId}`
        );
        const buffer = Buffer.from(imageDataURL.split(",")[1], "base64");
        await file.save(buffer, {
          metadata: {
            contentType: "image/jpeg",
          },
        });
        await file.makePublic();
        postImagePublicURL = file.publicUrl();
      }

      const newPostData: PostServerData = {
        senderUsername: username,
        description: description,
        image: postImagePublicURL,
        likeCount: 0,
        whoLiked: [],
        commentCount: 0,
        nftUrl: "",
        creationTime: Date.now(),
      };

      const serializeableNewPostData = JSON.parse(
        safeJsonStringify(newPostData)
      );

      await firestore
        .collection(`users/${username}/posts`)
        .add(serializeableNewPostData);

      res.status(200).json({ username: username });
    } catch (error) {
      console.error("Firebase Error while uploading new post", error);
      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
