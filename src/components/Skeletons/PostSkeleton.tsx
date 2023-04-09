import {
  AspectRatio,
  Flex,
  Icon,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { BsImage } from "react-icons/bs";

import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";

export default function PostSkeleton() {
  return (
    <Flex
      id="post-skeleton-main-parent"
      direction="column"
      width="100%"
      bg="gray.900"
      borderRadius="10px"
      p="1"
    >
      <Flex id="header-skeleton" align="center" gap={2} height="58px" p={1}>
        <SkeletonCircle size="50px" />
        <Flex direction="column" width="100px">
          <SkeletonText noOfLines={2} />
        </Flex>
      </Flex>

      <AspectRatio ratio={1} width="100%">
        <Skeleton />
      </AspectRatio>

      <Flex id="footer-skeleton" direction="column" width="100%">
        <Flex id="description-skeleton" width="100%" mt={2} ml={2}>
          <SkeletonText noOfLines={1} skeletonHeight="3" width="200px" />
        </Flex>
        <Flex id="buttons-skeleton" align="center" gap={2} p={2}>
          <Flex align="center" gap={1}>
            <Icon as={AiOutlineHeart} color="white" fontSize="25px" />
            <SkeletonText noOfLines={1} width="20px" />
          </Flex>
          <Flex align="center" gap={1}>
            <Icon as={AiOutlineComment} color="white" fontSize="25px" />
            <SkeletonText noOfLines={1} width="20px" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
