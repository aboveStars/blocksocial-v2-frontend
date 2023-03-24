export type UserInSearchbar = {
  username: string;
  fullname: string;
  profilePhoto?: string;
};

export interface CurrentUser {
  isThereCurrentUser: boolean;
  username: string;
  fullname: string;
  email: string;
  uid: string;
  profilePhoto?: string;
}

/**
 * Mostly for Single User Page => /users/yunus20korkmaz03
 */
export interface UserInformation {
  username: string;
  fullname: string;

  followingCount: number;
  followerCount: number;

  email: string;
  uid: string;
  profilePhoto?: string;
}
