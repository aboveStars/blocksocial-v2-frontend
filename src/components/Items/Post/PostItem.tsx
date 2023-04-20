import { useEffect, useState } from "react";
import { OpenPanelName, PostItemData } from "../../types/Post";
import PostComments from "../../Modals/Post/PostComments";
import PostFront from "../../Post/PostFront";
import PostLikes from "../../Modals/Post/PostLikes";
import PostMakeNFT from "@/components/Modals/Post/PostMakeNFT";
import { useRecoilValue } from "recoil";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

type Props = {
  postItemData: PostItemData;
};

export default function PostItem({ postItemData }: Props) {
  const [openPanelName, setOpenPanelName] = useState<OpenPanelName>("main");

  // Update realtime comment count when add or delete (locally)
  const [commentCount, setCommentCount] = useState(postItemData.commentCount);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const handlePostInformationForCurrentUser = async () => {
    let tempCurrentUserLikedThisPost: boolean = false;

    tempCurrentUserLikedThisPost = (
      await getDoc(
        doc(
          firestore,
          `users/${postItemData.senderUsername}/posts/${postItemData.postDocId}/likes/${currentUserState.username}`
        )
      )
    ).exists();

    console.log(
      currentUserState.username,
      " liked this post : ",
      tempCurrentUserLikedThisPost
    );
  };

  return (
    <>
      <PostFront
        postFrontData={{
          ...postItemData,
          commentCount: commentCount,
        }}
        openPanelNameSetter={setOpenPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostComments
        commentsInfo={{
          postDocPath: `users/${postItemData.senderUsername}/posts/${postItemData.postDocId}`,
          postCommentCount: commentCount,
        }}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
        commentCountSetter={setCommentCount}
      />
      <PostLikes
        likeData={{
          likeCount: postItemData.likeCount,
          likeColPath: `users/${postItemData.senderUsername}/posts/${postItemData.postDocId}/likes`,
        }}
        postSenderUsername={postItemData.senderUsername}
        openPanelNameSetter={setOpenPanelName}
        openPanelNameValue={openPanelName}
      />
      <PostMakeNFT
        openPanelNameValue={openPanelName}
        openPanelNameValueSetter={setOpenPanelName}
        postInformation={postItemData}
      />
    </>
  );
}
