import { Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export default function NotFoundPage() {
  const [innerHeight, setInnerHeight] = useState("");

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);
  return (
    <Flex align="center" minHeight={innerHeight}>
      <Text as="b" textColor="white" fontSize="20pt">
        Page couldn&apos;t be found.
      </Text>
    </Flex>
  );
}
