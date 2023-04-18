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

  email: string;
  uid: string;
}

export interface CurrentUser {
  isThereCurrentUser: boolean;
  loading: boolean;

  username: string;
  fullname: string;
  profilePhoto: string;

  followingCount: number;
  followerCount: number;

  email: string;
  uid: string;
}

export const defaultCurrentUserState: CurrentUser = {
  isThereCurrentUser: false,
  loading: true,

  username: "",
  fullname: "",
  profilePhoto: "",

  followingCount: 0,
  followerCount: 0,

  email: "",
  uid: "",
};
