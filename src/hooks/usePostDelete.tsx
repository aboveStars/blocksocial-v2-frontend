import { firestore } from "@/firebase/clientApp";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const postDelete = async (postDocPath: string) => {
    setPostDeletionLoading(true);
    console.log("Post Deletion is started");

    const postDocRefToDelete = doc(firestore, postDocPath);
    await deleteDoc(postDocRefToDelete);
    console.log("Post successfully finished");
    setPostDeletionLoading(false);
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
