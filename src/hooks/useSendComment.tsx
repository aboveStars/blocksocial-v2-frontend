import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function useSendComment() {
  const [commentSendLoading, setCommentSendLoading] = useState(false);

  /**
   * No need to pass sender, it is currentUser.
   * @param postDocPath
   * @param comment
   */
  const sendComment = async (
    postDocPath: string,
    comment: string
  ): Promise<string> => {
    setCommentSendLoading(true);
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      setCommentSendLoading(false);

      return "";
    }

    let response: Response;
    try {
      response = await fetch("/api/postComment", {
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
      setCommentSendLoading(false);
      return "";
    }

    if (!response.ok) {
      console.error("Error from 'postComments' API:", await response.json());
      setCommentSendLoading(false);
      return "";
    }

    setCommentSendLoading(false);

    return (await response.json()).newCommentDocPath;
  };
  return {
    sendComment,
    commentSendLoading
  };
}
