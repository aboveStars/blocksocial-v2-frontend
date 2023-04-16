import {
  AspectRatio,
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
import React, { SetStateAction, useCallback, useEffect, useState } from "react";
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

  const handleResetStates = () => {
    profilePhotoUpdateModalOpenSetter(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    willBeCroppedProfilePhotoSetter("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Modal
      id="profile-photo-update-panel"
      isOpen={profilePhotoUpdateModalOpenValue}
      onClose={() => {
        handleResetStates();
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
      <ModalContent bg="black">
        <ModalHeader>
          <Text color="white">Adjust Profile Photo</Text>

          <ModalCloseButton color="white" />
        </ModalHeader>

        <ModalBody>
          {willBeCroppedProfilePhoto && (
            <Flex id="crop-area" direction="column">
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
                    modifyingSetter(true);
                    // reset states
                    handleResetStates();
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
                    handleResetStates();
                  }}
                >
                  Cancel
                </Button>
              </Flex>

              <Flex position="relative" height="450px" width="100%" mt={4}>
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
