import { Flex, Image, Text } from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";

type Props = {
  name: string;
  description: string;
  image: string;

  minPrice: number;
  maxPrice: number;

  score: number;
  clientCount: number;

  selectedProviderValue: string;
  setSelectedProviderValue: React.Dispatch<SetStateAction<string>>;
  chooseIsDone: boolean;
};

export default function ProviderCardItem({
  name,
  description,
  image,
  minPrice,
  maxPrice,
  score,
  clientCount,
  selectedProviderValue,
  setSelectedProviderValue,
  chooseIsDone,
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
      p="8"
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
        if (!chooseIsDone) setSelectedProviderValue(name);
      }}
    >
      <Flex direction="column">
        <Flex gap="1">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Name:
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {name}
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Description:
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {description}
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Offer:
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {minPrice}$-{maxPrice}$
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Score:
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {score}%
          </Text>
        </Flex>
        <Flex gap="1">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Client Count:
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {clientCount}
          </Text>
        </Flex>
      </Flex>

      <Image src={image} width="90px" height="90px" rounded="full" />
    </Flex>
  );
}
