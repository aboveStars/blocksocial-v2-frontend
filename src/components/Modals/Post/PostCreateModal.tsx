import usePostUpload from "@/hooks/usePostUpload";

import {
  Button,
  Flex,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { postCreateModalStateAtom } from "../../atoms/postCreateModalAtom";

type Props = {};

export default function PostCreateModal({}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    onSelectPostPhoto,
    selectedPostPhoto,
    setSelectedPostPhoto,
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
    await sendPost(postCreateForm);
    console.log("Succesfully Uploaded Post");
    setPostCreateForm({ description: "", image: "" });
  };

  useEffect(() => {
    setPostCreateForm((prev) => ({
      ...prev,
      image: selectedPostPhoto,
    }));
  }, [selectedPostPhoto]);

  return (
    <Modal
      isOpen={postCreateModalState.isOpen}
      onClose={() => setPostCreatModaleState({ isOpen: false })}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Post</ModalHeader>

        <ModalBody>
          <Text>Description</Text>
          <Input name="description" onChange={onTextsChanged} />

          <Text>Photo</Text>
          {postCreateForm.image ? (
            <>
              <Image src={postCreateForm.image} />
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPostPhoto("");
                }}
                mt={2}
                colorScheme="red"
              >
                Delete Photo
              </Button>
            </>
          ) : (
            <Flex
              justify="center"
              align="center"
              p={20}
              border="1px dashed"
              width="100%"
              borderRadius="4"
              borderColor="gray.200"
              bgColor="gray.50"
            >
              <>
                <Button
                  variant="outline"
                  height="28px"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Upload
                </Button>
                <Input
                  ref={imageInputRef}
                  type="file"
                  hidden
                  onChange={onSelectPostPhoto}
                />
              </>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              setPostCreatModaleState({ isOpen: false });
              if (imageInputRef.current) imageInputRef.current.value = "";
            }}
            isDisabled={postUploadLoading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSendPost}
            isLoading={postUploadLoading}
          >
            Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
