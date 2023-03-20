import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import useLoginOperations from "@/hooks/useLoginOperations";

import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

export default function LogIn() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const [loginForm, setLoginForm] = useState({
    email: "",
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
    directLogin(loginForm.email, loginForm.password);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Input
          required
          name="email"
          placeholder="E-Mail"
          type="email"
          mb={2}
          onChange={onChange}
          fontSize="10pt"
          _placeholder={{
            color: "gray.500",
          }}
          _hover={{
            border: "1px solid",
            borderColor: "blue.500",
          }}
          bg="gray.50"
        />
        <Input
          required
          name="password"
          placeholder="Password"
          type="password"
          mb={1}
          onChange={onChange}
          fontSize="10pt"
          _placeholder={{
            color: "gray.500",
          }}
          _hover={{
            border: "1px solid",
            borderColor: "blue.500",
          }}
          bg="gray.50"
        />

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
          Log-In
        </Button>

        <Text color="red" textAlign="center" fontSize="10pt">
          {loginError}
        </Text>

        <Flex fontSize="9pt" justify="center">
          <Text mr={1}>New Here?</Text>
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
          <Text mr={1}>Forgot Password?</Text>
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
