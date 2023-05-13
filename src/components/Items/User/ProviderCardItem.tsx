import { Flex, Image, Text } from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";

type Props = {
  name: string;
  description: string;
  offer: string;
  image: string;
  selectedProviderValue: string;
  setSelectedProviderValue: React.Dispatch<SetStateAction<string>>;
};

export default function ProviderCardItem({
  name,
  description,
  offer,
  image,
  selectedProviderValue,
  setSelectedProviderValue,
}: Props) {
  const [thisCardSelected, setThisCardSelected] = useState(false);

  useEffect(() => {
    setThisCardSelected(name === selectedProviderValue);
  }, [selectedProviderValue]);

  return (
    <Flex
      id="provider-card"
      width="100%"
      height="110px"
      p="6"
      rounded="full"
      cursor="pointer"
      border="1px"
      borderColor={thisCardSelected ? "white" : "gray"}
      _hover={{
        borderColor: thisCardSelected ? "white" : "gray.700",
      }}
      gap="1"
      align="center"
      onClick={() => {
        setSelectedProviderValue(name);
      }}
    >
      <Flex direction="column">
        <Flex gap="1">
          <Text color="gray.500" fontSize="10pt" fontWeight="700">
            Provider Name:
          </Text>
          <Text color="white" fontSize="10pt" fontWeight="700">
            {name}
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="10pt" fontWeight="700">
            Description:
          </Text>
          <Text color="white" fontSize="10pt" fontWeight="700">
            {description}
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="10pt" fontWeight="700">
            Offer:
          </Text>
          <Text color="white" fontSize="10pt" fontWeight="700">
            {offer}
          </Text>
        </Flex>
      </Flex>

      <Image src={image} width="90px" height="90px" rounded="full" />
    </Flex>
  );
}
