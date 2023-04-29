import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { headerAtViewAtom } from "@/components/atoms/headerAtViewAtom";
import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export default function useFollow() {
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const setHeaderAtView = useSetRecoilState(headerAtViewAtom);

  const router = useRouter();

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

    // if are on home page, disable all follow button other posts whose sender is same.

    let response: Response;
    try {
      response = await fetch("/api/follow", {
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
    } catch (error) {
      console.error("Error while 'fetching' to 'follow' API");

      return;
    }

    if (!response.ok) {
      console.error("Error from 'follow' API:", await response.json());
      return;
    }

    // update "header" locally
    // 1-) If we are in our page => we can just "follow" people so we should just update our "following" count
    // 2-) If we are in someone else page => we can follow that user or one of it follows or followers so we just need update its "follower count" (If we are in that user page.)

    if (router.asPath.includes(currentUserState.username)) {
      setHeaderAtView((prev) => ({
        ...prev,
        followingCount: prev.followingCount + opCode,
      }));
    } else if (router.asPath.includes(operateToUserName)) {
      setHeaderAtView((prev) => ({
        ...prev,
        followerCount: prev.followingCount + opCode,
      }));
    }
  };

  return { follow };
}
