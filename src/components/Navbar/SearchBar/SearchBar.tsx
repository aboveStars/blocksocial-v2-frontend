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
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

type Props = {};

export default function SearchBar({}: Props) {
  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    if (!searchInput) return;
    const path = `/users/${searchInput}`;

    router.push(path);
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
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
              onChange={onChange}
            />
          </InputGroup>
          <Button ml={2} width={100} type="submit">
            Search
          </Button>
        </Flex>
      </form>
    </>
  );
}
