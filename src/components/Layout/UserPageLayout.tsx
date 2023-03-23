import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { UserInformation } from "../atoms/currentUserAtom";
import PostCreateModal from "../Modals/Post/PostCreateModal";
import { PostData } from "../types/Post";
import Header from "../user/Header";
import Posts from "../user/Posts";

type Props = {
  userInformation: UserInformation;
  userPosts: PostData[];
};

export default function UserPageLayout({ userInformation, userPosts }: Props) {
  return (
    <>
      <PostCreateModal />
      <Flex direction="row" justify="center" align="center" width="100%">
        <Flex direction="column" width="50%" maxWidth="800px">
          <Flex
            border="1px solid"
            borderColor="blue.600"
            width="100%"
            justify="center"
            align="center"
          >
            <Header userInformation={userInformation} />
          </Flex>
          <Flex
            border="1px solid"
            borderColor="blue.600"
            justify="center"
            align="center"
          >
            <Posts userPosts={userPosts} />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
