import {
  Button,
  Circle,
  Flex,
  Icon,
  Image,
  Input,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { currentUserStateAtom } from "../atoms/currentUserAtom";

import useImageUpload from "@/hooks/useImageUpload";

import { AiOutlinePlus } from "react-icons/ai";
import { BiPencil } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { postCreateModalStateAtom } from "../atoms/postCreateModalAtom";
import { UserInformation } from "../types/User";
import useFollow from "@/hooks/useFollow";
import { authModalStateAtom } from "../atoms/authModalAtom";

type Props = {
  userInformation: UserInformation;
};

export default function Header({ userInformation }: Props) {
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const [isCurrentUserPage, setIsCurrentUserPage] = useState<boolean>(false);
  const [modifying, setModifying] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * setSelectedFile for cancelling pp changing (clearing state)
   */
  const {
    selectedProfilePhoto,
    onSelectProfilePhoto,
    setSelectedProfilePhoto,
    profilePhotoUpload,
    profilePhotoUploadError,
    profilePhotoUploadLoading,
  } = useImageUpload();

  const setPostCreateModalState = useSetRecoilState(postCreateModalStateAtom);

  const [poorProfilePhoto, setPoorProfilePhoto] = useState(false);

  const [ostensibleProfilePhoto, setOstensibleProfilePhoto] = useState("");

  const [ostensibleUserInformation, setOstensibleUserInformation] =
    useState(userInformation);

  const { follow } = useFollow();

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   * UID is secure?
   */

  useEffect(() => {
    // Beacuse when page changes (userPage) state variable are not reseted. (ostensible)
    // We manually reset
    // But there is no problem at "userInformation" (userInformation.username changes, I mean)
    setSelectedProfilePhoto("");
    setOstensibleProfilePhoto("");
    setOstensibleUserInformation(userInformation);

    if (currentUserState.uid)
      if (currentUserState.uid == userInformation.uid) {
        setIsCurrentUserPage((prev) => true);
      } else {
        setIsCurrentUserPage((prev) => false);
      }
    else {
      setIsCurrentUserPage((prev) => false);
    }
  }, [userInformation, currentUserState.uid]);

  useEffect(() => {
    const poorStatus: boolean = !!(
      !userInformation.profilePhoto && !ostensibleProfilePhoto
    );
    setPoorProfilePhoto(poorStatus);
  }, [userInformation, ostensibleProfilePhoto]);

  const handleFollow = () => {
    // User check
    if (!currentUserState.username) {
      console.log("Only Users can follow");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
        view: "logIn",
      }));
      return;
    }
    // Follow operation
    follow(userInformation.username, 1);
    // Page Update (locally)
    // We don't need followers of users but I did.
    setOstensibleUserInformation((prev) => ({
      ...prev,
      followers: prev.followers.concat(currentUserState.username),
      followerCount: prev.followerCount + 1,
    }));
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(userInformation.username),
    }));
  };
  const handleDeFollow = () => {
    // Follow Operation
    follow(userInformation.username, -1);
    // Page Update (locally)
    setOstensibleUserInformation((prev) => ({
      ...prev,
      followers: prev.followers.filter((f) => f !== currentUserState.username),

      followerCount: prev.followerCount - 1,
    }));
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount - 1,
      followings: prev.followings.filter((f) => f !== userInformation.username),
    }));
  };

  return (
    <Flex direction="column" justify="center" align="center" mt={3}>
      <Flex position="relative" width="200px" direction="column" align="center">
        <Image
          src={
            selectedProfilePhoto
              ? selectedProfilePhoto
              : ostensibleProfilePhoto
              ? ostensibleProfilePhoto
              : userInformation.profilePhoto
              ? userInformation.profilePhoto
              : ""
          }
          fallback={
            !poorProfilePhoto ? (
              <SkeletonCircle
                width="200px"
                height="200px"
                startColor="gray.100"
                endColor="gray.800"
              />
            ) : (
              <Icon as={CgProfile} color="white" height="200px" width="200px" />
            )
          }
          height="200px"
          rounded="full"
        />

        <Circle
          position="absolute"
          top="151px"
          left="11px"
          bg="gray.700"
          minWidth="30px"
          minHeight="30px"
          hidden={!isCurrentUserPage}
        >
          <Icon
            as={BiPencil}
            cursor="pointer"
            onClick={() => {
              inputRef.current?.click();
            }}
            color="white"
            fontSize="15px"
          />
        </Circle>

        <Stack direction="row" gap={1} mt={3} hidden={!modifying}>
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={async () => {
              await profilePhotoUpload();
              setOstensibleProfilePhoto(selectedProfilePhoto);
              setModifying(false);
              setSelectedProfilePhoto("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            isLoading={profilePhotoUploadLoading}
          >
            Save
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            size="sm"
            onClick={() => {
              setSelectedProfilePhoto("");
              setModifying(false);
              if (inputRef.current) inputRef.current.value = "";
            }}
            isDisabled={profilePhotoUploadLoading}
          >
            Cancel
          </Button>
        </Stack>
      </Flex>

      <Input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => {
          setModifying(true);
          onSelectProfilePhoto(event);
        }}
      />

      <Flex direction="column" align="center" mt={1}>
        <Text as="b" fontSize="14pt" textColor="white">
          {userInformation.username}
        </Text>
        <Text as="i" fontSize="12pt" textColor="gray.500">
          {userInformation.fullname}
        </Text>
      </Flex>

      <Flex align="center" gap={3} mt={2}>
        <Flex gap={1}>
          <Text as="b" fontSize="12pt" textColor="white">
            {ostensibleUserInformation.followingCount}
          </Text>
          <Text fontSize="12pt" textColor="gray.500">
            Following
          </Text>
        </Flex>
        <Flex gap={1}>
          <Text as="b" fontSize="12pt" textColor="white">
            {ostensibleUserInformation.followerCount}
          </Text>
          <Text fontSize="12pt" textColor="gray.500">
            Follower
          </Text>
        </Flex>
      </Flex>

      {!isCurrentUserPage && (
        <Flex mt={2} mb={2}>
          {currentUserState.followings.includes(userInformation.username) ? (
            <Button
              variant="outline"
              colorScheme="blue"
              size="sm"
              onClick={handleDeFollow}
            >
              Unfollow
            </Button>
          ) : (
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={handleFollow}
            >
              Follow
            </Button>
          )}
        </Flex>
      )}

      {isCurrentUserPage && (
        <Flex
          align="center"
          gap="1"
          cursor="pointer"
          onClick={() => setPostCreateModalState({ isOpen: true })}
        >
          <Icon as={AiOutlinePlus} color="white" fontSize="2xl" mt={2} mb={2} />
          <Text as="b" textColor="white">
            Create
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
