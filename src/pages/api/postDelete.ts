import { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";

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
const bucket = admin
  .storage()
  .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID as string);

const auth = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const displayName = (await auth.getUser(uid)).displayName;

    let deleteRequestSender: string = "";

    if (!displayName) {
      // old user means, user who signed-up before update.

      console.log("Updating user");

      const oldUserUsername = (
        await firestore.collection("users").where("uid", "==", uid).get()
      ).docs[0].id;

      await auth.updateUser(uid, {
        displayName: oldUserUsername,
      });

      deleteRequestSender = oldUserUsername;
    } else {
      console.log("User already updated");
      deleteRequestSender = displayName;
    }

    if (req.method === "DELETE") {
      const { postDocPath } = req.body;

      if (!postDocPath) {
        res.status(405).json({ error: "Missing Prop" });
        console.error("Missing Prop");
        return;
      }

      const ps = await firestore.doc(postDocPath).get();
      const data = ps.data();

      if (data && data.senderUsername !== deleteRequestSender) {
        throw new Error("Only owner can delete its post");
      }

      if (data && data.nftUrl) {
        const metadataPath = `users/${postDocPath.split("/")[1]}/nftMetadatas/${
          postDocPath.split("/")[3]
        }`;

        const oldNftMetadataFile = bucket.file(metadataPath);
        await oldNftMetadataFile.delete();
      }

      await firestore.doc(postDocPath).delete();

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while deleting post", error);
    res.status(401).json({ error: error });
  }
}
