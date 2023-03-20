import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth, firestore } from "@/firebase/clientApp";
import { signOut, User, UserCredential } from "firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useResetRecoilState, useSetRecoilState } from "recoil";
import useAuthErrorCodes from "./useAuthErrorCodes";

const useSignUpOperations = () => {
  const resetCurrentUserState = useResetRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);

  const [signOutLoading, setSignOutLoading] = useState(false);

  const [onSignUpLoading, setOnSignUpLoading] = useState(false);
  const [error, setError] = useState("");

  const [createUserWithEmailAndPassword, , , signUpBackendError] =
    useCreateUserWithEmailAndPassword(auth, {
      sendEmailVerification: true,
    });

  const { getFriendlyAuthError } = useAuthErrorCodes();

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
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => {
    console.log("We are phase-1");
    setError("");

    setOnSignUpLoading((prev) => true);

    const isTaken = await isUserNameTaken(username);
    // I don't trust front of frontend, states are being updated slowly
    if (isTaken) {
      console.log("Username is taken, aborting user creation");
      setError("Username is taken");
      setOnSignUpLoading((prev) => false);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(
      email,
      password
    );
    if (!userCredential) {
      console.log("Error at Phase-1");
      setOnSignUpLoading((prev) => false);
      return;
    }

    console.log("Phase-1 successfull");
    onSignUpPhase2(userCredential, username, fullName);
  };

  const onSignUpPhase2 = async (
    userCred: UserCredential,
    username: string,
    fullname: string
  ) => {
    console.log("We are phase-2");
    let errorHappened: boolean = false;

    let user: User | null | undefined = null;

    try {
      user = userCred?.user;

      const data = {
        username: username,
        fullname: fullname,
        email: user.email,
        uid: user.uid,
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
      setError("Error while creating user :/");
      setOnSignUpLoading((prev) => false);

      user?.delete();

      return;
    }

    // Normally these are login things
    // In future, these may be transferred to useSignIn
    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));

    setCurrentUserState((prev) => ({
      isThereCurrentUser: true,
      fullname: fullname,
      username: username,
      email: user?.email || "",
      uid: user?.uid || "",
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

  useEffect(() => {
    if (signUpBackendError) {
      const friendlyError = getFriendlyAuthError(signUpBackendError);
      if (friendlyError) setError((pref) => friendlyError);
    }
  }, [signUpBackendError]);

  return {
    onSignOut,
    signOutLoading,
    onSignUp,
    error,
    setError,
    onSignUpLoading,
    isUserNameTaken,
  };
};

export default useSignUpOperations;
