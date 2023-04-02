import getCroppedImg from "@/components/utils/GetCroppedImage";
import usePostUpload from "@/hooks/usePostUpload";

import {
  Button,
  Flex,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useRecoilState } from "recoil";
import { postCreateModalStateAtom } from "../../atoms/postCreateModalAtom";

export default function PostCreateModal() {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const {
    onSelectWillBeCroppedPhoto,
    willBeCroppedPostPhoto,
    setWillBeCroppedPostPhoto,
    postUploadLoading,
    sendPost,
  } = usePostUpload();

  const [postCreateModalState, setPostCreatModaleState] = useRecoilState(
    postCreateModalStateAtom
  );

  const [postCreateForm, setPostCreateForm] = useState({
    description: "",
    image: "",
  });

  const onTextsChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostCreateForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSendPost = async () => {
    // Already button is disabled when empty, but for prevent from any
    if (!!!postCreateForm.description && !!!postCreateForm.image) {
      console.log("You Can not create empty post, aborting");
      return;
    }
    await sendPost(postCreateForm);

    // State Resets
    setPostCreateForm({ description: "", image: "" });

    setPostCreatModaleState((prev) => ({
      ...prev,
      isOpen: false,
    }));

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    if (imageInputRef.current) imageInputRef.current.value = "";

    console.log("Succesfully Uploaded Post");
  };

  return (
    <Modal
      isOpen={postCreateModalState.isOpen}
      onClose={() => {
        // State Resets
        setPostCreatModaleState((prev) => ({
          ...prev,
          isOpen: false,
        }));

        setPostCreateForm({ description: "", image: "" });

        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);

        if (imageInputRef.current) imageInputRef.current.value = "";
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
          <Text textColor="white">Create Post</Text>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
          <Text textColor="white" mb={1}>
            Photo
          </Text>

          <Flex
            id="post-image-crop-area"
            direction="column"
            hidden={!!!willBeCroppedPostPhoto}
          >
            <Flex justify="flex-end" gap={2} mb="2">
              <Button
                size="sm"
                variant="solid"
                colorScheme="blue"
                onClick={async () => {
                  // Get cropped image
                  const croppedImage = await getCroppedImg(
                    willBeCroppedPostPhoto,
                    croppedAreaPixels
                  );
                  // Update State
                  setPostCreateForm((prev) => ({
                    ...prev,
                    image: croppedImage as string,
                  }));
                  // Reset States
                  setWillBeCroppedPostPhoto("");
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedAreaPixels(null);

                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                Try
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  // Reset States
                  setWillBeCroppedPostPhoto("");

                  setWillBeCroppedPostPhoto("");
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedAreaPixels(null);

                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                Cancel
              </Button>
            </Flex>
            <Flex position="relative" width="100%" height="400px">
              <Cropper
                image={willBeCroppedPostPhoto}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Flex>
          </Flex>

          <Image src={postCreateForm.image} hidden={!!!postCreateForm.image} />
          <Button
            variant="outline"
            onClick={() => {
              setPostCreateForm((prev) => ({
                ...prev,
                image: "",
              }));

              // Reset States
              setWillBeCroppedPostPhoto("");

              setWillBeCroppedPostPhoto("");
              setCrop({ x: 0, y: 0 });
              setZoom(1);
              setCroppedAreaPixels(null);

              if (imageInputRef.current) imageInputRef.current.value = "";
            }}
            mt={2}
            colorScheme="red"
            hidden={!!!postCreateForm.image}
          >
            Delete Photo
          </Button>

          <Flex
            justify="center"
            align="center"
            p={20}
            border="1px dashed"
            width="100%"
            borderRadius="4"
            borderColor="gray.200"
            bgColor="gray.700"
            hidden={!!willBeCroppedPostPhoto || !!postCreateForm.image}
          >
            <>
              <Button
                variant="solid"
                colorScheme="blue"
                height="28px"
                onClick={() => imageInputRef.current?.click()}
              >
                Upload
              </Button>
              <Input
                ref={imageInputRef}
                type="file"
                hidden
                onChange={onSelectWillBeCroppedPhoto}
              />
            </>
          </Flex>

          <Flex direction="column" mt={1} gap="1">
            <Text color="white">Description</Text>
            <Textarea
              resize="vertical"
              name="description"
              onChange={onTextsChanged}
              textColor="white"
              size="sm"
            />
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              // State Resets
              setPostCreatModaleState((prev) => ({
                ...prev,
                isOpen: false,
              }));

              setPostCreateForm({ description: "", image: "" });

              setCrop({ x: 0, y: 0 });
              setZoom(1);
              setCroppedAreaPixels(null);

              if (imageInputRef.current) imageInputRef.current.value = "";
            }}
            isDisabled={postUploadLoading || !!willBeCroppedPostPhoto}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSendPost}
            isLoading={postUploadLoading}
            isDisabled={
              (!!!postCreateForm.description && !!!postCreateForm.image) ||
              !!willBeCroppedPostPhoto
            }
          >
            Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
