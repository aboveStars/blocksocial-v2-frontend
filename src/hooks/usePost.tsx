import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { useRecoilValue } from "recoil";

const usePost = () => {
  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;

  /**
   * Both for "like" and "deLike(removeLike)"
   * @param postId postId of post
   * @param opCode like : 1, deLike : -1
   */
  const like = async (postDocPath: string, opCode: number) => {
    console.log("Like Operation Started");

    const response = await fetch("/api/postLike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opCode: opCode,
        postDocPath: postDocPath,
        username: currentUserUsername,
      }),
    });

    if (!response.ok) {
      console.log("Like operation failed");
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.error("Firebase Error while like", firebaseError);
      } else {
        const { error } = await response.json();
        console.error("Non-Firebase Error while like", error);
      }
    } else {
      console.log("Like operation successfull");
    }
  };
  return {
    like,
  };
};
export default usePost;
