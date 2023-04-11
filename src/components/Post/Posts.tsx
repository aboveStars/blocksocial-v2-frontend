import { Stack } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { postsStatusAtom } from "../atoms/postsStatusAtom";
import PostItem from "../Items/Post/PostItem";
import PostSkeleton from "../Skeletons/PostSkeleton";

import { PostItemData } from "../types/Post";

type Props = {
  postsItemDatas: PostItemData[];
};

export default function Posts({ postsItemDatas }: Props) {
  const postsLoading = useRecoilValue(postsStatusAtom).loading;
  return (
    <>
      <Stack gap={3} mt={2} width="100%">
        {postsLoading ? (
          Array.from({ length: 1 }, (_, index) => <PostSkeleton key={index} />)
        ) : (
          <>
            {postsItemDatas.map((postItemData) => (
              <PostItem
                key={postItemData.postDocId}
                postItemData={postItemData}
              />
            ))}
          </>
        )}
      </Stack>
    </>
  );
}
