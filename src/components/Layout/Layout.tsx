import { Box, Center, Flex, Image, useStatStyles } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import AuthenticationModal from "../Modals/AuthenticationModal/AuthenticationModal";
import PostCreateModal from "../Modals/Post/PostCreateModal";
import Navbar from "../Navbar/Navbar";
import SystemStatus from "../system-status/SystemStatus";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [innerHeight, setInnerHeight] = useState("95vh");

  useEffect(() => {
    setLoading(false);
  }, []);

  

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  return (
    <>
      {loading ? (
        <Center height={innerHeight}>
          <Image src="/bsicon.ico" align="center" width="90px" />
        </Center>
      ) : (
        <Box>
          <Navbar />
          <Flex justifyContent="center">{children}</Flex>
          <PostCreateModal />
          <AuthenticationModal />
          <Footer />
          <SystemStatus />
        </Box>
      )}
    </>
  );
}
