import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";

import { useRecoilValue } from "recoil";

export default function useSendComment() {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;

  /**
   * No need to pass sender, it is currentUser.
   * @param postDocPath
   * @param comment
   */
  const sendComment = async (postDocPath: string, comment: string) => {
    console.log("Comment Sending Started");

    const response = await fetch("/api/postComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: comment,
        username: currentUserUsername,
        postDocPath: postDocPath,
      }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error("Firebase Error while sending comment", firebaseError);
      } else {
        const { error } = await response.json();
        console.error("Non-Firebase error while sending comment", error);
      }
    } else {
      console.log("Comment Sent");
    }
  };
  return {
    sendComment,
  };
}
