import { Flex, SkeletonCircle, SkeletonText, Icon } from "@chakra-ui/react";
import { BsDot } from "react-icons/bs";

export default function CommentItemSkeleton() {
  return (
    <Flex align="center" gap={2} height="50px">
      <SkeletonCircle
        width="35px"
        height="35px"
        startColor="gray.100"
        endColor="gray.800"
      />
      <Flex direction="column" gap={1}>
        <Flex align="center">
          <SkeletonText
            noOfLines={1}
            width="70px"
            skeletonHeight="3"
            startColor="gray.100"
            endColor="gray.800"
          />
          <Icon as={BsDot} color="gray.500" fontSize="13px" />
          <SkeletonText
            noOfLines={1}
            width="15px"
            skeletonHeight="2"
            startColor="gray.100"
            endColor="gray.800"
          />
        </Flex>

        <SkeletonText
          noOfLines={1}
          width="130px"
          skeletonHeight="3"
          startColor="gray.100"
          endColor="gray.800"
        />
      </Flex>
    </Flex>
  );
}
