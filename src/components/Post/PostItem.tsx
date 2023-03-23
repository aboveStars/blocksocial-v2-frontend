import {
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { BiSend } from "react-icons/bi";
import { BsDot, BsImage } from "react-icons/bs";

import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { PostData } from "../types/Post";

type Props = {
  postData: PostData;
};

export default function PostItem({ postData }: Props) {
  const [postSenderProfilePhotoURL, setPostSenderProfilePhotoURL] =
    useState("");

  const [postSenderFullname, setPostSenderFullname] = useState("");

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

  useEffect(() => {
    if (postData) {
      handleGetPostSenderData(postData.senderUsername);
    }
  }, [postData]);

  return (
    <Flex bg="black" direction="column" width="550px">
      <Flex
        align="center"
        gap={1}
        height="55px"
        bg="gray.900"
        borderRadius="10px 10px 0px 0px"
      >
        <Image
          src={postSenderProfilePhotoURL}
          width="50px"
          height="50px"
          rounded="full"
          fallback={
            <SkeletonCircle
              width="50px"
              height="50px"
              startColor="gray.100"
              endColor="gray.800"
            />
          }
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
      </Flex>

      <Image
        src={postData.image}
        maxWidth="550px"
        border=""
        fallback={
          <>
            <Skeleton height="400px" rounded="10" position="relative" />
            <Icon
              as={BsImage}
              fontSize="8xl"
              color="white"
              position="absolute"
              style={{
                marginTop: "215px",
                marginLeft: "153px",
              }}
            />
          </>
        }
      />

      <Flex
        direction="column"
        bg="gray.900"
        borderRadius="0px 0px 10px 10px"
        mt={1}
      >
        <Flex align="center" ml={2.5}>
          <Text textColor="white">{postData.description}</Text>
        </Flex>
        <Flex align="center" justify="space-between" p={2}>
          <Flex gap="1">
            <Icon as={AiOutlineHeart} color="red" fontSize="25px" />
            <Text textColor="white">53</Text>
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
