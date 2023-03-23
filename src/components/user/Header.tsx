import {
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  currentUserStateAtom,
  UserInformation,
} from "../atoms/currentUserAtom";

import useImageUpload from "@/hooks/useImageUpload";
import {
  AiFillEdit,
  AiOutlinePlusSquare,
  AiOutlineUpload,
} from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { postCreateModalStateAtom } from "../atoms/postCreateModalAtom";

type Props = {
  userInformation: UserInformation;
};

export default function Header({ userInformation }: Props) {
  const currentUserUid = useRecoilValue(currentUserStateAtom).uid;

  const [canModify, setCanModify] = useState<boolean>(false);
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

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   */
  useEffect(() => {
    setSelectedProfilePhoto("");
    if (currentUserUid)
      if (currentUserUid == userInformation.uid) {
        setCanModify((prev) => true);
      } else {
        setCanModify((prev) => false);
      }
    else {
      setCanModify((prev) => false);
    }
  }, [userInformation, currentUserUid]);

  return (
    <Flex direction="column" justify="center" align="center">
      <Flex justify="center" mt={2}>
        {selectedProfilePhoto ? (
          <>
            <Image
              src={selectedProfilePhoto}
              height="200px"
              rounded="full"
              fallback={
                <SkeletonCircle
                  width="200px"
                  height="200px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              }
            />
          </>
        ) : userInformation.profilePhoto ? (
          <>
            <Image
              src={userInformation.profilePhoto}
              fallback={
                <SkeletonCircle
                  width="200px"
                  height="200px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              }
              height="200px"
              rounded="full"
            />
          </>
        ) : (
          <Icon as={CgProfile} color="white" height="200px" width="200px" />
        )}
      </Flex>

      {canModify && (
        <Flex mt={5} mb={2}>
          {!modifying && (
            <Icon
              as={AiOutlineUpload}
              cursor="pointer"
              onClick={() => {
                inputRef.current?.click();
              }}
              color="white"
              fontSize="2xl"
            />
          )}

          <Input
            ref={inputRef}
            type="file"
            hidden
            onChange={(event) => {
              setModifying(true);
              onSelectProfilePhoto(event);
            }}
          />

          {modifying && (
            <Stack direction="row" gap={1}>
              <Button
                size="sm"
                onClick={async () => {
                  await profilePhotoUpload();
                  setModifying(false);
                }}
                isLoading={profilePhotoUploadLoading}
              >
                Save Profile Photo
              </Button>
              <Button
                onClick={() => {
                  setSelectedProfilePhoto("");
                  setModifying(false);
                }}
                size="sm"
                isDisabled={profilePhotoUploadLoading}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Flex>
      )}

      <Text textColor="white">{userInformation.username}</Text>
      <Divider />
      <Text textColor="white">{userInformation.fullname}</Text>
      <Text textColor="white">{userInformation.uid}</Text>
      <Text textColor="white">{userInformation.email}</Text>
      <Divider />

      {canModify && (
        <Icon
          as={AiOutlinePlusSquare}
          color="white"
          fontSize="2xl"
          mt={2}
          mb={2}
          cursor="pointer"
          onClick={() => setPostCreateModalState({ isOpen: true })}
        />
      )}
    </Flex>
  );
}
