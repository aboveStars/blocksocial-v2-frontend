import { Flex } from "@chakra-ui/react";
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
        <Flex>
          <Posts postsDatas={postsDatas} />
        </Flex>
        <Flex flexGrow={1}></Flex>
      </Flex>
    </>
  );
}
