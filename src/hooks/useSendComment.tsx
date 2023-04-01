import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { CommentData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import { useRecoilValue } from "recoil";

export default function useSendComment() {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;

  /**
   * No need to pass sender, it is currentUser.
   * @param commentCollectionPath
   * @param comment
   */
  const sendComment = async (
    commentCollectionPath: string,
    comment: string
  ) => {
    // Send Post
    const newCommentDocRef = doc(collection(firestore, commentCollectionPath));

    const commentObject: CommentData = {
      commentSenderUsername: currentUserUsername,
      comment: comment,
      creationTime: serverTimestamp() as Timestamp,
    };

    await setDoc(newCommentDocRef, commentObject);

    // Update Comment Count
    const commentColPath = commentCollectionPath;
    const subStringtoDeleteIndex = commentColPath.indexOf("comments");
    const postDocPath = commentColPath.substring(0, subStringtoDeleteIndex);

    await updateDoc(doc(firestore, postDocPath), {
      commentCount: increment(1),
    });

    console.log("Comment Sent");
  };
  return {
    sendComment,
  };
}
