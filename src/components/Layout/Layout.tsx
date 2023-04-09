import { Box, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import Footer from "../Footer/Footer";
import PostCreateModal from "../Modals/Post/PostCreateModal";
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
      <PostCreateModal />
      <Footer />
      <SystemStatus />
    </Box>
  );
}
