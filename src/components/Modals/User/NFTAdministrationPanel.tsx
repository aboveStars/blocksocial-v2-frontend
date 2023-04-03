import { SmallPostItemData } from "@/components/types/Post";
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { SetStateAction, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  nftAdministrationPanelOpenSetter: React.Dispatch<SetStateAction<boolean>>;
  nftAdministrationPanelOpenValue: boolean;
  currentUserUsername: string;
};

export default function NFTAdministrationPanel({
  nftAdministrationPanelOpenSetter,
  nftAdministrationPanelOpenValue,
  currentUserUsername,
}: Props) {
  const [userPostsToMakeNFT, setUserPostsToMakeNFT] = useState<
    SmallPostItemData[]
  >([]);

  useEffect(() => {
    if (!nftAdministrationPanelOpenValue) {
      return;
    }
    handleGetActiveNFTs();
  }, [nftAdministrationPanelOpenValue]);

  const handleGetActiveNFTs = async () => {
    /**
     * We need to check if post is already a nft
     */
    console.log("Active NFT's are being got.");
  };

  return (
    <Modal
      isOpen={nftAdministrationPanelOpenValue}
      onClose={() => nftAdministrationPanelOpenSetter(false)}
    >
      <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
      <ModalContent>
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
            <Text>NFT Administration</Text>
          </Flex>

          <Icon
            as={AiOutlineClose}
            color="white"
            fontSize="15pt"
            cursor="pointer"
            onClick={() => nftAdministrationPanelOpenSetter(false)}
          />
        </Flex>
        <ModalBody bg="gray.900">
          <Flex direction="column">
            <Text textColor="white" fontSize="13pt" fontWeight="500">
              Active NFT's
            </Text>
            <Stack textColor="white" fontSize="10pt" mt={2}>
              <Text> NFT 1</Text>
              <Text> NFT 2</Text>
              <Text> NFT 3</Text>
            </Stack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
