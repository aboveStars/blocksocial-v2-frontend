import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";

import { Button, Flex, Icon, Image, SkeletonCircle } from "@chakra-ui/react";
import { useRouter } from "next/router";

import React from "react";
import { BsPersonCircle } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue, useSetRecoilState } from "recoil";

type AuthModalView = "logIn" | "signUp" | "resetPassword";

export default function Authentication() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const handleSignInUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    const eventSource = event.currentTarget.name;
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: eventSource as AuthModalView,
    }));
  };

  const router = useRouter();

  return (
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
                onClick={() => router.push(`/${currentUserState.username}`)}
              />
            )
          }
          cursor="pointer"
          onClick={() => router.push(`/${currentUserState.username}`)}
        />
      ) : currentUserState.loading ? (
        <></>
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
  );
}
