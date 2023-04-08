import { NextApiRequest, NextApiResponse } from "next";

import * as admin from "firebase-admin";
import { NFTMetadata } from "@/components/types/NFT";
import safeJsonStringify from "safe-json-stringify";
import { blockSocialSmartContract } from "@/ethers/clientApp";
import { mumbaiContractAddress } from "@/ethers/ContractAddresses";

const buffer = Buffer.from(
  process.env.NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS_BASE64 as string,
  "base64"
);

const decryptedService = buffer.toString("utf-8");
const decryptedServiceJson = JSON.parse(decryptedService);

const serviceAccount = decryptedServiceJson;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
const bukcet = admin
  .storage()
  .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      name,
      description,
      username,
      image: imagePublicURL,
      postDocPath,
      creationTime,
      likeCount,
      commentCount,
    } = req.body;

    try {
      const metadata: NFTMetadata = {
        name: name,
        description: description,

        image: imagePublicURL,
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
            trait_type: "LIKES",
            value: likeCount,
          },
          {
            trait_type: "COMMENTS",
            value: commentCount,
          },
          {
            trait_type: "SENDER",
            value: username,
          },
        ],
      };

      const safeMetadata = safeJsonStringify(metadata);
      const buffer = Buffer.from(safeMetadata);

      const file = bukcet.file(
        `users/${username}/nftMetadatas/${Date.now().toString()}`
      );

      await file.save(buffer, {
        contentType: "application/json",
      });

      await file.makePublic();

      const metadataPublicURL = file.publicUrl();

      const nftMintTx = await blockSocialSmartContract.mint(metadataPublicURL);
      const txReceipt = await nftMintTx.wait(1);

      const tokenId = parseInt(txReceipt.logs[1].topics[2], 16);

      const openSeaLink = `https://testnets.opensea.io/assets/mumbai/${mumbaiContractAddress}/${tokenId}`;

      await firestore.doc(postDocPath).update({
        nftUrl: openSeaLink,
      });
      res.status(200).json({ openSeaUrl: openSeaLink });
    } catch (error) {
      console.error("Error while creating NFT");
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
