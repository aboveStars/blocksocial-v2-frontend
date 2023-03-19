import { auth } from "@/firebase/clientApp";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";

import { useSignInWithGoogle } from "react-firebase-hooks/auth";

import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function OAuthButtons() {
  const [signInWithGoogle, userCred, loading, error] =
    useSignInWithGoogle(auth);
  return (
    <>
      <Flex direction="column" width="100%" mb={3}>
        <Button
          bg="gray.100"
          mb={2}
          isLoading={loading}
          onClick={() => {
            signInWithGoogle();
          }}
        >
          <Icon as={FcGoogle} fontSize={30} mr={1} />
          Continue with Google
        </Button>
        <Button
          bg="gray.100"
          mb={2}
          isLoading={loading}
          onClick={() => {
            signInWithGoogle();
          }}
        >
          <Icon as={FaApple} fontSize={30} mr={1} />
          Continue with Apple
        </Button>
        {error && (
          <Text color="red" textAlign="center" fontSize="10pt">
            {error.message}
          </Text>
        )}
      </Flex>
    </>
  );
}
