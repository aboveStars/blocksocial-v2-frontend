import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  const setPostStatus = useSetRecoilState(postsStatusAtom);

  useEffect(() => {
    if (currentUserState.loading) return;
    handleMainPage();
  }, [
    currentUserState.username,
    currentUserState.loading,
    currentUserState.isThereCurrentUser,
  ]);

  const shufflePosts = (postsDatasArray: PostItemData[]) => {
    let currentIndex = postsDatasArray.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [postsDatasArray[currentIndex], postsDatasArray[randomIndex]] = [
        postsDatasArray[randomIndex],
        postsDatasArray[currentIndex],
      ];
    }

    postsDatasArray.sort((a, b) => b.creationTime - a.creationTime);

    return postsDatasArray;
  };

  /**
   * Shuffles posts.
   * @param postsDatasArray
   * @returns shuffled posts
   */
  const organizePosts = (postsDatasArray: PostItemData[]) => {
    const initialPostsDatasArray = [...postsDatasArray];

    // shuffle with Fisher-Yates method
    const shuffledPostsDatasArray = shufflePosts(initialPostsDatasArray);

    return shuffledPostsDatasArray;
  };

  const handleMainPage = async () => {
    setPostStatus({ loading: true });

    let followings: string[] = [];
    let currentUserUsername: string = "";
    if (currentUserState.isThereCurrentUser) {
      currentUserUsername = currentUserState.username;
      try {
        const currentUserFollowingsDocs = (
          await getDocs(
            collection(
              firestore,
              `users/${currentUserState.username}/followings`
            )
          )
        ).docs;

        for (const followingDoc of currentUserFollowingsDocs) {
          followings.push(followingDoc.id);
        }
      } catch (error) {
        console.error("Error while getting current user followings", error);
      }
    }

    let celebrities: string[] = [];
    try {
      const celebritiesServer = (
        await getDoc(doc(firestore, `popular/celebrities`))
      ).data()?.people;

      for (const celebrity of celebritiesServer) {
        celebrities.push(celebrity);
      }
    } catch (error) {
      console.error("Error while getting celebrities", error);
    }

    // merge all sources
    const postsSources: string[] = Array.from(
      new Set(followings.concat(celebrities).concat(currentUserUsername))
    );

    // get posts from all sources
    let getPostsFromOneSourcePromises: Promise<PostItemData[]>[] = [];
    for (const source of postsSources) {
      getPostsFromOneSourcePromises.push(
        getPostsFromOneSource(source, currentUserState.username)
      );
    }

    const postsArraysFromAllSources = await Promise.all(
      getPostsFromOneSourcePromises
    );

    const posts: PostItemData[] = [];
    for (const postsArray of postsArraysFromAllSources) {
      for (const post of postsArray) {
        posts.push(post);
      }
    }

    const orderedPosts = organizePosts(posts);

    setPostDatasInServer(orderedPosts);
    setPostStatus({ loading: false });
  };

  return (
    postsDatasInServer && <MainPageLayout postItemsDatas={postsDatasInServer} />
  );
}

const getPostsFromOneSource = async (
  source: string,
  currentUserUsername: string
) => {
  try {
    const postsDocs = (
      await getDocs(collection(firestore, `users/${source}/posts`))
    ).docs;

    let posts: PostItemData[] = [];
    let createPostItemDataPromises: Promise<PostItemData>[] = [];
    for (const postDoc of postsDocs) {
      createPostItemDataPromises.push(
        createPostItemData(
          source,
          postDoc,
          currentUserUsername
        ) as Promise<PostItemData>
      );
    }

    const postItemDatas = await Promise.all(createPostItemDataPromises);

    for (const postItemData of postItemDatas) {
      posts.push(postItemData);
    }

    return posts;
  } catch (error) {
    console.error("Error while getting posts from one source", error);
    return [];
  }
};

const createPostItemData = async (
  source: string,
  postDoc: QueryDocumentSnapshot<DocumentData>,
  currentUserUsername: string
) => {
  try {
    let likeStatus: boolean = false;
    if (currentUserUsername) {
      likeStatus = (
        await getDoc(
          doc(
            firestore,
            `users/${source}/posts/${postDoc.id}/likes/${currentUserUsername}`
          )
        )
      ).exists();
    }
    const postItemData: PostItemData = {
      commentCount: postDoc.data().commentCount,
      creationTime: postDoc.data().creationTime,
      currentUserFollowThisSender: true,
      currentUserLikedThisPost: likeStatus,
      description: postDoc.data().description,
      image: postDoc.data().image,
      likeCount: postDoc.data().likeCount,
      nftStatus: postDoc.data().nftStatus,
      postDocId: postDoc.id,
      senderUsername: postDoc.data().senderUsername,
    };
    return postItemData;
  } catch (error) {
    console.error("Error while creating post item data.", error);
  }
};
