import { useState } from "react";
import { OpenPanelName, PostItemData } from "../../types/Post";
import PostComments from "../../Modals/Post/PostComments";
import PostMain from "../../Post/PostMain";
import PostLikes from "../../Modals/Post/PostLikes";
import PostMakeNFT from "@/components/Modals/Post/PostMakeNFT";

type Props = {
  postItemData: PostItemData;
};

export default function PostItem({ postItemData }: Props) {
  const { commentsCollectionPath, ...postMainData } = postItemData;

  const [openPanelName, setOpenPanelName] = useState<OpenPanelName>("main");

  // Update realtime comment count when add or delete (locally)
  const [commentCount, setCommentCount] = useState(postItemData.commentCount);

  return (
    <>
      <PostMain
        postMainData={{ ...postMainData, commentCount: commentCount }}
        openPanelNameSetter={setOpenPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostComments
        commentsInfo={{
          postCommentsColPath: postItemData.commentsCollectionPath,
          postCommentCount: commentCount,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostLikes
        likeData={{
          likeCount: postItemData.likeCount,
          likeDocPath: postItemData.likeDocPath,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
      />
      <PostMakeNFT
        openPanelNameValue={openPanelName}
        openPanelNameValueSetter={setOpenPanelName}
        postInformation={postMainData}
        postDocPath={postItemData.commentsCollectionPath.substring(
          0,
          postItemData.commentsCollectionPath.indexOf("comments")
        )}
      />
    </>
  );
}
