import { auth } from "@/firebase/clientApp";
import { Box, Center, Flex, Image, Text } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import AuthenticationModal from "../Modals/AuthenticationModal/AuthenticationModal";
import PostCreateModal from "../Modals/Post/PostCreateModal";
import NotificationModal from "../Modals/User/NotificationModal";
import ChooseProviderModal from "../Modals/User/Provider/ChooseProviderModal";
import CurrentProviderModal from "../Modals/User/Provider/CurrentProviderModal";
import Navbar from "../Navbar/Navbar";
import SystemStatus from "../system-status/SystemStatus";
import useLogin from "@/hooks/authHooks/useLogin";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const [innerHeight, setInnerHeight] = useState("95vh");

  const [loading, setLoading] = useState(true);

  const { logSignedUserIn } = useLogin();

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        console.log("We have user!");
        await logSignedUserIn(user);
        console.log("User has been initialized.");
        setLoading(false);
      } else {
        console.log("We don't have user");
        setLoading(false);
        // User is signed out, handle the signed-out state
      }
    });

    return () => unsubscribe(); // Cleanup the event listener when component unmounts
  }, []);

  return (
    <>
      {loading ? (
        <>
          <Center height={innerHeight}>
            <Image src="/og.png" align="center" width="90px" />
          </Center>
        </>
      ) : (
        <Box>
          <Navbar />
          <Flex justifyContent="center">{children}</Flex>
          <PostCreateModal />
          <AuthenticationModal />
          <NotificationModal />
          <ChooseProviderModal />
          <CurrentProviderModal />
          <Footer />
          <SystemStatus />
        </Box>
      )}
    </>
  );
}
