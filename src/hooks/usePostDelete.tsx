import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useRecoilValue } from "recoil";

export default function usePostDelete() {
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const postDelete = async (postId: string) => {
    setPostDeletionLoading(true);
    console.log("Post Deletion is started");
    const postDocRef = query(
      collection(firestore, `users/${currentUserState.username}/posts`),
      where("id", "==", postId)
    );

    const postDoc = await getDocs(postDocRef);
    // postDocId and postID is different
    const postDocId = postDoc.docs[0].id;
    const postDocRefToDelete = doc(
      firestore,
      `users/${currentUserState.username}/posts/${postDocId}`
    );
    await deleteDoc(postDocRefToDelete);
    console.log("Post successfully finished");
    setPostDeletionLoading(false);
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
