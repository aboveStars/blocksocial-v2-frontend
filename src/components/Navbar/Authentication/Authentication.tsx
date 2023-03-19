import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import AuthenticationModal from "@/components/Modals/AuthenticationModal/AuthenticationModal";

import useAuthOperations from "@/hooks/useAuthOperations";
import { Button, Stack } from "@chakra-ui/react";

import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

type AuthModalView = "logIn" | "signUp" | "resetPassword";

export default function Authentication() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const { onSignOut, signOutLoading } = useAuthOperations();

  const handleSignInUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    const eventSource = event.currentTarget.name;
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: eventSource as AuthModalView,
    }));
  };

  return (
    <>
      <Stack direction="row">
        {currentUserState.isThereCurrentUser ? (
          <Button
            name="signOut"
            onClick={() => {
              onSignOut();
            }}
            isLoading={signOutLoading}
          >
            Sign Out
          </Button>
        ) : (
          <>
            <Button name="logIn" onClick={handleSignInUp}>
              Log In
            </Button>
            <Button name="signUp" onClick={handleSignInUp}>
              Sign Up
            </Button>
          </>
        )}
      </Stack>
      <AuthenticationModal />
    </>
  );
}
