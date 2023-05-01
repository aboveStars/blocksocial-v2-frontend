import { PostServerData } from "@/components/types/Post";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";
import AsyncLock from "async-lock";
import { ethers } from "ethers";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore } from "../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId, transferAddress } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  if (!transferAddress || !postDocId) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await verifyToken(authorization as string);
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  let operationFromUsername = "";

  try {
    operationFromUsername = await getDisplayName(decodedToken);
  } catch (error) {
    console.error("Error while getting display name", error);
    return res.status(401).json({ error: "Unautorized" });
  }

  await lock.acquire(`transferNFTAPI-${operationFromUsername}`, async () => {
    let pd: PostServerData;
    try {
      pd = (
        await firestore
          .doc(`users/${operationFromUsername}/posts/${postDocId}`)
          .get()
      ).data() as PostServerData;
    } catch (error) {
      console.error(
        "Error while transferring NFT..(We were on getting post doc.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    if (pd.senderUsername !== operationFromUsername) {
      console.error(
        "Error while transferring nft. (we were checking if user has access to doc)"
      );
      return res.status(401).json({ error: "Unautorized" });
    }

    if (!pd.nftStatus.minted) {
      console.error(
        "Error while transferring nft.(We are checking if NFT minted)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }

    if (pd.nftStatus.transferred) {
      console.error(
        "Error while transferring nft.(We are checking if NFT transferred)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }

    const transferAddressValidationStatus = ethers.isAddress(transferAddress);
    if (!transferAddressValidationStatus) {
      console.error(
        "Error while transferring nft.(We were checking if address is valid or not)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }

    try {
      const tx = await blockSocialSmartContract.approve(
        mumbaiContractAddress,
        pd.nftStatus.tokenId
      );
      const r = await tx.wait(1);
      if (!r) {
        throw new Error("Receipt null error.");
      }
    } catch (error) {
      console.error(
        "Error while transferring nft. (We were approving NFT)",
        error
      );
      return res.status(503).json({ error: "BlockChain error" });
    }

    try {
      const nftMintTx = await blockSocialSmartContract.safeTransferFrom(
        process.env.NEXT_PUBLIC_OWNER_PUBLIC_ADDRESS,
        transferAddress,
        pd.nftStatus.tokenId
      );
      const txReceipt = await nftMintTx.wait(1);

      if (!txReceipt) {
        throw new Error("Receipt null error");
      }
    } catch (error) {
      console.error(
        "Error while transferring nft. (We were transferring NFT)",
        error
      );
      return res.status(503).json({ error: "BlockChain error" });
    }

    try {
      await firestore
        .doc(`users/${operationFromUsername}/posts/${postDocId}`)
        .update({
          nftStatus: {
            ...pd.nftStatus,
            transferred: true,
            transferredAddress: transferAddress,
          },
        });
    } catch (error) {
      console.error(
        "Error while transferring nft. (We were updating post doc.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
    return res.status(200).json({});
  });
}

/**
 * @param authorization
 * @returns
 */
async function verifyToken(authorization: string) {
  const idToken = authorization.split("Bearer ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  return decodedToken;
}

/**
 * @param decodedToken
 */
async function getDisplayName(decodedToken: DecodedIdToken) {
  const uid = decodedToken.uid;
  const displayName = (await auth.getUser(uid)).displayName;
  return displayName as string;
}
