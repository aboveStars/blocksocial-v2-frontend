import { auth } from "@/firebase/clientApp";

export default function useRateProvider() {
  const rateProvider = async (score: number) => {
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return false;
    }

    let response: Response;
    try {
      response = await fetch("/api/provider/rateProvider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          score: score,
        }),
      });
    } catch (error) {
      console.error("Error while 'fetching' to 'rateProvider' API");
      return false;
    }

    if (!response.ok) {
      console.error("Error from 'rateProvider' API:", await response.json());
      return false;
    }

    return true;
  };

  return { rateProvider };
}
