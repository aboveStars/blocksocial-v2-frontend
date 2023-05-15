import { atom } from "recoil";

interface IProviderModalState {
  view: "chooseProvider" | "changeProvider";
  open: boolean;
}

export const providerModalStateAtom = atom<IProviderModalState>({
  key: "providerModalAtom",
  default: {
    view: "chooseProvider",
    open: false,
  },
});
