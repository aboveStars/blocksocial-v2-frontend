import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { headerAtViewAtom } from "@/components/atoms/headerAtViewAtom";
import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);
  const setHeaderAtView = useSetRecoilState(headerAtViewAtom);

  const router = useRouter();
  const currentUserState = useRecoilValue(currentUserStateAtom);

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
    if (
      router.asPath.includes(currentUserState.username) &&
      postsAtView.find((a) => a.postDocId === postDocId)?.nftStatus.minted
    ) {
      setHeaderAtView((prev) => ({ ...prev, nftCount: prev.nftCount - 1 }));
    }
    setPostsAtView((prev) => prev.filter((x) => x.postDocId !== postDocId));

    setPostDeletionLoading(false);
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
