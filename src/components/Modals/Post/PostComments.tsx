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
import { currentUserStateAtom } from "../../atoms/currentUserAtom";
import { CommentDataWithCommentDocPath, OpenPanelName } from "../../types/Post";
import CommentItem from "../../Items/Post/CommentItem";
import CommentItemSkeleton from "../../Skeletons/CommentItemSkeleton";
import useSortByUsername from "@/hooks/useSortByUsername";

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

  const [currentComment, setCurrentComment] = useState("");

  const { sendComment } = useSendComment();

  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const [gettingComments, setGettingComments] = useState(true);

  const { sortCommentsByUsername } = useSortByUsername();

  useEffect(() => {
    if (openPanelNameValue !== "comments") return;

    if (commentsInfo.postCommentCount > 0) {
      handleLoadComments();
    } else {
      setGettingComments(false);
      setCommentsDatasWithCommentDocPath([]);
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

    // Sorts if there is a current user
    if (currentUserState.isThereCurrentUser) {
      const sortedCommentDatasWithCommentDocPathArray = sortCommentsByUsername(
        commentDatasWithCommentDocPathArray,
        currentUserState.username
      );

      setCommentsDatasWithCommentDocPath(
        sortedCommentDatasWithCommentDocPathArray
      );
    } else
      setCommentsDatasWithCommentDocPath(commentDatasWithCommentDocPathArray);

    setGettingComments(false);
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
            {commentsDatasWithCommentDocPath.map((cdwcdi, i) => (
              <CommentItem
                key={i}
                commentDataWithCommentDocId={cdwcdi}
                openPanelNameSetter={openPanelNameSetter}
                commentCountSetter={commentCountSetter}
                commentsDatasWithCommentDocPathSetter={
                  setCommentsDatasWithCommentDocPath
                }
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
          <Text
            fontSize="10pt"
            textColor="white"
            hidden={!(!gettingComments && commentsInfo.postCommentCount === 0)}
          >
            No comments yet.
          </Text>
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
              onChange={(event) => {
                setCurrentComment(event.target.value);
              }}
              ml="3"
              height="40px"
              rounded="full"
            />
            <Icon
              as={AiOutlineSend}
              color="white"
              ml={2}
              mr={1}
              cursor="pointer"
              fontSize="20pt"
              onClick={() => {
                if (currentComment.length === 0) return;

                sendComment(commentsInfo.postDocPath, currentComment);
                if (commentInputRef.current) commentInputRef.current.value = "";
                const newCommentData: CommentDataWithCommentDocPath = {
                  commentDocPath: "",
                  comment: currentComment,
                  commentSenderUsername: currentUserState.username,
                  creationTime: Date.now(),
                };

                const prevCommentsDatasWithCommentDocPath =
                  commentsDatasWithCommentDocPath;
                prevCommentsDatasWithCommentDocPath.unshift(newCommentData);

                setCommentsDatasWithCommentDocPath(
                  prevCommentsDatasWithCommentDocPath
                );

                commentCountSetter((prev) => prev + 1);

                setCurrentComment("");
              }}
            />
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
