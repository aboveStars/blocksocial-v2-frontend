import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";

export default function useGetFullname() {
  /**
   * Give username and if exists, returns username.
   * Future, it will save (username => fullname (dataURL)) at atom
   * @param username
   */
  const getFullname = async (username: string): Promise<string> => {
    // userDocRef
    const userDocRef = doc(firestore, `users/${username}`);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) return userDocSnapshot.data().fullname;
    else {
      console.log("No user with this username to get full name");
      return "";
    }
  };

  return {
    getFullname,
  };
}
