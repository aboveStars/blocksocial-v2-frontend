import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

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

  const [followDataLoading, setFollowDataLoading] = useState(true);

  useEffect(() => {
    if (followInformationModalStateValue.isOpen) handleFollowData();
  }, [followInformationModalStateValue]);

  const handleFollowData = async () => {
    setFollowDataLoading(true);

    const followDataCollection = collection(
      firestore,
      `users/${userName}/${followInformationModalStateValue.modal}`
    );
    const q = query(followDataCollection, orderBy("followTime", "desc"));
    const followDataDocs = (await getDocs(q)).docs;

    let tempFollowData: string[] = [];
    for (const doc of followDataDocs) {
      tempFollowData.push(doc.id);
    }

    let finalFollowData: string[] = tempFollowData;
    if (currentUserState.isThereCurrentUser) {
      if (finalFollowData.includes(currentUserState.username)) {
        const filtered = finalFollowData.filter(
          (a) => a !== currentUserState.username
        );

        filtered.unshift(currentUserState.username);
        finalFollowData = filtered;
      }
    }
    setFollowData(finalFollowData);
    setFollowDataLoading(false);
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
      <ModalContent
        bg="black"
        minHeight={{
          md: "500px",
          lg: "500px",
        }}
      >
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
          <Spinner color="white" hidden={!followDataLoading} />

          {/**
           * At second time getting follow, stack uses old value of state. So I put hidden prop to it
           */}
          <Stack gap={2} hidden={followDataLoading}>
            {followData.map((f, i) => (
              <FollowItem
                key={`${f}${i}`}
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
