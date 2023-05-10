import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import UserPageLayout from "@/components/Layout/UserPageLayout";

import { LikeDatasArrayType, PostItemData } from "@/components/types/Post";
import { IPagePreviewData, UserInServer } from "@/components/types/User";

import { firestore } from "@/firebase/clientApp";
import { Flex, Text } from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSidePropsContext } from "next";

import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

type Props = {
  userInformation: UserInServer | undefined;
  postItemDatas: PostItemData[];
};

export default function UserPage({ userInformation, postItemDatas }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  const setPostStatus = useSetRecoilState(postsStatusAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [reviewedPostDatas, setReviewedPostDatas] = useState(postItemDatas);

  const handleLikeStatus = async () => {
    // Sometimes useEffect is not controlling.
    if (!currentUserState.isThereCurrentUser) {
      return;
    }

    const currentUserLikesSnapshot = await getDoc(
      doc(firestore, `users/${currentUserState.username}/activities/likes`)
    );

    let currentUserLikesDatas: LikeDatasArrayType = [];
    if (currentUserLikesSnapshot.exists()) {
      currentUserLikesDatas = currentUserLikesSnapshot.data().likesDatas;
    }

    if (currentUserLikesDatas) {
      let reviewedPostDatasTemp: PostItemData[] = [];
      for (const postItemData of postItemDatas) {
        const postDocPath = `users/${postItemData.senderUsername}/posts/${postItemData.postDocId}`;
        const likeStatus: boolean =
          currentUserLikesDatas.find(
            (a) => a.likedPostDocPath === postDocPath
          ) !== undefined;
        const likeStatusAddedPostItemData: PostItemData = {
          ...postItemData,
          currentUserLikedThisPost: likeStatus,
        };
        reviewedPostDatasTemp.push(likeStatusAddedPostItemData);
      }
      setReviewedPostDatas(reviewedPostDatasTemp);
    } else {
      setReviewedPostDatas(postItemDatas);
    }
    setPostStatus({
      loading: false,
    });
  };

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    if (currentUserState.isThereCurrentUser) {
      handleLikeStatus();
    } else {
      setReviewedPostDatas(postItemDatas);
    }
  }, [currentUserState]);

  useEffect(() => {
    if (!postItemDatas) return;

    if (!currentUserState.isThereCurrentUser) {
      setReviewedPostDatas(postItemDatas);
      setPostStatus({ loading: false });
    } else {
      setPostStatus({ loading: true });
      handleLikeStatus();
    }
  }, [postItemDatas]);

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
    <>
      <UserPageLayout
        userInformation={userInformation}
        postItemsDatas={reviewedPostDatas}
      />
    </>
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
  let postItemDatas: PostItemData[] = [];

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
        postItemDatas: [],
      },
    };
  }

  if (!userDoc.exists()) {
    console.warn("User doesn't exist");
    return {
      props: {
        userInformation: null,
        postItemDatas: [],
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

  const userPostsDatasCollection = collection(
    firestore,
    `users/${username}/posts`
  );
  const userPostDatasQuery = query(
    userPostsDatasCollection,
    orderBy("creationTime", "desc")
  );

  let userPostDatasSnapshot;
  try {
    userPostDatasSnapshot = (await getDocs(userPostDatasQuery)).docs;
  } catch (error) {
    console.error(
      "Error while creating userpage. (We were getting user's posts)"
    );
    return {
      props: {
        userInformation: userInformation,
        postItemDatas: [],
      },
    };
  }

  const tempPostDatas: PostItemData[] = [];

  for (const postDoc of userPostDatasSnapshot) {
    const postObject: PostItemData = {
      senderUsername: postDoc.data().senderUsername,

      description: postDoc.data().description,
      image: postDoc.data().image,

      likeCount: postDoc.data().likeCount,
      currentUserLikedThisPost: false,

      postDocId: postDoc.id,

      commentCount: postDoc.data().commentCount,

      currentUserFollowThisSender: false,

      nftStatus: postDoc.data().nftStatus,
      creationTime: postDoc.data().creationTime,
    };

    tempPostDatas.push(postObject);
  }

  postItemDatas = tempPostDatas;

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
      postItemDatas: postItemDatas,
      pagePreviewData: pagePreviewData,
    },
  };
}
