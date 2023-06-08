import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { headerAtViewAtom } from "@/components/atoms/headerAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function useFollow() {
  const currentUserState = useRecoilValue(currentUserStateAtom);
  const setHeaderAtView = useSetRecoilState(headerAtViewAtom);

  const router = useRouter();

  /**
   *
   * @param operateToUserName Who will we follow or unfollow
   * @param opCode For follow operations use "1" otherwise (unfollow) use "-1"
   * @returns if there is a success true otherwise false.
   */
  const follow = async (operateToUserName: string, opCode: number) => {
    if (!currentUserState.isThereCurrentUser) {
      return false;
    }
    if (operateToUserName == currentUserState.username) {
      return false;
    }
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return false;
    }

    let response: Response;
    try {
      response = await fetch("/api/social/follow", {
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
      return false;
    }

    if (!response.ok) {
      console.error("Error from 'follow' API:", await response.json());
      return false;
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
        followerCount: prev.followerCount + opCode,
      }));
    }

    return true;
  };

  return { follow };
}
