import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function useCommentDelete() {
  const [commentDeletionLoading, setCommentDeletionLoading] = useState(false);

  /**
   * @param userCommentDocPath
   * @returns true if operation is successfull, otherwise false
   */
  const commentDelete = async (userCommentDocPath: string) => {
    if (!userCommentDocPath) {
      return false;
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
      return false;
    }

    let response: Response;

    try {
      response = await fetch("/api/post/comment/postCommentDelete", {
        method: "POST",
        headers: {
          authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentDocPath: userCommentDocPath,
          postDocPath: postDocPath,
        }),
      });
    } catch (error) {
      console.error("Error while fetching 'postCommentDelete' API", error);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while deleting comment from postCommentDelete API",
        await response.json()
      );
      return false;
    }
    setCommentDeletionLoading(false);
    return true;
  };
  return {
    commentDelete,
    commentDeletionLoading,
  };
}
