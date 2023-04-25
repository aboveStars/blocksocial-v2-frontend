import { NFTMetadata } from "@/components/types/NFT";
import { OpenPanelName, PostItemData } from "@/components/types/Post";
import useNFT from "@/hooks/useNFT";
import {
  AspectRatio,
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
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import {
  AiFillHeart,
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineComment,
  AiOutlineNumber,
} from "react-icons/ai";

import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import { format } from "date-fns";
import { BiTransfer } from "react-icons/bi";
import {
  BsArrowRight,
  BsFillCalendarHeartFill,
  BsFillCalendarPlusFill,
} from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { GrTextAlignFull } from "react-icons/gr";
import { MdTitle } from "react-icons/md";

type Props = {
  openPanelNameValue: OpenPanelName;
  openPanelNameValueSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  postInformation: PostItemData;
  nftStatusValueSetter: React.Dispatch<
    SetStateAction<PostItemData["nftStatus"]>
  >;
};

export default function PostNFT({
  openPanelNameValue,
  openPanelNameValueSetter,
  postInformation,
  nftStatusValueSetter,
}: Props) {
  const { mintNft, creatingNFTLoading, refreshNFT, nftCreated, setNftCreated } =
    useNFT();

  const [nftTitle, setNftTitle] = useState("");
  const [nftDescription, setNftDescription] = useState(
    postInformation.description
  );

  const [gettingNFTDataLoading, setGettingNFTDataLoading] = useState(true);
  const [nftMetadaData, setNFTMetadata] = useState<NFTMetadata>();

  const [refreshNFTLoading, setRefreshNFTLoading] = useState(false);

  const [nftMetadataLikeCommentCount, setNftMetdataLikeCommentCount] = useState(
    {
      likeCount: 0,
      commentCount: 0,
    }
  );

  const nftDataFlexRef = useRef<HTMLDivElement>(null);
  const [nftImageSizePx, setNftImageSizePx] = useState("300px");

  const handleSendNFT = async () => {
    const nftMintResult = await mintNft(
      nftTitle,
      postInformation.description,
      postInformation.senderUsername,
      postInformation.image,
      postInformation.postDocId,
      postInformation.creationTime,
      postInformation.likeCount,
      postInformation.commentCount
    );

    if (!nftMintResult) {
      return;
    }

    nftStatusValueSetter(nftMintResult);
  };

  const resetStatesAfterNFTCreation = () => {
    setNftCreated(false);

    setNftTitle("");
    setNftDescription(postInformation.description);
  };

  const resetStatesAfterAbandon = () => {
    setNftTitle("");
    setNftDescription(postInformation.description);
  };

  const getNFTData = async () => {
    setGettingNFTDataLoading(true);
    setNFTMetadata(undefined);
    setNftMetdataLikeCommentCount({ commentCount: 0, likeCount: 0 });
    console.log(postInformation.nftStatus.metadataLink);
    const response = await fetch(postInformation.nftStatus.metadataLink, {
      cache: "no-store",
      method: "GET",
    });

    if (!response.ok) {
      setGettingNFTDataLoading(false);
      return console.error(
        "Error while getting nftMetadata",
        await response.json()
      );
    }

    const result: NFTMetadata = await response.json();
    console.log(result);
    setNFTMetadata(result);
    setNftMetdataLikeCommentCount({
      likeCount: Number(
        result.attributes.find((a) => a.trait_type === "Likes")!.value
      ),
      commentCount: Number(
        result.attributes.find((a) => a.trait_type === "Comments")!.value
      ),
    });

    setGettingNFTDataLoading(false);
  };

  const handleRefreshNFT = async () => {
    setRefreshNFTLoading(true);
    await refreshNFT(postInformation.postDocId);
    setRefreshNFTLoading(false);
    getNFTData();
  };

  useEffect(() => {
    if (nftDataFlexRef.current) {
      console.log(nftDataFlexRef.current.clientWidth);
      setNftImageSizePx(`${nftDataFlexRef.current.clientWidth / 2}px`);
    }
  }, [nftDataFlexRef.current?.clientWidth]);

  useEffect(() => {
    if (
      openPanelNameValue === "nft" &&
      postInformation.nftStatus.minted === true
    ) {
      getNFTData();
    }
  }, [openPanelNameValue, postInformation.nftStatus.minted]);
  // openPanelNameValue === "nft"
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
            {postInformation.nftStatus.minted
              ? "Manage Your NFT"
              : "Create NFT"}
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
          {postInformation.nftStatus.minted ? (
            <>
              {!gettingNFTDataLoading && nftMetadaData ? (
                <Flex id="Manage-Area-Body" direction="column" gap={3}>
                  <Flex
                    id="nft-full-data"
                    hidden={gettingNFTDataLoading}
                    gap="5"
                    ref={nftDataFlexRef}
                    align="center"
                  >
                    <Image
                      width={nftImageSizePx}
                      height={nftImageSizePx}
                      src={nftMetadaData?.image}
                      borderRadius="5"
                    />

                    <Flex id="nft-data" direction="column" gap={0.5}>
                      <Flex id="nft-title-data" align="center" gap={1}>
                        <Icon as={MdTitle} fontSize="11pt" color="white" />
                        <Text color="white" fontSize="11pt">
                          {nftMetadaData?.name}
                        </Text>
                      </Flex>
                      <Flex id="nft-description-data" align="center" gap={1}>
                        <Icon
                          as={GrTextAlignFull}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {nftMetadaData?.description}
                        </Text>
                      </Flex>
                      <Flex id="nft-like-data" align="center" gap={1}>
                        <Icon as={AiFillHeart} fontSize="11pt" color="white" />
                        <Text color="white" fontSize="11pt">
                          {nftMetadataLikeCommentCount.likeCount}
                        </Text>
                      </Flex>
                      <Flex id="nft-comment-data" align="center" gap={1}>
                        <Icon
                          as={AiOutlineComment}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {nftMetadataLikeCommentCount.commentCount}
                        </Text>
                      </Flex>
                      <Flex id="nft-tokenId-data" align="center" gap={1}>
                        <Icon
                          as={AiOutlineNumber}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {postInformation.nftStatus.tokenId}
                        </Text>
                      </Flex>
                      <Flex id="nft-network-data" align="center" gap={1}>
                        <AspectRatio width="20px" ratio={1}>
                          <img src="https://cryptologos.cc/logos/polygon-matic-logo.png?v=024" />
                        </AspectRatio>

                        <Text color="white" fontSize="11pt">
                          {`${mumbaiContractAddress.slice(
                            0,
                            5
                          )}...${mumbaiContractAddress.slice(
                            mumbaiContractAddress.length - 3,
                            mumbaiContractAddress.length
                          )}`}
                        </Text>
                      </Flex>
                      <Flex
                        id="nft-postCreation-date-data"
                        align="center"
                        gap={1}
                      >
                        <Icon
                          as={BsFillCalendarPlusFill}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {format(
                            new Date(
                              (nftMetadaData?.attributes.find(
                                (a) => a.trait_type === "Post Creation"
                              )?.value as number) * 1000
                            ),
                            "dd MMMM yyyy"
                          )}
                        </Text>
                      </Flex>
                      <Flex
                        id="nft-nftCreation-date-data"
                        align="center"
                        gap={1}
                      >
                        <Icon
                          as={BsFillCalendarHeartFill}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {format(
                            new Date(
                              (nftMetadaData?.attributes.find(
                                (a) => a.trait_type === "NFT Creation"
                              )?.value as number) * 1000
                            ),
                            "dd MMMM yyyy"
                          )}
                        </Text>
                      </Flex>
                      <Flex id="nft-owner-data" align="center" gap={1}>
                        <Icon
                          as={FaRegUserCircle}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {postInformation.nftStatus.transferred
                            ? postInformation.nftStatus.transferredAddress
                            : "BlockSocial"}
                        </Text>
                      </Flex>
                      <Flex id="nft-transfer-data" align="center" gap={1}>
                        <Icon as={BiTransfer} fontSize="11pt" color="white" />
                        <Text color="white" fontSize="11pt">
                          {postInformation.nftStatus.transferred ? "Yes" : "No"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex id="refresh-nft-area" direction="column">
                    <Text color="white" fontSize="15pt" as={"b"}>
                      NFT Status
                    </Text>
                    {postInformation.likeCount !==
                      nftMetadataLikeCommentCount.likeCount ||
                    postInformation.commentCount !==
                      nftMetadataLikeCommentCount.commentCount ? (
                      <Flex id="nft-update-needed" direction="column" gap="2">
                        <Text fontSize="9pt" color="red">
                          Your NFT is not up to date.
                        </Text>
                        <Flex
                          id="like-change"
                          align="center"
                          gap={2}
                          hidden={
                            nftMetadataLikeCommentCount.likeCount ===
                            postInformation.likeCount
                          }
                        >
                          <Icon as={AiFillHeart} color="white" />
                          <Text color="white">
                            {nftMetadataLikeCommentCount.likeCount}
                          </Text>
                          <Icon as={BsArrowRight} color="white" />
                          <Text color="white">{postInformation.likeCount}</Text>
                        </Flex>
                        <Flex
                          id="comment-change"
                          align="center"
                          gap={2}
                          hidden={
                            nftMetadataLikeCommentCount.commentCount ===
                            postInformation.commentCount
                          }
                        >
                          <Icon as={AiOutlineComment} color="white" />
                          <Text color="white">
                            {nftMetadataLikeCommentCount.commentCount}
                          </Text>
                          <Icon as={BsArrowRight} color="white" />
                          <Text color="white">
                            {postInformation.commentCount}
                          </Text>
                        </Flex>
                        <Button
                          variant="outline"
                          colorScheme="blue"
                          size="sm"
                          onClick={() => {
                            handleRefreshNFT();
                          }}
                          isLoading={refreshNFTLoading}
                        >
                          Update NFT
                        </Button>
                      </Flex>
                    ) : (
                      <>
                        <Text color="white" fontSize="9pt">
                          Your NFT is up to date.
                        </Text>
                      </>
                    )}
                  </Flex>
                </Flex>
              ) : (
                <Spinner color="white" />
              )}
            </>
          ) : (
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
                  <Icon
                    as={AiOutlineCheckCircle}
                    fontSize="19px"
                    color="green"
                  />
                )}
              </Flex>
            </Flex>
          )}
        </ModalBody>

        {postInformation.nftStatus.minted ? (
          <ModalFooter gap={3}>
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
          </ModalFooter>
        ) : (
          <ModalFooter gap={3}>
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
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
