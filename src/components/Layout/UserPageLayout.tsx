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
        <Flex grow={1}></Flex>

        <Flex
          direction="column"
          width={{
            base: "100%",
            sm: "100%",
            md: "550px",
            lg: "550px",
          }}
        >
          <Flex justify="center" align="center" width="100%">
            <Header userInformation={userInformation} />
          </Flex>
          <Flex justify="center" align="center" width="100%">
            <Posts postsDatas={userPosts} />
          </Flex>
        </Flex>
        <Flex grow={1}></Flex>
      </Flex>
    </>
  );
}
