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
import ResetPassword from "./ResetPassword";

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
      <Modal
        isOpen={authModalState.open}
        onClose={handleClose}
        autoFocus={false}
      >
        <ModalOverlay backdropFilter="auto" backdropBlur="5px" />
        <ModalContent>
          <ModalHeader textAlign="center">
            {authModalState.view == "logIn" && "Log In"}
            {authModalState.view == "signUp" && "Sign Up"}
            {authModalState.view == "resetPassword" && "Reset Password"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" pb="6">
              <Text fontSize="2xl" fontWeight={700} mb={5} align="center">
                BlockSocial
              </Text>
              {authModalState.view == "signUp" && <SignUp />}
              {authModalState.view == "logIn" && <LogIn />}
              {authModalState.view === "resetPassword" && <ResetPassword />}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
