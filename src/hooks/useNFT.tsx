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
          value: Date.now() / 1000,
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
          metadata: metadata,
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

    const metadataLink = (await response.json()).metadataLink;

    let txReceipt: TransactionReceipt | null = null;

    const nftMintTx = await blockSocialSmartContract.mint(metadataLink);

    txReceipt = await nftMintTx.wait(1);

    if (!txReceipt) {
      return console.error("txReceipt is null", txReceipt);
    }
    const tokenId = parseInt(txReceipt.logs[1].topics[2], 16);

    const openSeaLinkCreated = `https://testnets.opensea.io/assets/mumbai/${mumbaiContractAddress}/${tokenId}`;

    try {
      await updateDoc(doc(firestore, `users/${senderUsername}`), {
        nftCount: increment(1),
      });

      await updateDoc(
        doc(firestore, `users/${senderUsername}/posts/${postDocId}`),
        {
          nftStatus: {
            minted: true,
            metadataLink: metadataLink,
            mintTime: Date.now(),
            title: name,
            description: description,
            tokenId: tokenId,
            contractAddress: mumbaiContractAddress,
            openseaUrl: openSeaLinkCreated,
            transferred: false,
            transferredAddress: "",
          },
        }
      );
    } catch (error) {
      setCreatingNFTLoading(false);
      return console.error(
        "Error while creating nft. (We were upadating docs at firestore.",
        error
      );
    }

    setCreatingNFTLoading(false);
    setNftCreated(true);

    const nftMintResult: PostItemData["nftStatus"] = {
      minted: true,
      metadataLink: metadataLink,
      mintTime: Date.now(),

      tokenId: tokenId,
      contractAddress: mumbaiContractAddress,
      openseaUrl: openSeaLinkCreated,
      transferred: false,
      transferredAddress: "",
    };

    return nftMintResult;
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
