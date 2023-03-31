import { Flex, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export default function LikeItemSkeleton() {
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

          <SkeletonText
            noOfLines={1}
            width="15px"
            skeletonHeight="2"
            startColor="gray.100"
            endColor="gray.800"
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
