import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useRecoilValue } from "recoil";

export default function useFollow() {
  const currentUserState = useRecoilValue(currentUserStateAtom);

  /**
   * @param username username to operate
   * @param opCode  1 for follow, -1 for unFollow
   */
  const follow = async (operateToUserName: string, opCode: number) => {
    // Check if there is a current user
    if (!currentUserState.isThereCurrentUser) {
      console.log("Login First");
      return;
    }
    // Check if we follow ourselves (normally user doesn't see button to follow himself but for any bug it is more safer)
    if (operateToUserName == currentUserState.username) {
      console.log("You can not follow or unfollow yourself ");
      return;
    }

    // Update to be followed user
    console.log("Updating otherman's data");
    const toBeFollowedDocRef = doc(firestore, `users/${operateToUserName}`);
    await updateDoc(toBeFollowedDocRef, {
      followerCount: increment(opCode),
      followers:
        opCode == 1
          ? arrayUnion(currentUserState.username)
          : arrayRemove(currentUserState.username),
    });

    // update current user

    console.log("Updating Our Data");

    const currentUserDocRef = doc(
      firestore,
      `users/${currentUserState.username}`
    );
    await updateDoc(currentUserDocRef, {
      followingCount: increment(opCode),
      followings:
        opCode == 1
          ? arrayUnion(operateToUserName)
          : arrayRemove(operateToUserName),
    });

    console.log("Following Operation Successfull");
  };

  return { follow };
}
