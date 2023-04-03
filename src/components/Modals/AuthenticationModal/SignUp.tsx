import { authModalStateAtom } from "@/components/atoms/authModalAtom";

import useAuthOperations from "@/hooks/useSignUpOperations";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
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

  const [userNameLowerCaseValue, setUsernameLowercaseValue] = useState("");
  const [userNameTakenState, setUserNameTakenState] = useState(false);
  const [userNameTakenStateLoading, setUserNameTakenStateLoading] =
    useState(false);

  const [passwordWeak, setPassordWeak] = useState(false);

  const [fullnameRight, setFullnameRight] = useState(true);

  const [emailRight, setEmailRight] = useState(true);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Checking all requirements, again beacuse I don't trust react

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    if (!emailRegex.test(signUpForm.email)) {
      setEmailRight(false);
      return;
    }
    const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
    if (!fullnameRegex.test(signUpForm.fullname)) {
      setFullnameRight(false);
      return;
    }
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(signUpForm.username)) {
      setUserNameTakenState(true);
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(signUpForm.password)) {
      setPassordWeak(true);
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

    if (event.target.name === "email") {
      const emailRegex =
        /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;

      if (!emailRegex.test(event.target.value)) {
        setEmailRight(false);
      } else {
        setEmailRight(true);
      }
    }

    if (event.target.name === "username") {
      setUsernameLowercaseValue(event.target.value.toLowerCase());
      let regexFailFlag = false;
      const usernameRegex = /^[a-z0-9_]{3,18}$/;

      if (!usernameRegex.test(event.target.value.toLowerCase())) {
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

    if (event.target.name === "fullname") {
      const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;

      if (!fullnameRegex.test(event.target.value)) {
        setFullnameRight(false);
      } else {
        setFullnameRight(true);
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
        <Flex gap={1} direction="column">
          <InputGroup>
            <FormControl variant="floating">
              <Input
                required
                name="email"
                type="email"
                mb={2}
                onChange={onChange}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                borderColor={emailRight ? "gray.200" : "red"}
                bg="gray.50"
                placeholder=" "
              />
              <FormLabel textColor="gray.500" fontSize="10pt">
                Email
              </FormLabel>

              <InputRightElement>
                {!emailRight && (
                  <Icon
                    ml={5}
                    as={BiError}
                    fontSize="20px"
                    mr={3}
                    color="red"
                  />
                )}
              </InputRightElement>
            </FormControl>
          </InputGroup>

          <InputGroup>
            <FormControl variant="floating">
              <Input
                required
                name="fullname"
                type="text"
                mb={2}
                onChange={onChange}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                borderColor={fullnameRight ? "gray.200" : "red"}
                bg="gray.50"
                placeholder=" "
              />
              <FormLabel
                htmlFor="email-input"
                textColor="gray.500"
                fontSize="10pt"
              >
                Full Name
              </FormLabel>
            </FormControl>

            <InputRightElement>
              {!fullnameRight && (
                <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
              )}
            </InputRightElement>
          </InputGroup>

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
            <FormControl variant="floating">
              <Input
                required
                name="username"
                type="text"
                mb={2}
                value={userNameLowerCaseValue}
                onChange={onChange}
                borderColor={userNameTakenState ? "red" : "gray.200"}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                bg="gray.50"
                placeholder=" "
              />
              <FormLabel
                htmlFor="email-input"
                textColor="gray.500"
                fontSize="10pt"
              >
                Username
              </FormLabel>
            </FormControl>
          </InputGroup>

          <InputGroup>
            <InputRightElement>
              {passwordWeak && (
                <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
              )}
            </InputRightElement>
            <FormControl variant="floating">
              <Input
                required
                name="password"
                type="password"
                mb={1}
                onChange={onChange}
                borderColor={passwordWeak ? "red" : "gray.200"}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                bg="gray.50"
                placeholder=" "
              />
              <FormLabel
                htmlFor="email-input"
                textColor="gray.500"
                fontSize="10pt"
              >
                Password
              </FormLabel>
            </FormControl>
          </InputGroup>
        </Flex>
        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          bg="black"
          textColor="white"
          type="submit"
          isLoading={onSignUpLoading || userNameTakenStateLoading}
          isDisabled={
            userNameTakenState || passwordWeak || !fullnameRight || !emailRight
          }
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
