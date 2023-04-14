import { postsStatusAtom } from "@/components/atoms/postsStatusAtom";

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
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

import safeJsonStringify from "safe-json-stringify";

type Props = {
  userInformation: UserInformation | undefined;
  postItemDatas: PostItemData[];
};

export default function UserPage({ userInformation, postItemDatas }: Props) {
  const UserPageLayout = dynamic(
    () => import("../../../components/Layout/UserPageLayout")
  );
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
  const username = context.query.username;
  let userInformation: UserInformation | null = null;
  let postItemDatas: PostItemData[] = [];

  try {
    const userInformationDocRef = doc(firestore, `users/${username as string}`);
    const userDoc = await getDoc(userInformationDocRef);

    if (!userDoc.exists()) {
      throw new Error("There is no user with URL.");
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

    const userPostDatasSnapshot = await getDocs(userPostDatasQuery);

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
      const serializablePostObject: PostItemData = JSON.parse(
        safeJsonStringify(postObject)
      );
      tempPostDatas.push(serializablePostObject);
    });
    postItemDatas = tempPostDatas;
  } catch (error) {
    // I don't know where this log go
    console.error("Error while creating user page", error);
  }

  return {
    props: {
      userInformation: userInformation,
      postItemDatas: postItemDatas,
    },
  };
}
