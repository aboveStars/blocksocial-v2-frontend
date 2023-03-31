import {
  Button,
  Circle,
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { currentUserStateAtom } from "../atoms/currentUserAtom";

import useProfilePhoto from "@/hooks/useProfilePhoto";

import { BiPencil } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

import useFollow from "@/hooks/useFollow";
import Cropper from "react-easy-crop";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { UserInformation } from "../types/User";
import getCroppedImg from "../utils/GetCroppedImage";
import FollowItem from "./FollowItem";

import useAuthOperations from "@/hooks/useSignUpOperations";

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

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * setSelectedFile for cancelling pp changing (clearing state)
   */
  const {
    selectedProfilePhoto,
    setSelectedProfilePhoto,
    profilePhotoUpload,
    profilePhotoUploadError,
    profilePhotoUploadLoading,
    profilePhotoDelete,
    profilePhotoDeleteLoading,
    willBeCroppedProfilePhoto,
    setWillBeCroppedProfilePhoto,
    onSelectWillBeCroppedProfilePhoto,
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

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const { onSignOut, signOutLoading } = useAuthOperations();

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
      const editedFollowingsForIndexChanging = userInformation.followings;

      // get current user index
      const currentUserIndexAtArray = editedFollowingsForIndexChanging.indexOf(
        currentUserState.username
      );

      // remove current user and return it
      const currentUserAtArray = editedFollowingsForIndexChanging.splice(
        currentUserIndexAtArray,
        1
      )[0];

      // new index we want our user to put
      const currentUserRightIndex = 0;
      // put our user again to array at first place
      editedFollowingsForIndexChanging.splice(
        currentUserRightIndex,
        0,
        currentUserAtArray
      );

      readyUserInformation = {
        ...readyUserInformation,
        followings: editedFollowingsForIndexChanging,
      };
    }
    if (userInformation.followers.includes(currentUserState.username)) {
      const editedFollowersForIndexChanging = userInformation.followers;
      // get current user index
      const currentUserIndexAtArray = editedFollowersForIndexChanging.indexOf(
        currentUserState.username
      );
      // remove current user and return it
      const currentUserAtArray = editedFollowersForIndexChanging.splice(
        currentUserIndexAtArray,
        1
      )[0];
      // new index we want our user to put
      const currentUserRightIndex = 0;
      // put our user again to array at first place
      editedFollowersForIndexChanging.splice(
        currentUserRightIndex,
        0,
        currentUserAtArray
      );

      readyUserInformation = {
        ...readyUserInformation,
        followers: editedFollowersForIndexChanging,
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

  return (
    <>
      <Modal
        id="followings-followers-modal"
        size={{
          base: "full",
          sm: "full",
          md: "md",
          lg: "md",
        }}
        isOpen={followingsFollowersModalState.isOpen}
        onClose={() =>
          setFollowingsFollowesrModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      >
        <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
        <ModalContent bg="black">
          <ModalHeader>
            <Text color="white">
              "{userInformation.username}" {followingsFollowersModalState.modal}
            </Text>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Stack gap={2}>
              {ostensibleUserInformation[
                followingsFollowersModalState.modal
              ].map((f) => (
                <FollowItem
                  key={f}
                  username={f}
                  followingsFollowersModalStateSetter={
                    setFollowingsFollowesrModalState
                  }
                />
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        id="profile-photo-update-panel"
        isOpen={profilePhotoUpdateModalOpen}
        onClose={() => {
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCroppedAreaPixels(null);
          setWillBeCroppedProfilePhoto("");
          setProiflePhotoUpdateModalOpen(false);
        }}
      >
        <Input
          id="profile-photo-input"
          ref={inputRef}
          type="file"
          hidden
          onChange={onSelectWillBeCroppedProfilePhoto}
        />
        <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
        <ModalContent bg="gray.900">
          <ModalHeader>
            <Text color="white">Update Profile Photo</Text>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Flex id="intial-add-delete-buttons" gap={2} align="center" mb={5}>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={async () => {
                  await profilePhotoDelete();
                  setOstensibleUserInformation((prev) => ({
                    ...prev,
                    profilePhoto: "",
                  }));
                }}
                hidden={
                  !!willBeCroppedProfilePhoto ||
                  !!!ostensibleUserInformation.profilePhoto
                }
                isLoading={profilePhotoDeleteLoading}
              >
                Delete Profile Photo
              </Button>

              <Button
                variant="solid"
                colorScheme="blue"
                onClick={() => {
                  inputRef.current?.click();
                }}
                hidden={!!willBeCroppedProfilePhoto}
              >
                Add Profile Photo
              </Button>
            </Flex>
            {willBeCroppedProfilePhoto && (
              <Flex id="crop-area" direction="column" gap={3} mt="5">
                <Flex align="center" justify="flex-end" gap={2}>
                  <Button
                    size="sm"
                    variant="solid"
                    colorScheme="blue"
                    onClick={async () => {
                      // Get cropped image
                      const croppedImage = await getCroppedImg(
                        willBeCroppedProfilePhoto,
                        croppedAreaPixels
                      );
                      // update states
                      setSelectedProfilePhoto(croppedImage as string);
                      setProiflePhotoUpdateModalOpen(false);
                      setModifying(true);
                      // reset states
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setCroppedAreaPixels(null);
                      setWillBeCroppedProfilePhoto("");
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    Try
                  </Button>
                  <Button
                    id="willBeCroppped-delete-button"
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => {
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setCroppedAreaPixels(null);
                      setWillBeCroppedProfilePhoto("");
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    Cancel
                  </Button>
                </Flex>
                <Flex position="relative" width="100%" height="400px">
                  <Cropper
                    image={willBeCroppedProfilePhoto}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                  />
                </Flex>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Flex direction="column" justify="center" align="center" mt={3}>
        <Flex
          position="relative"
          width="100%"
          direction="column"
          align="center"
        >
          <Image
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
            cursor="pointer"
            onClick={() => {
              setProiflePhotoUpdateModalOpen(true);
            }}
            hidden={!isCurrentUserPage}
          >
            <Icon as={BiPencil} color="white" fontSize="15px" />
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
            <Flex mt={3}>
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                onClick={onSignOut}
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
