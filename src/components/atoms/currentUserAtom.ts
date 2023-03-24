import { atom } from "recoil";
import { CurrentUser } from "../types/User";


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
