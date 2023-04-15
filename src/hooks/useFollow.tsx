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
    if (!currentUserState.isThereCurrentUser) {
      return;
    }

    if (operateToUserName == currentUserState.username) {
      return;
    }

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return;
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
      console.error("Error from 'follow' API:", await response.json());
      return;
    }
  };

  return { follow };
}
