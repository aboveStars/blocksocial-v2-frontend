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
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import {
  AiFillHeart,
  AiOutlineComment,
  AiOutlineHeart,
  AiOutlineMenu,
} from "react-icons/ai";
import { BsDot, BsImage } from "react-icons/bs";

import { firestore } from "@/firebase/clientApp";
import useFollow from "@/hooks/useFollow";
import useNFT from "@/hooks/useNFT";
import usePost from "@/hooks/usePost";
import usePostDelete from "@/hooks/usePostDelete";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/router";
import { CgProfile } from "react-icons/cg";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { currentUserStateAtom } from "../atoms/currentUserAtom";
import { OpenPanelName, PostFrontData } from "../types/Post";

type Props = {
  postFrontData: PostFrontData;
  openPanelNameSetter: React.Dispatch<React.SetStateAction<OpenPanelName>>;
  commentCountSetter: React.Dispatch<React.SetStateAction<number>>;
};

export default function PostFront({
  postFrontData,
  openPanelNameSetter,
}: Props) {
  const [postSenderProfilePhotoURL, setPostSenderProfilePhotoURL] =
    useState("");

  const [postSenderFullname, setPostSenderFullname] = useState("");

  const { like } = usePost();

  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  // To update post values locally
  const [ostensiblePostData, setOstensiblePostData] = useState(postFrontData);

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

  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);

  const { refreshNFT, nftRefreshLoading } = useNFT();

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
    follow(postFrontData.senderUsername, 1);
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(postFrontData.senderUsername),
    }));
  };

  useEffect(() => {
    if (postFrontData) {
      handleGetPostSenderData(postFrontData.senderUsername);
    }
  }, [postFrontData]);

  /**
   * I gave UID just because, I can not trust 'currentUserState'
   * There is no UID usage in here so.
   */
  useEffect(() => {
    if (!postFrontData || !currentUserState.uid) {
      return;
    }
    const followingStatus: boolean = currentUserState.followings.includes(
      postFrontData.senderUsername
    );
    setIsCurrentUserFollowThisPostSender(followingStatus);
  }, [postFrontData, currentUserState]);

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
          alt=""
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
          onClick={() => router.push(`/users/${postFrontData.senderUsername}`)}
        />
        <Flex direction="column">
          <Flex align="center">
            <Text textColor="white" as="b" fontSize="12pt">
              {postFrontData.senderUsername}
            </Text>
          </Flex>

          <Flex align="center" gap={1}>
            <Text textColor="gray.100" as="i" fontSize="10pt">
              {postSenderFullname}
            </Text>
            {!postSenderFullname && <SkeletonText noOfLines={1} width="50px" />}

            <Icon as={BsDot} color="white" fontSize="13px" />

            <Text as="i" fontSize="9pt" textColor="gray.500">
              {moment(new Date(postFrontData.creationTime)).fromNow()}
            </Text>
          </Flex>
        </Flex>

        <Flex position="absolute" right="3" id="followButtonOnPost">
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={handleFollowOnPost}
            hidden={
              !currentUserState.username ||
              isCurrentUserFollowThisPostSender ||
              currentUserState.username == postFrontData.senderUsername ||
              router.asPath.includes("users")
            }
          >
            Follow
          </Button>

          <Flex
            hidden={currentUserState.username !== postFrontData.senderUsername}
            width="100%"
          >
            <Menu computePositionOnMount>
              <MenuButton>
                <Icon as={AiOutlineMenu} color="white" />
              </MenuButton>
              <MenuList>
                {postFrontData.nftUrl ? (
                  !nftRefreshLoading ? (
                    <MenuItem
                      onClick={() =>
                        refreshNFT(
                          postFrontData.senderUsername,
                          postFrontData.postDocId
                        )
                      }
                    >
                      Refresh NFT
                    </MenuItem>
                  ) : (
                    <MenuItem isDisabled={true}>
                      <Spinner />
                    </MenuItem>
                  )
                ) : (
                  <MenuItem onClick={() => openPanelNameSetter("nft")}>
                    Make NFT
                  </MenuItem>
                )}

                <MenuItem onClick={() => setShowDeleteUserDialog(true)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          <AlertDialog
            isOpen={showDeleteUserDialog}
            leastDestructiveRef={leastDestructiveRef}
            onClose={() => setShowDeleteUserDialog(false)}
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
                    onClick={() => setShowDeleteUserDialog(false)}
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
                    onClick={async () => {
                      await postDelete(
                        `users/${postFrontData.senderUsername}/posts/${postFrontData.postDocId}`
                      );
                      setIsThisPostDeleted(true);
                      setShowDeleteUserDialog(false);
                    }}
                    isLoading={postDeletionLoading}
                    hidden={
                      currentUserState.username !== postFrontData.senderUsername
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
        <Flex ml={2} mt={2}>
          <Text fontSize="13pt" fontWeight="medium" textColor="white">
            {postFrontData.description}
          </Text>
        </Flex>
        <Flex>
          <Flex gap={3} p={2}>
            <Flex gap="1" >
              {ostensiblePostData.whoLiked.includes(
                currentUserState.username
              ) ? (
                <Icon
                  as={AiFillHeart}
                  color="red"
                  fontSize="25px"
                  cursor="pointer"
                  onClick={() => {
                    like(
                      `users/${postFrontData.senderUsername}/posts/${postFrontData.postDocId}`,
                      -1
                    );
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
                    like(
                      `users/${postFrontData.senderUsername}/posts/${postFrontData.postDocId}`,
                      1
                    );
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
                {`${ostensiblePostData.likeCount}`} 
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

          <Flex
            justify="flex-end"
            align="center"
            width="100%"
            mb={2}
            mr="2"
            cursor="pointer"
            onClick={() => {
              window.open(postFrontData.nftUrl);
            }}
            hidden={!!!postFrontData.nftUrl}
          >
            <Image
              alt=""
              src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
              width="30px"
              height="30px"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}