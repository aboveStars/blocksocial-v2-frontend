import { Flex, SkeletonCircle, SkeletonText, Icon } from "@chakra-ui/react";
import { BsDot } from "react-icons/bs";

export default function CommentItemSkeleton() {
  return (
    <Flex align="center" gap={2}>
      <SkeletonCircle
        width="35px"
        height="35px"
        startColor="gray.100"
        endColor="gray.800"
      />
      <Flex direction="column" gap={1}>
        <Flex align="center">
          <SkeletonText noOfLines={1} width="70px" />
          <Icon as={BsDot} color="white" fontSize="13px" />
          <SkeletonText noOfLines={1} width="15px" />
        </Flex>

        <SkeletonText noOfLines={1} width="130px" />
      </Flex>
    </Flex>
  );
}
