import { PostServerData } from "@/components/types/Post";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, bucket, firestore } from "../../firebase/adminApp";

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

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await verifyToken(authorization as string);
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  let operationFromUsername = "";
  try {
    operationFromUsername = await getDisplayName(decodedToken);
  } catch (error) {
    console.error("Error while getting display name", error);
    return res.status(401).json({ error: "Unautorized" });
  }

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!description && !imageDataURL) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  let postImagePublicURL = "";
  if (imageDataURL) {
    try {
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
    } catch (error) {
      console.error(
        "Error while uploading post. We were on uploading image",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
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

  try {
    await firestore
      .collection(`users/${operationFromUsername}/posts`)
      .add(newPostData);
  } catch (error) {
    console.error(
      "Error while uploadingPost. (We were on creating doc for new post)",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  return res.status(200).json({ username: operationFromUsername });
}

/**
 * @param authorization
 * @returns
 */
async function verifyToken(authorization: string) {
  const idToken = authorization.split("Bearer ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  return decodedToken;
}

/**
 * @param decodedToken
 */
async function getDisplayName(decodedToken: DecodedIdToken) {
  const uid = decodedToken.uid;
  const displayName = (await auth.getUser(uid)).displayName;
  return displayName as string;
}
