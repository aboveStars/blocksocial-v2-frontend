import { authModalStateAtom } from "@/components/atoms/authModalAtom";

import useAuthOperations from "@/hooks/useSignUpOperations";
import {
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
} from "@chakra-ui/react";

import React, { useState } from "react";

import { useSetRecoilState } from "recoil";

import { AiOutlineCheckCircle } from "react-icons/ai";
import { BiError } from "react-icons/bi";

export default function SignUp() {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
  });

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { onSignUpLoading, onSignUp, isUserNameTaken, error, setError } =
    useAuthOperations();

  const [userNameTakenState, setUserNameTakenState] = useState(false);
  const [userNameTakenStateLoading, setUserNameTakenStateLoading] =
    useState(false);

  const [passwordWeak, setPassordWeak] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Checking all requirements, again beacuse I don't trust react
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(signUpForm.username)) {
      setUserNameTakenState((prev) => true);
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(signUpForm.password)) {
      setPassordWeak((prev) => true);
      return;
    }

    onSignUp(
      signUpForm.email,
      signUpForm.password,
      signUpForm.username,
      signUpForm.fullname
    );
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError((prev) => "");
    if (event.target.name === "username") {
      let regexFailFlag = false;
      const usernameRegex = /^[a-z0-9]+$/;
      if (!usernameRegex.test(event.target.value)) {
        setUserNameTakenState((prev) => true);
        regexFailFlag = true;
      }
      if (!regexFailFlag) {
        setUserNameTakenStateLoading((prev) => true);
        const isTaken = await isUserNameTaken(event.target.value);

        if (isTaken !== undefined) setUserNameTakenState((prev) => isTaken);
        setUserNameTakenStateLoading((prev) => false);
      }
    }

    if (event.target.name === "password") {
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
      if (!regex.test(event.target.value)) {
        setPassordWeak((prev) => true);
      } else setPassordWeak((prev) => false);
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

        <InputGroup>
          <InputRightElement>
            {passwordWeak && (
              <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
            )}
          </InputRightElement>

          <Input
            required
            name="password"
            placeholder="Password"
            type="password"
            mb={1}
            onChange={onChange}
            borderColor={passwordWeak ? "red" : "gray.200"}
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
        </InputGroup>

        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          bg="black"
          textColor="white"
          type="submit"
          isLoading={onSignUpLoading || userNameTakenStateLoading}
          isDisabled={userNameTakenState || passwordWeak}
          _hover={{
            bg: !userNameTakenState && "black",
            textColor: !userNameTakenState && "white",
          }}
        >
          Sign Up
        </Button>

        <Text color="red" textAlign="center" fontSize="10pt">
          {error}
        </Text>

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
