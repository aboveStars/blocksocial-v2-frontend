import { auth } from "@/firebase/clientApp";

const usePostLike = () => {
  /**
   * @param postDocPath
   * @param opCode "1" for like "-1" for like-remove
   * @returns true if operation is successfull, otherwise false.
   */
  const like = async (postDocPath: string, opCode: number) => {
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while liking. Couln't be got idToken", error);
      return false;
    }

    let response;
    try {
      response = await fetch("/api/post/postLike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          opCode: opCode,
          postDocPath: postDocPath,
        }),
      });
    } catch (error) {
      console.error("Error while fetching to 'postLike' API", error);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while liking from 'likePost' API",
        await response.json()
      );
      return false;
    }

    return true;
  };
  return {
    like,
  };
};
export default usePostLike;
