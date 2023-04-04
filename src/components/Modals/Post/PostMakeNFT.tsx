import {
  OpenPanelName,
  PostMainData,
  SendNftStatus,
} from "@/components/types/Post";
import { fakeWaiting } from "@/components/utils/FakeWaiting";
import useSmartContractTransactions from "@/hooks/useSmartContractTransactions";
import {
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  openPanelNameValue: OpenPanelName;
  openPanelNameValueSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  postInformation: PostMainData;
};

export default function PostMakeNFT({
  openPanelNameValue,
  openPanelNameValueSetter,
  postInformation,
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
  } = useSmartContractTransactions();

  const handleSendNFT = async () => {
    console.log("SendNFTFires");
    await mintNft(
      "Title",
      postInformation.description,
      postInformation.senderUsername,
      postInformation.image
    );
    console.log("SendNFTSuccessfull");
  };

  useEffect(() => {
    console.log(sendNftStatus);
  }, [sendNftStatus]);

  const resetStatesAfterNFTCreation = () => {
    setSendNftStatus("initial");
    setRequestSent(false);
    setConfirmed(false);
    setPostUpdated(false);
    setMetadataUploaded(false);
  };

  return (
    <Modal
      isOpen={openPanelNameValue === "nft"}
      onClose={() => {
        openPanelNameValueSetter("main");
        resetStatesAfterNFTCreation();
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
              // reset states
              resetStatesAfterNFTCreation();
            }}
          />
        </Flex>

        <ModalBody>
          <Text
            textColor="white"
            fontWeight="500"
            fontSize="10pt"
            hidden={!(sendNftStatus === "initial")}
          >
            Do you want to send this posts as NFT to Blockchain ?
          </Text>
          <Stack hidden={sendNftStatus === "initial"} mt={3} ml={3}>
            <Flex align="center" gap={3}>
              <Text textColor="white">Uploading Metadata</Text>
              {sendNftStatus === "uploadingMetadata" && (
                <Spinner color="white" size="sm" />
              )}
              {metadataUploaded && (
                <Icon as={AiOutlineCheckCircle} fontSize="20px" color="green" />
              )}
            </Flex>
            <Flex align="center" hidden={!metadataUploaded} gap={3}>
              <Text textColor="white">Sending request to blockchain</Text>
              {sendNftStatus === "sendingRequest" && (
                <Spinner color="white" size="sm" />
              )}
              {requestSent && (
                <Icon as={AiOutlineCheckCircle} fontSize="20px" color="green" />
              )}
            </Flex>

            <Flex align="center" gap={3} hidden={!requestSent}>
              <Text textColor="white">
                Waiting for confirmations from blockchain
              </Text>
              {sendNftStatus === "waitingForConfirmation" && (
                <Spinner color="white" size="sm" />
              )}
              {confirmed && (
                <Icon as={AiOutlineCheckCircle} fontSize="20px" color="green" />
              )}
            </Flex>
            <Flex align="center" gap={3} hidden={!confirmed}>
              <Text textColor="white">Updating post</Text>
              {sendNftStatus === "updatingPost" && (
                <Spinner color="white" size="sm" />
              )}
              {postUpdated && (
                <Icon as={AiOutlineCheckCircle} fontSize="20px" color="green" />
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
                window.open(
                  "https://testnets.opensea.io/assets/mumbai/0x0c0f47f2de87b0e8925a55d14b32ad6c0621047f/0",
                  "blank"
                );
              }}
            >
              <Text color="white">Visit your new NFT on OpenSea!</Text>
              <Icon as={FiExternalLink} color="white" mx={0.5} />
            </Flex>
          )}
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
                onClick={() => openPanelNameValueSetter("main")}
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
                Send NFT!
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
