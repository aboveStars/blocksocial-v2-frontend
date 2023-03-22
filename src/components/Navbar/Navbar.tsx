import { Flex, Text } from "@chakra-ui/react";
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
        border="1px solid"
        borderColor="gray.100"
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
