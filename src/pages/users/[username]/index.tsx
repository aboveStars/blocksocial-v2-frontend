import UserPageLayout from "@/components/Layout/UserPageLayout";
import { PostData } from "@/components/types/Post";
import { UserInformation } from "@/components/types/User";

import { firestore } from "@/firebase/clientApp";
import { Flex, Text } from "@chakra-ui/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";

import safeJsonStringify from "safe-json-stringify";

type Props = {
  userInformation: UserInformation;
  userPosts: PostData[];
};

export default function index({ userInformation, userPosts }: Props) {
  if (!userInformation) {
    return (
      <Flex justify="center" align="center" width="100%">
        <Text color="red">User Not Found</Text>
      </Flex>
    );
  }

  return (
    <>
      <UserPageLayout userInformation={userInformation} userPosts={userPosts} />
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

  const userPostsCollection = collection(
    firestore,
    `users/${username as string}/posts`
  );
  const userPostsSnapshot = await getDocs(userPostsCollection);

  const userPosts: PostData[] = [];

  userPostsSnapshot.forEach((doc) => {
    const postObject: PostData = {
      senderUsername: doc.data().senderUsername,
      description: doc.data().description,
      image: doc.data().image || null,
      likeCount: doc.data().likeCount,
      whoLiked: doc.data().whoLiked,
      creationTime: doc.data().creationTime,
      id: doc.data().id,
    };
    const serializablePostObject: PostData = JSON.parse(
      safeJsonStringify(postObject)
    );
    userPosts.push(serializablePostObject);
  });

  return {
    props: {
      userInformation: userInformation ?? null,
      userPosts: userPosts,
    },
  };
}
