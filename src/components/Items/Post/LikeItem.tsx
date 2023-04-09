import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/useFollow";
import {
  Button,
  Flex,
  Icon,
  Image,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import router from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../../atoms/authModalAtom";
import { currentUserStateAtom } from "../../atoms/currentUserAtom";
import { OpenPanelName } from "../../types/Post";

type Props = {
  likerUsername: string;
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
};

export default function LikeItem({
  likerUsername,
  openPanelNameSetter,
}: Props) {
  const [gettingLikerInformation, setGettingLikerInformation] = useState(false);

  const [likerUserInformation, setLikerUserInformation] = useState({
    likerFullname: "",
    likerProfilePhoto: "",
  });

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { follow } = useFollow();

  useEffect(() => {
    getPostSenderPhoto();
  }, [likerUsername]);

  const handleFollowOnLikeItem = () => {
    if (!currentUserState.isThereCurrentUser) {
      console.log("Login First to Follow");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
      }));
      return;
    }
    // Follow
    follow(likerUsername, 1);
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(likerUsername),
    }));
  };

  const getPostSenderPhoto = async () => {
    setGettingLikerInformation(true);
    const commentSenderDocRef = doc(firestore, `users/${likerUsername}`);
    const commentDocSnapshot = await getDoc(commentSenderDocRef);
    if (commentDocSnapshot.exists()) {
      setLikerUserInformation({
        likerFullname: commentDocSnapshot.data().fullname,
        likerProfilePhoto: commentDocSnapshot.data().profilePhoto,
      });
    }
    setGettingLikerInformation(false);
  };

  return (
    <Flex height="60px" align="center" justify="space-between">
      <Flex gap={2}>
        <Image
          alt=""
          src={likerUserInformation.likerProfilePhoto}
          rounded="full"
          width="50px"
          height="50px"
          cursor="pointer"
          onClick={() => {
            router.push(`/users/${likerUsername}`);
            openPanelNameSetter("main");
          }}
          fallback={
            !!likerUserInformation.likerProfilePhoto ||
            gettingLikerInformation ? (
              <SkeletonCircle
                width="50px"
                height="50px"
                startColor="gray.100"
                endColor="gray.800"
              />
            ) : (
              <Icon
                as={CgProfile}
                color="white"
                height="50px"
                width="50px"
                cursor="pointer"
                onClick={() => {
                  router.push(`/users/${likerUsername}`);
                  openPanelNameSetter("main");
                }}
              />
            )
          }
        />

        <Flex
          direction="column"
          cursor="pointer"
          onClick={() => {
            router.push(`/users/${likerUsername}`);
            openPanelNameSetter("main");
          }}
        >
          <Text fontSize="13pt" textColor="white" as="b">
            {likerUsername}
          </Text>
          <Text
            fontSize="10pt"
            textColor="white"
            as="i"
            hidden={gettingLikerInformation}
          >
            {likerUserInformation.likerFullname}
          </Text>

          <SkeletonText
            noOfLines={1}
            hidden={!gettingLikerInformation}
            skeletonHeight="2.5"
            width="80px"
          />
        </Flex>
      </Flex>
      <Flex id="follow-area">
        <Button
          size="sm"
          variant="solid"
          colorScheme="blue"
          onClick={handleFollowOnLikeItem}
          hidden={
            currentUserState.followings.includes(likerUsername) ||
            !!!likerUserInformation.likerFullname ||
            likerUsername === currentUserState.username ||
            router.asPath.includes(likerUsername)
          }
        >
          Follow
        </Button>
      </Flex>
    </Flex>
  );
}
