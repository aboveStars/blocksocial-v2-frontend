import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import useAuthErrorCodes from "@/hooks/useAuthErrorCodes";
import {
  Input,
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { AuthError } from "firebase/auth";
import React, { useRef, useState } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

type Props = {};

export default function ResetPassword({}: Props) {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);

  const [email, setEmail] = useState("");

  const [sendResetEmailSendSuccessfull, setSendResetEmailSendSuccessfull] =
    useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const { getFriendlyAuthError } = useAuthErrorCodes();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendResetEmailSendSuccessfull(false);
    // Password Reset
    const sendPasswordResult = await sendPasswordResetEmail(email);
    if (!sendPasswordResult) {
      console.log("Error at sending");
      return;
    }
    console.log("Success at sending password reset");
    if (emailInputRef.current) emailInputRef.current.value = "";
    setSendResetEmailSendSuccessfull(true);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <FormControl variant="floating">
          <Input
            ref={emailInputRef}
            required
            name="email"
            placeholder=" "
            type="email"
            mb={2}
            onChange={(event) => setEmail(event.target.value)}
            _hover={{
              border: "1px solid",
              borderColor: "blue.500",
            }}
            borderColor={sending ? "unset" : error ? "red" : "unset"}
            bg="gray.50"
          />
          <FormLabel textColor="gray.500" fontSize="10pt">
            Email
          </FormLabel>
        </FormControl>

        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          bg="black"
          textColor="white"
          type="submit"
          isLoading={sending}
          _hover={{
            bg: "black",
            textColor: "white",
          }}
        >
          Send Reset Email
        </Button>

        <Flex align="center" justify="center" mb={2}>
          <Text color="red" fontSize="10pt">
            {error && getFriendlyAuthError(error as AuthError)}
          </Text>

          <Flex direction="column" align="center">
            <Text
              as="b"
              color="green"
              fontSize="10pt"
              hidden={!sendResetEmailSendSuccessfull}
            >
              Password reset email sent.
            </Text>
            <Text
              as="b"
              color="green"
              fontSize="10pt"
              hidden={!sendResetEmailSendSuccessfull}
            >
              Check your inbox.
            </Text>
          </Flex>
        </Flex>

        <Flex fontSize="9pt" justify="center">
          <Text mr={1}>New here?</Text>
          <Text
            color="blue.500"
            fontWeight={700}
            cursor="pointer"
            onClick={() =>
              setAuthModalState((prev) => ({ ...prev, view: "signUp" }))
            }
          >
            Sign Up
          </Text>
        </Flex>
        <Flex fontSize="9pt" justify="center">
          <Text mr={1}>Remembered your password?</Text>
          <Text
            color="blue.500"
            fontWeight={700}
            cursor="pointer"
            onClick={() =>
              setAuthModalState((prev) => ({ ...prev, view: "logIn" }))
            }
          >
            Log In
          </Text>
        </Flex>
      </form>
    </>
  );
}
