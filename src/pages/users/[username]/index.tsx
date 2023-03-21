import { UserDataAtUserpage } from "@/components/atoms/currentUserAtom";
import UserPageLayout from "@/components/Layout/UserPageLayout";

import { firestore } from "@/firebase/clientApp";
import { Flex, Text } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";

type Props = {
  userData: UserDataAtUserpage;
};

export default function index({ userData }: Props) {
  if (!userData) {
    return (
      <Flex justify="center" align="center" width="100%">
        <Text color="red">User Not Found</Text>
      </Flex>
    );
  }

  return <UserPageLayout userData={userData} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // getting page name [username] => yunus20korkmaz03
  const username = context.query.username;
  let finalPropData: UserDataAtUserpage | undefined = undefined;
  try {
    const userDocRef = doc(firestore, "users", username as string);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      finalPropData = {
        ...userDoc.data(),
      } as UserDataAtUserpage;
    }
  } catch (error) {}

  return {
    props: {
      userData: finalPropData ?? null,
    },
  };
}
