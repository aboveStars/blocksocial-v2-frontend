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

      // 3-)

      let provider = "";
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

      provider = currentProviderDocSnapshot!.data()?.name as string;

      let response;
      try {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT_TO_APIDON_PROVIDER_SERVER}/client/provideFeed`,
          {
            method: "POST",
            headers: {
              authorization: process.env
                .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: operationFromUsername,
              provider: provider,
            }),
          }
        );
      } catch (error) {
        console.error(
          "Error while gettingPersonalizedMainFeed.(We were fetching provideFeed)",
          error
        );
      }

      let postDocPathArray: string[] = [];
      if (response) {
        if (!response.ok) {
          console.error(
            "Error while generating personalized main feed. Error from provideFeed API",
            await response.text()
          );
        }
      }

      if (response) {
        if (response.ok)
          postDocPathArray = (await response.json()).postDocPathArray;
      }

      /**
       * Now we have two types of sources.
       * First one is "username source" which then we get all posts of this from this "username"
       * Second one is "postDocPath" which contains directly posts.
       * Now it is time to create promises arrays of these two sources.s
       */

      // Creating "promises array" for "First" type source (source as username)
      const postsSourcesUsernamesClear = Array.from(
        new Set(postsSourcesUsernames)
      );

      let getPostsFromOneSourcePromisesArray: Promise<void | PostItemData[]>[] =
        [];
      for (const postSourceUsername of postsSourcesUsernamesClear) {
        getPostsFromOneSourcePromisesArray.push(
          getPostsFromOneSource(postSourceUsername, operationFromUsername)
        );
      }

      // Creating "promises array" for "Second" type source (source as postDocPath)
      let handleCreatePostItemDatasFromPostDocPathPromisesArray: Promise<void | PostItemData>[] =
        [];
      if (postDocPathArray.length !== 0) {
        for (const postDocPath of postDocPathArray)
          handleCreatePostItemDatasFromPostDocPathPromisesArray.push(
            handleCreatePostItemDataFromPostDocPath(
              postDocPath,
              operationFromUsername
            )
          );
      }

      /**
       * Now we have promises array.
       * But before Promise.All() for simultaneous approach, we need to notice something.
       * We are merging these two promises arrays. But...
       * First promises array (source as username) returns Promise<void | PostItemData[]>
       * Second promises array (source as postDocPath) returns Promise<void | PostItemData>
       * So after "resolve" promises we should check if the result is array or not.
       * If it is array we should again use "for..of" loop and add "postItemData" to "postItemDatas" array.
       */

      const finalPromisesArray = [
        ...getPostsFromOneSourcePromisesArray,
        ...handleCreatePostItemDatasFromPostDocPathPromisesArray,
      ];

      let postItemDatas: PostItemData[] = [];

      const finalPromisesArrayResult = await Promise.all(finalPromisesArray);

      for (const finalPromiseResult of finalPromisesArrayResult) {
        if (finalPromiseResult)
          if (Array.isArray(finalPromiseResult)) {
            for (const postItemData of finalPromiseResult) {
              postItemDatas.push(postItemData);
            }
          } else {
            postItemDatas.push(finalPromiseResult);
          }
      }

      // delete duplications (postItemDatas => clearPostItemDatas => finalPostItemDatas => postItemDatas)
      let countedPostDocIds: string[] = [];

      const clearPostItemDatas = postItemDatas.map((a) => {
        if (!countedPostDocIds.includes(a.postDocId)) {
          countedPostDocIds.push(a.postDocId);
          return a;
        } else {
          return;
        }
      });

      let finalPostItemDatas: PostItemData[] = [];
      for (const clearPostItemData of clearPostItemDatas) {
        if (clearPostItemData) finalPostItemDatas.push(clearPostItemData);
      }

      postItemDatas = finalPostItemDatas;

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

const handleCreatePostItemDataFromPostDocPath = async (
  postDocPath: string,
  operationFromUsername: string
) => {
  let postDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
  try {
    postDoc = await firestore.doc(postDocPath).get();
  } catch (error) {
    return console.error(
      "Error while creating post item data from postDocPath via provider.",
      error
    );
  }

  if (!postDoc.exists)
    return console.error("This post doesn't exist anymore.", postDocPath);

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
    senderUsername: postDoc.data()?.senderUsername,

    description: postDoc.data()?.description,
    image: postDoc.data()?.image,

    likeCount: postDoc.data()?.likeCount,
    currentUserLikedThisPost: likeStatus,
    commentCount: postDoc.data()?.commentCount,

    postDocId: postDoc.id,

    nftStatus: postDoc.data()?.nftStatus,

    currentUserFollowThisSender: followStatus,

    creationTime: postDoc.data()?.creationTime,
  };

  return newPostItemData;
};

const handleGetLikeStatus = async (
  operationFromUsername: string,
  postDoc:
    | FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
    | FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
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
  postDoc:
    | FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
    | FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
) => {
  let followStatus = false;
  try {
    followStatus = (
      await firestore
        .doc(
          `users/${operationFromUsername}/followings/${
            postDoc.data()?.senderUsername
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
