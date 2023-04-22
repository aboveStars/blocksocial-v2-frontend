import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AspectRatio,
  Button,
  Circle,
  Flex,
  Icon,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { currentUserStateAtom } from "../atoms/currentUserAtom";

import useProfilePhoto from "@/hooks/useProfilePhoto";

import { BiPencil } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

import useFollow from "@/hooks/useFollow";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { defaultCurrentUserState, UserInServer } from "../types/User";

import FollowInformationModal from "../Modals/User/FollowInformationModal";
import ProfilePhotoUpdateModal from "../Modals/User/ProfilePhotoUpdateModal";

import { auth, firestore } from "@/firebase/clientApp";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Props = {
  userInformation: UserInServer;
};

/**
 * I exported because, I will use in the "Follow Item".
 * When I click a user in modal, I wanted to close "modal"
 * So I exported state
 */
export type FollowingsFollowersModalType = {
  isOpen: boolean;
  modal: "followings" | "followers";
};

export default function Header({ userInformation }: Props) {
  const [currentUserState, setCurrentUserState] =
    useRecoilState(currentUserStateAtom);

  const [isCurrentUserPage, setIsCurrentUserPage] = useState(false);

  const [modifying, setModifying] = useState(false);

  /**
   * setSelectedFile for cancelling pp changing (clearing state)
   */
  const {
    selectedProfilePhoto,
    profilePhotoUpload,
    profilePhotoUploadLoading,
    willBeCroppedProfilePhoto,
    onSelectWillBeCroppedProfilePhoto,
    setSelectedProfilePhoto,
    setWillBeCroppedProfilePhoto,
    profilePhotoError,
  } = useProfilePhoto();

  const [poorProfilePhoto, setPoorProfilePhoto] = useState(false);

  const [ostensibleUserInformation, setOstensibleUserInformation] =
    useState(userInformation);

  const { follow } = useFollow();

  const setAuthModalState = useSetRecoilState(authModalStateAtom);

  const [followingsFollowersModalState, setFollowingsFollowesrModalState] =
    useState<FollowingsFollowersModalType>({
      isOpen: false,
      modal: "followings",
    });

  const [profilePhotoUpdateModalOpen, setProiflePhotoUpdateModalOpen] =
    useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [nftAdministrationPanelShow, setNftAdministrationPanelShow] =
    useState(false);

  const [signOutLoading, setSignOutLoading] = useState(false);

  const [profilephotoDeleteDialogOpen, setProfilePhotoDeleteDialogOpen] =
    useState(false);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);

  const { profilePhotoDelete, profilePhotoDeleteLoading } = useProfilePhoto();

  const [currentUserFollowThisMan, setCurrentUserFollowThisMan] =
    useState(false);

  const [gettingFollowStatus, setGettingFollowStatus] = useState(true);
  const [followOperationLoading, setFollowOperationLoading] = useState(false);

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   * UID is secure?
   */

  useEffect(() => {
    setSelectedProfilePhoto("");

    setOstensibleUserInformation(userInformation);

    if (currentUserState.isThereCurrentUser) {
      handleFollowStatus();
      if (currentUserState.uid == userInformation.uid) {
        setIsCurrentUserPage((prev) => true);
      } else {
        setIsCurrentUserPage((prev) => false);
      }
    } else {
      if (currentUserState.loading) return;
      setGettingFollowStatus(false);
      setIsCurrentUserPage((prev) => false);
    }
  }, [userInformation, currentUserState]);

  useEffect(() => {
    const poorStatus: boolean = !(
      ostensibleUserInformation.profilePhoto || selectedProfilePhoto
    );

    setPoorProfilePhoto(poorStatus);
  }, [ostensibleUserInformation.profilePhoto]);

  /**
   * Checks if we follow this user.
   */
  const handleFollowStatus = async () => {
    setGettingFollowStatus(true);
    let readyUserInformation: UserInServer = userInformation;
    setOstensibleUserInformation(readyUserInformation);

    const doesCurrentUserFollowThisMan = (
      await getDoc(
        doc(
          firestore,
          `users/${currentUserState.username}/followings/${userInformation.username}`
        )
      )
    ).exists();

    setCurrentUserFollowThisMan(doesCurrentUserFollowThisMan);
    setGettingFollowStatus(false);
  };

  const handleFollow = async () => {
    // User check
    if (!currentUserState.isThereCurrentUser) {
      console.log("Only Users can follow");
      setAuthModalState((prev) => ({
        ...prev,
        open: true,
        view: "logIn",
      }));
      return;
    }
    setFollowOperationLoading(true);
    // Follow operation
    await follow(userInformation.username, 1);

    // Current User Update (locally)
    setOstensibleUserInformation((prev) => ({
      ...prev,
      followerCount: prev.followerCount + 1,
    }));
    setCurrentUserFollowThisMan(true);

    setFollowOperationLoading(false);
  };
  const handleDeFollow = async () => {
    setFollowOperationLoading(true);
    // Follow Operation
    await follow(userInformation.username, -1);
    // Page Update (locally)
    setOstensibleUserInformation((prev) => ({
      ...prev,

      followerCount: prev.followerCount - 1,
    }));
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount - 1,
    }));
    setCurrentUserFollowThisMan(false);
    setFollowOperationLoading(false);
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);

    // Firebase sign-out
    await signOut(auth);

    // Clear States
    setCurrentUserState({
      ...defaultCurrentUserState,
      loading: false,
    });
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: "logIn",
    }));
    setCurrentUserFollowThisMan(false);

    setSignOutLoading(false);
  };

  useEffect(() => {
    if (!willBeCroppedProfilePhoto) return;
    setProiflePhotoUpdateModalOpen(true);
  }, [willBeCroppedProfilePhoto]);

  return (
    <>
      <ProfilePhotoUpdateModal
        modifyingSetter={setModifying}
        ostensibleUserInformationValue={ostensibleUserInformation}
        ostensibleUserInformationSetter={setOstensibleUserInformation}
        profilePhotoUpdateModalOpenSetter={setProiflePhotoUpdateModalOpen}
        profilePhotoUpdateModalOpenValue={profilePhotoUpdateModalOpen}
        inputRef={inputRef}
        willBeCroppedProfilePhoto={willBeCroppedProfilePhoto}
        selectedProfilePhotoSetter={setSelectedProfilePhoto}
        willBeCroppedProfilePhotoSetter={setWillBeCroppedProfilePhoto}
      />

      <Input
        id="profile-photo-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onSelectWillBeCroppedProfilePhoto}
      />

      <FollowInformationModal
        followInformationModalStateSetter={setFollowingsFollowesrModalState}
        followInformationModalStateValue={followingsFollowersModalState}
        userName={userInformation.username}
      />

      <AlertDialog
        id="profilePhotoDelete-dialog"
        isOpen={profilephotoDeleteDialogOpen}
        leastDestructiveRef={leastDestructiveRef}
        onClose={() => setProfilePhotoDeleteDialogOpen(false)}
        returnFocusOnClose={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Profile Photo
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter gap={2}>
              <Button
                ref={leastDestructiveRef}
                onClick={() => setProfilePhotoDeleteDialogOpen(false)}
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
                  await profilePhotoDelete();
                  setOstensibleUserInformation((prev) => ({
                    ...prev,
                    profilePhoto: "",
                  }));
                  setProfilePhotoDeleteDialogOpen(false);
                }}
                isLoading={profilePhotoDeleteLoading}
              >
                Delete Profile Photo
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Flex direction="column" justify="center" align="center" mt={3}>
        <Flex direction="column" align="center">
          <Flex position="relative" width="200px" height="200px">
            <Image
              alt=""
              src={
                selectedProfilePhoto
                  ? selectedProfilePhoto
                  : ostensibleUserInformation.profilePhoto
                  ? ostensibleUserInformation.profilePhoto
                  : ""
              }
              fallback={
                !poorProfilePhoto ? (
                  <SkeletonCircle
                    startColor="gray.100"
                    endColor="gray.800"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <Icon
                    as={CgProfile}
                    color="white"
                    width="100%"
                    height="100%"
                  />
                )
              }
              width="100%"
              height="100%"
              rounded="full"
            />
            <Circle
              position="absolute"
              bottom={poorProfilePhoto ? "18px" : "12px"}
              left={poorProfilePhoto ? "18px" : "12px"}
              bg="gray.700"
              minWidth="30px"
              minHeight="30px"
              hidden={!isCurrentUserPage || !!selectedProfilePhoto}
            >
              <Menu computePositionOnMount>
                <MenuButton mt={1}>
                  <Icon
                    as={BiPencil}
                    color="white"
                    fontSize="15px"
                    cursor="pointer"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      if (inputRef.current) inputRef.current.click();
                    }}
                  >
                    {ostensibleUserInformation.profilePhoto
                      ? "New Profile Photo"
                      : "Set Profile Photo"}
                  </MenuItem>

                  <MenuItem
                    onClick={() => setProfilePhotoDeleteDialogOpen(true)}
                    hidden={
                      !!willBeCroppedProfilePhoto ||
                      !ostensibleUserInformation.profilePhoto
                    }
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Circle>
          </Flex>

          <Stack direction="row" gap={1} mt={3} hidden={!modifying}>
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={async () => {
                await profilePhotoUpload();
                setOstensibleUserInformation((prev) => ({
                  ...prev,
                  profilePhoto: selectedProfilePhoto,
                }));
                setModifying(false);
                setSelectedProfilePhoto("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              isLoading={profilePhotoUploadLoading}
            >
              Save
            </Button>
            <Button
              variant="outline"
              colorScheme="blue"
              size="sm"
              onClick={() => {
                setSelectedProfilePhoto("");
                setModifying(false);
                if (inputRef.current) inputRef.current.value = "";
              }}
              isDisabled={profilePhotoUploadLoading}
            >
              Cancel
            </Button>
          </Stack>
          <Text fontSize="10pt" color="red" hidden={!!!profilePhotoError}>
            {profilePhotoError}
          </Text>
        </Flex>

        <Flex direction="column" align="center" mt={1}>
          <Text as="b" fontSize="14pt" textColor="white">
            {userInformation.username}
          </Text>
          <Text as="i" fontSize="12pt" textColor="gray.500">
            {userInformation.fullname}
          </Text>
        </Flex>

        <Flex align="center" gap={3} mt={2}>
          <Flex
            gap={1}
            cursor="pointer"
            onClick={() =>
              setFollowingsFollowesrModalState((prev) => ({
                ...prev,
                isOpen: true,
                modal: "followings",
              }))
            }
          >
            <Text as="b" fontSize="12pt" textColor="white">
              {ostensibleUserInformation.followingCount}
            </Text>
            <Text fontSize="12pt" textColor="gray.500">
              Following
            </Text>
          </Flex>
          <Flex
            gap={1}
            cursor="pointer"
            onClick={() =>
              setFollowingsFollowesrModalState((prev) => ({
                ...prev,
                isOpen: true,
                modal: "followers",
              }))
            }
          >
            <Text as="b" fontSize="12pt" textColor="white">
              {ostensibleUserInformation.followerCount}
            </Text>
            <Text fontSize="12pt" textColor="gray.500">
              Follower
            </Text>
          </Flex>
          <Flex gap={1}>
            <Text as="b" fontSize="12pt" textColor="white">
              {ostensibleUserInformation.nftCount}
            </Text>
            <Text fontSize="12pt" textColor="gray.500">
              NFTs
            </Text>
          </Flex>
        </Flex>

        {isCurrentUserPage == false && (
          <Flex mt={2} mb={2}>
            {currentUserFollowThisMan ? (
              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                onClick={handleDeFollow}
                isLoading={followOperationLoading}
              >
                Followed
              </Button>
            ) : (
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={handleFollow}
                isLoading={
                  currentUserState.loading ||
                  gettingFollowStatus ||
                  followOperationLoading
                }
              >
                Follow
              </Button>
            )}
          </Flex>
        )}

        {isCurrentUserPage && (
          <Flex align="center">
            <Flex mt={3} direction="column" gap={2}>
              <Button
                size="sm"
                variant="solid"
                bg="white"
                textColor="black"
                onClick={() => setNftAdministrationPanelShow(true)}
              >
                NFT Administration
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                onClick={handleSignOut}
                isLoading={signOutLoading}
              >
                Sign Out
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </>
  );
}
