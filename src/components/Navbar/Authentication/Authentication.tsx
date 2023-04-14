import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
import useLoginOperations from "@/hooks/useLoginOperations";

import {
  Button,
  Flex,
  Icon,
  Image,
  SkeletonCircle,
  Spinner
} from "@chakra-ui/react";
import { useRouter } from "next/router";

import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsPersonCircle } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { useRecoilState, useSetRecoilState } from "recoil";

type AuthModalView = "logIn" | "signUp" | "resetPassword";

export default function Authentication() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

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
      <Flex>
        {currentUserState.isThereCurrentUser ? (
          <Image
            alt=""
            src={currentUserState.profilePhoto}
            rounded="full"
            width="40px"
            fallback={
              currentUserState.profilePhoto ||
              !currentUserState.isThereCurrentUser ? (
                <SkeletonCircle
                  width="40px"
                  height="40px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              ) : (
                <Icon
                  as={CgProfile}
                  color="white"
                  height="40px"
                  width="40px"
                  cursor="pointer"
                  onClick={() =>
                    router.push(`/users/${currentUserState.username}`)
                  }
                />
              )
            }
            cursor="pointer"
            onClick={() => router.push(`/users/${currentUserState.username}`)}
          />
        ) : currentUserState.loading ? (
          <Flex align="center">
            <Spinner size="md" color="white" />
          </Flex>
        ) : (
          <>
            <Flex
              id="big-screen-auth-buttons"
              gap={2}
              display={{
                base: "none",
                sm: "none",
                md: "flex",
                lg: "flex",
              }}
            >
              <Button
                name="logIn"
                onClick={handleSignInUp}
                variant="outline"
                colorScheme="blue"
                size="md"
              >
                Log In
              </Button>
              <Button
                name="signUp"
                onClick={handleSignInUp}
                variant="solid"
                colorScheme="blue"
                size="md"
              >
                Sign Up
              </Button>
            </Flex>
            <Flex
              display={{
                base: "flex",
                sm: "flex",
                md: "none",
                lg: "none",
              }}
            >
              <Icon
                as={BsPersonCircle}
                color="white"
                fontSize="40px"
                cursor="pointer"
                onClick={() =>
                  setAuthModalState((prev) => ({
                    ...prev,
                    open: true,
                    view: "logIn",
                  }))
                }
              />
            </Flex>
          </>
        )}
      </Flex>
    
    </>
  );
}
