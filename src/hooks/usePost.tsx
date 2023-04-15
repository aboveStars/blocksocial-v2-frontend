import { auth } from "@/firebase/clientApp";

const usePost = () => {
  /**
   * Both for "like" and "deLike(removeLike)"
   * @param postId postId of post
   * @param opCode like : 1, deLike : -1
   */
  const like = async (postDocPath: string, opCode: number) => {
    console.log("Like Operation Started");

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      return console.error("Error while liking. Couln't be got idToken", error);
    }

    let response;
    try {
      response = await fetch("/api/postLike", {
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
      return console.error("Error while fetching to 'postLike' API", error);
    }

    if (!response.ok) {
      return console.error(
        "Error while liking from 'likePost' API",
        await response.json()
      );
    }
    console.log("Like operation successfull");
  };
  return {
    like,
  };
};
export default usePost;
