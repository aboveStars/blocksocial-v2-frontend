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
import { useEffect, useState } from "react";

import { AiFillHeart, AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { BiSend } from "react-icons/bi";
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
import { PostMainData } from "../types/Post";

type Props = {
  postMainData: PostMainData;
  commentPanelOpenStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  commentPanelOpenStateValue: boolean;
};

export default function PostMain({
  postMainData,
  commentPanelOpenStateSetter,
}: Props) {
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
      setOstensiblePostData(postMainData);
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

  return (
    <Flex bg="black" direction="column">
      <Flex
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

        <Flex position="absolute" right="2">
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={handleFollowOnPost}
            hidden={
              !currentUserState.username ||
              isCurrentUserFollowThisPostSender ||
              currentUserState.username == postMainData.senderUsername
            }
          >
            Follow
          </Button>
        </Flex>
      </Flex>

      {postMainData.image && (
        <Image
          src={postMainData.image}
          width="100%"
          fallback={
            <Flex align="center" justify="center">
              <Skeleton height="500px" width="100%" />
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

      <Flex direction="column" bg="gray.900" borderRadius="0px 0px 10px 10px">
        <Flex align="center" ml={2.5}>
          <Text fontSize="13pt" fontWeight="medium" textColor="white">
            {postMainData.description}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between" p={2}>
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

            <Text textColor="white">{ostensiblePostData.likeCount}</Text>
          </Flex>

          <Flex gap="1">
            <Icon
              as={AiOutlineComment}
              color="white"
              fontSize="25px"
              cursor="pointer"
              onClick={() => commentPanelOpenStateSetter(true)}
            />
            <Text textColor="white">{postMainData.commentCount}</Text>
          </Flex>

          <Flex gap="1">
            <Icon as={BiSend} color="white" fontSize="25px" />
            <Text textColor="white">14</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
