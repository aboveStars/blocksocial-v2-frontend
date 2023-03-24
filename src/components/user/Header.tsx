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

import { useRecoilValue, useSetRecoilState } from "recoil";
import { postCreateModalStateAtom } from "../atoms/postCreateModalAtom";
import { UserInformation } from "../types/User";

type Props = {
  userInformation: UserInformation;
};

export default function Header({ userInformation }: Props) {
  const currentUserUid = useRecoilValue(currentUserStateAtom).uid;

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

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   * UID is secure?
   */

  useEffect(() => {
    setSelectedProfilePhoto("");
    if (currentUserUid)
      if (currentUserUid == userInformation.uid) {
        setIsCurrentUserPage((prev) => true);
      } else {
        setIsCurrentUserPage((prev) => false);
      }
    else {
      setIsCurrentUserPage((prev) => false);
    }
  }, [userInformation, currentUserUid]);

  useEffect(() => {
    const poorStatus: boolean = !!(
      !userInformation.profilePhoto && !ostensibleProfilePhoto
    );
    console.log(poorStatus);
    setPoorProfilePhoto(poorStatus);
  }, [userInformation, ostensibleProfilePhoto]);

  useEffect(() => {
    console.log(selectedProfilePhoto.length);
  }, [selectedProfilePhoto]);

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
            {userInformation.followingCount}
          </Text>
          <Text fontSize="12pt" textColor="gray.500">
            Following
          </Text>
        </Flex>
        <Flex gap={1}>
          <Text as="b" fontSize="12pt" textColor="white">
            {userInformation.followerCount}
          </Text>
          <Text fontSize="12pt" textColor="gray.500">
            Follower
          </Text>
        </Flex>
      </Flex>

      {!isCurrentUserPage && (
        <Flex mt={2} mb={2}>
          <Button variant="solid" colorScheme="blue" size="sm">
            Follow
          </Button>
          {/* <Button variant="outline" colorScheme="blue" size="sm">
            Unfollow
          </Button> */}
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
