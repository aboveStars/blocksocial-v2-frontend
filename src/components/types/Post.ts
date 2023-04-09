import { Timestamp } from "firebase/firestore";

export type PostCreateForm = {
  description: string;
  image: string;
};

export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;
  likeCount: number;
  whoLiked: string[];
  commentCount: number;

  nftUrl?: string;

  creationTime: number;
};

export type PostItemData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  whoLiked: string[];

  commentCount: number;

  postDocId: string;

  nftUrl?: string;

  creationTime: number;
};

export type PostFrontData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  whoLiked: string[];

  commentCount: number;

  postDocId: string

  nftUrl?: string;

  creationTime: number;
};

export type SmallPostItemData = {
  description: string;
  image: string;
  likeCount: number;

  commentCount: number;

  creationTime: number;
};

export type CommentData = {
  commentSenderUsername: string;
  comment: string;
  creationTime: number
};

export type CommentDataWithCommentDocPath = {
  commentDocPath: string;
  commentSenderUsername: string;
  comment: string;
  creationTime: number
};

export type OpenPanelName = "main" | "comments" | "likes" | "nft";

export type LikeData = {
  likeCount: number;
  likeDocPath: string;
};

export type SendNftStatus =
  | "initial"
  | "uploadingMetadata"
  | "sendingRequest"
  | "waitingForConfirmation"
  | "updatingPost"
  | "final";
