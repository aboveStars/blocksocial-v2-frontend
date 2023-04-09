import { useState } from "react";

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
    console.log("Creating NFT Started ");
    setCreatingNFTLoading(true);

    const response = await fetch("/api/createNFT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name ? name : `${senderUsername}'s NFT`,
        description: description,
        username: senderUsername,
        image: image,
        postDocId: postDocId,
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

  /**
   *
   * @param senderUsername
   * @param postDocId
   */
  const refreshNFT = async (senderUsername: string, postDocId: string) => {
    setNftRefreshLoading(true);
    const response = await fetch("/api/refreshNFT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: senderUsername,
        postDocId: postDocId,
      }),
    });
    if (!response.ok) {
      if (response.status === 500) {
        const { firebaseError } = await response.json();
        console.log("Firebase Error", firebaseError);
      } else {
        const { error } = await response.json();
        console.log("Non-Firebase Error", error);
      }
    } else {
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
