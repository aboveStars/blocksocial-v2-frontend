import useProfilePhoto from "@/hooks/useProfilePhoto";
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { SetStateAction, useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { UserInformation } from "../../types/User";
import getCroppedImg from "../../utils/GetCroppedImage";

type Props = {
  profilePhotoUpdateModalOpenValue: boolean;
  profilePhotoUpdateModalOpenSetter: React.Dispatch<SetStateAction<boolean>>;
  ostensibleUserInformationValue: UserInformation;
  ostensibleUserInformationSetter: React.Dispatch<
    SetStateAction<UserInformation>
  >;
  inputRef: React.RefObject<HTMLInputElement>;

  modifyingSetter: React.Dispatch<SetStateAction<boolean>>;
  willBeCroppedProfilePhoto: string;

  selectedProfilePhotoSetter: React.Dispatch<SetStateAction<string>>;
  willBeCroppedProfilePhotoSetter: React.Dispatch<SetStateAction<string>>;
};

export default function ProfilePhotoUpdateModal({
  profilePhotoUpdateModalOpenValue,
  profilePhotoUpdateModalOpenSetter,
  ostensibleUserInformationSetter,
  ostensibleUserInformationValue,
  modifyingSetter,
  inputRef,
  willBeCroppedProfilePhoto,
  selectedProfilePhotoSetter,
  willBeCroppedProfilePhotoSetter,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const { profilePhotoDelete, profilePhotoDeleteLoading } = useProfilePhoto();

  return (
    <Modal
      id="profile-photo-update-panel"
      isOpen={profilePhotoUpdateModalOpenValue}
      onClose={() => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        willBeCroppedProfilePhotoSetter("");
        profilePhotoUpdateModalOpenSetter(false);
      }}
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      autoFocus={false}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent bg="gray.900">
        <ModalHeader>
          <Text color="white">Update Profile Photo</Text>

          <ModalCloseButton color="white" />
        </ModalHeader>

        <ModalBody>
          <Flex
            id="intial-add-delete-buttons"
            justify="space-between"
            align="center"
            mb={5}
          >
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              onClick={async () => {
                await profilePhotoDelete();
                ostensibleUserInformationSetter((prev) => ({
                  ...prev,
                  profilePhoto: "",
                }));
              }}
              hidden={
                !!willBeCroppedProfilePhoto ||
                !!!ostensibleUserInformationValue.profilePhoto
              }
              isLoading={profilePhotoDeleteLoading}
            >
              Delete Profile Photo
            </Button>

            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={() => {
                if (inputRef.current) inputRef.current.click();
              }}
              hidden={!!willBeCroppedProfilePhoto}
            >
              New Profile Photo
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
                    selectedProfilePhotoSetter(croppedImage as string);
                    profilePhotoUpdateModalOpenSetter(false);
                    modifyingSetter(true);
                    // reset states
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setCroppedAreaPixels(null);
                    willBeCroppedProfilePhotoSetter("");
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
                    willBeCroppedProfilePhotoSetter("");
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
  );
}
