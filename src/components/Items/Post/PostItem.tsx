import { useState } from "react";
import { OpenPanelName, PostItemData } from "../../types/Post";
import PostComments from "../../Modals/Post/PostComments";
import PostFront from "../../Post/PostFront";
import PostLikes from "../../Modals/Post/PostLikes";
import PostMakeNFT from "@/components/Modals/Post/PostMakeNFT";

type Props = {
  postItemData: PostItemData;
};

export default function PostItem({ postItemData }: Props) {
  const [openPanelName, setOpenPanelName] = useState<OpenPanelName>("main");

  // Update realtime comment count when add or delete (locally)
  const [commentCount, setCommentCount] = useState(postItemData.commentCount);

  return (
    <>
      <PostFront
        postFrontData={{ ...postItemData, commentCount: commentCount }}
        openPanelNameSetter={setOpenPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostComments
        commentsInfo={{
          postDocPath: postItemData.postDocPath,
          postCommentCount: commentCount,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostLikes
        likeData={{
          likeCount: postItemData.likeCount,
          likeDocPath: postItemData.postDocPath,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
      />
      <PostMakeNFT
        openPanelNameValue={openPanelName}
        openPanelNameValueSetter={setOpenPanelName}
        postInformation={postItemData}
        postDocPath={postItemData.postDocPath}
      />
    </>
  );
}
