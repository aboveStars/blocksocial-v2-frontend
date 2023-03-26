import { Flex } from "@chakra-ui/react";

import PostCreateModal from "../Modals/Post/PostCreateModal";
import { PostData } from "../types/Post";
import { UserInformation } from "../types/User";
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
      <Flex width="100%">
        <Flex grow={1} border="1px solid yellow"></Flex>
        <Flex border="1px solid green" direction="column" width="550px">
          <Flex justify="center" align="center">
            <Header userInformation={userInformation} />
          </Flex>
          <Flex justify="center" align="center">
            <Posts postsDatas={userPosts} />
          </Flex>
        </Flex>
        <Flex grow={1} border="1px solid pink"></Flex>
      </Flex>
    </>
  );
}
