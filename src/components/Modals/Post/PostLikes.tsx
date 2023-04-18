import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import useSortByUsername from "@/hooks/useSortByUsername";
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
import { doc, getDoc } from "firebase/firestore";
import { SetStateAction, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRecoilValue } from "recoil";
import LikeItem from "../../Items/Post/LikeItem";
import { LikeData, OpenPanelName } from "../../types/Post";

type Props = {
  likeData: LikeData;
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  openPanelNameValue: OpenPanelName;
  postSenderUsername: string;
};

export default function PostLikes({
  likeData,
  openPanelNameSetter,
  openPanelNameValue,
  postSenderUsername,
}: Props) {
  const [likeDatas, setLikeDatas] = useState<string[]>([]);

  const { sortLikesByUsername } = useSortByUsername();

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [gettingLikes, setGettingLikes] = useState(true);

  useEffect(() => {
    getLikes();
  }, [likeData]);

  const getLikes = async () => {
    setGettingLikes(true);
    const likeDocRef = doc(firestore, likeData.likeDocPath);
    const likeDoc = await getDoc(likeDocRef);
    if (!likeDoc.exists()) {
      console.log("Post Not Found");
      setGettingLikes(false);
      return;
    }

    let tempLikeDatas = likeDoc.data().whoLiked;

    if (tempLikeDatas.includes(currentUserState.username)) {
      const sortedWhoLiked = sortLikesByUsername(
        tempLikeDatas,
        currentUserState.username
      );

      tempLikeDatas = sortedWhoLiked;
    }

    setLikeDatas(tempLikeDatas);
    setGettingLikes(false);
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
          <Stack gap={1} hidden={gettingLikes}>
            {likeDatas.map((w, i) => (
              <LikeItem
                postSenderUsername={postSenderUsername}
                likerUsername={w}
                openPanelNameSetter={openPanelNameSetter}
                key={i}
              />
            ))}
          </Stack>

          <Text
            fontSize="10pt"
            textColor="white"
            hidden={likeDatas.length !== 0 || gettingLikes}
          >
            No likes yet.
          </Text>
          <Spinner color="white" hidden={!gettingLikes} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
