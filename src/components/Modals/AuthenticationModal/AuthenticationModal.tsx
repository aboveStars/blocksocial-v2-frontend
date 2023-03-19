import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";
import LogIn from "./LogIn";
import OAuthButtons from "./OAuthButtons";
import SignUp from "./SignUp";

export default function AuthenticationModal() {
  const [authModalState, setAuthModalState] =
    useRecoilState(authModalStateAtom);

  const handleClose = () => {
    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };
  return (
    <>
      <Modal isOpen={authModalState.open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            {authModalState.view == "logIn" && "Log In"}
            {authModalState.view == "signUp" && "Sign Up"}
            {authModalState.view == "resetPassword" && "Reset Password"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Flex
              direction="column"
              align="center"
              justifyContent="center"
              justify="center"
              width="70%"
              pb="6"
            >
              <OAuthButtons />
              {authModalState.view == "signUp" && <SignUp />}
              {authModalState.view == "logIn" && <LogIn />}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
