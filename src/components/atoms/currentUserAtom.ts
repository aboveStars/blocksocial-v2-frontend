import { atom } from "recoil";
import { CurrentUser, defaultCurrentUserState } from "../types/User";

export const currentUserStateAtom = atom<CurrentUser>({
  key: "currentUserAtom",
  default: defaultCurrentUserState,
});
