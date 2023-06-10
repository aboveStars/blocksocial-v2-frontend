import { Flex, Icon } from "@chakra-ui/react";
import React, { useState } from "react";

type Props = {
  value: 0 | 1 | 2 | 3 | 4 | 5;
};

import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export default function ProviderScoreStarItem({ value }: Props) {
  return (
    <Flex gap="1">
      <Icon
        id="first-star"
        as={value >= 1 ? AiFillStar : AiOutlineStar}
        color={value >= 1 ? "white" : "gray.800"}
        fontSize="20px"
      />
      <Icon
        id="second-star"
        as={value >= 2 ? AiFillStar : AiOutlineStar}
        color={value >= 2 ? "white" : "gray.800"}
        fontSize="20px"
      />
      <Icon
        id="third-star"
        as={value >= 3 ? AiFillStar : AiOutlineStar}
        color={value >= 3 ? "white" : "gray.800"}
        fontSize="20px"
      />
      <Icon
        id="fourth-star"
        as={value >= 4 ? AiFillStar : AiOutlineStar}
        color={value >= 4 ? "white" : "gray.800"}
        fontSize="20px"
      />
      <Icon
        id="fifth-star"
        as={value === 5 ? AiFillStar : AiOutlineStar}
        color={value === 5 ? "white" : "gray.800"}
        fontSize="20px"
      />
    </Flex>
  );
}
