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
  FormControl,
  FormLabel,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
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

import useProfilePhoto from "@/hooks/personalizationHooks/useProfilePhoto";

import { BiError, BiPencil } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";

import useFollow from "@/hooks/socialHooks/useFollow";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalStateAtom } from "../atoms/authModalAtom";
import { defaultCurrentUserState, UserInServer } from "../types/User";

import FollowInformationModal from "../Modals/User/FollowInformationModal";
import ProfilePhotoUpdateModal from "../Modals/User/ProfilePhotoUpdateModal";

import { auth, firestore } from "@/firebase/clientApp";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AiFillEdit } from "react-icons/ai";
import { headerAtViewAtom } from "../atoms/headerAtViewAtom";
import { providerModalStateAtom } from "../atoms/providerModalAtom";

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
    profilePhotoDelete,
    profilePhotoDeleteLoading,
  } = useProfilePhoto();

  const [poorProfilePhoto, setPoorProfilePhoto] = useState(false);

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

  const [signOutLoading, setSignOutLoading] = useState(false);

  const [profilephotoDeleteDialogOpen, setProfilePhotoDeleteDialogOpen] =
    useState(false);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);

  const [currentUserFollowThisMan, setCurrentUserFollowThisMan] =
    useState(false);

  const [gettingFollowStatus, setGettingFollowStatus] = useState(true);
  const [followOperationLoading, setFollowOperationLoading] = useState(false);

  const [headerAtView, setHeaderAtView] = useRecoilState(headerAtViewAtom);

  const [fullnameModifying, setFullnameModifying] = useState(false);
  const [fullnameRight, setFullnameRight] = useState(true);
  const [changedFullname, setChangedFullname] = useState(
    userInformation.fullname
  );
  const [fullnameUpdateLoading, setFullnameUpdateLoading] = useState(false);

  const setProviderModalState = useSetRecoilState(providerModalStateAtom);

  useEffect(() => {
    // after updating photo, we are using raw base64 selected photo as pp until refresh.
    setSelectedProfilePhoto("");

    if (userInformation) setHeaderAtView(userInformation);

    if (currentUserState.isThereCurrentUser) {
      handleFollowStatus();
      if (currentUserState.uid == userInformation.uid) {
        setIsCurrentUserPage((prev) => true);
      } else {
        setIsCurrentUserPage((prev) => false);
      }
    } else {
      setGettingFollowStatus(false);
      setIsCurrentUserPage((prev) => false);
    }
  }, [userInformation, currentUserState.isThereCurrentUser]);

  useEffect(() => {
    const poorStatus: boolean = !(
      headerAtView.profilePhoto || selectedProfilePhoto
    );

    setPoorProfilePhoto(poorStatus);
  }, [headerAtView.profilePhoto]);

  useEffect(() => {
    if (!willBeCroppedProfilePhoto) return;
    setProiflePhotoUpdateModalOpen(true);
  }, [willBeCroppedProfilePhoto]);

  /**
   * Checks if we follow this user.
   */
  const handleFollowStatus = async () => {
    setGettingFollowStatus(true);

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

  const handleFollowOnHeader = async (opCode: number) => {
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
    const operationResult = await follow(userInformation.username, opCode);

    if (!operationResult) {
      return setFollowOperationLoading(false);
    }

    setCurrentUserFollowThisMan(opCode === 1 ? true : false);
    setFollowOperationLoading(false);
  };

  const handleSignOut = async () => {
    if (!currentUserState.isThereCurrentUser) return;

    setSignOutLoading(true);

    // Firebase sign-out
    await signOut(auth);

    // Clear States
    setCurrentUserState({
      ...defaultCurrentUserState,
    });
    setAuthModalState((prev) => ({
      ...prev,
      open: true,
      view: "logIn",
    }));
    setCurrentUserFollowThisMan(false);

    setSignOutLoading(false);
  };

  const handleFullnameTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const susFullname = event.target.value;

    const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
    const consecutiveSpaceRegex = /\s\s/;
    if (
      !fullnameRegex.test(susFullname) ||
      consecutiveSpaceRegex.test(susFullname) ||
      susFullname[susFullname.length - 1] === " "
    ) {
      setFullnameRight(false);
    } else {
      setFullnameRight(true);
    }
    setChangedFullname(susFullname);
  };

  const handleUpdateFullname = async () => {
    if (!currentUserState.isThereCurrentUser) return;

    setFullnameUpdateLoading(true);
    const fullnameToUpdate = changedFullname;

    const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
    const consecutiveSpaceRegex = /\s\s/;
    if (
      !fullnameRegex.test(fullnameToUpdate) ||
      consecutiveSpaceRegex.test(fullnameToUpdate) ||
      fullnameToUpdate[fullnameToUpdate.length - 1] === " " ||
      fullnameToUpdate === headerAtView.fullname
    ) {
      setFullnameUpdateLoading(false);
      return setFullnameRight(false);
    }

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error("Error while getting 'idToken'", error);
      setFullnameUpdateLoading(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/user/fullnameUpdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          newRequestedUsername: fullnameToUpdate,
        }),
      });
    } catch (error) {
      setFullnameUpdateLoading(false);
      return console.error(
        "Error while updating fullname. (We were fetching to API...)",
        error
      );
    }

    if (!response.ok) {
      setFullnameUpdateLoading(false);
      return console.error(
        "Error while updating fullname. (from api)",
        await response.json()
      );
    }

    // update states
    setHeaderAtView((prev) => ({ ...prev, fullname: fullnameToUpdate }));

    // reset states
    setFullnameUpdateLoading(false);
    setFullnameModifying(false);
  };

  const handleProfilePhotoDelete = async () => {
    const operationResult = await profilePhotoDelete();

    if (!operationResult) {
      return;
    }

    setHeaderAtView((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
    setProfilePhotoDeleteDialogOpen(false);
  };

  const handleProfilePhotoUpload = async () => {
    const operationResult = await profilePhotoUpload();
    if (!operationResult) {
      return;
    }

    setHeaderAtView((prev) => ({
      ...prev,
      profilePhoto: selectedProfilePhoto,
    }));
    setModifying(false);
    setSelectedProfilePhoto("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <ProfilePhotoUpdateModal
        modifyingSetter={setModifying}
        ostensibleUserInformationValue={headerAtView}
        ostensibleUserInformationSetter={setHeaderAtView}
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
                onClick={handleProfilePhotoDelete}
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
                  : headerAtView.profilePhoto
                  ? headerAtView.profilePhoto
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
                    {headerAtView.profilePhoto
                      ? "New Profile Photo"
                      : "Set Profile Photo"}
                  </MenuItem>

                  <MenuItem
                    onClick={() => setProfilePhotoDeleteDialogOpen(true)}
                    hidden={
                      !!willBeCroppedProfilePhoto || !headerAtView.profilePhoto
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
              onClick={handleProfilePhotoUpload}
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
          {!isCurrentUserPage ? (
            <Text as="i" fontSize="12pt" textColor="gray.500">
              {userInformation.fullname}
            </Text>
          ) : (
            <Flex
              id="fullname-currentuser"
              align="center"
              gap={1}
              mt={fullnameModifying ? "2" : "unset"}
              maxWidth="200px"
              justify="center"
            >
              {!fullnameModifying ? (
                <>
                  <Text as="i" fontSize="12pt" textColor="gray.500">
                    {headerAtView.fullname}
                  </Text>
                  <Icon
                    as={AiFillEdit}
                    color="gray.500"
                    cursor="pointer"
                    onClick={() => {
                      setFullnameModifying(true);
                    }}
                  />
                </>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleUpdateFullname();
                  }}
                >
                  <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    gap="2"
                  >
                    <InputGroup>
                      <FormControl variant="floating">
                        <Input
                          required
                          name="fullname"
                          type="text"
                          autoComplete="new-password"
                          value={changedFullname}
                          pr={!fullnameRight ? "9" : "2"}
                          onChange={handleFullnameTextChange}
                          _hover={{
                            border: "1px solid",
                            borderColor: "blue.500",
                          }}
                          borderColor={fullnameRight ? "gray.200" : "red"}
                          textColor="white"
                          bg="black"
                          spellCheck={false}
                          isRequired
                          placeholder=" "
                        />
                        <FormLabel
                          bg="rgba(0,0,0)"
                          textColor="gray.500"
                          fontSize="12pt"
                          my={2}
                        >
                          Fullname
                        </FormLabel>
                      </FormControl>

                      <InputRightElement pointerEvents={"none"}>
                        {!fullnameRight && (
                          <Icon as={BiError} fontSize="20px" color="red" />
                        )}
                      </InputRightElement>
                    </InputGroup>
                    <Flex gap="1">
                      <Button
                        size="xs"
                        variant="solid"
                        colorScheme="blue"
                        isDisabled={
                          !fullnameRight ||
                          changedFullname === headerAtView.fullname
                        }
                        type="submit"
                        isLoading={fullnameUpdateLoading}
                      >
                        Update
                      </Button>
                      <Button
                        onClick={() => {
                          // reset process
                          setFullnameModifying(false);
                          setChangedFullname(headerAtView.fullname);
                          setFullnameRight(true);
                        }}
                        size="xs"
                        variant="outline"
                        colorScheme="blue"
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </Flex>
                </form>
              )}
            </Flex>
          )}
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
              {headerAtView.followingCount}
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
              {headerAtView.followerCount}
            </Text>
            <Text fontSize="12pt" textColor="gray.500">
              Follower
            </Text>
          </Flex>
          <Flex gap={1}>
            <Text as="b" fontSize="12pt" textColor="white">
              {headerAtView.nftCount}
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
                onClick={() => {
                  handleFollowOnHeader(-1);
                }}
                isLoading={followOperationLoading}
              >
                Followed
              </Button>
            ) : (
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={() => {
                  handleFollowOnHeader(1);
                }}
                isLoading={gettingFollowStatus || followOperationLoading}
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
                variant="outline"
                colorScheme="red"
                size="sm"
                onClick={handleSignOut}
                isLoading={signOutLoading}
              >
                Sign Out
              </Button>
              <Button
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => {
                  setProviderModalState({
                    open: true,
                    view: "currentProvider",
                  });
                }}
              >
                Data Ownership
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </>
  );
}
