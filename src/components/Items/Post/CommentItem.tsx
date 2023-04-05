import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { firestore } from "@/firebase/clientApp";
import useCommentDelete from "@/hooks/useCommentDelete";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Icon,
  Image,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import React, { SetStateAction, use, useEffect, useRef, useState } from "react";
import { BsDot, BsTrash } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { CommentDataWithCommentDocPath, OpenPanelName } from "../../types/Post";

type Props = {
  commentDataWithCommentDocId: CommentDataWithCommentDocPath;
  openPanelNameSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  commentCountSetter: React.Dispatch<SetStateAction<number>>;
};

export default function CommentItem({
  commentDataWithCommentDocId,
  openPanelNameSetter,
  commentCountSetter,
}: Props) {
  const [commentSenderPhoto, setCommentSenderPhoto] = useState("");
  const [gettingCommentSenderPhoto, setGettingCommentSenderPhoto] =
    useState(false);

  const router = useRouter();

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const { commentDelete } = useCommentDelete();

  const [isThisCommentDeleted, setIsThisCommentDeleted] = useState(false);

  const [
    newCommentDeletionErrorModalOpen,
    setNewCommentDeletionErrorModalOpen,
  ] = useState(false);

  const leastDestructiveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getPostSenderPhoto();
  }, [commentDataWithCommentDocId]);

  const getPostSenderPhoto = async () => {
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

  return (
    <Flex justify="space-between" align="center" hidden={isThisCommentDeleted}>
      <Flex id="comment" height="50px" align="center" gap={2}>
        <Image
          alt=""
          src={commentSenderPhoto}
          rounded="full"
          width="35px"
          height="35px"
          cursor="pointer"
          onClick={() => {
            router.push(
              `/users/${commentDataWithCommentDocId.commentSenderUsername}`
            );
            openPanelNameSetter("main");
          }}
          fallback={
            !!commentSenderPhoto || gettingCommentSenderPhoto ? (
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
                cursor="pointer"
                onClick={() => {
                  router.push(
                    `/users/${commentDataWithCommentDocId.commentSenderUsername}`
                  );
                  openPanelNameSetter("main");
                }}
              />
            )
          }
        />

        <Flex
          direction="column"
          cursor="pointer"
          onClick={() => {
            router.push(
              `/users/${commentDataWithCommentDocId.commentSenderUsername}`
            );
            openPanelNameSetter("main");
          }}
        >
          <Flex align="center">
            <Text fontSize="10pt" textColor="white" as="b">
              {commentDataWithCommentDocId.commentSenderUsername}
            </Text>
            <Icon as={BsDot} color="white" fontSize="13px" />
            <Text as="i" fontSize="8pt" textColor="gray.300">
              {moment(
                new Date(
                  commentDataWithCommentDocId.creationTime.seconds * 1000
                )
              ).fromNow(true)}
            </Text>
          </Flex>

          <Text fontSize="10pt" textColor="white">
            {commentDataWithCommentDocId.comment}
          </Text>
        </Flex>
      </Flex>
      <Flex
        id="comment-delete-area"
        hidden={
          commentDataWithCommentDocId.commentSenderUsername !==
          currentUserState.username
        }
      >
        <Icon
          as={BsTrash}
          color="red.700"
          cursor="pointer"
          onClick={async () => {
            if (!!!commentDataWithCommentDocId.commentDocPath) {
              setNewCommentDeletionErrorModalOpen(true);
            } else {
              commentDelete(commentDataWithCommentDocId.commentDocPath);
              setIsThisCommentDeleted(true);
              commentCountSetter((prev) => prev - 1);
            }
          }}
        />
        <AlertDialog
          leastDestructiveRef={leastDestructiveRef}
          isOpen={newCommentDeletionErrorModalOpen}
          autoFocus={false}
          onClose={() => setNewCommentDeletionErrorModalOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Comment Error
              </AlertDialogHeader>

              <AlertDialogBody>
                You need to open comment dialog again to delete this comment due
                to technical issues.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={leastDestructiveRef}
                  onClick={() => setNewCommentDeletionErrorModalOpen(false)}
                >
                  Okay, open again.
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    </Flex>
  );
}
