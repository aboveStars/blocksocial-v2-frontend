import { atom } from "recoil";
import { PostItemData } from "../types/Post";

export const postsAtViewAtom = atom<PostItemData[]>({
  key: "postsAtViewAtom",
  default: [],
});
