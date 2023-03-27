import { Stack } from "@chakra-ui/react";
import PostItem from "../Post/PostItem";
import { PostItemData } from "../types/Post";

type Props = {
  postsItemDatas: PostItemData[];
};

export default function Posts({ postsItemDatas }: Props) {
  return (
    <>
      <Stack gap={3} mt={3} width="100%">
        {postsItemDatas.map((postItemData, index) => (
          <PostItem key={index} postItemData={postItemData} />
        ))}
      </Stack>
    </>
  );
}
