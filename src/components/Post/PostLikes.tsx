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
import { SetStateAction } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { OpenPanelName } from "../types/Post";
import CommentItemSkeleton from "./CommentItemSkeleton";
import LikeItem from "./LikeItem";
import LikeItemSkeleton from "./LikeItemSkeleton";

type Props = {
  likeData: {
    likeCount: number;
    whoLiked: string[];
  };
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  openPanelNameValue: OpenPanelName;
};

export default function PostLikes({
  likeData,
  openPanelNameSetter,
  openPanelNameValue,
}: Props) {
  return (
    <Modal
      onClose={() => openPanelNameSetter("main")}
      size="full"
      isOpen={openPanelNameValue === "likes"}
    >
      <ModalOverlay />
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
            Likes
          </Text>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() => openPanelNameSetter("main")}
          />
        </Flex>

        <ModalBody>
          <Stack gap={1} hidden={likeData.likeCount === 0}>
            {likeData.whoLiked.map((w, i) => (
              <LikeItem
                likerUsername={w}
                openPanelNameSetter={openPanelNameSetter}
                key={i}
              />
            ))}
          </Stack>
          <Stack gap={1} hidden={likeData.likeCount !== 0}>
            {Array.from({ length: likeData.likeCount }, (_, index) => (
              <LikeItemSkeleton key={index} />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
