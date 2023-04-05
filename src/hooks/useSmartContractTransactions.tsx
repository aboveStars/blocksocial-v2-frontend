import { NFTMetadata } from "@/components/types/NFT";
import { SendNftStatus } from "@/components/types/Post";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import { firestore, storage } from "@/firebase/clientApp";
import { TransactionReceipt } from "ethers";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import safeJsonStringify from "safe-json-stringify";

export default function useSmartContractTransactions() {
  const [sendNftStatus, setSendNftStatus] = useState<SendNftStatus>("initial");

  const [metadataUploaded, setMetadataUploaded] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [postUpdated, setPostUpdated] = useState(false);

  const [openSeaLink, setOpenSeaLink] = useState("");

  /**
   *
   * @param name
   * @param description
   * @param senderUsername
   * @param image
   * @returns tokenId of created NFT
   */
  const mintNft = async (
    name: string,
    description: string,
    senderUsername: string,
    image: string,
    postDocPath: string,
    creationTime: Timestamp,
    likeCount: number,
    commentCount: number
  ) => {
    // Create metadata
    console.log("Creating Metadata");
    const metadata: NFTMetadata = {
      name: name,
      description: description,

      image: image,
      attributes: [
        {
          display_type: "date",
          trait_type: "Post Creation",
          value: creationTime.seconds,
        },
        {
          display_type: "date",
          trait_type: "NFT Creation",
          value: Date.now(),
        },
        {
          trait_type: "LIKES",
          value: likeCount,
        },
        {
          trait_type: "COMMENTS",
          value: commentCount,
        },
        {
          trait_type: "SENDER",
          value: senderUsername,
        },
      ],
    };
    console.log("Metadata Created", metadata);
    // upload metadata to storage
    const safeMetadata = safeJsonStringify(metadata);
    const metadataBlob = new Blob([safeMetadata], { type: "application/json" });

    // filename will be defined as different
    const fileName = Date.now().toString();
    const storageRef = ref(
      storage,
      `users/${senderUsername}/nftMetadatas/${fileName}`
    );

    setSendNftStatus("uploadingMetadata");

    console.log("Uploading Metadata");
    try {
      await uploadBytes(storageRef, metadataBlob);
    } catch (error) {
      console.log("Error while uploading nft-metadata", error);
    }

    console.log("Metadata Uploaded");

    console.log("Creating Metadata Link");
    // genereate download link
    let metadataLink: string = "";
    try {
      metadataLink = await getDownloadURL(storageRef);
      setMetadataUploaded(true);
    } catch (error) {
      console.log("Error while creating download url", error);
    }

    console.log("Metadata Link created", metadataLink);

    setSendNftStatus("sendingRequest");

    // mint nft to downlaod link as uri
    if (!!!metadataLink) {
      console.log("metadata link has problem, aborting minting");
      return;
    }

    console.log("Minting Nft");

    let txReceipt: TransactionReceipt | null = null;
    try {
      console.log("Requested NFT Minting");

      const nftMintTx = await blockSocialSmartContract.mint(metadataLink);

      setRequestSent(true);

      setSendNftStatus("waitingForConfirmation");

      console.log("Waiting For Confirmations");

      txReceipt = await nftMintTx.wait(3);

      setConfirmed(true);
    } catch (error) {
      console.log("Error at NFT Minting process", error);
    }

    if (txReceipt === null) {
      console.log("Error at tx receipt, it is null, aborting....");
      return;
    }

    // update post

    // get tokenId from this nft

    const tokenId = parseInt(txReceipt.logs[1].topics[2], 16);
    console.log(tokenId);

    // make url of nft to opensea

    const openSeaLinkCreated = `https://testnets.opensea.io/assets/mumbai/${mumbaiContractAddress}/${tokenId}`;
    setOpenSeaLink(openSeaLinkCreated);

    // update post data at server

    setSendNftStatus("updatingPost");

    console.log("Post Path: ", postDocPath);

    const postDocRef = doc(firestore, postDocPath);

    try {
      await updateDoc(postDocRef, {
        nftUrl: openSeaLinkCreated,
      });
    } catch (error) {
      console.error("Error while updating post", error);
    }

    setPostUpdated(true);
    setSendNftStatus("final");
  };

  return {
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
  };
}
