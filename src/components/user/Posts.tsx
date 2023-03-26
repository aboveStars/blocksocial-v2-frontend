import { Divider, Stack } from "@chakra-ui/react";
import PostItem from "../Post/PostItem";
import { PostData } from "../types/Post";

type Props = {
  postsDatas: PostData[];
};

export default function Posts({ postsDatas }: Props) {
  return (
    <>
      <Stack gap={3} mt={3}>
        {postsDatas.map((postData, index) => (
          <PostItem key={index} postData={postData} />
        ))}
      </Stack>
    </>
  );
}
