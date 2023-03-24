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
import usePost from "@/hooks/usePost";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import { CgProfile } from "react-icons/cg";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { PostData } from "../types/Post";
import useFollow from "@/hooks/useFollow";

type Props = {
  postData: PostData;
};

export default function PostItem({ postData }: Props) {
  const [postSenderProfilePhotoURL, setPostSenderProfilePhotoURL] =
    useState("");

  const [postSenderFullname, setPostSenderFullname] = useState("");

  const { like } = usePost();

  const currentUserUsername = useRecoilValue(currentUserStateAtom).username;

  // To show user its like, count and other things...

  const [ostensiblePostData, setOstensiblePostData] = useState(postData);

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
    if (!currentUserUsername) {
      console.log("Only Users can follow");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
        view: "logIn",
      }));
      return;
    }

    follow(postData.senderUsername, 1);
    setIsCurrentUserFollowThisPostSender(true);
  };

  const checkFollowingStatus = async () => {
    if (!currentUserUsername || !postData) {
      console.log("Problem: ");
      console.log("currentUsername: ", currentUserUsername);
      console.log("postData: ", postData);
      return;
    }
    const currentUserDocRef = doc(firestore, `users/${currentUserUsername}`);
    const currentUserDocSnapshot = await getDoc(currentUserDocRef);
    // I am sure, this snaphot not null but typescript......
    if (!currentUserDocSnapshot.exists()) {
      return;
    }
    const followingStatus = currentUserDocSnapshot
      .data()
      .followings.includes(postData.senderUsername);

    setIsCurrentUserFollowThisPostSender(followingStatus);
  };

  useEffect(() => {
    if (postData) {
      handleGetPostSenderData(postData.senderUsername);
      setOstensiblePostData(postData);
    }
  }, [postData]);

  useEffect(() => {
    if (!postData || !currentUserUsername) {
      return;
    }
    checkFollowingStatus();
  }, [postData, currentUserUsername]);

  return (
    <Flex bg="black" direction="column" width="550px">
      <Flex
        align="center"
        position="relative"
        gap={1}
        height="58px"
        bg="gray.900"
        borderRadius="10px 10px 0px 0px"
        p={1}
        width="100%"
        border="1px solid green"
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
          onClick={() => router.push(`/users/${postData.senderUsername}`)}
        />
        <Flex direction="column">
          <Flex align="center">
            <Text textColor="white" as="b" fontSize="12pt">
              {postData.senderUsername}
            </Text>
          </Flex>

          <Flex align="center" gap={1}>
            <Text textColor="gray.100" as="i" fontSize="10pt">
              {postSenderFullname}
            </Text>
            {!postSenderFullname && <SkeletonText noOfLines={1} width="50px" />}

            <Icon as={BsDot} color="white" fontSize="13px" />

            <Text as="i" fontSize="9pt" textColor="gray.500">
              {moment(new Date(postData.creationTime.seconds * 1000)).fromNow()}
            </Text>
          </Flex>
        </Flex>

        <Flex position="absolute" right="2">
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={handleFollowOnPost}
            hidden={isCurrentUserFollowThisPostSender}
          >
            Follow
          </Button>
        </Flex>
      </Flex>

      <Image
        src={postData.image}
        maxWidth="550px"
        border=""
        fallback={
          <Flex align="center" justify="center">
            <Skeleton height="550px" width="550px" />
            <Icon
              as={BsImage}
              position="absolute"
              fontSize="8xl"
              color="white"
            />
          </Flex>
        }
      />

      <Flex direction="column" bg="gray.900" borderRadius="0px 0px 10px 10px">
        <Flex align="center" ml={2.5}>
          <Text textColor="white">{postData.description}</Text>
        </Flex>
        <Flex align="center" justify="space-between" p={2}>
          <Flex gap="1">
            {ostensiblePostData.whoLiked.includes(currentUserUsername) ? (
              <Icon
                as={AiFillHeart}
                color="red"
                fontSize="25px"
                cursor="pointer"
                onClick={() => {
                  like(postData.id, postData.senderUsername, -1);
                  setOstensiblePostData((prev) => ({
                    ...prev,
                    likeCount: prev.likeCount - 1,
                    whoLiked: prev.whoLiked.filter(
                      (wL) => wL !== currentUserUsername
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
                  if (!currentUserUsername) {
                    console.log("Only Users can like");
                    setAuthModalState((prev) => ({
                      ...prev,
                      open: true,
                      view: "logIn",
                    }));
                    return;
                  }
                  like(postData.id, postData.senderUsername, 1);
                  setOstensiblePostData((prev) => ({
                    ...prev,
                    likeCount: prev.likeCount + 1,
                    whoLiked: prev.whoLiked.concat(currentUserUsername),
                  }));
                }}
              />
            )}

            <Text textColor="white">{ostensiblePostData.likeCount}</Text>
          </Flex>

          <Flex gap="1">
            <Icon as={AiOutlineComment} color="white" fontSize="25px" />
            <Text textColor="white">34</Text>
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
