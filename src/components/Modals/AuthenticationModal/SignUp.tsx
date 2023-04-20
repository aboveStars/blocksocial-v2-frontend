import { authModalStateAtom } from "@/components/atoms/authModalAtom";
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

import React, { useRef, useState } from "react";

import { useSetRecoilState } from "recoil";

import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BiError } from "react-icons/bi";

import useLoginOperations from "@/hooks/useLoginOperations";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUp() {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    fullname: "",
    username: "",
    password: "",
  });

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [userNameLowerCaseValue, setUsernameLowercaseValue] = useState("");
  const [userNameTakenState, setUserNameTakenState] = useState(false);
  const [userNameTakenStateLoading, setUserNameTakenStateLoading] =
    useState(false);
  const [userNameRight, setUserNameRight] = useState(true);

  const [passwordStrong, setPassordStrong] = useState(true);

  const [fullnameRight, setFullnameRight] = useState(true);

  const [emailRight, setEmailRight] = useState(true);

  const setCurrentUserState = useSetRecoilState(currentUserStateAtom);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [error, setError] = useState("");

  const captchaRef = useRef<ReCAPTCHA>(null);

  const { directLogin } = useLoginOperations();

  const isUserNameTaken = async (susUsername: string) => {
    if (!susUsername) return false;

    const susDocRef = doc(firestore, "usernames", susUsername);
    const susDocSnap = await getDoc(susDocRef);

    const existingStatus = susDocSnap.exists();

    return existingStatus;
  };

  const handleCaptcha = async () => {
    if (!captchaRef.current) {
      return;
    }

    const token = captchaRef.current.getValue();
    captchaRef.current.reset();

    return token;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignUpLoading(true);
    setError("");

    const captchaToken = await handleCaptcha();

    if (!captchaToken) {
      setSignUpLoading(false);
      setError("Complete Captcha Please");
      return;
    }

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    if (!emailRegex.test(signUpForm.email)) {
      setEmailRight(false);
      setSignUpLoading(false);
      setError("Email is invalid");
      return;
    }
    const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
    if (!fullnameRegex.test(signUpForm.fullname)) {
      setFullnameRight(false);
      setSignUpLoading(false);
      setError("Fullname is invalid");
      return;
    }
    const usernameRegex = /^[a-z0-9]{3,20}$/;
    if (!usernameRegex.test(signUpForm.username)) {
      setUserNameRight(false);
      setSignUpLoading(false);
      setError("Username is invalid");
      return;
    }
    const taken = await isUserNameTaken(signUpForm.username);
    if (taken) {
      setUserNameTakenState(true);
      setSignUpLoading(false);
      setError("Username is taken");
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(signUpForm.password)) {
      setPassordStrong(false);
      setSignUpLoading(false);
      setError("Password is invalid");
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...signUpForm,
          captchaToken: captchaToken,
        }),
      });
    } catch (error) {
      setSignUpLoading(false);
      return console.error("Error while fetching to 'signUp' API", error);
    }

    if (!response.ok) {
      const { error } = await response.json();
      setError(error);
      setSignUpLoading(false);
      return console.error("Error while signup from 'signup' API", error);
    }

    await directLogin(signUpForm.email, signUpForm.password);
    setSignUpLoading(false);
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    let zeroFlag = false;

    if (event.target.name === "email") {
      if (event.target.value.length === 0) {
        // To prevent bad ui
        setEmailRight(true);
        zeroFlag = true;
      }
      if (!zeroFlag) {
        const emailRegex =
          /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;

        if (!emailRegex.test(event.target.value)) {
          setEmailRight(false);
        } else {
          setEmailRight(true);
        }
      }
    }

    if (event.target.name === "username") {
      if (event.target.value.length === 0) {
        // To prevent bad ui
        setUserNameRight(true);
        setUsernameLowercaseValue("");
        setUserNameTakenState(false);

        zeroFlag = true;
      }

      if (!zeroFlag) {
        setUsernameLowercaseValue(event.target.value.toLowerCase());
        let regexFailFlag = false;
        const usernameRegex = /^[a-z0-9]{3,20}$/;

        if (!usernameRegex.test(event.target.value.toLowerCase())) {
          setUserNameRight(false);
          regexFailFlag = true;
        }
        if (!regexFailFlag) {
          setUserNameRight(true);

          setUserNameTakenStateLoading(true);
          const isTaken = await isUserNameTaken(event.target.value);

          setUserNameTakenState(isTaken);
          setUserNameTakenStateLoading(false);
        }
      }
    }

    if (event.target.name === "fullname") {
      if (event.target.value.length === 0) {
        // To prevent bad ui
        setFullnameRight(true);
        zeroFlag = true;
      }

      if (!zeroFlag) {
        const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;

        if (!fullnameRegex.test(event.target.value)) {
          setFullnameRight(false);
        } else {
          setFullnameRight(true);
        }
      }
    }

    if (event.target.name === "password") {
      if (event.target.value.length === 0) {
        // To prevent bad ui
        setPassordStrong(true);
        zeroFlag = true;
      }
      if (!zeroFlag) {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!regex.test(event.target.value)) {
          setPassordStrong(false);
        } else setPassordStrong(true);
      }
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
                autoComplete="new-password"
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
              <FormLabel
                bg="rgba(248,250,252,1)"
                textColor="gray.500"
                fontSize="10pt"
                my="2.5"
              >
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
                autoComplete="new-password"
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
                bg="rgba(248,250,252,1)"
                textColor="gray.500"
                fontSize="10pt"
                my="2.5"
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
              ) : userNameTakenState || !userNameRight ? (
                <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
              ) : (
                signUpForm.username.length !== 0 && (
                  <Icon
                    ml={5}
                    as={AiOutlineCheckCircle}
                    fontSize="20px"
                    mr={3}
                    color="green"
                  />
                )
              )}
            </InputRightElement>
            <FormControl variant="floating">
              <Input
                required
                name="username"
                type="text"
                autoComplete="new-password"
                mb={2}
                value={userNameLowerCaseValue}
                onChange={onChange}
                borderColor={
                  userNameTakenState || !userNameRight ? "red" : "gray.200"
                }
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                bg="gray.50"
                placeholder=" "
              />
              <FormLabel
                bg="rgba(248,250,252,1)"
                textColor="gray.500"
                fontSize="10pt"
                my="2.5"
              >
                Username
              </FormLabel>
            </FormControl>
          </InputGroup>

          <InputGroup>
            <InputRightElement>
              {!passwordStrong && (
                <Icon ml={5} as={BiError} fontSize="20px" mr={3} color="red" />
              )}
            </InputRightElement>
            <FormControl variant="floating">
              <Input
                required
                name="password"
                type="password"
                autoComplete="new-password"
                mb={1}
                onChange={onChange}
                borderColor={!passwordStrong ? "red" : "gray.200"}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                bg="gray.50"
                placeholder=" "
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
          isLoading={signUpLoading || userNameTakenStateLoading}
          isDisabled={
            !userNameRight ||
            userNameTakenState ||
            !passwordStrong ||
            !fullnameRight ||
            !emailRight
          }
          _hover={{
            bg: !userNameTakenState && "black",
            textColor: !userNameTakenState && "white",
          }}
        >
          Sign Up
        </Button>

        <Flex justify="center">
          <ReCAPTCHA
            size="normal"
            ref={captchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
          />
        </Flex>

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
