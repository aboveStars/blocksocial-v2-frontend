import getDisplayName from "@/apiUtils";
import { PostServerData } from "@/components/types/Post";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";

import { bucket, fieldValue, firestore } from "../../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId } = req.body;

  console.log("postDocId: ", postDocId)

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST")
    return res.status(405).json("Method not allowed");

  if (!postDocId) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`postDeleteAPI-${operationFromUsername}`, async () => {
    let postDoc;
    let isOwner = false;
    try {
      postDoc = await firestore
        .doc(`users/${operationFromUsername}/posts/${postDocId}`)
        .get();
      isOwner = postDoc.data()?.senderUsername === operationFromUsername;
    } catch (error) {
      console.error("Error while deleting post from 'isOwner' function", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    // isOwner is false in undefined too.
    if (!isOwner) {
      console.error("Not owner of the comment");
      return res.status(522).json({ error: "Not-Owner" });
    }

    const postDocData = postDoc.data() as PostServerData;

    try {
      if (postDocData.image || postDocData.nftStatus.minted) {
        const postFilesPath = `users/${operationFromUsername}/postsFiles/${postDocId}`;
        await bucket.deleteFiles({
          prefix: postFilesPath + "/",
        });
      }
    } catch (error) {
      console.error(
        "Errow while deleting post (we were deleting post files folder.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    try {
      if (postDocData.nftStatus.minted) {
        await firestore.doc(`users/${operationFromUsername}`).update({
          nftCount: fieldValue.increment(-1),
        });
      }
    } catch (error) {
      console.error(
        "Error while deleting post. (We were decrementing NFTs count.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    try {
      if (postDocData.likeCount > 0)
        await deleteCollection(
          `users/${operationFromUsername}/posts/${postDocId}/likes`
        );
      if (postDocData.commentCount > 0)
        await deleteCollection(
          `users/${operationFromUsername}/posts/${postDocId}/comments`
        );
      await firestore
        .doc(`users/${operationFromUsername}/posts/${postDocId}`)
        .delete();
    } catch (error) {
      console.error(
        "Error while deleting post.(We were deleting post doc and its subCollections):",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
    return res.status(200).json({});
  });
}



async function deleteCollection(collectionPath: string) {
  const limit = 50;
  try {
    const docsSnapshot = await firestore
      .collection(collectionPath)
      .limit(limit)
      .get();

    const batch = firestore.batch();
    docsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    if (docsSnapshot.size > 0) {
      await deleteCollection(collectionPath);
    }
  } catch (error) {
    throw new Error(
      `Error while deleting collection (${collectionPath}): ${error} `
    );
  }
}
