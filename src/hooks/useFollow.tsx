import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
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

    const idToken = await auth.currentUser?.getIdToken();

    const response = await fetch("/api/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        operationFrom: currentUserState.username,
        operationTo: operateToUserName,
        opCode: opCode,
      }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error(
          "Firebase Error while following operation",
          firebaseError
        );
      } else {
        const { error } = await response.json();
        console.error("Firebase Error while following operation", error);
      }
    } else {
      console.log("Following Operation Successfull");
    }
  };

  return { follow };
}
