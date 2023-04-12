import { atom } from "recoil";
import { PostStatus } from "../types/Post";

export const postsStatusAtom = atom<PostStatus>({
  key: "post-status-atom",
  default: {
    loading: true,

  },
});
