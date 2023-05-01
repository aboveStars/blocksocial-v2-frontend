import { NFTMetadata } from "@/components/types/NFT";
import { PostItemData } from "@/components/types/Post";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import { auth, firestore } from "@/firebase/clientApp";
import { TransactionReceipt } from "ethers";
import { doc, increment, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function useNFT() {
  const [creatingNFTLoading, setCreatingNFTLoading] = useState(false);

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

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      setCreatingNFTLoading(false);
      return console.error(
        "Error while post deleting. Couln't be got idToken",
        error
      );
    }

    let response;
    try {
      response = await fetch("/api/uploadNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocId: postDocId,
          name: name,
          description: description,
        }),
      });
    } catch (error) {
      setCreatingNFTLoading(false);
      return console.error(
        "Error while uploading nft. (We were fetching to 'uploadNFT API'",
        error
      );
    }

    if (!response.ok) {
      setCreatingNFTLoading(false);
      return console.error(
        "Error while uploading nft. Error came from 'uploadNFT' API:",
        await response.json()
      );
    }

    setCreatingNFTLoading(false);
    setNftCreated(true);

    return await response.json();
  };

  /**
   * @param postDocId
   */
  const refreshNFT = async (postDocId: string) => {
    setNftRefreshLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      setNftRefreshLoading(false);
      return console.error(
        "Error while post deleting. Couln't be got idToken",
        error
      );
    }

    let response: Response;
    try {
      response = await fetch("/api/refreshNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocId: postDocId,
        }),
      });
    } catch (error) {
      setNftRefreshLoading(false);
      return console.error("Error while fetching 'refreshNFT' API", error);
    }

    if (!response.ok) {
      setNftRefreshLoading(false);
      return console.error(
        "Error while refreshingNFT from 'resfreshNFT' API",
        await response.json()
      );
    }

    setNftRefreshLoading(false);
  };

  return {
    mintNft,
    creatingNFTLoading,
    nftCreated,
    setNftCreated,
    refreshNFT,
    nftRefreshLoading,
  };
}
