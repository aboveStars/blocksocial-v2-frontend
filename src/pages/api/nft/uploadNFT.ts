import getDisplayName from "@/apiUtils";
import { NFTMetadata } from "@/components/types/NFT";
import { PostServerData } from "@/components/types/Post";

import AsyncLock from "async-lock";
import { TransactionReceipt } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { bucket, fieldValue, firestore } from "../../../firebase/adminApp";
import { apidonNFT, apidonNFTMumbaiContractAddress } from "@/web3/NFT/ApidonNFTApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId, name, description } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  await lock.acquire(`uploadNFTAPI-${operationFromUsername}`, async () => {
    let postDocData;
    try {
      postDocData = (
        await firestore
          .doc(`users/${operationFromUsername}/posts/${postDocId}`)
          .get()
      ).data();

      if (!postDocData) throw new Error("postDoc is null");
    } catch (error) {
      console.error(
        "Error while uploading NFT. (We were getting postDocData)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    // check if we already minted or not

    if (postDocData.nftStatus.minted) {
      console.error("Error while uploading NFT. (Detected already minted.)");
      return res.status(422).json({ error: "Invalid prop or props" });
    }

    const metadata: NFTMetadata = {
      name: name,
      description: description,

      image: postDocData.image,
      attributes: [
        {
          display_type: "date",
          trait_type: "Post Creation",
          value: postDocData.creationTime,
        },
        {
          display_type: "date",
          trait_type: "NFT Creation",
          value: Date.now(),
        },
        {
          trait_type: "Likes",
          value: postDocData.likeCount,
        },
        {
          trait_type: "Comments",
          value: postDocData.commentCount,
        },
        {
          trait_type: "SENDER",
          value: operationFromUsername,
        },
      ],
    };

    const buffer = Buffer.from(JSON.stringify(metadata));

    const newMetadataFile = bucket.file(
      `users/${operationFromUsername}/postsFiles/${postDocId}/nftMetadata`
    );

    try {
      await newMetadataFile.save(buffer, {
        metadata: {
          contentType: "application/json",
        },
      });
      await newMetadataFile.setMetadata({
        cacheControl: "public, max-age=1",
      });
    } catch (error) {
      console.error(
        "Error while refreshingNFT.(We were on saving new metadata).",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
    try {
      await newMetadataFile.makePublic();
    } catch (error) {
      console.error(
        "Error while refreshingNFT.(We were making new metadata public.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    const newMetadataFilePublicURL = newMetadataFile.publicUrl();

    let txReceipt: TransactionReceipt | null = null;
    let nftMintTx;
    try {
      nftMintTx = await apidonNFT.mint(newMetadataFilePublicURL);
    } catch (error) {
      console.error(
        "Error while uploading NFT. (We started to mint process.)",
        error
      );
      return res.status(503).json({ error: "Blockchain error" });
    }

    try {
      txReceipt = await nftMintTx.wait(1);
    } catch (error) {
      console.error(
        "Error while uploading NFT.(We were verifying transaction.)",
        error
      );
      return res.status(503).json({ error: "Blockchain error" });
    }

    if (!txReceipt) {
      console.error("Error while uploading NFT. (TX is null)", txReceipt);
      return res.status(503).json({ error: "Blockchain error" });
    }
    const tokenId = parseInt(txReceipt.logs[1].topics[2], 16);
    const openSeaLinkCreated = `https://testnets.opensea.io/assets/mumbai/${apidonNFTMumbaiContractAddress}/${tokenId}`;

    try {
      await firestore.doc(`users/${operationFromUsername}`).update({
        nftCount: fieldValue.increment(1),
      });
    } catch (error) {
      console.error(
        "Error while uploading NFT. (We are updating NFT Count of user.",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    const resultNFTStatus: PostServerData["nftStatus"] = {
      minted: true,
      metadataLink: newMetadataFilePublicURL,
      mintTime: Date.now(),
      name: metadata.name,
      description: metadata.description,
      tokenId: tokenId,
      contractAddress: apidonNFTMumbaiContractAddress,
      openseaUrl: openSeaLinkCreated,
      transferred: false,
      transferredAddress: "",
    };

    try {
      await firestore
        .doc(`users/${operationFromUsername}/posts/${postDocId}`)
        .update({
          nftStatus: {
            ...resultNFTStatus,
          },
        });
    } catch (error) {
      console.error("Error uploading NFT. (We were updating post doc.", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    return res.status(200).json(resultNFTStatus);
  });
}
