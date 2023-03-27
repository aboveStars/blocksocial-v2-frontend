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
  commentCount: number;
  commentsCollectionPath: string;

  creationTime: Timestamp;
  id: string;
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
};
