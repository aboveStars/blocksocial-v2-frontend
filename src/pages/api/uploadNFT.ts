import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, bucket } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { postDocId, metadata } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
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

  return res.status(200).json({
    metadataLink: newMetadataFile.publicUrl(),
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
