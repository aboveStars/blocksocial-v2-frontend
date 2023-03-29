import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useRecoilState } from "recoil";
import LogIn from "./LogIn";

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
        <ModalOverlay backdropFilter="auto" backdropBlur="5px" />
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
              <Text fontSize="2xl" fontWeight={700} mb={5}>
                BlockSocial
              </Text>
              {authModalState.view == "signUp" && <SignUp />}
              {authModalState.view == "logIn" && <LogIn />}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
