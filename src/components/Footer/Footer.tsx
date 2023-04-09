import { Flex, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Flex justify="center" align="center" direction="column" width="100%">
      <Text as="b" textColor="gray.300" fontSize="15pt">
        BlockSocial
      </Text>
      <Text as="b" textColor="gray.300" fontSize="9pt">
        Made with ❤️ in Istanbul
      </Text>

      <Flex
        align="center"
        gap={1}
        justify="center"
        cursor="pointer"
        onClick={() => {
          window.open(
            "https://github.com/aboveStars/blocksocial-v2-frontend",
            "blank"
          );
        }}
      >
        <Text as="b" textColor="gray.300" fontSize="8pt">
          Give ⭐️ on GitHub
        </Text>
      </Flex>
      <Text as="i" textColor="gray.400" fontSize="5pt">
        Version 0.6.0
      </Text>
    </Flex>
  );
}
