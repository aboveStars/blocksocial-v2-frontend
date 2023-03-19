import { authModalStateAtom } from "@/components/atoms/authModalAtom";

import { auth, firestore } from "@/firebase/clientApp";
import useAuthOperations from "@/hooks/useAuthOperations";
import {
  Input,
  Button,
  Flex,
  Text,
  Icon,
  Stack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

import { BiError } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function SignUp() {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [
    createUserWithEmailAndPassword,
    userCred,
    loading,
    signUpBackendError,
  ] = useCreateUserWithEmailAndPassword(auth);

  const [error, setError] = useState("");

  const { onSignUpLoading, onSignUp, isUserNameTaken, onSignUpError } =
    useAuthOperations();

  const [userNameTakenState, setUserNameTakenState] = useState(false);
  const [userNameTakenStateLoading, setUserNameTakenStateLoading] =
    useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    await createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
  };

  const onSuccessfullUserAuthCreation = async () => {
    console.log("Creation of User's first part is done.");
    console.log("UserCred:  ", userCred);

    console.log("Now going second part");

    if (userCred) onSignUp(userCred, signUpForm.username, signUpForm.fullname);
  };

  useEffect(() => {
    if (userCred) {
      onSuccessfullUserAuthCreation();
    }

    return () => {};
  }, [userCred]);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "username") {
      setUserNameTakenStateLoading((prev) => true);
      const isTaken = await isUserNameTaken(event.target.value);
      console.log(isTaken);
      if (isTaken !== undefined) setUserNameTakenState((prev) => isTaken);
      setUserNameTakenStateLoading((prev) => false);
    }

    setSignUpForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
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
          name="fullname"
          placeholder="Full Name"
          type="text"
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

        <InputGroup>
          <InputRightElement>
            {userNameTakenStateLoading ? (
              <Spinner size="sm" ml={1.5} />
            ) : userNameTakenState ? (
              <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
            ) : signUpForm.username ? (
              <Icon
                ml={5}
                as={AiOutlineCheckCircle}
                fontSize="20px"
                mr={3}
                color="green"
              />
            ) : (
              <></>
            )}
          </InputRightElement>
          <Input
            required
            name="username"
            placeholder="Username"
            type="text"
            mb={2}
            onChange={onChange}
            fontSize="10pt"
            border="1px solid"
            borderColor={userNameTakenState ? "red" : "gray.200"}
            _placeholder={{
              color: "gray.500",
            }}
            _hover={{
              border: "1px solid",
              borderColor: "blue.500",
            }}
            bg="gray.50"
          />
        </InputGroup>

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
        <Input
          required
          name="confirmPassword"
          placeholder="Confirm Password"
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

        <Text textAlign="center" color="red" fontSize="10pt">
          {error}
        </Text>

        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          bg="black"
          textColor="white"
          type="submit"
          isLoading={loading || onSignUpLoading || userNameTakenStateLoading}
          isDisabled={userNameTakenState}
          _hover={{
            bg: !userNameTakenState && "black",
            textColor: !userNameTakenState && "white",
          }}
        >
          Sign Up
        </Button>

        <Text color="red" textAlign="center" fontSize="10pt">
          {onSignUpError}
        </Text>

        <Text>{signUpBackendError?.message}</Text>
        <Flex fontSize="9pt" justify="center">
          <Text mr={1}>Have an account?</Text>
          <Text
            color="blue.500"
            fontWeight={700}
            cursor="pointer"
            onClick={() =>
              setAuthModalState((prev) => ({
                ...prev,
                view: "logIn",
              }))
            }
          >
            Log In
          </Text>
        </Flex>
      </form>
    </>
  );
}
