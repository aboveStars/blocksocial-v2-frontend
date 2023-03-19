import { atom } from "recoil";

export interface AuthModalState {
  open: boolean;
  view: "logIn" | "signUp" | "resetPassword";
}

const defaultState: AuthModalState = {
  open: false,
  view: "logIn",
};

export const authModalStateAtom = atom<AuthModalState>({
  key: "authModalState",
  default: defaultState,
});
