export type UserInSearchbar = {
  username: string;
  fullname: string;
  profilePhoto: string;
};

export interface UserInServer {
  username: string;
  fullname: string;
  profilePhoto: string;

  followingCount: number;
  followerCount: number;

  nftCount: number;

  email: string;
  uid: string;
}

export const defaultUserInServer: UserInServer = {
  username: "",
  fullname: "",
  profilePhoto: "",

  followingCount: -1,
  followerCount: -1,

  nftCount: -1,

  email: "",
  uid: "",
};

export interface CurrentUser {
  isThereCurrentUser: boolean;
  loading: boolean;

  username: string;
  fullname: string;
  profilePhoto: string;

  nftCount: number;

  email: string;
  uid: string;
}

export const defaultCurrentUserState: CurrentUser = {
  isThereCurrentUser: false,
  loading: true,

  username: "",
  fullname: "",
  profilePhoto: "",

  nftCount: 0,

  email: "",
  uid: "",
};

export interface INotificationServerData {
  notificationTime: number;
  seen: boolean;
  sender: string;
  cause: "like" | "follow" | "comment";
  commentDocPath?: string;
}

/**
 * Interface for link previews in social medias.
 */
export interface IPagePreviewData {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
}

export interface IProviderSettings {
  apiEndpoint: string;
  currency: string;
  deal: number;
  name: string;
  startTime: number;
  endTime: number;
}

export interface IProviderCard {
  currency: string;
  deal: number;
  name: string;
  description: string;
  image: string;
}

export interface InitialSignUpForm {
  email: string;
  fullname: string;
  username: string;
  password: string;
}
