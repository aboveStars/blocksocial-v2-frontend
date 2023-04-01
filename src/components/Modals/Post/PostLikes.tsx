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
import { SetStateAction, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { LikeData, OpenPanelName } from "../../types/Post";
import LikeItem from "../../Items/Post/LikeItem";
import LikeItemSkeleton from "../../Skeletons/LikeItemSkeleton";
import useSortByUsername from "@/hooks/useSortByUsername";
import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { useRecoilValue } from "recoil";

type Props = {
  likeData: LikeData;
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  openPanelNameValue: OpenPanelName;
};

export default function PostLikes({
  likeData,
  openPanelNameSetter,
  openPanelNameValue,
}: Props) {
  const [reviewedLikeData, setReviewedLikeData] = useState<LikeData>({
    likeCount: 0,
    whoLiked: [],
  });

  const { sortLikesByUsername } = useSortByUsername();

  const currentUserState = useRecoilValue(currentUserStateAtom);

  useEffect(() => {
    getLikes();
  }, [likeData]);
  /**
   *  All like information already come with props, but in future, that will not.
   *Now this is just for sorting likes with our username
   */
  const getLikes = () => {
    if (likeData.whoLiked.includes(currentUserState.username)) {
      const sortedWhoLiked = sortLikesByUsername(
        likeData.whoLiked,
        currentUserState.username
      );
      setReviewedLikeData({
        likeCount: likeData.likeCount,
        whoLiked: sortedWhoLiked,
      });
    } else {
      setReviewedLikeData(likeData);
    }
  };

  return (
    <Modal
      onClose={() => openPanelNameSetter("main")}
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      isOpen={openPanelNameValue === "likes"}
      autoFocus={false}
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
          <Stack gap={1} hidden={reviewedLikeData.likeCount === 0}>
            {reviewedLikeData.whoLiked.map((w, i) => (
              <LikeItem
                likerUsername={w}
                openPanelNameSetter={openPanelNameSetter}
                key={i}
              />
            ))}
          </Stack>
          <Stack gap={1} hidden={reviewedLikeData.likeCount !== 0}>
            {Array.from({ length: reviewedLikeData.likeCount }, (_, index) => (
              <LikeItemSkeleton key={index} />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
