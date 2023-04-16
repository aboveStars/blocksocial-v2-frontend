import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
import { defaultCurrentUserState, UserInformation } from "../types/User";

import useSortByUsername from "@/hooks/useSortByUsername";
import FollowInformationModal from "../Modals/User/FollowInformationModal";
import ProfilePhotoUpdateModal from "../Modals/User/ProfilePhotoUpdateModal";

import { auth } from "@/firebase/clientApp";
import { signOut } from "firebase/auth";

type Props = {
  userInformation: UserInformation;
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

  const { sortFollowersByUsername, sortFollowingsByUsername } =
    useSortByUsername();

  const [nftAdministrationPanelShow, setNftAdministrationPanelShow] =
    useState(false);

  const [signOutLoading, setSignOutLoading] = useState(false);

  const [profilephotoDeleteDialogOpen, setProfilePhotoDeleteDialogOpen] =
    useState(false);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);

  const { profilePhotoDelete, profilePhotoDeleteLoading } = useProfilePhoto();

  /**
   * userData is already being controlled then, comes here
   * Current user uid, but direcly comes here. So we check it
   * UID is secure?
   */

  useEffect(() => {
    // Beacuse when page changes (userPage) state variable are not reseted. (ostensible)
    // We manually reset
    // But there is no problem at "userInformation" (userInformation.username changes, I mean)
    setSelectedProfilePhoto("");

    handleUserInformation();

    if (currentUserState.uid)
      if (currentUserState.uid == userInformation.uid) {
        setIsCurrentUserPage((prev) => true);
      } else {
        setIsCurrentUserPage((prev) => false);
      }
    else {
      if (currentUserState.loading) return;
      setIsCurrentUserPage((prev) => false);
    }
  }, [userInformation, currentUserState.uid]);

  useEffect(() => {
    const poorStatus: boolean = !!!(
      ostensibleUserInformation.profilePhoto || selectedProfilePhoto
    );

    setPoorProfilePhoto(poorStatus);
  }, [ostensibleUserInformation.profilePhoto]);

  const handleUserInformation = () => {
    let readyUserInformation: UserInformation = userInformation;
    if (userInformation.followings.includes(currentUserState.username)) {
      const reviewedFollowings = sortFollowingsByUsername(
        userInformation.followings,
        currentUserState.username
      );
      readyUserInformation = {
        ...readyUserInformation,
        followings: reviewedFollowings,
      };
    }
    if (userInformation.followers.includes(currentUserState.username)) {
      const reviewedFollowers = sortFollowersByUsername(
        userInformation.followers,
        currentUserState.username
      );
      readyUserInformation = {
        ...readyUserInformation,
        followers: reviewedFollowers,
      };
    }

    setOstensibleUserInformation(readyUserInformation);
  };

  const handleFollow = () => {
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
    // Follow operation
    follow(userInformation.username, 1);
    // Page Update (locally)
    // We don't need followers of users but I did.
    setOstensibleUserInformation((prev) => ({
      ...prev,
      followers: [currentUserState.username, ...prev.followers],
      followerCount: prev.followerCount + 1,
    }));
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
      followings: prev.followings.concat(userInformation.username),
    }));
  };
  const handleDeFollow = () => {
    // Follow Operation
    follow(userInformation.username, -1);
    // Page Update (locally)
    setOstensibleUserInformation((prev) => ({
      ...prev,
      followers: prev.followers.filter((f) => f !== currentUserState.username),

      followerCount: prev.followerCount - 1,
    }));
    // Current User Update (locally)
    setCurrentUserState((prev) => ({
      ...prev,
      followingCount: prev.followingCount - 1,
      followings: prev.followings.filter((f) => f !== userInformation.username),
    }));
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
        ostensibleUserInformation={ostensibleUserInformation}
      />

      {/* <NFTAdministrationPanel
        nftAdministrationPanelOpenSetter={setNftAdministrationPanelShow}
        nftAdministrationPanelOpenValue={nftAdministrationPanelShow}
        currentUserUsername={currentUserState.username}
      /> */}

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
        <Flex
          position="relative"
          width="100%"
          direction="column"
          align="center"
        >
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
                  width="200px"
                  height="200px"
                  startColor="gray.100"
                  endColor="gray.800"
                />
              ) : (
                <Icon
                  as={CgProfile}
                  color="white"
                  height="200px"
                  width="200px"
                />
              )
            }
            width="200px"
            height="200px"
            rounded="full"
          />

          <Circle
            position="absolute"
            top="151px"
            left="11px"
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
          <Flex gap={1}>
            <Text as="b" fontSize="12pt" textColor="white">
              {ostensibleUserInformation.followingCount}
            </Text>
            <Text
              fontSize="12pt"
              textColor="gray.500"
              cursor="pointer"
              onClick={() =>
                setFollowingsFollowesrModalState((prev) => ({
                  ...prev,
                  isOpen: true,
                  modal: "followings",
                }))
              }
            >
              Following
            </Text>
          </Flex>
          <Flex gap={1}>
            <Text as="b" fontSize="12pt" textColor="white">
              {ostensibleUserInformation.followerCount}
            </Text>
            <Text
              fontSize="12pt"
              textColor="gray.500"
              cursor="pointer"
              onClick={() =>
                setFollowingsFollowesrModalState((prev) => ({
                  ...prev,
                  isOpen: true,
                  modal: "followers",
                }))
              }
            >
              Follower
            </Text>
          </Flex>
        </Flex>

        {isCurrentUserPage == false && (
          <Flex mt={2} mb={2}>
            {currentUserState.followings.includes(userInformation.username) ? (
              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                onClick={handleDeFollow}
              >
                Followed
              </Button>
            ) : (
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={handleFollow}
                isLoading={currentUserState.loading}
              >
                Follow
              </Button>
            )}
          </Flex>
        )}

        {isCurrentUserPage && (
          <Flex align="center">
            <Flex mt={3} direction="column" gap={2}>
              {/* <Button
                size="sm"
                variant="solid"
                bg="white"
                textColor="black"
                onClick={() => setNftAdministrationPanelShow(true)}
              >
                NFT Administration
              </Button> */}
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
