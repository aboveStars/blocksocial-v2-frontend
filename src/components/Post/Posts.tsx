import { Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import PostItem from "../Items/Post/PostItem";
import PostSkeleton from "../Skeletons/PostSkeleton";

import { PostItemData } from "../types/Post";

type Props = {
  postsItemDatas: PostItemData[];
};

export default function Posts({ postsItemDatas }: Props) {
  const router = useRouter();
  return (
    <>
      <Stack gap={3} mt={2} width="100%">
        {postsItemDatas.length === 0 && !router.asPath.includes("users") ? (
          Array.from({ length: 2 }, (_, index) => <PostSkeleton key={index} />)
        ) : (
          <>
            {postsItemDatas.map((postItemData, index) => (
              <PostItem key={index} postItemData={postItemData} />
            ))}
          </>
        )}
      </Stack>
    </>
  );
}
