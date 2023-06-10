import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";
import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/socialHooks/useFollow";
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
  postSenderUsername: string;
};

export default function LikeItem({
  likerUsername,
  openPanelNameSetter,
  postSenderUsername,
}: Props) {
  const [gettingLikerInformation, setGettingLikerInformation] = useState(false);

  const [likerUserInformation, setLikerUserInformation] = useState({
    likerFullname: "",
    likerProfilePhoto: "",
    followedByCurrentUser: true,
  });

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);
  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { follow } = useFollow();

  const [followOperationLoading, setFollowOperationLoading] = useState(false);

  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);

  useEffect(() => {
    getLikerData();
  }, [likerUsername]);

  const handleFollowOnLikeItem = async () => {
    if (!currentUserState.isThereCurrentUser) {
      console.log("Login First to Follow");
      return setAuthModalState((prev) => ({
        ...prev,
        open: true,
      }));
    }

    setFollowOperationLoading(true);

    const updatedPostsAtView = postsAtView.map((a) => {
      if (a.senderUsername === likerUsername) {
        const updatedPost = { ...a };
        updatedPost.currentUserFollowThisSender = true;
        return updatedPost;
      } else {
        return a;
      }
    });
    setPostsAtView(updatedPostsAtView);

    // Follow
    const operationResult = await follow(likerUsername, 1);

    if (!operationResult) {
      const updatedPostsAtView = postsAtView.map((a) => {
        if (a.senderUsername === likerUsername) {
          const updatedPost = { ...a };
          updatedPost.currentUserFollowThisSender = false;
          return updatedPost;
        } else {
          return a;
        }
      });
      setPostsAtView(updatedPostsAtView);
      return setFollowOperationLoading(false);
    }

    // update follow status
    setLikerUserInformation((prev) => ({
      ...prev,
      followedByCurrentUser: true,
    }));

    setFollowOperationLoading(false);
  };

  const getLikerData = async () => {
    setGettingLikerInformation(true);
    const likerDocRef = doc(firestore, `users/${likerUsername}`);
    const likerDocSnapshot = await getDoc(likerDocRef);

    let currentUserFollowsThisLiker = false;
    if (currentUserState.isThereCurrentUser)
      currentUserFollowsThisLiker = (
        await getDoc(
          doc(
            firestore,
            `users/${currentUserState.username}/followings/${likerUsername}`
          )
        )
      ).exists();

    if (likerDocSnapshot.exists()) {
      setLikerUserInformation({
        likerFullname: likerDocSnapshot.data().fullname,
        likerProfilePhoto: likerDocSnapshot.data().profilePhoto,
        followedByCurrentUser: currentUserFollowsThisLiker,
      });
    }
    setGettingLikerInformation(false);
  };

  return (
    <Flex height="60px" align="center" justify="space-between">
      <Flex
        gap={2}
        cursor="pointer"
        onClick={() => {
          router.push(`/${likerUsername}`);
          openPanelNameSetter("main");
        }}
      >
        <Image
          alt=""
          src={likerUserInformation.likerProfilePhoto}
          rounded="full"
          width="50px"
          height="50px"
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
              <Icon as={CgProfile} color="white" height="50px" width="50px" />
            )
          }
        />

        <Flex direction="column">
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
            postSenderUsername === likerUsername ||
            likerUserInformation.followedByCurrentUser ||
            !!!likerUserInformation.likerFullname ||
            likerUsername === currentUserState.username ||
            router.asPath.includes(likerUsername)
          }
          isLoading={followOperationLoading}
        >
          Follow
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={() => {
            router.push(`/users/${postSenderUsername}`);
          }}
          hidden={postSenderUsername !== likerUsername}
        >
          Owner
        </Button>
      </Flex>
    </Flex>
  );
}
