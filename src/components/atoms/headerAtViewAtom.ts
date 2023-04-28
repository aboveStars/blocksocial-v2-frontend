import { atom } from "recoil";
import { defaultUserInServer, UserInServer } from "../types/User";

export const headerAtViewAtom = atom<UserInServer>({
  key: "headerAtViewAtomKey",
  default: defaultUserInServer,
});
