import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/useFollow";
import {
  Flex,
  Text,
  Image,
  Icon,
  SkeletonCircle,
  Button,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { useRecoilState } from "recoil";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { FollowingsFollowersModalType } from "./Header";

type Props = {
  username: string;
  followingsFollowersModalStateSetter: React.Dispatch<
    React.SetStateAction<FollowingsFollowersModalType>
  >;
};

type FollowItemState = {
  username: string;
  fullname: string;
  profilePhoto?: string;
};

export default function FollowItem({
  username,
  followingsFollowersModalStateSetter,
}: Props) {
  const [followItemState, setFollowItemState] = useState<FollowItemState>({
    username: "",
    fullname: "",
    profilePhoto: "",
  });
  const [gettingFollowItemState, setGettingFollowItemState] = useState(false);

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const router = useRouter();

  const { follow } = useFollow();

  useEffect(() => {
    getFollowItemInformation();
  }, [username]);

  const getFollowItemInformation = async () => {
    setGettingFollowItemState(true);
    const followItemUserDocRef = doc(firestore, `users/${username}`);
    const followItemUserDocSnaphot = await getDoc(followItemUserDocRef);

    // I am sure it exists but ....
    if (!followItemUserDocSnaphot.exists()) {
      setFollowItemState({
        username: "NO USER",
        fullname: "NO USER",
      });
      return;
    }

    const followItemStateServer: FollowItemState = {
      // We know username but if I download from server,I use it.
      username: followItemUserDocSnaphot.data().username,
      fullname: followItemUserDocSnaphot.data().fullname,
      profilePhoto: followItemUserDocSnaphot.data().profilePhoto,
    };

    setFollowItemState(followItemStateServer);
    setGettingFollowItemState(false);
  };

  const handleFollowonFollowItem = () => {
    // Follow
    follow(followItemState.username, 1);
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(followItemState.username),
    }));
  };

  return (
    <Flex position="relative" align="center">
      <Flex
        cursor="pointer"
        onClick={() => {
          followingsFollowersModalStateSetter((prev) => ({
            ...prev,
            isOpen: false,
          }));
          router.push(`/users/${followItemState.username}`);
        }}
      >
        <Image
          src={followItemState.profilePhoto}
          rounded="full"
          width="50px"
          height="50px"
          fallback={
            !!followItemState.profilePhoto || gettingFollowItemState ? (
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

        <Flex justify="center" ml={1} flexDirection="column">
          <Text textColor="white" as="b" fontSize="10pt">
            {followItemState.username}
          </Text>
          <Text textColor="gray.100" fontSize="9pt" as="i">
            {followItemState.fullname}
          </Text>
        </Flex>
      </Flex>

      <Flex position="absolute" right="1">
        <Button
          size="sm"
          variant="solid"
          colorScheme="blue"
          onClick={handleFollowonFollowItem}
          hidden={
            currentUserState.followings.includes(followItemState.username) ||
            !!!followItemState.username ||
            followItemState.username === currentUserState.username
          }
        >
          Follow
        </Button>
      </Flex>
    </Flex>
  );
}
