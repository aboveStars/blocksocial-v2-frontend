import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import useLoginOperations from "@/hooks/useLoginOperations";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

export default function LogIn() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: "",
    password: "",
  });

  const { directLogin, loginLoading, loginError, setLoginError } =
    useLoginOperations();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginError("");
    setLoginForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    directLogin(loginForm.emailOrUsername, loginForm.password);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={1}>
          <FormControl variant="floating">
            <Input
              required
              name="emailOrUsername"
              placeholder=" "
              type="text"
              mb={2}
              onChange={onChange}
              _hover={{
                border: "1px solid",
                borderColor: "blue.500",
              }}
              bg="gray.50"
            />
            <FormLabel
              bg="rgba(248,250,252,1)"
              textColor="gray.500"
              fontSize="10pt"
              my="2.5"
            >
              Email or Username
            </FormLabel>
          </FormControl>

          <FormControl variant="floating">
            <Input
              required
              name="password"
              placeholder=" "
              type="password"
              mb={1}
              onChange={onChange}
              _hover={{
                border: "1px solid",
                borderColor: "blue.500",
              }}
              bg="gray.50"
            />
            <FormLabel
              bg="rgba(248,250,252,1)"
              textColor="gray.500"
              fontSize="10pt"
              my="2.5"
            >
              Password
            </FormLabel>
          </FormControl>
        </Flex>

        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          bg="black"
          textColor="white"
          type="submit"
          isLoading={loginLoading}
          _hover={{
            bg: "black",
            textColor: "white",
          }}
        >
          Log In
        </Button>

        <Text color="red" textAlign="center" fontSize="10pt">
          {loginError}
        </Text>

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
          <Text mr={1}>Forgot password?</Text>
          <Text
            color="blue.500"
            fontWeight={700}
            cursor="pointer"
            onClick={() =>
              setAuthModalState((prev) => ({ ...prev, view: "resetPassword" }))
            }
          >
            Reset
          </Text>
        </Flex>
      </form>
    </>
  );
}
