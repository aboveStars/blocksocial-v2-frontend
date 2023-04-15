import { NextApiRequest, NextApiResponse } from "next";
import { PostServerData } from "@/components/types/Post";
import { auth, bucket, firestore } from "../../firebase/adminApp";
import safeJsonStringify from "safe-json-stringify";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { description, image: imageDataURL } = req.body;

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

    if (req.method === "POST") {
      if (description.length === 0 && imageDataURL.length === 0) {
        throw new Error("Empty Post Creation Attempt");
      }

      if (!operationFromUsername) {
        throw new Error("Missing Prop");
      }

      let postImagePublicURL = "";
      if (imageDataURL.length !== 0) {
        const postImageId = Date.now().toString();
        const file = bucket.file(
          `users/${operationFromUsername}/postsPhotos/${postImageId}`
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
        senderUsername: operationFromUsername,
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
        .collection(`users/${operationFromUsername}/posts`)
        .add(serializeableNewPostData);

      res.status(200).json({ username: operationFromUsername });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while post upload operation:", error);
    return res.status(401).json({ error: error });
  }
}
