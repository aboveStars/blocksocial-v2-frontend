export type PostCreateForm = {
  description: string;
  image: string;
};

export type PostServerData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  commentCount: number;

  nftStatus: {
    minted: boolean;
    mintTime: number;
    metadataLink: string;
    title: string;
    description: string;
    tokenId: number;
    contractAddress: string;
    openseaUrl: string;
    transferred: boolean;
    transferredAddress: string;
  };

  creationTime: number;
};

export type PostItemData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  currentUserLikedThisPost: boolean;
  commentCount: number;

  postDocId: string;

  nftStatus: {
    minted: boolean;
    mintTime: number;
    metadataLink: string;
    title: string;
    description: string;
    tokenId: number;
    contractAddress: string;
    openseaUrl: string;
    transferred: boolean;
    transferredAddress: string;
  };

  creationTime: number;
};

export type PostFrontData = {
  senderUsername: string;

  description: string;
  image: string;

  likeCount: number;
  currentUserLikedThisPost: boolean;
  commentCount: number;

  postDocId: string;

  nftStatus: {
    minted: boolean;
    mintTime: number;
    metadataLink: string;
    title: string;
    description: string;
    tokenId: number;
    contractAddress: string;
    openseaUrl: string;
    transferred: boolean;
    transferredAddress: string;
  };

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
  creationTime: number;
};

export type CommentDataWithCommentDocPath = {
  commentDocPath: string;
  commentSenderUsername: string;
  comment: string;
  creationTime: number;
};

export type OpenPanelName = "main" | "comments" | "likes" | "nft";

export type LikeData = {
  likeCount: number;
  likeColPath: string;
};

export type SendNftStatus =
  | "initial"
  | "uploadingMetadata"
  | "sendingRequest"
  | "waitingForConfirmation"
  | "updatingPost"
  | "final";

export type PostStatus = {
  loading: boolean;
};
