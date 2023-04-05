import { OpenPanelName, PostMainData } from "@/components/types/Post";
import useSmartContractTransactions from "@/hooks/useSmartContractTransactions";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  openPanelNameValue: OpenPanelName;
  openPanelNameValueSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  postInformation: PostMainData;
  postDocPath: string;
};

export default function PostMakeNFT({
  openPanelNameValue,
  openPanelNameValueSetter,
  postInformation,
  postDocPath,
}: Props) {
  const {
    mintNft,
    sendNftStatus,
    setSendNftStatus,
    requestSent,
    setRequestSent,
    confirmed,
    setConfirmed,
    postUpdated,
    setPostUpdated,
    metadataUploaded,
    setMetadataUploaded,
    openSeaLink,
    setOpenSeaLink,
  } = useSmartContractTransactions();

  const [nftTitle, setNftTitle] = useState("");
  const [nftDescription, setNftDescription] = useState(
    postInformation.description
  );

  const handleSendNFT = async () => {
    console.log("SendNFTFires");

    await mintNft(
      nftTitle,
      postInformation.description,
      postInformation.senderUsername,
      postInformation.image,
      postDocPath,
      postInformation.creationTime,
      postInformation.likeCount,
      postInformation.commentCount
    );
    console.log("SendNFTSuccessfull");
  };

  useEffect(() => {
    console.log(sendNftStatus);
  }, [sendNftStatus]);

  useEffect(() => {
    console.log(nftDescription);
  }, [nftDescription]);

  const resetStatesAfterNFTCreation = () => {
    setSendNftStatus("initial");
    setRequestSent(false);
    setConfirmed(false);
    setPostUpdated(false);
    setMetadataUploaded(false);
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
        if (sendNftStatus === "initial" || sendNftStatus === "final")
          resetStatesAfterNFTCreation();
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
              if (sendNftStatus === "final" || sendNftStatus === "initial")
                resetStatesAfterNFTCreation();
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
                _hover={{
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                textColor="white"
                bg="black"
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
            <Stack hidden={sendNftStatus === "initial"} mt={1} ml="3">
              <Flex align="center" gap={3}>
                <Text textColor="gray.400" fontSize="12pt" as="b">
                  Preparing NFT&apos;s details
                </Text>
                {sendNftStatus === "uploadingMetadata" && (
                  <Spinner color="gray.400" size="sm" />
                )}
                {metadataUploaded && (
                  <Icon
                    as={AiOutlineCheckCircle}
                    fontSize="19px"
                    color="green"
                  />
                )}
              </Flex>
              <Flex align="center" hidden={!metadataUploaded} gap={3}>
                <Text textColor="gray.400" fontSize="12pt" as="b">
                  Uploading NFT
                </Text>
                {sendNftStatus === "sendingRequest" && (
                  <Spinner color="gray.400" size="sm" />
                )}
                {requestSent && (
                  <Icon
                    as={AiOutlineCheckCircle}
                    fontSize="19px"
                    color="green"
                  />
                )}
              </Flex>

              <Flex align="center" gap={3} hidden={!requestSent}>
                <Text textColor="gray.400" fontSize="12pt" as="b">
                  Verifying NFT
                </Text>
                {sendNftStatus === "waitingForConfirmation" && (
                  <Spinner color="gray.400" size="sm" />
                )}
                {confirmed && (
                  <Icon
                    as={AiOutlineCheckCircle}
                    fontSize="19px"
                    color="green"
                  />
                )}
              </Flex>
              <Flex align="center" gap={3} hidden={!confirmed}>
                <Text textColor="gray.400" fontSize="12pt" as="b">
                  Adding NFT to Your Account
                </Text>
                {sendNftStatus === "updatingPost" && (
                  <Spinner color="gray.400" size="sm" />
                )}
                {postUpdated && (
                  <Icon
                    as={AiOutlineCheckCircle}
                    fontSize="19px"
                    color="green"
                  />
                )}
              </Flex>
            </Stack>
            {sendNftStatus === "final" && (
              <Flex
                align="center"
                mt={3}
                gap="1"
                cursor="pointer"
                onClick={() => {
                  window.open(openSeaLink, "blank");
                }}
                ml="1"
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
          {sendNftStatus === "final" ? (
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
                }}
                isDisabled={!(sendNftStatus === "initial")}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="blue"
                onClick={() => {
                  handleSendNFT();
                }}
                isLoading={!(sendNftStatus === "initial")}
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
