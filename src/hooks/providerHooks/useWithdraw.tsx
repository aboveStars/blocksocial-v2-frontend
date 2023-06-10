import { auth } from "@/firebase/clientApp";

export default function useWithdraw() {
  const withdraw = async (withdrawAddress: string) => {
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return false;
    }

    let response;
    try {
      response = await fetch("/api/provider/withdraw", {
        method: "POST",
        headers: {
          authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawAddress: withdrawAddress,
        }),
      });
    } catch (error) {
      console.error("Error while fething withdraw API", error);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while withdraw from withdraw API",
        await response.text()
      );
      return false;
    }

    return true;
  };
  return { withdraw };
}
