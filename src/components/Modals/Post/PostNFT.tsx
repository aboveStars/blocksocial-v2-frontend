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
  InputGroup,
  InputRightElement,
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

import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import { auth } from "@/firebase/clientApp";
import { format } from "date-fns";
import { ethers } from "ethers";
import { BiError } from "react-icons/bi";
import {
  BsArrowRight,
  BsFillCalendarHeartFill,
  BsFillCalendarPlusFill,
} from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { GrTextAlignFull } from "react-icons/gr";
import { MdContentCopy } from "react-icons/md";
import { RxText } from "react-icons/rx";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { postsAtViewAtom } from "@/components/atoms/postsAtViewAtom";

type Props = {
  openPanelNameValue: OpenPanelName;
  openPanelNameValueSetter: React.Dispatch<SetStateAction<OpenPanelName>>;
  postInformation: PostItemData;
};

export default function PostNFT({
  openPanelNameValue,
  openPanelNameValueSetter,
  postInformation,
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

  /**
   * nftAddress state with 0x add-on
   */
  const [nftTransferAddress, setNftTransferAddress] = useState("");
  const [nftTransferAddressRight, setNftTransferAddressRight] = useState(true);
  const [nftTransferLoading, setNftTransferLoading] = useState(false);

  const currentUserState = useRecoilValue(currentUserStateAtom);

  const nftTransferAddressInputRef = useRef<HTMLInputElement>(null);

  const setPostsAtView = useSetRecoilState(postsAtViewAtom);

  useEffect(() => {
    if (
      openPanelNameValue === "nft" &&
      postInformation.nftStatus.minted === true
    ) {
      getNFTData();
    }
  }, [openPanelNameValue, postInformation.nftStatus.minted]);

  const handleSendNFT = async () => {
    const nftMintResult = await mintNft(
      nftTitle,
      postInformation.description,
      postInformation.postDocId
    );

    if (!nftMintResult) {
      return;
    }

    setPostsAtView((prev) => {
      return prev.map((p) => {
        if (p.postDocId === postInformation.postDocId) {
          const updatedPost = { ...p };
          updatedPost.nftStatus = nftMintResult;
          return updatedPost;
        } else {
          return p;
        }
      });
    });
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

  const handleNFTransfer = async () => {
    const transferAddressValidationStatus =
      ethers.isAddress(nftTransferAddress);
    if (!transferAddressValidationStatus) {
      return setNftTransferAddressRight(false);
    }
    if (!nftTransferAddressRight) return;

    setNftTransferLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      setNftTransferLoading(false);
      return console.error(
        "Error while transferring NFT. Couln't be got idToken",
        error
      );
    }

    let response: Response;
    try {
      response = await fetch("/api/transferNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocId: postInformation.postDocId,
          transferAddress: nftTransferAddress,
        }),
      });
    } catch (error) {
      setNftTransferLoading(false);
      return console.error("Error while fetching 'refreshNFT' API", error);
    }

    if (!response.ok) {
      setNftTransferLoading(false);
      return console.error(
        "Error while transferring from 'transferNFT' API",
        await response.json()
      );
    }

    setPostsAtView((prev) => {
      return prev.map((p) => {
        if (p.postDocId === postInformation.postDocId) {
          const updatedPost = { ...p };
          updatedPost.nftStatus.transferred = true;
          updatedPost.nftStatus.transferredAddress = nftTransferAddress;
          return updatedPost;
        } else {
          return p;
        }
      });
    });

    getNFTData();

    setNftTransferLoading(false);
  };

  const handleNftTransferAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const susAddress = event.target.value;
    if (susAddress.length === 0) {
      // prevent bad ui
      setNftTransferAddressRight(true);
      setNftTransferAddress(susAddress);
      return;
    }
    const validationStatus = ethers.isAddress(susAddress);
    setNftTransferAddressRight(validationStatus);
    if (validationStatus) {
      if (nftTransferAddressInputRef.current) {
        nftTransferAddressInputRef.current.blur();
      }
    }
    if (validationStatus && !susAddress.startsWith("0x")) {
      setNftTransferAddress(`0x${susAddress}`);
      return;
    }
    setNftTransferAddress(susAddress);
  };
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
            {postInformation.senderUsername !== currentUserState.username
              ? `${postInformation.senderUsername}'s NFT`
              : postInformation.nftStatus.minted
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
                    gap="3"
                  >
                    <Image
                      width="50%"
                      src={nftMetadaData?.image}
                      borderRadius="5"
                    />

                    <Flex
                      id="nft-data"
                      gap={0.5}
                      overflow="scroll"
                      direction="column"
                    >
                      <Flex id="nft-title-data" align="center" gap={1}>
                        <Icon as={RxText} fontSize="13pt" color="white" />
                        <Text color="gray.300" fontSize="13pt">
                          {nftMetadaData?.name}
                        </Text>
                      </Flex>
                      <Flex id="nft-description-data" align="center" gap={1}>
                        <Icon
                          as={GrTextAlignFull}
                          fontSize="13pt"
                          color="white"
                        />
                        <Text color="gray.300" fontSize="13pt">
                          {nftMetadaData?.description}
                        </Text>
                      </Flex>
                      <Flex id="nft-like-data" align="center" gap={1}>
                        <Icon as={AiFillHeart} fontSize="13pt" color="white" />
                        <Text color="gray.300" fontSize="13pt">
                          {nftMetadataLikeCommentCount.likeCount}
                        </Text>
                      </Flex>
                      <Flex id="nft-comment-data" align="center" gap={1}>
                        <Icon
                          as={AiOutlineComment}
                          fontSize="13pt"
                          color="white"
                        />
                        <Text color="gray.300" fontSize="13pt">
                          {nftMetadataLikeCommentCount.commentCount}
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
                          {postInformation.senderUsername ===
                          currentUserState.username
                            ? "Your"
                            : "This"}{" "}
                          NFT is not up to date.
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
                          hidden={
                            currentUserState.username !==
                            postInformation.senderUsername
                          }
                        >
                          Update NFT
                        </Button>
                      </Flex>
                    ) : (
                      <>
                        <Text color="white" fontSize="9pt">
                          {postInformation.senderUsername ===
                          currentUserState.username
                            ? "Your"
                            : "This"}{" "}
                          NFT is up to date.
                        </Text>
                      </>
                    )}
                  </Flex>
                  <Flex id="nft-transfer-area" direction="column">
                    <Text color="white" fontSize="15pt" as="b">
                      Transfer Status
                    </Text>
                    {postInformation.nftStatus.transferred ? (
                      <Text color="white" fontSize="9pt">
                        {postInformation.senderUsername ===
                        currentUserState.username
                          ? "Your"
                          : "This"}{" "}
                        NFT is transferred.
                      </Text>
                    ) : (
                      <Flex
                        id="transfer-required-area"
                        direction="column"
                        gap={2}
                      >
                        <Text color="red" fontSize="9pt">
                          {postInformation.senderUsername ===
                          currentUserState.username
                            ? "Your"
                            : "This"}
                          NFT is not transferred.
                        </Text>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleNFTransfer();
                          }}
                          style={{
                            marginTop: "1",
                          }}
                          hidden={
                            postInformation.senderUsername !==
                            currentUserState.username
                          }
                        >
                          <InputGroup>
                            <FormControl variant="floating">
                              <Input
                                ref={nftTransferAddressInputRef}
                                required
                                name="nftTransferAddress"
                                placeholder=" "
                                mb={2}
                                pr={"9"}
                                onChange={handleNftTransferAddressChange}
                                value={nftTransferAddress}
                                _hover={{
                                  border: "1px solid",
                                  borderColor: "blue.500",
                                }}
                                textColor="white"
                                bg="black"
                                spellCheck={false}
                                isRequired
                                disabled={nftTransferLoading}
                              />
                              <FormLabel
                                bg="rgba(0,0,0)"
                                textColor="gray.500"
                                fontSize="12pt"
                                my={2}
                              >
                                Transfer Address
                              </FormLabel>
                            </FormControl>
                            <InputRightElement
                              hidden={nftTransferAddress.length === 0}
                            >
                              {!nftTransferAddressRight ? (
                                <Icon
                                  as={BiError}
                                  fontSize="20px"
                                  color="red"
                                />
                              ) : (
                                <Icon
                                  as={AiOutlineCheckCircle}
                                  fontSize="20px"
                                  color="green"
                                />
                              )}
                            </InputRightElement>
                          </InputGroup>
                          <Button
                            width="100%"
                            variant="outline"
                            type="submit"
                            colorScheme="blue"
                            size="sm"
                            isDisabled={!nftTransferAddressRight}
                            isLoading={nftTransferLoading}
                          >
                            Transfer your NFT
                          </Button>
                        </form>
                      </Flex>
                    )}
                  </Flex>
                  <Flex id="nft-market-places-links" direction="column" gap={2}>
                    <Text fontSize="15pt" as="b" color="white">
                      Market Place Links
                    </Text>
                    <Flex
                      gap={1}
                      cursor="pointer"
                      onClick={() => {
                        window.open(
                          `https://testnets.opensea.io/assets/mumbai/${mumbaiContractAddress}/${postInformation.nftStatus.tokenId}`,
                          "blank"
                        );
                      }}
                      maxWidth="150px"
                      overflow="hidden"
                    >
                      <Image
                        src="https://storage.googleapis.com/opensea-static/Logomark/OpenSea-Full-Logo%20(light).png"
                        width="120px"
                      />
                      <Icon as={FiExternalLink} color="white" fontSize="10pt" />
                    </Flex>
                  </Flex>
                  <Flex id="nft-details" direction="column" gap={2}>
                    <Text color="white" fontSize="15pt" as="b">
                      Details
                    </Text>
                    <Flex direction="column">
                      <Flex id="nft-owner-data" align="center" gap={1}>
                        <Icon
                          as={FaRegUserCircle}
                          fontSize="11pt"
                          color="white"
                        />
                        <Text color="white" fontSize="11pt">
                          {postInformation.nftStatus.transferred
                            ? `${postInformation.nftStatus.transferredAddress.slice(
                                0,
                                3
                              )}...${postInformation.nftStatus.transferredAddress.slice(
                                postInformation.nftStatus.transferredAddress
                                  .length - 3,
                                postInformation.nftStatus.transferredAddress
                                  .length
                              )}`
                            : "BlockSocial"}
                        </Text>
                        <Icon
                          as={MdContentCopy}
                          fontSize="11pt"
                          color="blue"
                          cursor="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              postInformation.nftStatus.transferredAddress
                            );
                          }}
                        />
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
                        <Icon
                          as={MdContentCopy}
                          fontSize="11pt"
                          color="blue"
                          cursor="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              postInformation.nftStatus.tokenId.toString()
                            );
                          }}
                        />
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
                        <Icon
                          as={MdContentCopy}
                          fontSize="11pt"
                          color="blue"
                          cursor="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              mumbaiContractAddress
                            );
                          }}
                        />
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
                    </Flex>
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
