import { Flex, Image, Text } from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";
import ProviderScoreStarItem from "./ProviderScoreStarItem";

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
      direction="column"
      align="center"
      gap="1"
      cursor="pointer"
      border="1px"
      borderColor={thisCardSelected ? "white" : "gray"}
      _hover={{
        borderColor: thisCardSelected ? "white" : "gray.700",
      }}
      onClick={() => {
        if (!chooseIsDone) setSelectedProviderValue(name);
      }}
      borderRadius="25px"
      p="3"
    >
      <Image src={image} rounded="full" width="100px" height="100px" />
      <Text color="white" fontSize="10pt" fontWeight="700">
        {name}
      </Text>
      <Text color="gray.200" fontSize="9pt" fontWeight="700">
        "{description}"
      </Text>
      <ProviderScoreStarItem
        key={score}
        value={score as 0 | 1 | 2 | 3 | 4 | 5}
      />
      <Flex gap="3">
        <Flex direction="column" align="center">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Client Count
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {clientCount}
          </Text>
        </Flex>
        <Flex direction="column" align="center">
          <Text color="gray.500" fontSize="9pt" fontWeight="700">
            Price
          </Text>
          <Text color="white" fontSize="9pt" fontWeight="700">
            {minPrice}-{maxPrice}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
