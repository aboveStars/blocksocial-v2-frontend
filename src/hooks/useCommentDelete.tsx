import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function useCommentDelete() {
  const [commentDeletionLoading, setCommentDeletionLoading] = useState(false);

  const commentDelete = async (userCommentDocPath: string) => {
    if (!userCommentDocPath) {
      return;
    }
    setCommentDeletionLoading(true);

    const fullPath = userCommentDocPath;
    const subStringtoDeleteIndex = fullPath.indexOf("comments");
    const postDocPath = fullPath.substring(0, subStringtoDeleteIndex);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error(
        "Error while comment deleting. Couln't be got idToken",
        error
      );
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/postCommentDelete", {
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
    } catch (error) {
      console.error("Error while fetching 'postCommentDelete' API", error);
      return;
    }

    if (!response.ok) {
      console.error(
        "Error while deleting comment from postCommentDelete API",
        await response.json()
      );
      return;
    }
    setCommentDeletionLoading(false);
  };
  return {
    commentDelete,
    commentDeletionLoading,
  };
}
