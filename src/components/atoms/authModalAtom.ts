import { atom } from "recoil";

export interface AuthModalState {
  open: boolean;
  view: "logIn" | "signUp" | "resetPassword";
}

export const defaultAuthModalState: AuthModalState = {
  open: false,
  view: "logIn",
};

export const authModalStateAtom = atom<AuthModalState>({
  key: "authModalState",
  default: defaultAuthModalState,
});
