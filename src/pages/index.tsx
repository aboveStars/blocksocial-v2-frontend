import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import MainPageLayout from "@/components/Layout/MainPageLayout";
import { PostItemData } from "@/components/types/Post";
import { IPagePreviewData } from "@/components/types/User";
import { auth } from "@/firebase/clientApp";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Home() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  const setPostStatus = useSetRecoilState(postsStatusAtom);

  useEffect(() => {
    if (currentUserState.isThereCurrentUser) {
      handlePersonalizedMainFeed();
    } else {
      handleAnonymousMainFeed();
    }
  }, [currentUserState.isThereCurrentUser]);

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

  const handlePersonalizedMainFeed = async () => {
    setPostStatus({ loading: true });

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return false;
    }

    let response;
    try {
      response = await fetch("/api/feed/main/getPersonalizedMainFeed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      return console.error(
        `Error while fetching 'getFeed'-API for ${currentUserState.username} user.`,
        error
      );
    }

    if (!response.ok) {
      return console.error(
        `Error from 'getFeedAPI' for ${currentUserState.username} user.`,
        await response.json()
      );
    }

    const postsFromServer: PostItemData[] = (await response.json())
      .postItemDatas;

    const organizedPosts: PostItemData[] = organizePosts(postsFromServer);

    setPostDatasInServer(organizedPosts);
    setPostStatus({ loading: false });
  };

  const handleAnonymousMainFeed = async () => {
    setPostStatus({ loading: true });
    let response;
    try {
      response = await fetch("/api/feed/main/getAnonymousMainFeed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: process.env
            .NEXT_PUBLIC_ANONYMOUS_ENTERANCE_KEY as string,
        },
      });
    } catch (error) {
      return console.error(
        `Error while fetching 'getAnonymousFeed'-API`,
        error
      );
    }

    if (!response.ok) {
      return console.error(
        `Error from 'getFeedAPI' for ${currentUserState.username} user.`,
        await response.json()
      );
    }

    const postsFromServer: PostItemData[] = (await response.json())
      .postItemDatas;

    const organizedPosts: PostItemData[] = organizePosts(postsFromServer);

    setPostDatasInServer(organizedPosts);

    setPostStatus({ loading: false });
  };

  return (
    <>
      {postsDatasInServer && (
        <MainPageLayout postItemsDatas={postsDatasInServer} />
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const pagePreviewData: IPagePreviewData = {
    title: "BlockSocial",
    description: "Create NFTs from your posts and much more!",
    type: "website",
    url: "https://blocksocial.vercel.app",
    image: "https://blocksocial.vercel.app/bsicon.jpg",
  };

  return {
    props: {
      pagePreviewData: pagePreviewData,
    },
  };
}
