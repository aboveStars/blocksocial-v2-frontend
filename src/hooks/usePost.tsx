import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRecoilValue } from "recoil";

const usePost = () => {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;

  /**
   * Both for "like" and "deLike(removeLike)"
   * @param postId postId of post
   * @param opCode like : 1, deLike : -1
   */
  const like = async (
    postId: string,
    postSenderUsername: string,
    opCode: number
  ) => {
    console.log("Like Operation Started");
    const postDocQuery = query(
      collection(firestore, `users/${postSenderUsername}/posts`),
      where("id", "==", postId)
    );
    // This query size will be 1.
    const postDocSnapshot = await getDocs(postDocQuery);

    // I am sure it does exist
    const postDoc = postDocSnapshot.docs[0];
    const postDocId = postDoc.id;

    const postDocRef = doc(
      firestore,
      `users/${postSenderUsername}/posts/${postDocId}`
    );

    console.log("Updating Like Count...");
    await updateDoc(postDocRef, {
      likeCount: increment(opCode),
    });
    console.log("Updating whoLiked array....");

    await updateDoc(postDocRef, {
      whoLiked:
        opCode == 1
          ? arrayUnion(currentUserUsername)
          : arrayRemove(currentUserUsername),
    });
    console.log("Like operation successfull");
  };
  return {
    like,
  };
};
export default usePost;
