import { atom } from "recoil";

interface IProviderModalState {
  view: "chooseProvider" | "currentProvider";
  open: boolean;
}

export const providerModalStateAtom = atom<IProviderModalState>({
  key: "providerModalAtom",
  default: {
    view: "chooseProvider",
    open: false,
  },
});
