import { SendNftStatus } from "@/components/types/Post";
import { useState } from "react";

export default function useSmartContractTransactions() {
  const [creatingNFTLoading, setCreatingNFTLoading] = useState(false);

  const [openSeaLink, setOpenSeaLink] = useState("");

  const [nftCreated, setNftCreated] = useState(false);

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
    creationTime: number,
    likeCount: number,
    commentCount: number
  ) => {
    console.log("Creating NFT Started ");
    setCreatingNFTLoading(true);

    const response = await fetch("/api/createNFT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
        username: senderUsername,
        image: image,
        postDocPath: postDocPath,
        creationTime: creationTime,
        likeCount: likeCount,
        commentCount: commentCount,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error("Error while creating NFT", error);
      setCreatingNFTLoading(false);
    } else {
      const { openSeaUrl } = await response.json();
      console.log(openSeaUrl);
      setOpenSeaLink(openSeaUrl as string);

      setCreatingNFTLoading(false);

      console.log("NFT Created Successfully");

      setNftCreated(true);
    }
  };

  return {
    mintNft,
    creatingNFTLoading,
    openSeaLink,
    setOpenSeaLink,
    nftCreated,
    setNftCreated,
  };
}
