import type { NextApiRequest, NextApiResponse } from "next";

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
const authentication = admin.auth();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const idToken = authorization.split("Bearer ")[1];
      const decodedToken = await authentication.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const username = (
        await firestore.collection("users").where("uid", "==", uid).get()
      ).docs[0].id;

      await authentication.updateUser(uid, {
        displayName: username,
      });

      return res.status(200).json({
        createdDisplayName: username,
      });
    } catch (error) {
      console.error("Error while update operation:", error);
      return res.status(401).json({ error: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
