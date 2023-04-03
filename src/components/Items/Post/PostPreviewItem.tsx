import { Flex, Icon, Image, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import React from "react";
import { CgProfile } from "react-icons/cg";

type Props = {};

export default function PostPreviewItem({}: Props) {
  return (
    <Flex direction="column">
      <Image
        src={""}
        width="50px"
        height="50px"
        fallback={
          <Skeleton
            width="50px"
            height="50px"
            startColor="gray.100"
            endColor="gray.800"
          />
        }
      />
    </Flex>
  );
}
