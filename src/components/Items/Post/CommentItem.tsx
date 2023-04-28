import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import useCommentDelete from "@/hooks/useCommentDelete";
import { Flex, Icon, Image, SkeletonCircle, Text } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import React, { SetStateAction, useEffect, useState } from "react";
import { BsDot, BsTrash } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { CommentDataWithCommentDocPath, OpenPanelName } from "../../types/Post";

type Props = {
  commentDataWithCommentDocId: CommentDataWithCommentDocPath;
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  commentCountSetter: React.Dispatch<SetStateAction<number>>;

  commentsDatasWithCommentDocPathSetter: React.Dispatch<
    SetStateAction<CommentDataWithCommentDocPath[]>
  >;
};

export default function CommentItem({
  commentDataWithCommentDocId,
  openPanelNameSetter,
  commentCountSetter,
  commentsDatasWithCommentDocPathSetter,
}: Props) {
  const [commentSenderPhoto, setCommentSenderPhoto] = useState("");
  const [gettingCommentSenderPhoto, setGettingCommentSenderPhoto] =
    useState(false);

  const router = useRouter();

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const { commentDelete } = useCommentDelete();

  useEffect(() => {
    getCommentSenderPhoto();
  }, []);

  const getCommentSenderPhoto = async () => {
    setGettingCommentSenderPhoto(true);
    const commentSenderDocRef = doc(
      firestore,
      `users/${commentDataWithCommentDocId.commentSenderUsername}`
    );
    const commentDocSnapshot = await getDoc(commentSenderDocRef);
    if (commentDocSnapshot.exists()) {
      setCommentSenderPhoto(commentDocSnapshot.data().profilePhoto);
    }
    setGettingCommentSenderPhoto(false);
  };

  const handleDeleteComment = async () => {
    commentDelete(commentDataWithCommentDocId.commentDocPath);
    commentsDatasWithCommentDocPathSetter((prev) =>
      prev.filter(
        (a) => a.commentDocPath !== commentDataWithCommentDocId.commentDocPath
      )
    );
    commentCountSetter((prev) => prev - 1);
  };

  return (
    <Flex id="main-comment-area" position="relative" align="center">
      <Flex align="center" gap={2}>
        <Image
          alt=""
          src={commentSenderPhoto}
          rounded="full"
          width="35px"
          height="35px"
          cursor="pointer"
          onClick={() => {
            router.push(
              `/${commentDataWithCommentDocId.commentSenderUsername}`
            );
            openPanelNameSetter("main");
          }}
          fallback={
            !!commentSenderPhoto || gettingCommentSenderPhoto ? (
              <Flex id="i-put-this-flex to adjust skeleton">
                <SkeletonCircle
                  width="35px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              </Flex>
            ) : (
              <Icon
                as={CgProfile}
                color="white"
                width="35px"
                cursor="pointer"
                onClick={() => {
                  router.push(
                    `/${commentDataWithCommentDocId.commentSenderUsername}`
                  );
                  openPanelNameSetter("main");
                }}
              />
            )
          }
        />
        <Flex direction="column">
          <Flex align="center">
            <Text
              fontSize="10pt"
              textColor="white"
              as="b"
              cursor="pointer"
              onClick={() => {
                router.push(
                  `/${commentDataWithCommentDocId.commentSenderUsername}`
                );
                openPanelNameSetter("main");
              }}
            >
              {commentDataWithCommentDocId.commentSenderUsername}
            </Text>
            <Icon as={BsDot} color="white" fontSize="13px" />
            <Text as="i" fontSize="8pt" textColor="gray.300">
              {moment(
                new Date(commentDataWithCommentDocId.creationTime)
              ).fromNow(true)}
            </Text>
            <Flex
              hidden={
                commentDataWithCommentDocId.commentSenderUsername !==
                currentUserState.username
              }
            >
              <Icon
                ml={1}
                as={BsTrash}
                fontSize="7pt"
                color="red"
                cursor="pointer"
                onClick={handleDeleteComment}
              />
            </Flex>
          </Flex>
          <Text fontSize="10pt" textColor="white" wordBreak="break-word" mr="2">
            {commentDataWithCommentDocId.comment}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
