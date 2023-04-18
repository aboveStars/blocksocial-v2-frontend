import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { CurrentUser, UserInServer } from "@/components/types/User";

import { auth, firestore } from "@/firebase/clientApp";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
   * @param emailOrUsername
   * @param password
   */
  const directLogin = async (emailOrUsername: string, password: string) => {
    setLoginLoading((prev) => true);

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
      setLoginLoading((prev) => false);
    } else await onLogin(userCred.user);
  };

  /**
   * Database operations after successfull login.
   * @param user
   * @returns
   */
  const onLogin = async (user: User) => {
    // check if user has display name if not, update auth object

    const displayName = user.displayName;
    let username: string = "";
    if (!displayName) {
      username = await handleDisplayNameUpdate();
    } else {
      username = displayName;
    }

    const userDoc = await getDoc(doc(firestore, `users/${username}`));

    let currentUserDataOnServer: UserInServer;

    if (userDoc.exists())
      currentUserDataOnServer = {
        username: userDoc.data().username,
        fullname: userDoc.data().fullname,
        profilePhoto: userDoc.data().profilePhoto,

        followingCount: userDoc.data().followingCount,
        followerCount: userDoc.data().followerCount,

        email: userDoc.data().email,
        uid: userDoc.data().uid,
      };

    if (!currentUserDataOnServer!) {
      console.log(
        "Error while getting user document, \n At sign-up it is right."
      );
      setLoginLoading((prev) => false);

      return;
    }

    const currentUserDataTemp: CurrentUser = {
      isThereCurrentUser: true,
      loading: false,

      username: currentUserDataOnServer.username,
      fullname: currentUserDataOnServer.fullname,
      profilePhoto: currentUserDataOnServer.profilePhoto,

      followingCount: currentUserDataOnServer.followingCount,
      followerCount: currentUserDataOnServer.followerCount,

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

  const handleDisplayNameUpdate = async () => {
    console.log("We are updating user");

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      return;
    }

    let response: Response;

    try {
      response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          idToken: idToken,
        }),
      });
    } catch (error) {
      return console.error("Error while fetching to 'update' API", error);
    }

    if (!response.ok) {
      return console.error(
        "Error on update from 'update' API",
        await response.json()
      );
    }

    const { createdDisplayName } = await response.json();

    console.log("User updated:", createdDisplayName);

    return createdDisplayName;
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
