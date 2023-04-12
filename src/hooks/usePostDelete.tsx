import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const postDelete = async (postDocPath: string) => {
    setPostDeletionLoading(true);
    console.log("Post Deletion is started");

    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/postDelete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ postDocPath: postDocPath }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      } else {
        console.log("Post successfully finished");
        setPostDeletionLoading(false);
      }
    } catch (error) {
      console.error("Error while deleting post", error);
    }
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
