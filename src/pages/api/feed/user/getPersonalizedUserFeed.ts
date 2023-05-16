import getDisplayName from "@/apiUtils";
import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/adminApp";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { username } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (!username)
    return res.status(422).json({ error: "Invalid prop or props" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  let postItemDatas: PostItemData[] = [];

  let postsDocsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
  try {
    postsDocsQuerySnapshot = await firestore
      .collection(`users/${username}/posts`)
      .get();
  } catch (error) {
    console.error(
      `Error while creating user (single) ${username} feed for ${operationFromUsername} user.`,
      error
    );
    return res.status(503).json({ error: "firebase error" });
  }

  if (postsDocsQuerySnapshot.size !== 0) {
    for (const postDoc of postsDocsQuerySnapshot.docs) {
      // getting like status
      let likeStatus = false;
      try {
        likeStatus = (
          await postDoc.ref.collection("likes").doc(operationFromUsername).get()
        ).exists;
      } catch (error) {
        console.error(
          `Error while creating (single) user: ${username} feed for ${operationFromUsername}. (We were retriving like status from ${postDoc.ref.path})`
        );
        return res.status(503).json({ error: "firebase-error" });
      }

      // getting following status
      let followStatus = false;
      try {
        followStatus = (
          await firestore
            .doc(
              `users/${operationFromUsername}/followings/${
                postDoc.data().operationFromUsername
              }`
            )
            .get()
        ).exists;
      } catch (error) {
        console.error(
          `Error while creating (single) user: ${username} for ${operationFromUsername}. (We were getting follow status from post: ${postDoc.ref.path})`
        );
        return res.status(503).json({ error: "firebase error." });
      }

      const newPostItemData: PostItemData = {
        senderUsername: postDoc.data().senderUsername,

        description: postDoc.data().description,
        image: postDoc.data().image,

        likeCount: postDoc.data().likeCount,
        currentUserLikedThisPost: likeStatus,
        commentCount: postDoc.data().commentCount,

        postDocId: postDoc.id,

        nftStatus: postDoc.data().nftStatus,

        currentUserFollowThisSender: followStatus,

        creationTime: postDoc.data().creationTime,
      };

      postItemDatas.push(newPostItemData);
    }
  }

  return res.status(200).json({ postItemDatas: postItemDatas });
}
