import { fakeWaiting } from "@/components/utils/FakeWaiting";
import useRateProvider from "@/hooks/useRateProvider";
import { Flex, Icon, Spinner } from "@chakra-ui/react";
import React, { useState } from "react";

type Props = {
  value: 0 | 1 | 2 | 3 | 4 | 5;
};

import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export default function ProviderUserStarRateItem({ value }: Props) {
  const [candicateValue, setCandicateValue] = useState(value);

  const [isProviderRateLoading, setIsProviderRateLoading] = useState(false);

  const { rateProvider } = useRateProvider();

  const handleRate = async (value: 1 | 2 | 3 | 4 | 5) => {
    setIsProviderRateLoading(true);
    setCandicateValue(value);
    const operationResult = await rateProvider(value);
    console.log(operationResult);
    setIsProviderRateLoading(false);
  };

  return (
    <>
      {isProviderRateLoading ? (
        <Flex>
          <Spinner color="white" size="md" />
        </Flex>
      ) : (
        <Flex gap="1">
          <Icon
            id="first-star"
            as={candicateValue >= 1 ? AiFillStar : AiOutlineStar}
            color={candicateValue >= 1 ? "white" : "gray.800"}
            onClick={() => {
              handleRate(1);
            }}
            fontSize="30px"
            cursor="pointer"
          />
          <Icon
            id="second-star"
            as={candicateValue >= 2 ? AiFillStar : AiOutlineStar}
            color={candicateValue >= 2 ? "white" : "gray.800"}
            onClick={() => {
              handleRate(2);
            }}
            fontSize="30px"
            cursor="pointer"
          />
          <Icon
            id="third-star"
            as={candicateValue >= 3 ? AiFillStar : AiOutlineStar}
            color={candicateValue >= 3 ? "white" : "gray.800"}
            onClick={() => {
              handleRate(3);
            }}
            fontSize="30px"
            cursor="pointer"
          />
          <Icon
            id="fourth-star"
            as={candicateValue >= 4 ? AiFillStar : AiOutlineStar}
            color={candicateValue >= 4 ? "white" : "gray.800"}
            onClick={() => {
              handleRate(4);
            }}
            fontSize="30px"
            cursor="pointer"
          />
          <Icon
            id="fifth-star"
            as={candicateValue === 5 ? AiFillStar : AiOutlineStar}
            color={candicateValue === 5 ? "white" : "gray.800"}
            onClick={() => {
              handleRate(5);
            }}
            fontSize="30px"
            cursor="pointer"
          />
        </Flex>
      )}
    </>
  );
}
