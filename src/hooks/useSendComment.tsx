import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { CommentData } from "@/components/types/Post";
import { firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
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
    comment: string,
    postId: string,
    postSenderUserName: string
  ) => {
    // Send Post
    const newCommentDocRef = doc(collection(firestore, commentCollectionPath));

    const commentObject: CommentData = {
      commentSenderUsername: currentUserUsername,
      comment: comment,
    };

    await setDoc(newCommentDocRef, commentObject);
    console.log("Comment Sent");

    // Update Comment Count
    const q = query(
      collection(firestore, `users/${postSenderUserName}/posts/`),
      where("id", "==", postId)
    );
    const postDocId = (await getDocs(q)).docs[0].id;
    const postDocRef = doc(
      firestore,
      `users/${postSenderUserName}/posts/${postDocId}`
    );
    await updateDoc(postDocRef, {
      commentCount: increment(1),
    });
  };
  return {
    sendComment,
  };
}
