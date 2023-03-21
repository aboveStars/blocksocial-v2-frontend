import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { UserDataAtUserpage } from "../atoms/currentUserAtom";
import Header from "../user/Header";

type Props = {
  userData: UserDataAtUserpage;
};

export default function UserPageLayout({ userData }: Props) {
  return (
    <>
      <Flex
        border="1px solid"
        borderColor="blue.500"
        direction="row"
        justify="center"
        align="center"
        width="100%"
      >
        <Flex direction="column" width="50%" maxWidth="800px">
          <Flex
            border="1px solid"
            borderColor="blue.600"
            width="100%"
            justify="center"
            align="center"
          >
            <Header userData={userData} />
          </Flex>
          <Flex
            border="1px solid"
            borderColor="blue.600"
            justify="center"
            align="center"
          >
            <Text textColor="white">Posts</Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
