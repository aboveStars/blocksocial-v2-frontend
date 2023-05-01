import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AspectRatio,
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import {
  AiFillHeart,
  AiOutlineComment,
  AiOutlineHeart,
  AiOutlineMenu,
} from "react-icons/ai";
import { BsDot } from "react-icons/bs";

import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/useFollow";
import usePost from "@/hooks/usePost";
import usePostDelete from "@/hooks/usePostDelete";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import { CgProfile } from "react-icons/cg";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { postsAtViewAtom } from "../atoms/postsAtViewAtom";
import { OpenPanelName, PostFrontData } from "../types/Post";

type Props = {
  postFrontData: PostFrontData;
  openPanelNameSetter: React.Dispatch<React.SetStateAction<OpenPanelName>>;
};

export default function PostFront({
  postFrontData,
  openPanelNameSetter,
}: Props) {
  const [postSenderInformation, setPostSenderInformation] = useState({
    username: postFrontData.senderUsername,
    fullname: "",
    profilePhoto: "",
    followedByCurrentUser: true,
  });

  const { like } = usePost();

  const currentUserState = useRecoilValue(currentUserStateAtom);

  // To update post values locally

  const router = useRouter();

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const { follow } = useFollow();

  const { postDelete, postDeletionLoading } = usePostDelete();

  const imageSkeletonRef = useRef<HTMLDivElement>(null);

  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false);

  const [followOperationLoading, setFollowOperationLoading] = useState(false);

  const [postsAtView, setPostsAtView] = useRecoilState(postsAtViewAtom);

  const [taggedDescription, setTaggedDescription] = useState<
    {
      isTagged: boolean;
      word: string;
    }[]
  >([]);

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

    let currentUserFollowsThisPostSender = false;
    if (currentUserState.isThereCurrentUser)
      currentUserFollowsThisPostSender = (
        await getDoc(
          doc(
            firestore,
            `users/${currentUserState.username}/followings/${username}`
          )
        )
      ).exists();

    if (userDocSnapshot.exists()) {
      setPostSenderInformation((prev) => ({
        ...prev,
        fullname: userDocSnapshot.data().fullname,
        profilePhoto: userDocSnapshot.data().profilePhoto,
        followedByCurrentUser: currentUserFollowsThisPostSender,
      }));
    }
  };

  const handleFollowOnPost = async () => {
    if (!currentUserState.isThereCurrentUser) {
      console.log("Login First to Follow");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
      }));
      return;
    }

    setFollowOperationLoading(true);

    const updatedPostsAtView = postsAtView.map((a) => {
      if (
        a.senderUsername === postFrontData.senderUsername &&
        a.postDocId !== postFrontData.postDocId
      ) {
        const updatedPost = { ...a };
        updatedPost.currentUserFollowThisSender = true;
        return updatedPost;
      } else {
        return a;
      }
    });

    setPostsAtView(updatedPostsAtView);

    // Follow
    await follow(postFrontData.senderUsername, 1);

    setPostSenderInformation((prev) => ({
      ...prev,
      followedByCurrentUser: true,
    }));

    setFollowOperationLoading(false);
  };

  useEffect(() => {
    handleGetPostSenderData(postFrontData.senderUsername);
  }, []);

  // Skeleton Height Adjustment
  useEffect(() => {
    if (imageSkeletonRef.current)
      imageSkeletonRef.current.style.height = `${imageSkeletonRef.current?.clientWidth}px`;
  }, []);

  useEffect(() => {
    const descriptionContainsTagging = postFrontData.description.includes("@");
    if (!descriptionContainsTagging) return;

    handleTagging();
  }, []);

  const handleTagging = () => {
    const desArr = postFrontData.description.split(" ");

    let tempTaggedDescription: {
      isTagged: boolean;
      word: string;
    }[] = [];
    for (const word of desArr) {
      if (word.startsWith("@")) {
        tempTaggedDescription.push({
          isTagged: true,
          word: word,
        });
      } else {
        tempTaggedDescription.push({
          isTagged: false,
          word: word,
        });
      }
    }
    setTaggedDescription(tempTaggedDescription);
  };

  const handleLike = async (opCode: number) => {
    if (!currentUserState.username) {
      console.log("Only Users can like");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
        view: "logIn",
      }));
      return;
    }

    const updatedPostsAtView = postsAtView.map((a) => {
      if (a.postDocId === postFrontData.postDocId) {
        const updatedPost = { ...a };
        updatedPost.currentUserLikedThisPost = opCode === 1 ? true : false;
        updatedPost.likeCount = a.likeCount + opCode;
        return updatedPost;
      } else {
        return a;
      }
    });

    setPostsAtView(updatedPostsAtView);

    // likeCountValueSetter((prev) => prev + opCode);

    await like(
      `users/${postFrontData.senderUsername}/posts/${postFrontData.postDocId}`,
      opCode
    );
  };

  const handlePostDelete = async () => {
    await postDelete(postFrontData.postDocId);
    setShowDeletePostDialog(false);
  };

  return (
    <>
      <Flex bg="black" direction="column" p={1}>
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
            alt=""
            src={postSenderInformation.profilePhoto}
            width="50px"
            height="50px"
            rounded="full"
            fallback={
              postSenderInformation.profilePhoto ? (
                <SkeletonCircle
                  width="50px"
                  height="50px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              ) : (
                <Icon
                  as={CgProfile}
                  color="white"
                  height="50px"
                  width="50px"
                  cursor="pointer"
                  onClick={() =>
                    router.push(`/${postFrontData.senderUsername}`)
                  }
                />
              )
            }
            cursor="pointer"
            onClick={() => router.push(`/${postFrontData.senderUsername}`)}
          />
          <Flex direction="column">
            <Flex align="center">
              <Text
                textColor="white"
                as="b"
                fontSize="12pt"
                cursor="pointer"
                onClick={() => router.push(`/${postFrontData.senderUsername}`)}
              >
                {postFrontData.senderUsername}
              </Text>
            </Flex>

            <Flex align="center" gap={1}>
              <Text
                textColor="gray.100"
                as="i"
                fontSize="10pt"
                cursor="pointer"
                onClick={() => router.push(`/${postFrontData.senderUsername}`)}
              >
                {postSenderInformation.fullname}
              </Text>
              {!postSenderInformation.fullname && (
                <SkeletonText noOfLines={1} width="50px" />
              )}

              <Icon as={BsDot} color="white" fontSize="13px" />

              <Text as="i" fontSize="9pt" textColor="gray.500">
                {moment(new Date(postFrontData.creationTime)).fromNow()}
              </Text>
            </Flex>
          </Flex>

          <Flex position="absolute" right="3" id="follow-nft-delete">
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={handleFollowOnPost}
              hidden={
                !currentUserState.username ||
                postSenderInformation.followedByCurrentUser ||
                postFrontData.currentUserFollowThisSender ||
                currentUserState.username == postFrontData.senderUsername ||
                router.asPath.includes(`${postSenderInformation.username}`)
              }
              isLoading={followOperationLoading}
            >
              Follow
            </Button>

            <Flex
              hidden={
                currentUserState.username !== postFrontData.senderUsername
              }
              width="100%"
            >
              <Menu computePositionOnMount>
                <MenuButton>
                  <Icon as={AiOutlineMenu} color="white" />
                </MenuButton>
                <MenuList>
                  {postFrontData.nftStatus.minted ? (
                    <MenuItem onClick={() => openPanelNameSetter("nft")}>
                      Manage NFT
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => openPanelNameSetter("nft")}>
                      Make NFT
                    </MenuItem>
                  )}

                  <MenuItem onClick={() => setShowDeletePostDialog(true)}>
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>

            <AlertDialog
              isOpen={showDeletePostDialog}
              leastDestructiveRef={leastDestructiveRef}
              onClose={() => setShowDeletePostDialog(false)}
              returnFocusOnClose={false}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Post
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You can&apos;t undo this action afterwards.
                  </AlertDialogBody>

                  <AlertDialogFooter gap={2}>
                    <Button
                      ref={leastDestructiveRef}
                      onClick={() => setShowDeletePostDialog(false)}
                      variant="solid"
                      size="md"
                      colorScheme="blue"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      size="md"
                      onClick={handlePostDelete}
                      isLoading={postDeletionLoading}
                      hidden={
                        currentUserState.username !==
                        postFrontData.senderUsername
                      }
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Flex>
        </Flex>

        {postFrontData.image && (
          <AspectRatio ratio={1} width="100%">
            <Image alt="" src={postFrontData.image} fallback={<Skeleton />} />
          </AspectRatio>
        )}

        <Flex
          id="post-footer"
          direction="column"
          bg="gray.900"
          borderRadius="0px 0px 10px 10px"
          height="auto"
        >
          <Text
            p={2}
            fontSize="13pt"
            fontWeight="medium"
            wordBreak="break-word"
          >
            {taggedDescription.length > 0 ? (
              taggedDescription.map((w, i) => {
                if (w.isTagged) {
                  return (
                    <span
                      key={i}
                      style={{ color: "#00A2FF", cursor: "pointer" }}
                      onClick={() => {
                        router.push(w.word.slice(1, w.word.length + 1));
                      }}
                    >
                      {w.word}{" "}
                    </span>
                  );
                } else {
                  return (
                    <span key={i} style={{ color: "white" }}>
                      {w.word}{" "}
                    </span>
                  );
                }
              })
            ) : (
              <span style={{ color: "white" }}>
                {postFrontData.description}
              </span>
            )}
          </Text>
          <Flex>
            <Flex gap={3} p={2}>
              <Flex gap="1">
                {postFrontData.currentUserLikedThisPost ? (
                  <Icon
                    as={AiFillHeart}
                    color="red"
                    fontSize="25px"
                    cursor="pointer"
                    onClick={() => handleLike(-1)}
                  />
                ) : (
                  <Icon
                    as={AiOutlineHeart}
                    color="white"
                    fontSize="25px"
                    cursor="pointer"
                    onClick={() => handleLike(1)}
                  />
                )}

                <Text
                  textColor="white"
                  cursor="pointer"
                  onClick={() => {
                    openPanelNameSetter("likes");
                  }}
                >
                  {`${postFrontData.likeCount}`}
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
                <Text textColor="white">{postFrontData.commentCount}</Text>
              </Flex>
            </Flex>

            <Flex width="100%" position="relative">
              <Button
                hidden={!!!postFrontData.nftStatus.minted}
                position="absolute"
                right="2.5"
                bottom="3"
                colorScheme="pink"
                size="sm"
                borderRadius="full"
                px={4}
                py={2}
                fontWeight="bold"
                _hover={{ bg: "pink.500" }}
                _active={{ bg: "pink.600" }}
                onClick={() => {
                  openPanelNameSetter("nft");
                }}
              >
                NFT
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
