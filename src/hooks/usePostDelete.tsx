import { useState } from "react";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const postDelete = async (postDocPath: string) => {
    setPostDeletionLoading(true);
    console.log("Post Deletion is started");

    const response = await fetch("/api/postDelete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postDocPath: postDocPath }),
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
      console.log("Post successfully finished");
      setPostDeletionLoading(false);
    }
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
