import { auth } from "@/firebase/clientApp";
import useLoginOperations from "@/hooks/useLoginOperations";
import { Box, Center, Flex, Image } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import Footer from "../Footer/Footer";
import AuthenticationModal from "../Modals/AuthenticationModal/AuthenticationModal";
import PostCreateModal from "../Modals/Post/PostCreateModal";
import NotificationModal from "../Modals/User/NotificationModal";
import Navbar from "../Navbar/Navbar";
import SystemStatus from "../system-status/SystemStatus";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);
  const [innerHeight, setInnerHeight] = useState("95vh");

  const [user, loading, error] = useAuthState(auth);

  const { onLogin } = useLoginOperations();

  useEffect(() => {
    setInnerHeight(`${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    if (user) {
      onLogin(user);
    }
  }, [user]);

  useEffect(() => {
    if (!user)
      setCurrentUserState((prev) => ({
        ...prev,
        loading: loading,
      }));
  }, [loading]);

  return (
    <>
      {currentUserState.loading ? (
        <>
          <Center height={innerHeight}>
            <Image src="/bsicon.jpg" align="center" width="90px" />
          </Center>
        </>
      ) : (
        <Box>
          <Navbar />
          <Flex justifyContent="center">{children}</Flex>
          <PostCreateModal />
          <AuthenticationModal />
          <NotificationModal />
          <Footer />
          <SystemStatus />
        </Box>
      )}
    </>
  );
}
