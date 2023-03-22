import { atom } from "recoil";

export interface PostCreateModal {
  isOpen: boolean;
}

const defaultState: PostCreateModal = {
  isOpen: false,
};

export const postCreateModalStateAtom = atom<PostCreateModal>({
  key: "postCreateModal",
  default: defaultState,
});
