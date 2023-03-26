import { UserInSearchbar } from "@/components/types/User";
import { Flex, SkeletonCircle, Icon, Image, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { CgProfile } from "react-icons/cg";

type Props = {
  searchItemData: UserInSearchbar;
  searchListOpenStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  inputReferance: React.RefObject<HTMLInputElement>;
};

export default function SearchItem({
  searchItemData,
  searchListOpenStateSetter,
  inputReferance,
}: Props) {
  const router = useRouter();
  return (
    <Flex
      key={searchItemData.username}
      align="center"
      height="55px"
      p={1}
      cursor="pointer"
      onClick={() => {
        searchListOpenStateSetter(false);
        if (inputReferance.current) inputReferance.current.value = "";
        router.push(`/users/${searchItemData.username}`);
      }}
    >
      <Image
        src={searchItemData.profilePhoto}
        width="50px"
        height="50px"
        rounded="full"
        fallback={
          !!searchItemData.profilePhoto ? (
            <SkeletonCircle
              width="50px"
              height="50px"
              startColor="gray.100"
              endColor="gray.800"
            />
          ) : (
            <Icon as={CgProfile} color="white" height="50px" width="50px" />
          )
        }
      />
      <Flex justify="center" ml={1} flexDirection="column">
        <Text textColor="white" as="b" fontSize="10pt">
          {searchItemData.username}
        </Text>
        <Text textColor="gray.100" fontSize="9pt" as="i">
          {searchItemData.fullname}
        </Text>
      </Flex>
    </Flex>
  );
}
