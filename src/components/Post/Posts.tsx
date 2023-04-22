import { Stack } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { postsAtViewAtom } from "../atoms/postsAtViewAtom";
import { postsStatusAtom } from "../atoms/postsStatusAtom";
import PostItem from "../Items/Post/PostItem";
import PostSkeleton from "../Skeletons/PostSkeleton";

import { PostItemData } from "../types/Post";

type Props = {
  postsItemDatas: PostItemData[];
};

export default function Posts({ postsItemDatas }: Props) {
  const postsLoading = useRecoilValue(postsStatusAtom).loading;
  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);

  useEffect(() => {
    if (postsItemDatas) {
      setPostsAtView(postsItemDatas);
    }
  }, [postsItemDatas]);

  return (
    <>
      <Stack gap={3} mt={2} width="100%">
        {postsLoading ? (
          Array.from({ length: 1 }, (_, index) => <PostSkeleton key={index} />)
        ) : (
          <>
            {postsAtView.map((postItemData, i) => (
              <PostItem
                key={`${postItemData.senderUsername}/${
                  postItemData.postDocId
                }/${Date.now()}${i}`}
                postItemData={postItemData}
              />
            ))}
          </>
        )}
      </Stack>
    </>
  );
}
