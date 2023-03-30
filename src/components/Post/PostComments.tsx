import { firestore } from "@/firebase/clientApp";
import useSendComment from "@/hooks/useSendComment";
import {
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { CommentData, OpenPanelName } from "../types/Post";
import CommentItem from "./CommentItem";
import CommentItemSkeleton from "./CommentItemSkeleton";

type Props = {
  postInfo: {
    postSenderUsername: string;
    postId: string;
  };

  commentsInfo: {
    postCommentCount: number;
    postCommentsColPath: string;
  };

  openPanelNameValue: OpenPanelName;
  openPanelNameSetter: React.Dispatch<React.SetStateAction<OpenPanelName>>;
};

export default function PostComments({
  postInfo,
  commentsInfo,
  openPanelNameSetter,
  openPanelNameValue,
}: Props) {
  const [commentsDatas, setCommentsDatas] = useState<CommentData[]>([]);

  const [currentComment, setCurrentComment] = useState("");

  const { sendComment } = useSendComment();

  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [gettingComments, setGettingComments] = useState(true);

  useEffect(() => {
    if (
      openPanelNameValue === "comments" &&
      commentsInfo.postCommentCount > 0
    ) {
      console.log("Comments Loading");
      handleLoadComments();
    } else {
      console.log("Prevented Update");
    }
  }, [openPanelNameValue]);

  const handleLoadComments = async () => {
    // get comment docs

    const postCommentsCollection = collection(
      firestore,
      commentsInfo.postCommentsColPath
    );
    const commentDocQuery = query(
      postCommentsCollection,
      orderBy("creationTime", "desc")
    );
    const postCommentsDocs = await getDocs(commentDocQuery);

    const commentDatasArray: CommentData[] = [];

    postCommentsDocs.forEach((doc) => {
      const commentDataObject: CommentData = {
        commentSenderUsername: doc.data().commentSenderUsername,
        comment: doc.data().comment,
        creationTime: doc.data().creationTime,
      };

      commentDatasArray.push(commentDataObject);
    });

    setCommentsDatas(commentDatasArray);
    setGettingComments(false);
  };

  return (
    <Modal
      onClose={() => openPanelNameSetter("main")}
      size="full"
      isOpen={openPanelNameValue === "comments"}
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
            Comments
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
          <Stack gap={1} hidden={gettingComments}>
            {commentsDatas.map((cd, i) => (
              <CommentItem
                key={i}
                commentData={cd}
                openPanelNameSetter={openPanelNameSetter}
              />
            ))}
          </Stack>
          <Stack gap={1} hidden={!gettingComments}>
            {Array.from(
              { length: commentsInfo.postCommentCount },
              (_, index) => (
                <CommentItemSkeleton key={index} />
              )
            )}
          </Stack>
        </ModalBody>

        <Flex
          position="sticky"
          bottom={2}
          width="100%"
          height="70px"
          bg="black"
          px={3}
        >
          <Flex align="center" width="100%" border="1px" rounded="full" p={2}>
            <Image
              src={currentUserState.profilePhoto}
              rounded="full"
              width="50px"
              height="50px"
              fallback={
                currentUserState.profilePhoto ? (
                  <Flex>
                    <SkeletonCircle
                      size="50px"
                      startColor="gray.100"
                      endColor="gray.800"
                    />
                  </Flex>
                ) : (
                  <Icon
                    as={CgProfile}
                    color="white"
                    height="50px"
                    width="50px"
                  />
                )
              }
            />
            <Input
              ref={commentInputRef}
              placeholder="Add a comment..."
              _placeholder={{
                fontSize: "10pt",
              }}
              textColor="white"
              focusBorderColor="gray.900"
              borderColor="gray.900"
              _hover={{
                borderColor: "gray.900",
              }}
              onChange={(event) => setCurrentComment(event.target.value)}
              ml="3"
              height="40px"
              rounded="full"
              tabIndex={-1}
            />
            <Icon
              as={AiOutlineSend}
              color="white"
              ml={2}
              mr={1}
              cursor="pointer"
              fontSize="20pt"
              onClick={() => {
                sendComment(
                  commentsInfo.postCommentsColPath,
                  currentComment,
                  postInfo.postId,
                  postInfo.postSenderUsername
                );
                if (commentInputRef.current) commentInputRef.current.value = "";
                setCommentsDatas((prev) => [
                  {
                    comment: currentComment,
                    commentSenderUsername: currentUserState.username,
                    creationTime: new Timestamp(Date.now() / 1000, 0),
                  },
                  ...prev,
                ]);
              }}
            />
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
