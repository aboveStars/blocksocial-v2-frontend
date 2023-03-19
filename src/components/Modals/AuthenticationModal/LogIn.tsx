import { authModalStateAtom } from "@/components/atoms/authModalAtom";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { auth } from "@/firebase/clientApp";
import { Input, Button, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

export default function LogIn() {
  const setAuthModalState = useSetRecoilState(authModalStateAtom);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);

  const [signInWithEmailAndPassword, userCred, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signInWithEmailAndPassword(loginForm.email, loginForm.password);
  };

  const handleSuccessfullLogin = () => {
    console.log("User Succeffuly Signed-In");

    console.log("UserCred: ", userCred);

    // State Updates
    setCurrentUserState((prev) => ({
      ...prev,
      isThereCurrentUser: true,
    }));

    setAuthModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };

  useEffect(() => {
    if (userCred) {
      handleSuccessfullLogin();
    }
  }, [userCred]);

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
          type="submit"
          isLoading={loading}
        >
          Log In
        </Button>
        {error && (
          <Text color="red" textAlign="center" fontSize="10pt">
            {error.message}
          </Text>
        )}
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
