import { Timestamp } from "firebase/firestore";

export type PostCreateForm = {
  description: string;
  image: string;
};

export type PostData = {
  senderUsername: string;

  description: string;
  image?: string;
  likeCount: number;
  whoLiked: string[];

  creationTime: Timestamp;
  id: string;
};


