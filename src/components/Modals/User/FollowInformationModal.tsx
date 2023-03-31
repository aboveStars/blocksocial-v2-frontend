import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";
import React, { SetStateAction } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { UserInformation } from "../../types/User";
import FollowItem from "../../user/FollowItem";
import { FollowingsFollowersModalType } from "../../user/Header";

type Props = {
  followInformationModalStateValue: FollowingsFollowersModalType;
  followInformationModalStateSetter: React.Dispatch<
    SetStateAction<FollowingsFollowersModalType>
  >;
  ostensibleUserInformation: UserInformation;
};

export default function FollowInformationModal({
  followInformationModalStateValue,
  followInformationModalStateSetter,
  ostensibleUserInformation,
}: Props) {
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
          <Text textColor="white" fontSize="17pt" fontWeight="700">
            "{ostensibleUserInformation.username}"{" "}
            {followInformationModalStateValue.modal}
          </Text>

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
            {ostensibleUserInformation[
              followInformationModalStateValue.modal
            ].map((f) => (
              <FollowItem
                key={f}
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
