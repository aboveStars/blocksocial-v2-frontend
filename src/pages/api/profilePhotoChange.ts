import getDisplayName from "@/apiUtils";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";
import { bucket, firestore } from "../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { image: imageDataURL } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  await lock.acquire(
    `profilePhotoChangeAPI-${operationFromUsername}`,
    async () => {
      if (req.method === "DELETE") {
        try {
          await firestore
            .doc(`users/${operationFromUsername}`)
            .update({ profilePhoto: "" });
        } catch (error) {
          console.error("Error while deleting profilePhoto.");
          return res.status(503).json({ error: "Firebase error" });
        }

        return res.status(200).json({});
      } else if (req.method === "POST") {
        if (!imageDataURL)
          return res.status(422).json({ error: "Invalid prop or props" });

        const file = bucket.file(`users/${operationFromUsername}/profilePhoto`);
        const buffer = Buffer.from(imageDataURL.split(",")[1], "base64");

        try {
          await file.save(buffer, {
            metadata: {
              contentType: "image/jpeg",
            },
          });
          await file.setMetadata({
            cacheControl: "public, max-age=1",
          });
        } catch (error) {
          console.error(
            "Error while updating profile photo. (We are on 'file saving'.)",
            error
          );
          return res.status(503).json({ error: "Firebase error" });
        }

        try {
          await file.makePublic();
        } catch (error) {
          console.error(
            "Error while updating profile photo.(We are on 'making file public')"
          );
          return res.status(503).json({ error: "Firebase error" });
        }

        let publicURL = "";
        try {
          publicURL = file.publicUrl();
          await firestore.doc(`users/${operationFromUsername}`).update({
            profilePhoto: publicURL,
          });
        } catch (error) {
          console.error(
            "Error while updating post.(Process were on updating doc.)",
            error
          );
          return res.status(503).json({ error: "Firebase error" });
        }

        return res.status(200).json({
          newProfilePhotoURL: publicURL,
        });
      } else {
        return res.status(405).json({ error: "Method not allowed" });
      }
    }
  );
}
