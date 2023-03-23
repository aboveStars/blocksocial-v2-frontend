import { Divider, Stack } from "@chakra-ui/react";
import PostItem from "../Post/PostItem";
import { PostData } from "../types/Post";

type Props = {
  userPosts: PostData[];
};

export default function Posts({ userPosts }: Props) {
  return (
    <>
      <Stack
        gap={3}
        mt={3}
        divider={<Divider borderColor="gray.600" borderWidth="1px" />}
      >
        {userPosts.map((postData, index) => (
          <PostItem key={index} postData={postData} />
        ))}
      </Stack>
    </>
  );
}
