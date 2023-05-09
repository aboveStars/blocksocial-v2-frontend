import getDisplayName from "@/apiUtils";
import { NFTMetadata } from "@/components/types/NFT";
import { PostServerData } from "@/components/types/Post";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";
import { bucket, firestore } from "../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!operationFromUsername || !postDocId) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`refreshNFTAPI-${operationFromUsername}`, async () => {
    let oldMetadata: NFTMetadata;
    try {
      const oldMetadataFile = bucket.file(
        `users/${operationFromUsername}/postsFiles/${postDocId}/nftMetadata`
      );

      oldMetadata = JSON.parse(
        (await oldMetadataFile.download())[0].toString("utf-8")
      );
    } catch (error) {
      console.error(
        "Error while refreshingNFT.(We were on downloading old metadata.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    let pd: PostServerData;

    try {
      pd = (
        await firestore
          .doc(`users/${operationFromUsername}/posts/${postDocId}`)
          .get()
      ).data() as PostServerData;
    } catch (error) {
      console.error(
        "Error while refreshingNFT.(We were on getting new comment and like count.))",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    if (!pd) {
      console.error(
        "Error while refreshingNFT.(We were checking if postDocExist. It is not null)"
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    if (pd.senderUsername !== operationFromUsername) {
      console.error(
        "Error while refreshing nft. (we were checking if user has access to doc)"
      );
      return res.status(401).json({ error: "Unautorized" });
    }

    if (!pd.nftStatus.minted) {
      console.error(
        "Error while refreshing nft.(We are checking if NFT minted)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }

    oldMetadata.attributes.find((a) => a.trait_type === "Likes")!.value =
      pd.likeCount;

    oldMetadata.attributes.find((a) => a.trait_type === "Comments")!.value =
      pd.commentCount;

    const refreshedMetadata = oldMetadata;

    const buffer = Buffer.from(JSON.stringify(refreshedMetadata));

    const refreshedMetadataFile = bucket.file(
      `users/${operationFromUsername}/postsFiles/${postDocId}/nftMetadata`
    );

    try {
      await refreshedMetadataFile.save(buffer, {
        metadata: {
          contentType: "application/json",
        },
      });
      await refreshedMetadataFile.setMetadata({
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
      await refreshedMetadataFile.makePublic();
    } catch (error) {
      console.error(
        "Error while refreshingNFT.(We were making new metadata public.)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }
    return res.status(200).json({});
  });
}
