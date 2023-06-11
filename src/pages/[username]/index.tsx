import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import UserPageLayout from "@/components/Layout/UserPageLayout";

import { PostItemData } from "@/components/types/Post";
import { IPagePreviewData, UserInServer } from "@/components/types/User";

import { auth, firestore } from "@/firebase/clientApp";
import { Flex, Text } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

type Props = {
  userInformation: UserInServer | undefined;
  postItemDatas: PostItemData[];
};

export default function UserPage({ userInformation }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  const setPostStatus = useSetRecoilState(postsStatusAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [postsDatasInServer, setPostDatasInServer] = useState<PostItemData[]>(
    []
  );

  const router = useRouter();

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    if (currentUserState.isThereCurrentUser) {
      handlePersonalizedUserFeed();
    } else {
      handleAnonymousUserFeed();
    }
  }, [currentUserState.isThereCurrentUser, router.asPath]);

  const handleAnonymousUserFeed = async () => {
    setPostStatus({ loading: true });
    let response;
    try {
      response = await fetch("/api/feed/user/getAnonymousUserFeed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: process.env
            .NEXT_PUBLIC_ANONYMOUS_ENTERANCE_KEY as string,
        },
        body: JSON.stringify({
          username: router.asPath.split("/")[1],
        }),
      });
    } catch (error) {
      return console.error(
        `Error while fetching 'getAnonymousUserFeed'-API`,
        error
      );
    }

    if (!response.ok) {
      return console.error(
        `Error from 'getAnonymousUserFeedAPI' for ${currentUserState.username} user.`,
        await response.json()
      );
    }

    const postsFromServer: PostItemData[] = (await response.json())
      .postItemDatas;

    setPostDatasInServer(postsFromServer);

    setPostStatus({ loading: false });
  };

  const handlePersonalizedUserFeed = async () => {
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
      response = await fetch("/api/feed/user/getPersonalizedUserFeed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: router.asPath.split("/")[1],
        }),
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

    postsFromServer.sort((a, b) => b.creationTime - a.creationTime);

    setPostDatasInServer(postsFromServer);
    setPostStatus({ loading: false });
  };

  if (!userInformation) {
    return (
      <Flex
        justify="center"
        align="center"
        width="100%"
        minHeight={innerHeight}
      >
        <Text as="b" textColor="white" fontSize="20pt">
          User couldn&apos;t be found.
        </Text>
      </Flex>
    );
  }

  return (
    <UserPageLayout
      userInformation={userInformation}
      postItemsDatas={postsDatasInServer}
    />
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cron = context.req.headers.cron as string;
  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return {
      props: {
        userInformation: null,
        postItemDatas: [],
      },
    };
  }

  const username = context.query.username;

  let userInformation: UserInServer | null = null;

  let userDoc;
  try {
    const userInformationDocRef = doc(firestore, `users/${username as string}`);
    userDoc = await getDoc(userInformationDocRef);
  } catch (error) {
    console.error(
      "Error while creating userpage. (We were getting userdoc)",
      error
    );
    return {
      props: {
        userInformation: null,
      },
    };
  }

  if (!userDoc.exists()) {
    console.warn("User doesn't exist");
    return {
      props: {
        userInformation: null,
      },
    };
  }

  const tempUserInformation: UserInServer = {
    username: userDoc.data().username,
    fullname: userDoc.data().fullname,
    profilePhoto: userDoc.data().profilePhoto,

    followingCount: userDoc.data().followingCount,
    followerCount: userDoc.data().followerCount,

    nftCount: userDoc.data().nftCount,

    email: userDoc.data().email,
    uid: userDoc.data().uid,
  };

  userInformation = tempUserInformation;

  const pagePreviewData: IPagePreviewData = {
    title: `${userInformation.username}'s BlockSocial`,
    description: `${userInformation.followerCount} followers, ${userInformation.nftCount} NFT's`,
    type: "website",
    url: `https://blocksocial.vercel.app/${userInformation.username}`,
    image: userInformation.profilePhoto,
  };

  return {
    props: {
      userInformation: userInformation,
      pagePreviewData: pagePreviewData,
    },
  };
}
