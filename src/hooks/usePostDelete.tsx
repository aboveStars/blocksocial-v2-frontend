import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useState } from "react";
import { useRecoilState } from "recoil";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);

  const postDelete = async (postDocId: string) => {
    setPostDeletionLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error(
        "Error while post deleting. Couln't be got idToken",
        error
      );
    }

    let response: Response;
    try {
      response = await fetch("/api/postDelete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ postDocId: postDocId }),
      });
    } catch (error) {
      return console.error("Error while fecthing to 'postDelete API'", error);
    }

    if (!response.ok) {
      return console.error(
        "Error while deleting post from 'postDelete' API",
        await response.json()
      );
    }

    setPostsAtView((prev) => prev.filter((x) => x.postDocId !== postDocId));

    setPostDeletionLoading(false);
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
