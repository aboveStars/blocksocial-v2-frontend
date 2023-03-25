import { Flex } from "@chakra-ui/react";
import PostCreateModal from "../Modals/Post/PostCreateModal";
import { PostData } from "../types/Post";
import Posts from "../user/Posts";

type Props = {
  postsDatas: PostData[];
};

export default function MainPageLayout({ postsDatas }: Props) {
  return (
    <>
      <Posts postsDatas={postsDatas} />
    </>
  );
}
