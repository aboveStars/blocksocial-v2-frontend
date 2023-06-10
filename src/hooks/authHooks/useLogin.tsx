import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { CurrentUser, UserInServer } from "@/components/types/User";

import { providerModalStateAtom } from "@/components/atoms/providerModalAtom";
import { auth, firestore } from "@/firebase/clientApp";
import {
  User,
  UserCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { useSetRecoilState } from "recoil";
import useCheckProviderStatus from "../providerHooks/useCheckProviderStatus";

const useLogin = () => {
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const setProviderModalState = useSetRecoilState(providerModalStateAtom);

  const { checkProviderStatusOnLogin } = useCheckProviderStatus();

  /**
   * @param emailOrUsername
   * @param password
   */
  const logSignedOutUserIn = async (
    emailOrUsername: string,
    password: string
  ) => {
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

    if (!email) return false;

    let userCred: UserCredential;
    try {
      userCred = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error while logging provider.", error);
      return false;
    }

    return true;

    // logSignedUserIn automatically runs by "Layout"
  };

  /**
   * @param user
   * @returns
   */
  const logSignedUserIn = async (user: User) => {
    if (!user) return false;
    let signedInUserDocSnapshot: DocumentSnapshot<DocumentData>;
    try {
      signedInUserDocSnapshot = await getDoc(
        doc(firestore, `users/${user.displayName}`)
      );
    } catch (error) {
      console.error(
        "Error while log user in. (We were getting doc with userCred.",
        error
      );
      return false;
    }

    if (!signedInUserDocSnapshot.exists()) {
      console.error("Error while login. (User snapshot doesn't exixt)");
      return false;
    }

    let currentUserDataOnServer: UserInServer;

    currentUserDataOnServer = signedInUserDocSnapshot.data() as UserInServer;

    const currentUserDataTemp: CurrentUser = {
      isThereCurrentUser: true,

      username: currentUserDataOnServer.username,
      fullname: currentUserDataOnServer.fullname,
      profilePhoto: currentUserDataOnServer.profilePhoto,

      nftCount: currentUserDataOnServer.nftCount,

      email: currentUserDataOnServer.email,
      uid: currentUserDataOnServer.uid,
    };

    const operationResult = await checkProviderStatusOnLogin(
      user.displayName as string
    );

    if (operationResult === "server-error") return false;
    if (operationResult === "no-current-provider")
      setProviderModalState({ open: true, view: "chooseProvider" });

    if (operationResult === "expired")
      setProviderModalState({ open: true, view: "currentProvider" });

    // State Updates
    setCurrentUserState(currentUserDataTemp);

    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));

    return true;
  };

  return {
    logSignedOutUserIn,
    logSignedUserIn,
  };
};

export default useLogin;
