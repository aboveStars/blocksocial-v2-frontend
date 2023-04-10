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

import safeJsonStringify from "safe-json-stringify";

type Props = {
  userInformation: UserInformation;
  postItemsDatas: PostItemData[];
};

export default function index({ userInformation, postItemsDatas }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
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
    <>
      <UserPageLayout
        userInformation={userInformation}
        postItemsDatas={postItemsDatas}
      />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = context.query.username;
  let userInformation: UserInformation | undefined = undefined;
  const postItemDatas: PostItemData[] = [];
  try {
    const userInformationDocRef = doc(firestore, `users/${username as string}`);
    const userDoc = await getDoc(userInformationDocRef);

    if (userDoc.exists()) {
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
    }

    const userPostsDatasCollection = collection(
      firestore,
      `users/${username}/posts`
    );
    const userPostDatasQuery = query(
      userPostsDatasCollection,
      orderBy("creationTime", "desc")
    );

    const userPostDatasSnapshot = await getDocs(userPostDatasQuery);

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
      postItemDatas.push(serializablePostObject);
    });
  } catch (error) {
    // I don't know where this log go
    console.error("Error while creating user page", error);
  }

  return {
    props: {
      userInformation: userInformation ?? null,
      postItemsDatas: postItemDatas,
    },
  };
}
