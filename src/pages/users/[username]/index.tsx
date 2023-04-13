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

import safeJsonStringify from "safe-json-stringify";

type Props = {
  userInformation: UserInformation | undefined;
};

export default function UserPage({ userInformation }: Props) {
  const [innerHeight, setInnerHeight] = useState("");

  const [postItemDatas, setPostItemDatas] = useState<PostItemData[]>([]);

  const setPostStatus = useSetRecoilState(postsStatusAtom);

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    if (!userInformation) {
      return;
    }
    handleUserPosts();
  }, [userInformation]);

  const handleUserPosts = async () => {
    setPostStatus({
      loading: true,
    });

    const userPostsDatasCollection = collection(
      firestore,
      `users/${userInformation?.username}/posts`
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

    setPostItemDatas(tempPostDatas);
    setPostStatus({
      loading: false,
    });
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
      postItemsDatas={postItemDatas}
    />
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const username = context.query.username;
  let userInformation: UserInformation | null = null;

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
  } catch (error) {
    // I don't know where this log go
    console.error("Error while creating user page", error);
  }

  return {
    props: {
      userInformation: userInformation,
    },
  };
}
