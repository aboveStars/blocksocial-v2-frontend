import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
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

    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) {
      throw new Error("Id Token couldn't be get");
    }

    try {
      const response = await fetch("/api/postLike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          opCode: opCode,
          postDocPath: postDocPath,
          username: currentUserUsername,
        }),
      });

      if (!response.ok) {
        console.log("Like operation failed");
        const { error } = await response.json();
        throw new Error(error);
      } else {
        console.log("Like operation successfull");
      }
    } catch (error) {
      console.error("Error while like operation", error);
    }
  };
  return {
    like,
  };
};
export default usePost;
