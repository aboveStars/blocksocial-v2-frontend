import * as admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

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

    let likerUsername = displayName;

    if (req.method === "POST") {
      const { opCode, postDocPath } = req.body;
      if (!opCode || !postDocPath || !likerUsername) {
        throw new Error("Missing Prop");
      }

      await firestore.doc(postDocPath).update({
        likeCount: admin.firestore.FieldValue.increment(opCode as number),
      });
      await firestore.doc(postDocPath).update({
        whoLiked:
          opCode === 1
            ? admin.firestore.FieldValue.arrayUnion(likerUsername)
            : admin.firestore.FieldValue.arrayRemove(likerUsername),
      });

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while like operation", error);
    res.status(401).json({ error: error });
  }
}
