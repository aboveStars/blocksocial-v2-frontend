import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import {
  CurrentUser,
  currentUserStateAtom,
} from "@/components/atoms/currentUserAtom";
import { auth, firestore } from "@/firebase/clientApp";
import { FirebaseError } from "firebase/app";
import { signOut, User, UserCredential } from "firebase/auth";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { useResetRecoilState, useSetRecoilState } from "recoil";

const useAuthOperations = () => {
  const resetCurrentUserState = useResetRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);

  const [signOutLoading, setSignOutLoading] = useState(false);
  const [onSignUpLoading, setOnSignUpLoading] = useState(false);

  const [onSignUpError, setOnSignUpError] = useState("");

  const onSignOut = async () => {
    setSignOutLoading(true);

    // Firebase sign-out
    await signOut(auth);

    // Clear States
    resetCurrentUserState();
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: "logIn",
    }));

    setSignOutLoading(false);
  };

  const onSignUp = async (
    userCred: UserCredential,
    username: string,
    fullname: string
  ) => {
    const isTaken = await isUserNameTaken(username);

    // I don't trust front of frontend, states are being updated slowly
    if (isTaken) {
      console.log("Username is taken, aborting user creation");
      setOnSignUpError("Username is taken");
      return;
    }

    let errorHappened: boolean = false;

    setOnSignUpLoading(true);

    let user: User | null = null;
    let uid: string;

    try {
      user = userCred.user;
      uid = user.uid;

      const validUserObjectForFirestore = JSON.parse(JSON.stringify(user));

      const data = {
        username: username,
        fullname: fullname,
        ...validUserObjectForFirestore,
      };

      // creating batch
      const batch = writeBatch(firestore);

      // creating user object
      batch.set(doc(firestore, "users", `${username}`), data);

      // adding username to "usernames"
      batch.set(doc(firestore, "usernames", username), {});

      // commiting operations
      await batch.commit();
    } catch (error) {
      console.log("Error while second phase of User Creation", error);
      errorHappened = true;
    }

    if (errorHappened) {
      console.log(
        "Due to error on second-phase of user creating, we are now deleting user"
      );
      setOnSignUpError("Error while creating user :/");

      user?.delete();

      return;
    }

    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));

    setCurrentUserState((prev) => ({
      ...prev,
      isThereCurrentUser: true,
      uid: uid,
      fullname: fullname,
      username: username,
    }));

    setOnSignUpLoading(false);

    console.log("Phase 2 of SignUp is successfull. We are good to go.");
  };

  const isUserNameTaken = async (susUsername: string) => {
    if (!susUsername) return false;

    const susDocRef = doc(firestore, "usernames", susUsername);
    const susDocSnap = await getDoc(susDocRef);

    const existingStatus = susDocSnap.exists();

    return existingStatus;
  };

  return {
    onSignOut,
    signOutLoading,
    onSignUp,
    onSignUpError,
    onSignUpLoading,
    isUserNameTaken,
  };
};

export default useAuthOperations;
