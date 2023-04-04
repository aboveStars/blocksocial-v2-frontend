import { NFTMetadata } from "@/components/types/NFT";
import { SendNftStatus } from "@/components/types/Post";
import { fakeWaiting } from "@/components/utils/FakeWaiting";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { storage } from "@/firebase/clientApp";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import safeJsonStringify from "safe-json-stringify";

export default function useSmartContractTransactions() {
  const [sendNftStatus, setSendNftStatus] = useState<SendNftStatus>("initial");

  const [metadataUploaded, setMetadataUploaded] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [postUpdated, setPostUpdated] = useState(false);

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
    image: string
  ) => {
    // Create metadata
    console.log("Creating Metadata");
    const metadata: NFTMetadata = {
      name: name,
      description: description,
      external_url: [
        {
          name: senderUsername,
          url: `https://blocksocial.vercel.app/users/${senderUsername}`,
        },
      ],
      image: image,
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

    try {
      console.log("Requested NFT Minting");

      const nftMintTx = await blockSocialSmartContract.mint(metadataLink);

      setRequestSent(true);

      setSendNftStatus("waitingForConfirmation");

      console.log("Waiting For Confirmations");

      await nftMintTx.wait(3);

      setConfirmed(true);
    } catch (error) {
      console.log("Error at NFT Minting process", error);
    }

    console.log("We are good to goooooooo!");

    // update post
    setSendNftStatus("updatingPost");
    await fakeWaiting(2);
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
  };
}
