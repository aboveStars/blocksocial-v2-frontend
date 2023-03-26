import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import AuthenticationModal from "@/components/Modals/AuthenticationModal/AuthenticationModal";
import { auth } from "@/firebase/clientApp";
import useLoginOperations from "@/hooks/useLoginOperations";

import useAuthOperations from "@/hooks/useSignUpOperations";
import { Button, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";

type AuthModalView = "logIn" | "signUp" | "resetPassword";

export default function Authentication() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const { onSignOut, signOutLoading } = useAuthOperations();

  const [user, loading, error] = useAuthState(auth);

  const { onLogin } = useLoginOperations();

  const handleSignInUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    const eventSource = event.currentTarget.name;
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: eventSource as AuthModalView,
    }));
  };

  const router = useRouter();

  useEffect(() => {
    if (user) {
      onLogin(user);
    }
  }, [user]);

  useEffect(() => {
    if (!user)
      setCurrentUserState((prev) => ({
        ...prev,
        loading: loading,
      }));
  }, [loading]);

  return (
    <>
      <Stack direction="row">
        {currentUserState.isThereCurrentUser ? (
          <>
            <Button
              onClick={() => router.push(`/users/${currentUserState.username}`)}
              colorScheme="blue"
              variant="solid"
              size={{
                base: "sm",
                sm: "sm",
                md: "md",
                lg: "md",
              }}
            >
              <Text>{currentUserState.username}</Text>
            </Button>
            <Button
              name="signOut"
              onClick={() => {
                onSignOut();
              }}
              isLoading={signOutLoading}
              variant="outline"
              colorScheme="blue"
              size={{
                base: "sm",
                sm: "sm",
                md: "md",
                lg: "md",
              }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button
              name="logIn"
              onClick={handleSignInUp}
              variant="outline"
              colorScheme="blue"
              size={{
                base: "sm",
                sm: "sm",
                md: "md",
                lg: "md",
              }}
            >
              Log In
            </Button>
            <Button
              name="signUp"
              onClick={handleSignInUp}
              variant="solid"
              colorScheme="blue"
              size={{
                base: "sm",
                sm: "sm",
                md: "md",
                lg: "md",
              }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Stack>
      <AuthenticationModal />
    </>
  );
}
