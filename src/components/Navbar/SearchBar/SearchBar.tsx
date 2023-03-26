import { firestore } from "@/firebase/clientApp";
import {
  Flex,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SkeletonCircle,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

import { UserInSearchbar } from "../../types/User";

import { CgProfile } from "react-icons/cg";
import { MdCancel } from "react-icons/md";
import SearchItem from "./SearchItem";

type Props = {};

export default function SearchBar({}: Props) {
  // const [searchInput, setSearchInput] = useState<string>("");
  const [searchListOpen, setSearchListOpen] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<UserInSearchbar[]>([]);

  const router = useRouter();

  /**
   * To clear search keyword
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * To close search panel, when click somewhere else
   */
  const [searchFocus, setSearchFocus] = useState(false);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchInput = event.target.value;
    if (searchInput.length == 0) {
      setSearchListOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchResult([]);

    // Search thorugh documents for match....
    const searchQuery = query(
      collection(firestore, "users"),
      orderBy("username"),
      startAt(searchInput),
      endAt(searchInput + "\uf8ff")
    );

    const querySnaphot = await getDocs(searchQuery);

    const resultArray: UserInSearchbar[] = [];
    querySnaphot.forEach((doc) => {
      const resultObject = {
        username: doc.data().username,
        fullname: doc.data().fullname,
        profilePhoto: doc.data().profilePhoto,
      };
      resultArray.push(resultObject);
    });

    // Update states
    setSearchLoading(false);
    setSearchResult(resultArray);
    setSearchListOpen(true);
  };

  return (
    <>
      <Flex direction="column" position="relative">
        <Flex align="center">
          <InputGroup size="md">
            <InputLeftElement>
              <Icon as={AiOutlineSearch} color="gray.600" fontSize="12pt" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              pr="4.5rem"
              placeholder="Search"
              textColor="white"
              onChange={onChange}
              _hover={{
                borderColor: "gray.900",
              }}
              _focus={{
                bg: "gray.900",
              }}
              focusBorderColor="gray.900"
              borderColor="gray.800"
              onFocus={() => setSearchFocus(true)}
              onBlur={(event) => {
                if (event.relatedTarget?.id == "search-result-panel") {
                  return;
                } else {
                  setSearchFocus(false);
                }
              }}
            />
            <InputRightElement>
              <Spinner
                size="sm"
                ml={1.5}
                color="gray"
                hidden={!searchLoading}
              />
              {!searchLoading && searchListOpen && (
                <Icon
                  as={MdCancel}
                  color="gray.400"
                  fontSize="11pt"
                  cursor="pointer"
                  onClick={() => {
                    setSearchListOpen(false);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                />
              )}
            </InputRightElement>
          </InputGroup>
        </Flex>

        {searchListOpen && searchFocus && (
          <Flex
            id="search-result-panel"
            position="absolute"
            width="100%"
            top="42px"
            minHeight="60px"
            bg="rgba(0, 0, 0, 0.5)"
            borderRadius="0px 0px 10px 10px"
            backdropFilter="auto"
            backdropBlur="10px"
            tabIndex={0}
          >
            <Stack mt={1} mb={1}>
              {searchResult.map((result) => (
                <SearchItem
                  key={result.username}
                  inputReferance={inputRef}
                  searchListOpenStateSetter={setSearchListOpen}
                  searchItemData={result}
                />
              ))}
            </Stack>
          </Flex>
        )}
      </Flex>
    </>
  );
}
