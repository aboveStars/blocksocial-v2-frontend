import { Box, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Authentication from "./Authentication/Authentication";
import PostCreateButton from "./SearchBar/PostCreateButton";

import SearchBar from "./SearchBar/SearchBar";

export default function Navbar() {
  const router = useRouter();

  // return (
  //   <Flex
  //     as="nav"
  //     align="center"
  //     justify="space-between"
  //     wrap="wrap"
  //     padding={6}
  //     bg="gray.700"

  //   >
  //     <Box>
  //       <Text textColor="white" fontSize="20pt" fontWeight="700">
  //         BlockSocial
  //       </Text>
  //     </Box>
  //     <Box flex="1">
  //       <SearchBar/>
  //     </Box>
  //     <Box>
  //      <PostCreateButton/>
  //      <Authentication/>
  //     </Box>
  //   </Flex>
  // );

  return (
    <>
      <Flex
        position="sticky"
        top="0"
        left="0"
        right="0"
        width="100%"
        height="50px"
        justify="space-between"
        align="center"
        bg="black"
        zIndex="banner"
        px={3}
        gap={2}
      >
        <Box>
          <Box
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
          </Box>
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
              fontWeight={700}
              fontSize="30pt"
              cursor="pointer"
              onClick={() => router.push("/")}
            >
              BS
            </Text>
          </Flex>
        </Box>

        <Box flex="1">
          <SearchBar />
        </Box>

        <Box gap={2}>
          <Flex align="center" gap={1}>
            <PostCreateButton />
            <Authentication />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
