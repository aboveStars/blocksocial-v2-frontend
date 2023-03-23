import { Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Authentication from "./Authentication/Authentication";

import SearchBar from "./SearchBar/SearchBar";

type Props = {};

export default function Navbar({}: Props) {
  const router = useRouter();
  return (
    <>
      <Flex
        position="sticky"
        top="0"
        width="100%"
        height="50px"
        align="center"
        p={5}
        bg="black"
      >
        <Flex width="100%" justify="flex-start">
          <Text
            color="white"
            fontSize="20pt"
            fontWeight={700}
            cursor="pointer"
            onClick={() => router.push("/")}
          >
            BlockSocial
          </Text>
        </Flex>

        <Flex width="100%" justify="center">
          <SearchBar />
        </Flex>

        <Flex width="100%" justify="flex-end">
          <Authentication />
        </Flex>
      </Flex>
    </>
  );
}
