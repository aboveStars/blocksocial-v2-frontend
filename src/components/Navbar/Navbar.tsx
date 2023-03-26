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
        p={2}
        bg="black"
        zIndex="banner"
      >
        <Flex width="100%" justify="flex-start">
          <Flex
            display={{
              base: "none",
              sm: "none",
              md: "flex",
              lg: "flex",
            }}
          >
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
          <Flex
            display={{
              base: "flex",
              sm: "flex",
              md: "none",
              lg: "none",
            }}
          >
            <Text
              color="white"
              fontSize="20pt"
              fontWeight={700}
              cursor="pointer"
              onClick={() => router.push("/")}
            >
              BS
            </Text>
          </Flex>
        </Flex>

        <Flex width="100%" justify="center">
          <Flex
            display={{
              base: "none",
              sm: "none",
              md: "flex",
              lg: "flex",
            }}
          >
            <SearchBar />
          </Flex>
        </Flex>

        <Flex width="100%" justify="flex-end">
          <Authentication />
        </Flex>
      </Flex>
    </>
  );
}
