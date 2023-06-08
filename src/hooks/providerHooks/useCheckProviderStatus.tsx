import { firestore } from "@/firebase/clientApp";
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

export default function useCheckProviderStatus() {
  const checkProviderStatusOnLogin = async (
    username: string
  ): Promise<
    "server-error" | "no-current-provider" | "expired" | "good-to-go"
  > => {
    let currentProviderDoc: DocumentSnapshot<DocumentData>;
    try {
      currentProviderDoc = await getDoc(
        doc(firestore, `users/${username}/provider/currentProvider`)
      );
    } catch (error) {
      console.error("Error while getting current provider doc", error);
      return "server-error";
    }
    if (!currentProviderDoc.exists()) return "no-current-provider";

    const endTimeInServer = currentProviderDoc.data().endTime;
    if (Date.now() >= endTimeInServer) return "expired";

    return "good-to-go";
  };

  return { checkProviderStatusOnLogin };
}
