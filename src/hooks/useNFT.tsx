import { NFTMetadata } from "@/components/types/NFT";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import { auth, firestore, storage } from "@/firebase/clientApp";
import { TransactionReceipt } from "ethers";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import safeJsonStringify from "safe-json-stringify";

export default function useNFT() {
  const [creatingNFTLoading, setCreatingNFTLoading] = useState(false);

  const [openSeaLink, setOpenSeaLink] = useState("");

  const [nftCreated, setNftCreated] = useState(false);

  const [nftRefreshLoading, setNftRefreshLoading] = useState(false);

  /**
   *
   * @param name
   * @param description
   * @param senderUsername
   * @param image
   * @param postDocId
   * @param creationTime
   * @param likeCount
   * @param commentCount
   */
  const mintNft = async (
    name: string,
    description: string,
    senderUsername: string,
    image: string,
    postDocId: string,
    creationTime: number,
    likeCount: number,
    commentCount: number
  ) => {
    setNftCreated(false);
    setCreatingNFTLoading(true);
    const metadata: NFTMetadata = {
      name: name,
      description: description,

      image: image,
      attributes: [
        {
          display_type: "date",
          trait_type: "Post Creation",
          value: creationTime / 1000,
        },
        {
          display_type: "date",
          trait_type: "NFT Creation",
          value: Date.now(),
        },
        {
          trait_type: "Likes",
          value: likeCount,
        },
        {
          trait_type: "Comments",
          value: commentCount,
        },
        {
          trait_type: "SENDER",
          value: senderUsername,
        },
      ],
    };

    const safeMetadata = safeJsonStringify(metadata);
    const metadataBlob = new Blob([safeMetadata], { type: "application/json" });

    const fileName = postDocId;

    try {
      const storageRef = ref(
        storage,
        `users/${senderUsername}/nftMetadatas/${fileName}`
      );

      await uploadBytes(storageRef, metadataBlob);

      let metadataLink: string = "";

      metadataLink = await getDownloadURL(storageRef);

      if (!metadataLink) {
        throw new Error("Metadata Link is empty");
      }

      let txReceipt: TransactionReceipt | null = null;

      const nftMintTx = await blockSocialSmartContract.mint(metadataLink);

      txReceipt = await nftMintTx.wait(1);

      if (!txReceipt) {
        throw new Error("Tx Receipt is null");
      }
      const tokenId = parseInt(txReceipt.logs[1].topics[2], 16);

      const openSeaLinkCreated = `https://testnets.opensea.io/assets/mumbai/${mumbaiContractAddress}/${tokenId}`;
      setOpenSeaLink(openSeaLinkCreated);

      const postDocRef = doc(
        firestore,
        `users/${senderUsername}/posts/${postDocId}`
      );

      await updateDoc(postDocRef, {
        nftUrl: openSeaLinkCreated,
      });

      setCreatingNFTLoading(false);
      setNftCreated(true);
    } catch (error) {
      console.error("Error while creating NFT:", error);
      setCreatingNFTLoading(false);
    }
  };

  /**
   * @param postDocId
   */
  const refreshNFT = async (postDocId: string) => {
    setNftRefreshLoading(true);

    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Id Token couldn't be get");
      }

      const response = await fetch("/api/refreshNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocId: postDocId,
        }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      setNftRefreshLoading(true);
    } catch (error) {
      console.error("Error while refreshingNFT", error);
      setNftRefreshLoading(false);
    }
  };

  return {
    mintNft,
    creatingNFTLoading,
    openSeaLink,
    setOpenSeaLink,
    nftCreated,
    setNftCreated,
    refreshNFT,
    nftRefreshLoading,
  };
}
