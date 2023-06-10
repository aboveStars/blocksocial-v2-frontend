import { firestore } from "@/firebase/clientApp";
import useSendComment from "@/hooks/postHooks/useSendComment";

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
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { currentUserStateAtom } from "../../atoms/currentUserAtom";
import CommentItem from "../../Items/Post/CommentItem";
import { CommentDataWithCommentDocPath, OpenPanelName } from "../../types/Post";

type Props = {
  commentsInfo: {
    postCommentCount: number;
    postDocPath: string;
  };

  openPanelNameValue: OpenPanelName;
  openPanelNameSetter: React.Dispatch<React.SetStateAction<OpenPanelName>>;
  commentCountSetter: React.Dispatch<React.SetStateAction<number>>;
};

export default function PostComments({
  commentsInfo,
  openPanelNameSetter,
  openPanelNameValue,
  commentCountSetter,
}: Props) {
  const [commentsDatasWithCommentDocPath, setCommentsDatasWithCommentDocPath] =
    useState<CommentDataWithCommentDocPath[]>([]);

  const { sendComment } = useSendComment();

  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [gettingComments, setGettingComments] = useState(true);
  const [commentSendLoading, setCommentSendLoading] = useState(false);

  useEffect(() => {
    if (openPanelNameValue === "comments") {
      handleLoadComments();
    }
  }, [openPanelNameValue]);

  const handleLoadComments = async () => {
    setGettingComments(true);

    // get comment docs

    const postCommentsCollection = collection(
      firestore,
      `${commentsInfo.postDocPath}/comments`
    );
    const commentDocQuery = query(
      postCommentsCollection,
      orderBy("creationTime", "desc")
    );
    const postCommentsDocs = await getDocs(commentDocQuery);

    const commentDatasWithCommentDocPathArray: CommentDataWithCommentDocPath[] =
      [];

    postCommentsDocs.forEach((doc) => {
      const commentDataObject: CommentDataWithCommentDocPath = {
        commentDocPath: `${commentsInfo.postDocPath}/comments/${doc.id}`,
        commentSenderUsername: doc.data().commentSenderUsername,
        comment: doc.data().comment,
        creationTime: doc.data().creationTime,
      };

      commentDatasWithCommentDocPathArray.push(commentDataObject);
    });

    let finalCommentDatasWithCommentDocPathArray: CommentDataWithCommentDocPath[] =
      commentDatasWithCommentDocPathArray;

    // Don't need to control if this user commented
    if (currentUserState.isThereCurrentUser) {
      const currentUserCommentObjects =
        finalCommentDatasWithCommentDocPathArray.filter(
          (a) => a.commentSenderUsername === currentUserState.username
        );

      if (currentUserCommentObjects.length !== 0) {
        const filtered = finalCommentDatasWithCommentDocPathArray.filter(
          (a) => a.commentSenderUsername !== currentUserState.username
        );

        for (const a of currentUserCommentObjects) {
          filtered.unshift(a);
        }

        finalCommentDatasWithCommentDocPathArray = filtered;
      }
    }

    setCommentsDatasWithCommentDocPath(
      finalCommentDatasWithCommentDocPathArray
    );

    setGettingComments(false);
  };

  const handleSendComment = async () => {
    if (!currentUserState.isThereCurrentUser) return;

    if (!commentInputRef.current) return;

    const currentComment = commentInputRef.current.value;
    if (currentComment.length === 0) return;

    setCommentSendLoading(true);

    const newCommentDocPath = await sendComment(
      commentsInfo.postDocPath,
      currentComment
    );

    if (!newCommentDocPath) return setCommentSendLoading(false);

    const newCommentData: CommentDataWithCommentDocPath = {
      commentDocPath: newCommentDocPath,
      comment: currentComment,
      commentSenderUsername: currentUserState.username,
      creationTime: Date.now(),
    };

    const prevCommentsDatasWithCommentDocPath = commentsDatasWithCommentDocPath;
    prevCommentsDatasWithCommentDocPath.unshift(newCommentData);
    setCommentsDatasWithCommentDocPath(prevCommentsDatasWithCommentDocPath);

    commentCountSetter((prev) => prev + 1);

    if (commentInputRef.current) commentInputRef.current.value = "";
    setCommentSendLoading(false);
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
      isOpen={openPanelNameValue === "comments"}
      autoFocus={false}
    >
      <ModalOverlay />
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
            {commentsDatasWithCommentDocPath.map((cdwcdi, i) => (
              <CommentItem
                key={JSON.stringify(cdwcdi)}
                commentDataWithCommentDocId={cdwcdi}
                openPanelNameSetter={openPanelNameSetter}
                commentCountSetter={commentCountSetter}
                commentsDatasWithCommentDocPathSetter={
                  setCommentsDatasWithCommentDocPath
                }
              />
            ))}
          </Stack>

          <Text
            fontSize="10pt"
            textColor="white"
            hidden={
              !(
                !gettingComments && commentsDatasWithCommentDocPath.length === 0
              )
            }
          >
            No comments yet.
          </Text>
          <Spinner color="white" hidden={!gettingComments} />
        </ModalBody>
        <Flex
          id="comment-send-area"
          position="sticky"
          bottom={2}
          width="100%"
          height="70px"
          bg="black"
          px={3}
          hidden={!currentUserState.isThereCurrentUser}
        >
          <Flex align="center" width="100%" border="1px" rounded="full" p={2}>
            <Image
              alt=""
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
              ml="3"
              height="40px"
              rounded="full"
              isDisabled={commentSendLoading}
            />
            {commentSendLoading ? (
              <Flex ml={2} mr={1}>
                <Spinner color="white" />
              </Flex>
            ) : (
              <Icon
                as={AiOutlineSend}
                color="white"
                ml={2}
                mr={1}
                cursor="pointer"
                fontSize="20pt"
                onClick={handleSendComment}
              />
            )}
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
