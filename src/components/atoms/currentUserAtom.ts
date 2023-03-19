import { atom } from "recoil";

export interface CurrentUser {
  isThereCurrentUser: boolean;
  uid: string;
  username: string;
  fullname: string;
}

const defaultState: CurrentUser = {
  isThereCurrentUser: false,
  uid: "",
  username: "",
  fullname: "",
};

export const currentUserStateAtom = atom<CurrentUser>({
  key: "currentUserAtom",
  default: defaultState,
});
