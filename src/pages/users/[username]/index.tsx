import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";
import UserPageLayout from "@/components/Layout/UserPageLayout";

import { PostItemData } from "@/components/types/Post";
import { UserInformation } from "@/components/types/User";

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
import { useSetRecoilState } from "recoil";

type Props = {
  userInformation: UserInformation | undefined;
  postItemDatas: PostItemData[];
};

export default function UserPage({ userInformation, postItemDatas }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  const setPostStatus = useSetRecoilState(postsStatusAtom);

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
    setPostStatus({
      loading: false,
    });
  }, []);

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
      postItemsDatas={postItemDatas}
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

  let userInformation: UserInformation | null = null;
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

  const tempUserInformation: UserInformation = {
    username: userDoc.data().username,
    fullname: userDoc.data().fullname,
    profilePhoto: userDoc.data().profilePhoto,
    followingCount: userDoc.data().followingCount,
    followings: userDoc.data().followings,
    followerCount: userDoc.data().followerCount,
    followers: userDoc.data().followers,
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
    userPostDatasSnapshot = await getDocs(userPostDatasQuery);
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
  userPostDatasSnapshot.forEach((doc) => {
    const postObject: PostItemData = {
      senderUsername: doc.data().senderUsername,

      description: doc.data().description,
      image: doc.data().image,

      likeCount: doc.data().likeCount,
      whoLiked: doc.data().whoLiked,

      postDocId: doc.id,

      commentCount: doc.data().commentCount,

      nftUrl: doc.data().nftUrl,
      creationTime: doc.data().creationTime,
    };
    const serializablePostObject: PostItemData = postObject;

    tempPostDatas.push(serializablePostObject);
  });
  postItemDatas = tempPostDatas;

  return {
    props: {
      userInformation: userInformation,
      postItemDatas: postItemDatas,
    },
  };
}
