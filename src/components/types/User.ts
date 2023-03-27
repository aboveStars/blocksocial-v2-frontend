export type UserInSearchbar = {
  username: string;
  fullname: string;
  profilePhoto: string;
};

export interface CurrentUser {
  isThereCurrentUser: boolean;
  loading: boolean;

  username: string;
  fullname: string;
  profilePhoto: string;

  followingCount: number;
  followings: string[];

  followerCount: number;
  followers: string[];

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
  followings: [],

  followerCount: 0,
  followers: [],

  email: "",
  uid: "",
};

/**
 * Mostly for Single User Page => /users/yunus20korkmaz03
 */
export interface UserInformation {
  username: string;
  fullname: string;
  profilePhoto: string;

  followingCount: number;
  followings: string[];

  followerCount: number;
  followers: string[];

  email: string;
  uid: string;
}

export const defaultUserInformation: UserInformation = {
  username: "",
  fullname: "",
  profilePhoto: "",

  followingCount: 0,
  followings: [],

  followerCount: 0,
  followers: [],

  email: "",
  uid: "",
};
