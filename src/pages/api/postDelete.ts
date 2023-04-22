import { PostServerData } from "@/components/types/Post";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";

import { auth, firestore, bucket, fieldValue } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
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

  if (req.method !== "DELETE")
    return res.status(405).json("Method not allowed");

  if (!postDocId) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  let isOwner = false;
  try {
    isOwner = await isOwnerOfPost(postDocId, operationFromUsername);
  } catch (error) {
    console.error("Error while deleting post from 'isOwner' function", error);
    return res.status(503).json({ error: "Firebase error" });
  }

  if (!isOwner) {
    console.error("Not owner of the comment");
    return res.status(522).json({ error: "Not-Owner" });
  }

  let postDoc;

  let postDocData;
  try {
    postDoc = await firestore
      .doc(`users/${operationFromUsername}/posts/${postDocId}`)
      .get();
    postDocData = postDoc.data() as PostServerData;
  } catch (error) {
    console.error(
      "Error while deleting post. (We were getting post details from server",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

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

  res.status(200).json({});
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

async function isOwnerOfPost(postDocId: string, operationFromUsername: string) {
  const ss = await firestore
    .doc(`users/${operationFromUsername}/posts/${postDocId}`)
    .get();
  return ss.data()?.senderUsername === operationFromUsername;
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
