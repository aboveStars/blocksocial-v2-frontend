import { atom } from "recoil";

export interface CurrentUser {
  isThereCurrentUser: boolean;
  username: string;
  fullname: string;
  email: string;
  uid: string;
  profilePhoto?: string;
}

export interface UserInformation {
  username: string;
  fullname: string;
  email: string;
  uid: string;
  profilePhoto?: string;
}

const defaultState: CurrentUser = {
  isThereCurrentUser: false,
  username: "",
  fullname: "",
  email: "",
  uid: "",
};

export const currentUserStateAtom = atom<CurrentUser>({
  key: "currentUserAtom",
  default: defaultState,
});
