import { Stack, Text } from "@chakra-ui/react";
import React from "react";

type Props = {};

export default function Posts({}: Props) {
  return (
    <>
      <Stack>
        <Text color="white">Post-1</Text>
        <Text color="white">Post-2</Text>
        <Text color="white">Post-3</Text>
        <Text color="white">Post-4</Text>
      </Stack>
    </>
  );
}
