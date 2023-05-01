import { currentUserStateAtom } from "@/components/atoms/currentUserAtom";
import { headerAtViewAtom } from "@/components/atoms/headerAtViewAtom";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function useNFT() {
  const [creatingNFTLoading, setCreatingNFTLoading] = useState(false);

  const [nftCreated, setNftCreated] = useState(false);

  const [nftRefreshLoading, setNftRefreshLoading] = useState(false);

  const [headerAtView, setHeaderAtView] = useRecoilState(headerAtViewAtom);
  const currentUserState = useRecoilValue(currentUserStateAtom);

  const router = useRouter();

  /**
   * @param name
   * @param description
   * @param postDocId
   * @returns
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

    if (router.asPath.includes(currentUserState.username)) {
      setHeaderAtView((prev) => ({ ...prev, nftCount: prev.nftCount + 1 }));
    }

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
