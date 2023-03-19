import {
  Button,
  Input,
  Text,
  Flex,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Icon,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineSearch } from "react-icons/ai";

type Props = {};

export default function SearchBar({}: Props) {
  return (
    <>
      <Flex align="center" flexGrow={1} maxWidth={700}>
        <InputGroup size="md">
          <InputLeftElement>
            <Icon as={AiOutlineSearch} color="white" fontSize="10pt" />
          </InputLeftElement>
          <Input
            pr="4.5rem"
            placeholder="Search friends, posts...."
            border="1px solid"
            borderColor="gray.700"
            textColor="white"
            _focus={{
              bg: "gray.800",
            }}
          />
        </InputGroup>
        <Button ml={2} width={100}>
          Search
        </Button>
      </Flex>
    </>
  );
}
