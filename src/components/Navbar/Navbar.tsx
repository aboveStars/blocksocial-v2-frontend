import { Button, Flex, Text } from "@chakra-ui/react";
import React from "react";
import Authentication from "./Authentication/Authentication";

import SearchBar from "./SearchBar/SearchBar";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <>
      <Flex
        bg="black"
        height="50px"
        align="center"
        p={5}
        justify="space-between"
      >
        <Text
          color="white"
          fontSize="20pt"
          fontWeight={700}
          position="relative"
          mr={2}
        >
          BlockSocial
        </Text>
        <SearchBar />
        <Authentication />
      </Flex>
    </>
  );
}
