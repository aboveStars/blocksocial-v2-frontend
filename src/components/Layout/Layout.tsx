import { Box, Container, Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import Footer from "../Footer/Footer";
import LeftPanel from "../LeftPanel/LeftPanel";
import Navbar from "../Navbar/Navbar";
import SystemStatus from "../system-status/SystemStatus";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Box>
      <Navbar />
      <Flex as="main" mt="">
        {children}
      </Flex>
      <Footer />
      <SystemStatus />
    </Box>
  );
}
