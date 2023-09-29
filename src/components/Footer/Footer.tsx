import { Flex, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      width="100%"
      mb={3}
      mt={3}
    >
      <Text as="b" textColor="gray.300" fontSize="15pt">
        apidon
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
          window.open("https://github.com/aboveStars/apidon-user", "blank");
        }}
      >
        <Text as="b" textColor="gray.300" fontSize="8pt">
          Give ⭐️ on GitHub
        </Text>
      </Flex>
    </Flex>
  );
}
