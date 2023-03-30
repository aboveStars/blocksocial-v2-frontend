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
  SkeletonText,
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
import { BsDot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { CommentData } from "../types/Post";
import CommentItem from "./CommentItem";
import CommentItemSkeleton from "./CommentItemSkeleton";

type Props = {
  postCommentsData: {
    postSenderUsername: string;
    postId: string;
    postCommentsColPath: string;
  };

  commentPanelOpenStateValue: boolean;
  commentPanelOpenStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PostComments({
  postCommentsData,
  commentPanelOpenStateSetter,
  commentPanelOpenStateValue,
}: Props) {
  const [commentsDatas, setCommentsDatas] = useState<CommentData[]>([]);

  const [currentComment, setCurrentComment] = useState("");

  const { sendComment } = useSendComment();

  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [gettingComments, setGettingComments] = useState(true);

  useEffect(() => {
    if (commentPanelOpenStateValue) {
      console.log("Comments Loading");
      handleLoadComments();
    } else {
      console.log("Prevented Update");
    }
  }, [commentPanelOpenStateValue]);

  const handleLoadComments = async () => {
    // get comment docs

    const postCommentsCollection = collection(
      firestore,
      postCommentsData.postCommentsColPath
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
      onClose={() => commentPanelOpenStateSetter(false)}
      size="full"
      isOpen={commentPanelOpenStateValue}
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
            onClick={() => commentPanelOpenStateSetter(false)}
          />
        </Flex>

        <ModalBody>
          <Stack gap={1} hidden={gettingComments}>
            {commentsDatas.map((cd) => (
              <CommentItem
                key={`${cd.commentSenderUsername}${cd.creationTime.seconds}.${cd.creationTime.nanoseconds}`}
                commentData={cd}
              />
            ))}
          </Stack>
          <Stack gap={1} hidden={!gettingComments}>
            {Array.from({ length: 5 }, (_, index) => (
              <CommentItemSkeleton key={index} />
            ))}
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
                  postCommentsData.postCommentsColPath,
                  currentComment,
                  postCommentsData.postId,
                  postCommentsData.postSenderUsername
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
