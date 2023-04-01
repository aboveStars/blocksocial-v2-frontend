import { firestore } from "@/firebase/clientApp";

import { deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function useCommentDelete() {
  const [commentDeletionLoading, setCommentDeletionLoading] = useState(false);

  const commentDelete = async (userCommentDocPath: string) => {
    if (!!!userCommentDocPath) {
      console.log("Not ");
      return;
    }

    // Comment Deletion
    if (commentDeletionLoading) {
      console.log("Already deleting...");
      return;
    }
    setCommentDeletionLoading(true);
    console.log("Comment Deletion is started");

    await deleteDoc(doc(firestore, userCommentDocPath));

    console.log("Comment Deletion is succesfull");

    // Update Comment Count
    const fullPath = userCommentDocPath;
    const subStringtoDeleteIndex = fullPath.indexOf("comments");
    const postDocPath = fullPath.substring(0, subStringtoDeleteIndex);

    updateDoc(doc(firestore, postDocPath), {
      commentCount: increment(-1),
    });

    setCommentDeletionLoading(false);
  };
  return {
    commentDelete,
    commentDeletionLoading,
  };
}
