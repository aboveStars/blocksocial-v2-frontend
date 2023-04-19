import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";

import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";

import React, { SetStateAction, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRecoilValue } from "recoil";
import FollowItem from "../../user/FollowItem";
import { FollowingsFollowersModalType } from "../../user/Header";

type Props = {
  followInformationModalStateValue: FollowingsFollowersModalType;
  followInformationModalStateSetter: React.Dispatch<
    SetStateAction<FollowingsFollowersModalType>
  >;
  userName: string;
};

export default function FollowInformationModal({
  followInformationModalStateValue,
  followInformationModalStateSetter,
  userName,
}: Props) {
  /**
   * Both for followers and followings
   */
  const [followData, setFollowData] = useState<string[]>([]);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  useEffect(() => {
    handleFollowData();
  }, [followInformationModalStateValue]);

  const handleFollowData = async () => {
    const followDataCollection = collection(
      firestore,
      `users/${userName}/${followInformationModalStateValue.modal}`
    );
    const followDataDocs = (await getDocs(followDataCollection)).docs;

    let tempFollowData: string[] = [];
    for (const doc of followDataDocs) {
      tempFollowData.push(doc.id);
    }

    let finalFollowData: string[] = tempFollowData;
    if (currentUserState.isThereCurrentUser) {
      const filtered = finalFollowData.filter(
        (a) => a !== currentUserState.username
      );

      filtered.unshift(currentUserState.username);
      finalFollowData = filtered;
    }
    setFollowData(finalFollowData);
  };

  return (
    <Modal
      id="followings-followers-modal"
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      isOpen={followInformationModalStateValue.isOpen}
      onClose={() =>
        followInformationModalStateSetter((prev) => ({
          ...prev,
          isOpen: false,
        }))
      }
      autoFocus={false}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent bg="black">
        <Flex
          position="sticky"
          top="0"
          px={6}
          align="center"
          justify="space-between"
          height="50px"
          bg="black"
        >
          <Flex textColor="white" fontSize="17pt" fontWeight="700" gap={2}>
            <Text> &ldquo;{userName}&ldquo;</Text>
            <Text>
              {followInformationModalStateValue.modal === "followings"
                ? "follows"
                : `${followInformationModalStateValue.modal}`}
            </Text>
          </Flex>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() =>
              followInformationModalStateSetter((prev) => ({
                ...prev,
                isOpen: false,
              }))
            }
          />
        </Flex>

        <ModalBody>
          <Stack gap={2}>
            {followData.map((f) => (
              <FollowItem
                key={`${f}${Date.now()}`}
                username={f}
                followingsFollowersModalStateSetter={
                  followInformationModalStateSetter
                }
              />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
