import { Flex, Text } from "@chakra-ui/react";

import PostCreateModal from "../Modals/Post/PostCreateModal";
import { PostItemData } from "../types/Post";
import { UserInformation } from "../types/User";
import Header from "../user/Header";
import Posts from "../Post/Posts";

type Props = {
  userInformation: UserInformation;
  postItemsDatas: PostItemData[];
};

export default function UserPageLayout({
  userInformation,
  postItemsDatas,
}: Props) {
  return (
    <>
      <PostCreateModal />
      <Flex width="100%">
        <Flex
          grow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        ></Flex>

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
            <Posts postsItemDatas={postItemsDatas} />
          </Flex>
        </Flex>
        <Flex
          grow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        ></Flex>
      </Flex>
    </>
  );
}
