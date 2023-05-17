import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { headerAtViewAtom } from "@/components/atoms/headerAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function useNFT() {
  const [creatingNFTLoading, setCreatingNFTLoading] = useState(false);

  const [nftCreated, setNftCreated] = useState(false);

  const [nftRefreshLoading, setNftRefreshLoading] = useState(false);

  const setHeaderAtView = useSetRecoilState(headerAtViewAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const router = useRouter();

  /**
   * @param name
   * @param description
   * @param postDocId
   * @returns NFT data of newly minted NFT if operation successfull, otherwise false.
   */
  const mintNft = async (
    name: string,
    description: string,
    postDocId: string
  ) => {
    setNftCreated(false);
    setCreatingNFTLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      setCreatingNFTLoading(false);
      console.error("Error while post deleting. Couln't be got idToken", error);
      return false;
    }

    let response;
    try {
      response = await fetch("/api/nft/uploadNFT", {
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
      console.error(
        "Error while uploading nft. (We were fetching to 'uploadNFT API'",
        error
      );
      return false;
    }

    if (!response.ok) {
      setCreatingNFTLoading(false);
      console.error(
        "Error while uploading nft. Error came from 'uploadNFT' API:",
        await response.json()
      );
      return false;
    }

    setCreatingNFTLoading(false);
    setNftCreated(true);

    if (router.asPath.includes(currentUserState.username)) {
      setHeaderAtView((prev) => ({ ...prev, nftCount: prev.nftCount + 1 }));
    }

    return await response.json();
  };

  /**
   * @param postDocId
   * @returns true if operation successfull, otherwise false.
   */
  const refreshNFT = async (postDocId: string) => {
    setNftRefreshLoading(true);

    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      setNftRefreshLoading(false);
      console.error("Error while post deleting. Couln't be got idToken", error);
      return false;
    }

    let response: Response;
    try {
      response = await fetch("/api/nft/refreshNFT", {
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
      console.error("Error while fetching 'refreshNFT' API", error);
      return false;
    }

    if (!response.ok) {
      setNftRefreshLoading(false);
      console.error(
        "Error while refreshingNFT from 'resfreshNFT' API",
        await response.json()
      );
      return false;
    }

    setNftRefreshLoading(false);

    return true;
  };

  /**
   * @param postDocId
   * @param nftTransferAddress
   * @returns true if operation is successfull, otherwise false.s
   */
  const transferNft = async (
    postDocId: string,
    nftTransferAddress: string
  ): Promise<boolean> => {
    let idToken = "";
    try {
      idToken = (await auth.currentUser?.getIdToken()) as string;
    } catch (error) {
      console.error(
        "Error while transferring NFT. Couln't be got idToken",
        error
      );
      return false;
    }

    let response: Response;
    try {
      response = await fetch("/api/nft/transferNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocId: postDocId,
          transferAddress: nftTransferAddress,
        }),
      });
    } catch (error) {
      console.error("Error while fetching 'refreshNFT' API", error);
      return false;
    }

    if (!response.ok) {
      console.error(
        "Error while transferring from 'transferNFT' API",
        await response.json()
      );
      return false;
    }

    return true;
  };

  return {
    mintNft,
    creatingNFTLoading,
    nftCreated,
    setNftCreated,
    refreshNFT,
    nftRefreshLoading,
    transferNft,
  };
}
