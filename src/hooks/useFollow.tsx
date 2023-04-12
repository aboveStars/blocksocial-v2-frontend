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
    try {
      if (!currentUserState.isThereCurrentUser) {
        throw new Error("There is no current user");
      }

      if (operateToUserName == currentUserState.username) {
        throw new Error("Self Follow Detected");
      }

      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          operationTo: operateToUserName,
          opCode: opCode,
        }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          const { firebaseError } = await response.json();
          throw new Error(firebaseError);
        } else {
          const { error } = await response.json();
          throw new Error(error);
        }
      } else {
        console.log("Following Operation Successfull");
      }
    } catch (error) {
      console.error("Error at follow operation:", error);
    }
  };

  return { follow };
}
