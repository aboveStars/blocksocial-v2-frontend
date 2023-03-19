import { Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import LeftPanel from "../LeftPanel/LeftPanel";
import Navbar from "../Navbar/Navbar";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <Flex bg="black">{children}</Flex>
      <LeftPanel />
    </>
  );
}
