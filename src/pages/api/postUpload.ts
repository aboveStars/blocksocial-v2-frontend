import { PostServerData } from "@/components/types/Post";
import { NextApiRequest, NextApiResponse } from "next";
import { bucket, firestore } from "../../firebase/adminApp";

import getDisplayName from "@/apiUtils";
import AsyncLock from "async-lock";
import { v4 as uuidv4 } from "uuid";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { description, image: imageDataURL } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!description && !imageDataURL) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`postUploadAPI-${operationFromUsername}`, async () => {
    /**
     * Both for image and post.
     */
    let generalPostId = uuidv4().replace(/-/g, "");
    while (
      (
        await firestore
          .doc(`users/${operationFromUsername}/posts/${generalPostId}`)
          .get()
      ).exists
    ) {
      generalPostId = uuidv4().replace(/-/g, "");
    }

    let postImagePublicURL = "";
    if (imageDataURL) {
      try {
        const file = bucket.file(
          `users/${operationFromUsername}/postsFiles/${generalPostId}/image`
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
      commentCount: 0,
      nftStatus: {
        minted: false,
        mintTime: -1,
        metadataLink: "",
        tokenId: -1,
        name: "",
        description: "",
        contractAddress: "",
        openseaUrl: "",
        transferred: false,
        transferredAddress: "",
      },
      creationTime: Date.now(),
    };

    try {
      await firestore
        .doc(`users/${operationFromUsername}/posts/${generalPostId}`)
        .set(newPostData);
    } catch (error) {
      console.error(
        "Error while uploadingPost. (We were on creating doc for new post)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
    return res
      .status(200)
      .json({ newPostData: newPostData, newPostDocId: generalPostId });
  });
}
