import { OpenPanelName, PostItemData } from "@/components/types/Post";
import useNFT from "@/hooks/useNFT";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import React, { SetStateAction, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  openPanelNameValue: OpenPanelName;
  openPanelNameValueSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  postInformation: PostItemData;
};

export default function PostMakeNFT({
  openPanelNameValue,
  openPanelNameValueSetter,
  postInformation,
}: Props) {
  const {
    mintNft,
    creatingNFTLoading,
    openSeaLink,
    setOpenSeaLink,
    nftCreated,
    setNftCreated,
  } = useNFT();

  const [nftTitle, setNftTitle] = useState("");
  const [nftDescription, setNftDescription] = useState(
    postInformation.description
  );

  const handleSendNFT = async () => {
    await mintNft(
      nftTitle,
      postInformation.description,
      postInformation.senderUsername,
      postInformation.image,
      postInformation.postDocId,
      postInformation.creationTime,
      postInformation.likeCount,
      postInformation.commentCount
    );
  };

  const resetStatesAfterNFTCreation = () => {
    setNftCreated(false);

    setOpenSeaLink("");
    setNftTitle("");
    setNftDescription(postInformation.description);
  };

  const resetStatesAfterAbandon = () => {
    setNftTitle("");
    setNftDescription(postInformation.description);
  };

  return (
    <Modal
      isOpen={openPanelNameValue === "nft"}
      onClose={() => {
        openPanelNameValueSetter("main");
        // To prevent lose unfinished progress
        if (nftCreated) resetStatesAfterNFTCreation();
      }}
      autoFocus={false}
      size={{
        base: "full",
        sm: "full",
        md: "lg",
        lg: "lg",
      }}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent bg="black">
        <Flex
          id="modal-header"
          position="sticky"
          top="0"
          px={6}
          align="center"
          justify="space-between"
          height="50px"
          bg="black"
          zIndex="banner"
        >
          <Text textColor="white" fontSize="17pt" as="b">
            Create NFT
          </Text>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() => {
              openPanelNameValueSetter("main");
              if (nftCreated) resetStatesAfterNFTCreation();
            }}
          />
        </Flex>

        <ModalBody>
          <Flex direction="column" p={1} gap="3">
            <FormControl variant="floating">
              <Input
                required
                name="title"
                placeholder=" "
                mb={2}
                onChange={(event) => {
                  setNftTitle(event.target.value);
                }}
                value={nftTitle}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                textColor="white"
                bg="black"
                isDisabled={creatingNFTLoading || nftCreated}
              />
              <FormLabel
                bg="rgba(0,0,0)"
                textColor="gray.500"
                fontSize="12pt"
                my={2}
              >
                Title
              </FormLabel>
            </FormControl>
            <Image alt="" src={postInformation.image} />
            <FormControl variant="floating">
              <Input
                required
                name="title"
                placeholder=" "
                mb={2}
                value={nftDescription}
                onChange={(event) => {
                  setNftDescription(event.target.value);
                }}
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                bg="black"
                textColor="white"
                isDisabled={creatingNFTLoading || nftCreated}
              />
              <FormLabel
                textColor="gray.500"
                fontSize="12pt"
                bg="rgba(0,0,0)"
                my={2}
              >
                Description
              </FormLabel>
            </FormControl>

            <Flex
              align="center"
              gap="3"
              hidden={!(creatingNFTLoading || nftCreated)}
            >
              <Text textColor="gray.400" fontSize="12pt" as="b">
                Creating NFT
              </Text>
              {creatingNFTLoading && <Spinner color="gray.400" size="sm" />}
              {nftCreated && (
                <Icon as={AiOutlineCheckCircle} fontSize="19px" color="green" />
              )}
            </Flex>

            {nftCreated && (
              <Flex
                align="center"
                mt={3}
                gap="1"
                cursor="pointer"
                onClick={() => {
                  window.open(openSeaLink, "blank");
                }}
              >
                <Text color="white" fontSize="15pt" as="b">
                  Visit your new NFT on OpenSea!
                </Text>
                <Icon
                  as={FiExternalLink}
                  color="white"
                  fontSize="15pt"
                  mx={0.5}
                />
              </Flex>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter gap={3}>
          {nftCreated ? (
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                openPanelNameValueSetter("main");
                resetStatesAfterNFTCreation();
              }}
            >
              Return to post
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  resetStatesAfterAbandon();
                  openPanelNameValueSetter("main");
                }}
                isDisabled={creatingNFTLoading}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="blue"
                onClick={() => {
                  handleSendNFT();
                }}
                isLoading={creatingNFTLoading}
              >
                Create!
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
