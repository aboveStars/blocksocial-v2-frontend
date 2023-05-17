import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function useSendComment() {
  /**
   * No need to pass sender, it is currentUser.
   * @param postDocPath
   * @param comment
   * @returns comment doc-id of newly created comment if there is a success, otherwise an empty string
   */
  const sendComment = async (
    postDocPath: string,
    comment: string
  ): Promise<string> => {
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);

      return "";
    }

    let response: Response;
    try {
      response = await fetch("/api/post/sendPostComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          comment: comment,
          postDocPath: postDocPath,
        }),
      });
    } catch (error) {
      console.error("Error while 'fetching' to 'postComment' API", error);

      return "";
    }

    if (!response.ok) {
      console.error("Error from 'postComments' API:", await response.json());

      return "";
    }

    return (await response.json()).newCommentDocPath;
  };
  return {
    sendComment,
  };
}
