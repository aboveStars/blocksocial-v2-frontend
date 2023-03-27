import React, { useState } from "react";
import { PostItemData, PostMainData } from "../types/Post";
import PostComments from "./PostComments";
import PostMain from "./PostMain";

type Props = {
  postItemData: PostItemData;
};

export default function PostItem({ postItemData }: Props) {
  const { commentsCollectionPath, ...postMainData } = postItemData;

  const [commentPanelOpenState, setCommentPanelOpenState] = useState(false);

  return (
    <>
      {commentPanelOpenState ? (
        <PostComments
          postCommentsData={{
            postCommentsColPath: postItemData.commentsCollectionPath,
            postSenderUsername: postItemData.senderUsername,
            postId: postItemData.id,
          }}
          commentPanelOpenStateSetter={setCommentPanelOpenState}
        />
      ) : (
        <PostMain
          postMainData={postMainData}
          commentPanelOpenStateSetter={setCommentPanelOpenState}
        />
      )}
    </>
  );
}
