import { firestore } from "@/firebase/clientApp";
import useSendComment from "@/hooks/useSendComment";
import {
  Flex,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SkeletonCircle,
  Stack,
  Text
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { CommentData } from "../types/Post";
import CommentItem from "./CommentItem";

type Props = {
  postCommentsData: {
    postSenderUsername: string;
    postId: string;
    postCommentsColPath: string;
  };

  commentPanelOpenStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PostComments({
  postCommentsData,
  commentPanelOpenStateSetter,
}: Props) {
  const [commentsDatas, setCommentsDatas] = useState<CommentData[]>([]);
  const [currentComment, setCurrentComment] = useState("");

  const { sendComment } = useSendComment();

  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserProfilePhoto =
    useRecoilValue(currentUserStateAtom).profilePhoto;

  useEffect(() => {
    handleLoadComments();
  }, [postCommentsData]);

  const handleLoadComments = async () => {
    // get comment docs
    const postCommentsCollectionRef = collection(
      firestore,
      postCommentsData.postCommentsColPath
    );
    const postCommentsDocs = await getDocs(postCommentsCollectionRef);

    const commentDatasArray: CommentData[] = [];

    postCommentsDocs.forEach((doc) => {
      const commentDataObject: CommentData = {
        commentSenderUsername: doc.data().commentSenderUsername,
        comment: doc.data().comment,
      };
      commentDatasArray.push(commentDataObject);
    });

    console.log(commentDatasArray);

    setCommentsDatas(commentDatasArray);
  };

  return (
    <Flex direction="column" gap={2} p={3} bg="gray.900" rounded="10px">
      <Flex id="footer" position="relative" align="center" height="45px">
        <Flex position="absolute" left={0}>
          <Text as="b" fontSize="15pt" textColor="white">
            Comments
          </Text>
        </Flex>
        <Flex position="absolute" right={0}>
          <Icon
            as={AiOutlineClose}
            color="white"
            cursor="pointer"
            onClick={() => commentPanelOpenStateSetter(false)}
          />
        </Flex>
      </Flex>
      <Flex id="comments">
        <Stack gap={1}>
          {commentsDatas.map((cd) => (
            <CommentItem key={cd.commentSenderUsername} commentData={cd} />
          ))}
        </Stack>
      </Flex>
      <Flex id="sendComment" align="center">
        <InputGroup>
          <InputLeftElement>
            <Image
              src={currentUserProfilePhoto}
              rounded="full"
              width="30px"
              height="30px"
              fallback={
                currentUserProfilePhoto ? (
                  <SkeletonCircle
                    width="35px"
                    height="35px"
                    startColor="gray.100"
                    endColor="gray.800"
                  />
                ) : (
                  <Icon
                    as={CgProfile}
                    color="white"
                    height="35px"
                    width="35px"
                  />
                )
              }
            />
          </InputLeftElement>
          <Input
            ref={commentInputRef}
            placeholder="Add a comment..."
            textColor="white"
            focusBorderColor="gray.800"
            borderColor="gray.800"
            _hover={{
              borderColor: "gray.800",
            }}
            onChange={(event) => setCurrentComment(event.target.value)}
            ml="1"
            height="40px"
          />
          <InputRightElement>
            <Icon
              as={AiOutlineSend}
              color="white"
              cursor="pointer"
              onClick={() => {
                sendComment(
                  postCommentsData.postCommentsColPath,
                  currentComment,
                  postCommentsData.postId,
                  postCommentsData.postSenderUsername
                );
                if (commentInputRef.current) commentInputRef.current.value = "";
              }}
            />
          </InputRightElement>
        </InputGroup>
      </Flex>
    </Flex>
  );
}
