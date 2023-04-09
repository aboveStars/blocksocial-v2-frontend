import getCroppedImg from "@/components/utils/GetCroppedImage";
import usePostUpload from "@/hooks/usePostUpload";

import {
  AspectRatio,
  Button,
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { AiOutlineClose } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";
import { useRecoilState } from "recoil";
import { setTextRange } from "typescript";
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

  const onTextsChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      id="post-create-modal"
      size={{
        base: "full",
        sm: "full",
        md: "md",
        lg: "md",
      }}
      isOpen={postCreateModalState.isOpen}
      onClose={() => {
        // State Resets
        setPostCreatModaleState((prev) => ({
          ...prev,
          isOpen: false,
        }));
      }}
      autoFocus={false}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent bg="black">
        <Flex
          position="sticky"
          top="0"
          px={6}
          align="center"
          justify="space-between"
          height="50px"
          bg="black"
        >
          <Flex textColor="white" fontSize="17pt" fontWeight="700" gap={2}>
            <Text>Create Post</Text>
          </Flex>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
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
          />
        </Flex>

        <ModalBody>
          <Stack gap={1}>
            <Text as="b" fontSize="14pt" textColor="white">
              Photo
            </Text>

            <Flex
              id="post-image-crop-area"
              direction="column"
              hidden={!!!willBeCroppedPostPhoto}
            >
              <Flex id="try-cancel-buttons" justify="flex-end" gap={2} mb="2">
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
              <AspectRatio position="relative" width="100%" ratio={1}>
                <Cropper
                  image={willBeCroppedPostPhoto}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </AspectRatio>
            </Flex>

            <AspectRatio hidden={!!!postCreateForm.image} ratio={1}>
              <Image
                borderRadius="5px"
                alt=""
                src={postCreateForm.image}
                hidden={!!!postCreateForm.image}
              />
            </AspectRatio>

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

            <AspectRatio
              id="image-upload-placeholder"
              width="100%"
              borderRadius="4"
              bg="black"
              hidden={!!willBeCroppedPostPhoto || !!postCreateForm.image}
              ratio={4 / 3}
            >
              <>
                <Button
                  width="100%"
                  height="100%"
                  onClick={() => imageInputRef.current?.click()}
                  bg="black"
                  borderWidth={3}
                  borderColor="white"
                  textColor="white"
                  fontSize="50pt"
                  fontWeight={700}
                  _hover={{
                    textColor: "black",
                    bg: "white",
                  }}
                >
                  <Icon as={BiImageAdd} />
                </Button>
                <Input
                  ref={imageInputRef}
                  type="file"
                  hidden
                  onChange={onSelectWillBeCroppedPhoto}
                />
              </>
            </AspectRatio>

            <Flex direction="column" mt={1} gap="1">
              <Text as="b" fontSize="14pt" textColor="white">
                Description
              </Text>

              <Input
                name="description"
                textColor="white"
                fontWeight="600"
                value={postCreateForm.description}
                onChange={onTextsChanged}
              />
            </Flex>
          </Stack>
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
