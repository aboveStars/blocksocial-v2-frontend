import getDisplayName from "@/apiUtils";
import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/adminApp";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }
  
  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  await lock.acquire(`getPosts-${operationFromUsername}`, async () => {
    /**
     * We are creating feed for index....
     * 1-) Posts from we follow...
     * 2-) Popular posts....
     * 3-) Ads...
     */

    let postItemDatas: PostItemData[] = [];
    let postsSourcesUsernames: string[] = [];

    // 1
    let userFollowingsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
    try {
      userFollowingsQuerySnapshot = await firestore
        .collection(`users/${operationFromUsername}/followings`)
        .get();
    } catch (error) {
      console.error(
        `Error while creating feed for ${operationFromUsername}. (We were getting followings collection)`,
        error
      );
      return res.status(503).json({ error: "Firebase Error" });
    }
    // if we follow at least one person...
    if (userFollowingsQuerySnapshot.size !== 0) {
      for (const followingDoc of userFollowingsQuerySnapshot.docs) {
        postsSourcesUsernames.push(followingDoc.id);
      }
    }

    // 2-)
    let celebritiesDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
    try {
      celebritiesDoc = await firestore.doc(`popular/celebrities`).get();
    } catch (error) {
      console.error(
        `Error while creating feed for ${operationFromUsername}. (We were getting popular people)`,
        error
      );
      return res.status(503).json({ error: "Firebase Error" });
    }

    let popularPeople: string[] = [];
    if (celebritiesDoc.data()) {
      popularPeople = celebritiesDoc.data()!.people;
    }

    if (popularPeople.length !== 0) {
      for (const popularPerson of popularPeople) {
        postsSourcesUsernames.push(popularPerson);
      }
    }

    // 3-) for now we are aborting this option

    /**
     * Now we have all sources we need.
     * It is time to create posts item from them.
     * But before we should remove duplications from sources.
     */

    // 1-
    const postsSourcesUsernamesClear = Array.from(
      new Set(postsSourcesUsernames)
    );

    // 2-

    for (const postSourceUsername of postsSourcesUsernamesClear) {
      let postsQuerySnaphostFromOneSource: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
      try {
        postsQuerySnaphostFromOneSource = await firestore
          .collection(`users/${postSourceUsername}/posts`)
          .get();
      } catch (error) {
        console.error(
          `Error while creating feed for ${operationFromUsername}. (We were getting posts from ${postSourceUsername} source.)`,
          error
        );
        return res.status(503).json({ error: "firebase-error" });
      }

      if (postsQuerySnaphostFromOneSource.size !== 0) {
        for (const postDoc of postsQuerySnaphostFromOneSource.docs) {
          // getting like status
          let likeStatus = false;
          try {
            likeStatus = (
              await postDoc.ref
                .collection("likes")
                .doc(operationFromUsername)
                .get()
            ).exists;
          } catch (error) {
            console.error(
              `Error while creating feed for ${operationFromUsername}. (We were retriving like status from ${postDoc.ref.path})`
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
              `Error while creating feed for ${operationFromUsername}. (We were getting follow status from post: ${postDoc.ref.path})`
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
    }

    return res.status(200).json({
      postItemDatas: postItemDatas,
    });
  });
}
