import { Timestamp } from "firebase/firestore";

export type PostCreateForm = {
  description: string;
  image: string;
};

export type PostItemData = {
  senderUsername: string;

  description: string;
  image: string;
  likeCount: number;
  whoLiked: string[];
  likeDocPath: string;
  commentCount: number;
  commentsCollectionPath: string;

  creationTime: Timestamp;
  id: string;
};

export type SmallPostItemData = {
  description: string;
  image: string;
  likeCount: number;

  commentCount: number;

  creationTime: Timestamp;
};

export type PostMainData = {
  senderUsername: string;

  description: string;
  image: string;
  likeCount: number;
  whoLiked: string[];
  commentCount: number;

  creationTime: Timestamp;
  id: string;
};

export type CommentData = {
  commentSenderUsername: string;
  comment: string;
  creationTime: Timestamp;
};

export type CommentDataWithCommentDocPath = {
  commentDocPath: string;
  commentSenderUsername: string;
  comment: string;
  creationTime: Timestamp;
};

export type OpenPanelName = "main" | "comments" | "likes" | "nft";

export type LikeData = {
  likeCount: number;
  likeDocPath: string;
};

export type SendNftStatus =
  | "initial"
  | "sendingRequest"
  | "waitingForConfirmation"
  | "updatingPost"
  | "final";
