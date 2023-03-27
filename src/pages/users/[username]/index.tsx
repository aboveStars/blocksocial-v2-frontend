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

import safeJsonStringify from "safe-json-stringify";

type Props = {
  userInformation: UserInformation;
  postItemsDatas: PostItemData[];
};

export default function index({ userInformation, postItemsDatas }: Props) {
  if (!userInformation) {
    return (
      <Flex justify="center" align="center" width="100%">
        <Text color="red">User Not Found</Text>
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
  // getting page name [username] => yunus20korkmaz03
  const username = context.query.username;
  let userInformation: UserInformation | undefined = undefined;
  try {
    const userInformationDocRef = doc(firestore, `users/${username as string}`);
    const userDoc = await getDoc(userInformationDocRef);
    if (!userDoc.exists()) {
      return;
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
  } catch (error) {}

  const userPostsDatasCollection = collection(
    firestore,
    `users/${username}/posts`
  );
  const userPostDatasQuery = query(
    userPostsDatasCollection,
    orderBy("creationTime", "desc")
  );

  const userPostDatasSnapshot = await getDocs(userPostDatasQuery);

  const postItemDatas: PostItemData[] = [];

  userPostDatasSnapshot.forEach((doc) => {
    const postObject: PostItemData = {
      senderUsername: doc.data().senderUsername,
      description: doc.data().description,
      image: doc.data().image,
      likeCount: doc.data().likeCount,
      whoLiked: doc.data().whoLiked,
      commentCount: doc.data().commentCount,
      commentsCollectionPath: `users/${doc.data().senderUsername}/posts/${
        doc.id
      }/comments`,
      creationTime: doc.data().creationTime,
      id: doc.data().id,
    };
    const serializablePostObject: PostItemData = JSON.parse(
      safeJsonStringify(postObject)
    );
    postItemDatas.push(serializablePostObject);
  });

  return {
    props: {
      userInformation: userInformation ?? null,
      postItemsDatas: postItemDatas,
    },
  };
}
