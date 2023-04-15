import { auth } from "@/firebase/clientApp";
import { useState } from "react";

export default function usePostDelete() {
  const [postDeletionLoading, setPostDeletionLoading] = useState(false);

  const postDelete = async (postDocPath: string) => {
    setPostDeletionLoading(true);
    console.log("Post Deletion is started");

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error(
        "Error while post deleting. Couln't be got idToken",
        error
      );
    }

    let response: Response;
    try {
      response = await fetch("/api/postDelete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ postDocPath: postDocPath }),
      });
    } catch (error) {
      return console.error("Error while fecthing to 'postDelete API'", error);
    }

    if (!response.ok) {
      return console.error(
        "Error while deleting post from 'postDelete' API",
        await response.json()
      );
    }

    console.log("Post successfully finished");
    setPostDeletionLoading(false);
  };
  return {
    postDelete,
    postDeletionLoading,
  };
}
