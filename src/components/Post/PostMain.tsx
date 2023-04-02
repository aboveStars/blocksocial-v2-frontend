import {
  Button,
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import { AiFillHeart, AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { BsDot, BsImage } from "react-icons/bs";

import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/useFollow";
import usePost from "@/hooks/usePost";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import { CgProfile } from "react-icons/cg";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { OpenPanelName, PostMainData } from "../types/Post";
import usePostDelete from "@/hooks/usePostDelete";

type Props = {
  postMainData: PostMainData;
  openPanelNameSetter: React.Dispatch<React.SetStateAction<OpenPanelName>>;
  commentCountSetter: React.Dispatch<React.SetStateAction<number>>;
};

export default function PostMain({ postMainData, openPanelNameSetter }: Props) {
  const [postSenderProfilePhotoURL, setPostSenderProfilePhotoURL] =
    useState("");

  const [postSenderFullname, setPostSenderFullname] = useState("");

  const { like } = usePost();

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  // To update post values locally
  const [ostensiblePostData, setOstensiblePostData] = useState(postMainData);

  const router = useRouter();

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { follow } = useFollow();

  const [
    isCurrentUserFollowThisPostSender,
    setIsCurrentUserFollowThisPostSender,
  ] = useState(true);

  const { postDelete, postDeletionLoading } = usePostDelete();
  const [isThisPostDeleted, setIsThisPostDeleted] = useState(false);

  const imageSkeletonRef = useRef<HTMLDivElement>(null);

  /**
   * Simply gets postSender's pp and fullname.
   * Normally, I used hooks for seperately to get pp and fullname.
   * I thought it was inefficient :) .
   * @param username
   * @returns
   */
  const handleGetPostSenderData = async (username: string) => {
    const userDocRef = doc(firestore, `users/${username}`);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      setPostSenderFullname(userDocSnapshot.data().fullname);
      setPostSenderProfilePhotoURL(userDocSnapshot.data().profilePhoto);
    }
  };

  const handleFollowOnPost = () => {
    // Follow
    follow(postMainData.senderUsername, 1);
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(postMainData.senderUsername),
    }));
  };

  useEffect(() => {
    if (postMainData) {
      handleGetPostSenderData(postMainData.senderUsername);
    }
  }, [postMainData]);

  /**
   * I gave UID just because, I can not trust 'currentUserState'
   * There is no UID usage in here so.
   */
  useEffect(() => {
    if (!postMainData || !currentUserState.uid) {
      return;
    }
    const followingStatus: boolean = currentUserState.followings.includes(
      postMainData.senderUsername
    );
    setIsCurrentUserFollowThisPostSender(followingStatus);
  }, [postMainData, currentUserState]);

  // Skeleton Height Adjustment
  useEffect(() => {
    if (imageSkeletonRef.current)
      imageSkeletonRef.current.style.height = `${imageSkeletonRef.current?.clientWidth}px`;
  }, []);

  return (
    <Flex bg="black" direction="column" p={1} hidden={isThisPostDeleted}>
      <Flex
        id="postHeader"
        align="center"
        position="relative"
        gap={1}
        height="58px"
        p={1}
        bg="gray.900"
        borderRadius="10px 10px 0px 0px"
      >
        <Image
          src={postSenderProfilePhotoURL}
          width="50px"
          height="50px"
          rounded="full"
          fallback={
            postSenderProfilePhotoURL ? (
              <SkeletonCircle
                width="50px"
                height="50px"
                startColor="gray.100"
                endColor="gray.800"
              />
            ) : (
              <Icon as={CgProfile} color="white" height="50px" width="50px" />
            )
          }
          cursor="pointer"
          onClick={() => router.push(`/users/${postMainData.senderUsername}`)}
        />
        <Flex direction="column">
          <Flex align="center">
            <Text textColor="white" as="b" fontSize="12pt">
              {postMainData.senderUsername}
            </Text>
          </Flex>

          <Flex align="center" gap={1}>
            <Text textColor="gray.100" as="i" fontSize="10pt">
              {postSenderFullname}
            </Text>
            {!postSenderFullname && <SkeletonText noOfLines={1} width="50px" />}

            <Icon as={BsDot} color="white" fontSize="13px" />

            <Text as="i" fontSize="9pt" textColor="gray.500">
              {moment(
                new Date(postMainData.creationTime.seconds * 1000)
              ).fromNow()}
            </Text>
          </Flex>
        </Flex>

        <Flex position="absolute" right="2" id="followButtonOnPost">
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={handleFollowOnPost}
            hidden={
              !currentUserState.username ||
              isCurrentUserFollowThisPostSender ||
              currentUserState.username == postMainData.senderUsername ||
              router.asPath.includes("users")
            }
          >
            Follow
          </Button>
          <Button
            variant="outline"
            colorScheme="red"
            size="sm"
            onClick={async () => {
              await postDelete(postMainData.id);
              setIsThisPostDeleted(true);
            }}
            isLoading={postDeletionLoading}
            hidden={currentUserState.username !== postMainData.senderUsername}
          >
            Delete
          </Button>
        </Flex>
      </Flex>

      {postMainData.image && (
        <Image
          src={postMainData.image}
          width="100%"
          fallback={
            <Flex align="center" justify="center">
              <Skeleton ref={imageSkeletonRef} height="500px" width="100%" />
              <Icon
                as={BsImage}
                position="absolute"
                fontSize="8xl"
                color="white"
              />
            </Flex>
          }
        />
      )}

      <Flex
        id="post-footer"
        direction="column"
        bg="gray.900"
        borderRadius="0px 0px 10px 10px"
      >
        <Flex align="center" ml={2} mt={2}>
          <Text fontSize="13pt" fontWeight="medium" textColor="white">
            {postMainData.description}
          </Text>
        </Flex>
        <Flex align="center" gap={3} p={2}>
          <Flex gap="1">
            {ostensiblePostData.whoLiked.includes(currentUserState.username) ? (
              <Icon
                as={AiFillHeart}
                color="red"
                fontSize="25px"
                cursor="pointer"
                onClick={() => {
                  like(postMainData.id, postMainData.senderUsername, -1);
                  setOstensiblePostData((prev) => ({
                    ...prev,
                    likeCount: prev.likeCount - 1,
                    whoLiked: prev.whoLiked.filter(
                      (wL) => wL !== currentUserState.username
                    ),
                  }));
                }}
              />
            ) : (
              <Icon
                as={AiOutlineHeart}
                color="white"
                fontSize="25px"
                cursor="pointer"
                onClick={() => {
                  if (!currentUserState.username) {
                    console.log("Only Users can like");
                    setAuthModalState((prev) => ({
                      ...prev,
                      open: true,
                      view: "logIn",
                    }));
                    return;
                  }
                  like(postMainData.id, postMainData.senderUsername, 1);
                  setOstensiblePostData((prev) => ({
                    ...prev,
                    likeCount: prev.likeCount + 1,
                    whoLiked: prev.whoLiked.concat(currentUserState.username),
                  }));
                }}
              />
            )}

            <Text
              textColor="white"
              cursor="pointer"
              onClick={() => {
                openPanelNameSetter("likes");
              }}
            >
              {ostensiblePostData.likeCount}
            </Text>
          </Flex>

          <Flex
            gap="1"
            cursor="pointer"
            onClick={() => {
              openPanelNameSetter("comments");
            }}
          >
            <Icon as={AiOutlineComment} color="white" fontSize="25px" />
            <Text textColor="white">{postMainData.commentCount}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
