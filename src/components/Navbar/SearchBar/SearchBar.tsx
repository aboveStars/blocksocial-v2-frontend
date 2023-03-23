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

import { MdCancel } from "react-icons/md";

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
      <Flex direction="column" maxWidth="300px">
        <Flex align="center" position="relative">
          <InputGroup size="md">
            <InputLeftElement>
              <Icon as={AiOutlineSearch} color="white" fontSize="12pt" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              pr="4.5rem"
              placeholder="Search"
              border="1px solid"
              borderColor="gray.700"
              textColor="white"
              _focus={{
                bg: "gray.800",
              }}
              onChange={onChange}
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

        {searchListOpen && (
          <Flex
            position="absolute"
            mt="12"
            minHeight="200px"
            backdropFilter="auto"
            backdropBlur="5px"
          >
            <Stack>
              {searchResult.map((r) => (
                <Flex
                  bg="gray.900"
                  key={r.username}
                  align="center"
                  width="295px"
                  height="55px"
                  p={1}
                  borderRadius="30"
                  cursor="pointer"
                  onClick={() => {
                    setSearchListOpen(false);
                    if (inputRef.current) inputRef.current.value = "";
                    router.push(`/users/${r.username}`);
                  }}
                >
                  <Image
                    src={r.profilePhoto}
                    width="50px"
                    height="50px"
                    rounded="full"
                    fallback={
                      <SkeletonCircle
                        width="50px"
                        height="50px"
                        startColor="gray.100"
                        endColor="gray.800"
                      />
                    }
                  />
                  <Flex justify="center" ml={1} flexDirection="column">
                    <Text textColor="white" as="b" fontSize="10pt">
                      {r.username}
                    </Text>
                    <Text textColor="gray.100" fontSize="9pt" as="i">
                      {r.fullname}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          </Flex>
        )}
      </Flex>
    </>
  );
}
