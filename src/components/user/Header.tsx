import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import {
  currentUserStateAtom,
  UserDataAtUserpage,
} from "../atoms/currentUserAtom";

import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { AiFillEdit, AiOutlineUpload } from "react-icons/ai";
import useImageUpload from "@/hooks/useImageUpload";

type Props = {
  userData: UserDataAtUserpage;
};

export default function Header({ userData }: Props) {
  const currentUserUid = useRecoilValue(currentUserStateAtom).uid;

  const [canModify, setCanModify] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedFile, onSelectFile } = useImageUpload();

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
      {userData.profilePhoto || selectedFile ? (
        <Image src={selectedFile} height="200px" rounded="full" />
      ) : (
        <>
          <Icon as={CgProfile} color="white" fontSize="8xl" />
        </>
      )}
      {canModify && (
        <>
          <Button
            width="10px"
            height="15px"
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            <Icon as={AiOutlineUpload} width="15px" height="15px" />
          </Button>
          <Input ref={inputRef} type="file" hidden onChange={onSelectFile} />
        </>
      )}

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
