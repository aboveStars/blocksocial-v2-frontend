import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";

export default function useGetProfilePhoto() {
  /**
   * Give username and if exists, returns downloadable URL.
   * If there is user, but no pp then returns empty string
   * Future, it will save (username => profilePhoto (dataURL)) at atom
   * @param username
   */
  const getProfilePhotoURL = async (username: string): Promise<string> => {
    // userDocRef
    const userDocRef = doc(firestore, `users/${username}`);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) return userDocSnapshot.data().profilePhoto;
    else {
      console.log("No user with this username to get pp");
      return "";
    }
  };

  return {
    getProfilePhotoURL,
  };
}
