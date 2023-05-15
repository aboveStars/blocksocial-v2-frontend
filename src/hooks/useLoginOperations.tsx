import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { CurrentUser, UserInServer } from "@/components/types/User";

import { auth, firestore } from "@/firebase/clientApp";
import { User } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import useAuthErrorCodes from "./useAuthErrorCodes";
import { providerModalStateAtom } from "@/components/atoms/providerModalAtom";

const useLoginOperations = () => {
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { getFriendlyAuthError } = useAuthErrorCodes();

  const [signInWithEmailAndPassword, , , loginBackendError] =
    useSignInWithEmailAndPassword(auth);

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const setProviderModalState = useSetRecoilState(providerModalStateAtom);

  /**
   * Starting point of login
   * @param emailOrUsername
   * @param password
   */
  const directLogin = async (emailOrUsername: string, password: string) => {
    setLoginLoading(true);

    let email: string = "";

    const emailRegex = /\S+@\S+\.\S+/;
    const isEmail = emailRegex.test(emailOrUsername);

    if (isEmail) {
      email = emailOrUsername;
    } else {
      const username = emailOrUsername;
      const userDocSnapshot = await getDoc(doc(firestore, `users/${username}`));

      if (!userDocSnapshot.exists()) {
        email = "";
      } else {
        email = userDocSnapshot.data().email;
      }
    }

    if (!email) {
      setLoginLoading(false);
      setLoginError("Invalid username or email");
      return;
    }

    const userCred = await signInWithEmailAndPassword(email, password);
    if (!userCred) {
      console.log("Error while login");
      setLoginLoading(false);
    } else await onLogin(userCred.user);
  };

  /**
   * Database operations after successfull login.
   * @param user
   * @returns
   */
  const onLogin = async (user: User) => {
    const displayName = user.displayName;
    let username = displayName as string;

    const userDoc = await getDoc(doc(firestore, `users/${username}`));

    let currentUserDataOnServer: UserInServer;

    if (userDoc.exists()) {
      currentUserDataOnServer = {
        username: userDoc.data().username,
        fullname: userDoc.data().fullname,
        profilePhoto: userDoc.data().profilePhoto,

        followingCount: userDoc.data().followingCount,
        followerCount: userDoc.data().followerCount,

        nftCount: userDoc.data().nftCount,

        email: userDoc.data().email,
        uid: userDoc.data().uid,
      };
    } else {
      return setLoginLoading(false);
    }

    const currentUserDataTemp: CurrentUser = {
      isThereCurrentUser: true,
      loading: false,

      username: currentUserDataOnServer.username,
      fullname: currentUserDataOnServer.fullname,
      profilePhoto: currentUserDataOnServer.profilePhoto,

      nftCount: currentUserDataOnServer.nftCount,

      email: currentUserDataOnServer.email,
      uid: currentUserDataOnServer.uid,
    };

    // check if user has a provider

    try {
      const currentProviderSnapshot = await getDoc(
        doc(firestore, `users/${displayName}/provider/currentProvider`)
      );

      if (!currentProviderSnapshot.exists()) {
        setProviderModalState({ open: true, view: "chooseProvider" });
      }
    } catch (error) {
      console.error("Error while getting provider", error);
      return;
    }

    // State Updates
    setCurrentUserState(currentUserDataTemp);

    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));

    setLoginLoading(false);
  };

  useEffect(() => {
    if (loginBackendError) {
      const friendlyError = getFriendlyAuthError(loginBackendError);
      if (friendlyError) setLoginError(friendlyError);
    }
  }, [loginBackendError]);

  return {
    onLogin,
    directLogin,
    loginLoading,
    loginError,
    setLoginError,
  };
};

export default useLoginOperations;
