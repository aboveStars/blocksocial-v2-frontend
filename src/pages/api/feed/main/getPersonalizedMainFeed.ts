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

  await lock.acquire(
    `getPersonalizedMainFeed-${operationFromUsername}`,
    async () => {
      /**
       * We are creating feed for index....
       * 1-) Posts from we follow...
       * 2-) Popular posts....
       * 3-) Ads...
       */

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

      /**
       * Stage-3 (MOST CRITICAL PART)
       * Now we should show ADs to user.
       * In this part we should use "proivder API Endpoint".
       * Provider has responsablilty to provide relatable posts, ads.
       * Provider has access to user's activities such as likes, comments; general information like age, sex, or country where user lives.
       * Users have independence to share which information they want.
       * After all this data processed, provider should provide an API Endpoint for user.
       * Post from followers, friends always will be shown by BlockSocial.
       */

      // Get API Endpoint.
      let providerAPIEndpoint = "";
      let currentProviderDocSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
      try {
        currentProviderDocSnapshot = await firestore
          .doc(`users/${operationFromUsername}/provider/currentProvider`)
          .get();
      } catch (error) {
        console.error(
          `Error while creating personalizedMainFeed for ${operationFromUsername}. (We were getting provider endpoint)`
        );
      }

      if (currentProviderDocSnapshot!.exists && currentProviderDocSnapshot!) {
        const currentProviderDocData = currentProviderDocSnapshot.data();
        if (currentProviderDocData)
          providerAPIEndpoint = currentProviderDocData.apiEndpoint;
      }

      console.log(providerAPIEndpoint);

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
      let getPostsFromOneSourcePromisesArray: Promise<void | PostItemData[]>[] =
        [];
      for (const postSourceUsername of postsSourcesUsernamesClear) {
        getPostsFromOneSourcePromisesArray.push(
          getPostsFromOneSource(postSourceUsername, operationFromUsername)
        );
      }

      const getPostsFromOneSourcePromisesResults = await Promise.all(
        getPostsFromOneSourcePromisesArray
      );

      let postItemDatas: PostItemData[] = [];

      for (const getPostsFromOneSourcePromisesResult of getPostsFromOneSourcePromisesResults) {
        if (getPostsFromOneSourcePromisesResult)
          for (const postItemData of getPostsFromOneSourcePromisesResult) {
            postItemDatas.push(postItemData);
          }
      }

      return res.status(200).json({
        postItemDatas: postItemDatas,
      });
    }
  );
}

/**
 *
 * @param postSourceUsername
 * @param operationFromUsername
 * @returns
 */
const getPostsFromOneSource = async (
  postSourceUsername: string,
  operationFromUsername: string
) => {
  let postItemDatas: PostItemData[] = [];

  let postsQuerySnaphostFromOneSource: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
  try {
    postsQuerySnaphostFromOneSource = await firestore
      .collection(`users/${postSourceUsername}/posts`)
      .get();
  } catch (error) {
    return console.error(
      `Error while creating feed for ${operationFromUsername}. (We were getting posts from ${postSourceUsername} source.)`,
      error
    );
  }

  if (postsQuerySnaphostFromOneSource.size === 0) return postItemDatas; // as empty array

  let handleCreatePostItemDataPromisesArray: Promise<void | PostItemData>[] =
    [];
  for (const postDoc of postsQuerySnaphostFromOneSource.docs) {
    handleCreatePostItemDataPromisesArray.push(
      handleCreatePostItemData(postDoc, operationFromUsername)
    );
  }

  const handleCreatePostItemDataPromisesResults = await Promise.all(
    handleCreatePostItemDataPromisesArray
  );

  for (const handleCreatePostItemDataPromiseResult of handleCreatePostItemDataPromisesResults) {
    if (handleCreatePostItemDataPromiseResult) {
      postItemDatas.push(handleCreatePostItemDataPromiseResult);
    }
  }

  return postItemDatas;
};

const handleCreatePostItemData = async (
  postDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  operationFromUsername: string
) => {
  let likeStatus = false;

  // getting following status
  let followStatus = false;

  const [likeResponse, followResponse] = await Promise.all([
    handleGetLikeStatus(operationFromUsername, postDoc),
    handleGetFollowStatus(operationFromUsername, postDoc),
  ]);

  // undefined is false default.
  likeStatus = likeResponse as boolean;
  followStatus = followResponse as boolean;

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

  return newPostItemData;
};

const handleGetLikeStatus = async (
  operationFromUsername: string,
  postDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
) => {
  let likeStatus = false;
  try {
    likeStatus = (
      await postDoc.ref.collection("likes").doc(operationFromUsername).get()
    ).exists;
  } catch (error) {
    return console.error(
      `Error while creating feed for ${operationFromUsername}. (We were retriving like status from ${postDoc.ref.path})`
    );
  }
  return likeStatus;
};

const handleGetFollowStatus = async (
  operationFromUsername: string,
  postDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
) => {
  let followStatus = false;
  try {
    followStatus = (
      await firestore
        .doc(
          `users/${operationFromUsername}/followings/${
            postDoc.data().senderUsername
          }`
        )
        .get()
    ).exists;
  } catch (error) {
    return console.error(
      `Error while creating feed for ${operationFromUsername}. (We were getting follow status from post: ${postDoc.ref.path})`
    );
  }

  return followStatus;
};
