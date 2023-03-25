import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import {
  CurrentUser,
  defaultCurrentUserState,
  defaultUserInformation,
  UserInformation,
} from "@/components/types/User";

import { auth, firestore } from "@/firebase/clientApp";
import { User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import useAuthErrorCodes from "./useAuthErrorCodes";

const useLoginOperations = () => {
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { getFriendlyAuthError } = useAuthErrorCodes();

  const [signInWithEmailAndPassword, , , loginBackendError] =
    useSignInWithEmailAndPassword(auth);

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /**
   * Starting point of login
   * @param email
   * @param password
   */
  const directLogin = async (email: string, password: string) => {
    setLoginLoading((prev) => true);
    const userCred = await signInWithEmailAndPassword(email, password);
    if (!userCred) {
      console.log("Error while login");
      setLoginLoading((prev) => false);
    } else await onLogin(userCred.user);
  };

  /**
   * Database operations after successfull login.
   * @param user
   * @returns
   */
  const onLogin = async (user: User) => {
    // getting user data from database
    const uid = user.uid;

    const userQuery = query(
      collection(firestore, "users"),
      where("uid", "==", uid)
    );
    const userQuerySnapshot = await getDocs(userQuery);

    let currentUserDataOnServer: UserInformation = defaultUserInformation;

    userQuerySnapshot.forEach((doc) => {
      currentUserDataOnServer = {
        username: doc.data().username,
        fullname: doc.data().fullname,
        followingCount: doc.data().followingCount,
        followings: doc.data().followings,
        followerCount: doc.data().followerCount,
        followers: doc.data().followers,
        email: doc.data().email,
        uid: doc.data().uid,
      };
    });

    if (!currentUserDataOnServer!) {
      console.log(
        "Error while getting user document, \n At sign-up it is right."
      );
      setLoginLoading((prev) => false);

      return;
    }

    const currentUserDataTemp: CurrentUser = {
      isThereCurrentUser: true,
      username: currentUserDataOnServer.username,
      fullname: currentUserDataOnServer.fullname,
      followingCount: currentUserDataOnServer.followingCount,
      followings: currentUserDataOnServer.followings,
      followerCount: currentUserDataOnServer.followerCount,
      followers: currentUserDataOnServer.followers,
      email: currentUserDataOnServer.email,
      uid: currentUserDataOnServer.uid,
    };

    // State Updates
    setCurrentUserState((prev) => currentUserDataTemp);

    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));

    setLoginLoading((prev) => false);
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
