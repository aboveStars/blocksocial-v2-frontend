import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import PageHead from "@/components/Layout/PageHead";
import { LikeDatasArrayType, PostItemData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  const setPostStatus = useSetRecoilState(postsStatusAtom);

  const router = useRouter();

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

    let currentUserUsername: string = "";

    let followings: string[] = [];
    let currentUserLikesDatas: LikeDatasArrayType = [];
    let celebrities: string[] = [];

    if (currentUserState.isThereCurrentUser) {
      currentUserUsername = currentUserState.username;
      try {
        const [followingsSnaphot, activitiesSnapshot, celebritiesSnapshot] =
          await Promise.all([
            getDocs(
              collection(
                firestore,
                `users/${currentUserState.username}/followings`
              )
            ),
            getDoc(
              doc(firestore, `users/${currentUserUsername}/activities/likes`)
            ),
            getDoc(doc(firestore, `popular/celebrities`)),
          ]);

        const currentUserFollowingsDocs = followingsSnaphot.docs;
        if (activitiesSnapshot.exists())
          currentUserLikesDatas = activitiesSnapshot.data()?.likesDatas;

        for (const celebrity of celebritiesSnapshot.data()?.people) {
          celebrities.push(celebrity);
        }

        for (const followingDoc of currentUserFollowingsDocs) {
          followings.push(followingDoc.id);
        }
      } catch (error) {
        console.error("Error while getting current user followings", error);
      }
    } else {
      try {
        const celebritiesServer = (
          await getDoc(doc(firestore, "popular/celebrities"))
        ).data()?.people;

        for (const celebrity of celebritiesServer) {
          celebrities.push(celebrity);
        }
      } catch (error) {
        console.error("Error while getting popular names", error);
      }
    }

    // merge all sources
    const postsSources: string[] = Array.from(
      new Set(followings.concat(celebrities).concat(currentUserUsername))
    );

    // get posts from all sources
    let getPostsFromOneSourcePromises: Promise<PostItemData[]>[] = [];

    for (const source of postsSources.filter((a) => a)) {
      getPostsFromOneSourcePromises.push(
        getPostsFromOneSource(source, currentUserLikesDatas)
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
    <>
      <PageHead
        title="BlockSocial"
        description="Create NFTs from your posts and much more!"
        url="https://blocksocial.vercel.app/"
        image="https://blocksocial.vercel.app/bsicon.ico"
        type="website"
      />
      {postsDatasInServer && (
        <MainPageLayout postItemsDatas={postsDatasInServer} />
      )}
    </>
  );
}

const getPostsFromOneSource = async (
  source: string,
  userLikesDatas: LikeDatasArrayType
) => {
  try {
    const postsDocs = (
      await getDocs(collection(firestore, `users/${source}/posts`))
    ).docs;

    let posts: PostItemData[] = [];

    for (const postDoc of postsDocs) {
      const postDocPath = postDoc.ref.path;

      const likeStatus =
        userLikesDatas.find((a) => a.likedPostDocPath === postDocPath) !==
        undefined;

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
      posts.push(postItemData);
    }

    return posts;
  } catch (error) {
    console.error("Error while getting posts from one source", error);
    return [];
  }
};
