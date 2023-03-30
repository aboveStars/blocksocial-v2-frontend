import { useState } from "react";
import { OpenPanelName, PostItemData } from "../types/Post";
import PostComments from "./PostComments";
import PostLikes from "./PostLikes";
import PostMain from "./PostMain";

type Props = {
  postItemData: PostItemData;
};

export default function PostItem({ postItemData }: Props) {
  const { commentsCollectionPath, ...postMainData } = postItemData;

  const [openPanelName, setOpenPanelName] = useState<OpenPanelName>("main");

  return (
    <>
      <PostMain
        postMainData={postMainData}
        openPanelNameSetter={setOpenPanelName}
      />
      <PostComments
        postInfo={{
          postSenderUsername: postItemData.senderUsername,
          postId: postItemData.id,
        }}
        commentsInfo={{
          postCommentsColPath: postItemData.commentsCollectionPath,
          postCommentCount: postItemData.commentCount,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
      />
      <PostLikes
        likeData={{
          likeCount: postItemData.likeCount,
          whoLiked: postItemData.whoLiked,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
      />
    </>
  );
}
