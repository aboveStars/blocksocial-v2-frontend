import {
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  currentUserStateAtom,
  UserDataAtUserpage,
} from "../atoms/currentUserAtom";

import useImageUpload from "@/hooks/useImageUpload";
import { AiFillEdit, AiOutlineUpload } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";

type Props = {
  userData: UserDataAtUserpage;
};

export default function Header({ userData }: Props) {
  const currentUserUid = useRecoilValue(currentUserStateAtom).uid;

  const [canModify, setCanModify] = useState<boolean>(false);
  const [modifying, setModifying] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * setSelectedFile for cancelling pp changing (clearing state)
   */
  const {
    selectedFile,
    onSelectFile,
    setSelectedFile,
    profilePhotoUpload,
    profilePhotoUploadError,
    profilePhotoUploadLoading,
  } = useImageUpload();

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   */
  useEffect(() => {
    if (currentUserUid)
      if (currentUserUid == userData.uid) {
        setCanModify((prev) => true);
      } else {
        setCanModify((prev) => false);
      }
    else {
      setCanModify((prev) => false);
    }
  }, [userData, currentUserUid]);

  return (
    <Flex direction="column" justify="center" align="center">
      <Flex justify="center" mt={2}>
        {selectedFile ? (
          <>
            <Image src={selectedFile} height="200px" rounded="full" />
          </>
        ) : userData.profilePhoto ? (
          <>
            <Image src={userData.profilePhoto} height="200px" rounded="full" />
          </>
        ) : (
          <Icon as={CgProfile} color="white" height="200px" width="200px" />
        )}
      </Flex>

      <Flex mt={5} mb={5}>
        {canModify && (
          <>
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
                onSelectFile(event);
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
                    setSelectedFile("");
                    setModifying(false);
                  }}
                  size="sm"
                  isDisabled={profilePhotoUploadLoading}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </>
        )}
      </Flex>

      <Text textColor="white">{userData.username}</Text>
      <Divider />
      <Text textColor="white">{userData.fullname}</Text>
      <Text textColor="white">{userData.uid}</Text>
      <Text textColor="white">{userData.email}</Text>
      <Divider />
      {canModify && <Icon as={AiFillEdit} color="white" fontSize="2xl" />}
    </Flex>
  );
}
