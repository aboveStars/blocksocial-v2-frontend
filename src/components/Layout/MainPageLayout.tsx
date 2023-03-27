import { Box, Flex } from "@chakra-ui/react";
import { PostItemData } from "../types/Post";
import Posts from "../user/Posts";

type Props = {
  postItemsDatas: PostItemData[];
};

export default function MainPageLayout({ postItemsDatas }: Props) {
  return (
    <>
      <Flex width="100%">
        <Flex
          flexGrow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        />

        <Flex
          width={{
            base: "100%",
            sm: "100%",
            md: "550px",
            lg: "550px",
          }}
        >
          <Posts postsItemDatas={postItemsDatas} />
        </Flex>

        <Flex
          flexGrow={1}
          display={{
            base: "none",
            sm: "none",
            md: "flex",
            lg: "flex",
          }}
        />
      </Flex>
    </>
  );
}
