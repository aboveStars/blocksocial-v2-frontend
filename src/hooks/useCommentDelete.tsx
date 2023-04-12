import { auth } from "@/firebase/clientApp";
import { useState } from "react";
import safeJsonStringify from "safe-json-stringify";

export default function useCommentDelete() {
  const [commentDeletionLoading, setCommentDeletionLoading] = useState(false);

  const commentDelete = async (userCommentDocPath: string) => {
    if (!!!userCommentDocPath) {
      return;
    }

    setCommentDeletionLoading(true);

    const fullPath = userCommentDocPath;
    const subStringtoDeleteIndex = fullPath.indexOf("comments");
    const postDocPath = fullPath.substring(0, subStringtoDeleteIndex);

    console.log("Comment Deletion is started");

    const idToken = await auth.currentUser?.getIdToken();

    try {
      const response = await fetch("/api/postCommentDelete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          commentDocPath: userCommentDocPath,
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(safeJsonStringify(error));
      } else {
        console.log("Comment Deletion is succesfull");
        setCommentDeletionLoading(false);
      }
    } catch (error) {
      console.error("Error while deleting comment", error);
    }
  };
  return {
    commentDelete,
    commentDeletionLoading,
  };
}
