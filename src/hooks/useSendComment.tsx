import { auth } from "@/firebase/clientApp";

export default function useSendComment() {
  /**
   * No need to pass sender, it is currentUser.
   * @param postDocPath
   * @param comment
   */
  const sendComment = async (postDocPath: string, comment: string) => {
    console.log("Comment Sending Started");

    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/postComment", {
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
    } catch (error) {
      console.error("Error while sending comment", error);
    }
  };
  return {
    sendComment,
  };
}
