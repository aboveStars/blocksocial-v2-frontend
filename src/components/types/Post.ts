import { Timestamp } from "firebase/firestore";

export type PostCreateForm = {
  description: string;
  image: string;
};

export type PostData = {
  senderUsername: string;
  description: string;
  image?: string;
  creationTime: Timestamp;
  id: Timestamp;
};
