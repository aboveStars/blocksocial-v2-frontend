import { Box, Flex } from "@chakra-ui/react";
import { PostData } from "../types/Post";
import Posts from "../user/Posts";

type Props = {
  postsDatas: PostData[];
};

export default function MainPageLayout({ postsDatas }: Props) {
  return (
    <>
      <Flex width="100%">
        <Flex flexGrow={1}></Flex>
        <Box display="flex" flexWrap="wrap" justifyContent="center">
          <Flex
            width={{
              base: "100%",
              sm: "100%",
              md: "550px",
              lg: "550px",
            }}
          >
            <Posts postsDatas={postsDatas} />
          </Flex>
        </Box>

        <Flex flexGrow={1}></Flex>
      </Flex>
    </>
  );
}
