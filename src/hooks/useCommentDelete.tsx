import { useState } from "react";

export default function useCommentDelete() {
  const [commentDeletionLoading, setCommentDeletionLoading] = useState(false);

  const commentDelete = async (userCommentDocPath: string) => {
    if (!!!userCommentDocPath) {
      console.log("Not ");
      return;
    }

    setCommentDeletionLoading(true);

    const fullPath = userCommentDocPath;
    const subStringtoDeleteIndex = fullPath.indexOf("comments");
    const postDocPath = fullPath.substring(0, subStringtoDeleteIndex);

    console.log("Comment Deletion is started");

    const response = await fetch("/api/postCommentDelete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commentDocPath: userCommentDocPath,
        postDocPath: postDocPath,
      }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error("Firebase Error while deleting post", firebaseError);
      } else {
        const { error } = await response.json();
        console.error("Non-Firebase Error while deleting post", error);
      }
    } else {
      console.log("Comment Deletion is succesfull");

      setCommentDeletionLoading(false);
    }
  };
  return {
    commentDelete,
    commentDeletionLoading,
  };
}
