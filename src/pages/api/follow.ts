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

    let operationFromUsername: string = "";

    if (!displayName) {
      // old user means, user who signed-up before update.

      const oldUserUsername = (
        await firestore.collection("users").where("uid", "==", uid).get()
      ).docs[0].id;

      await auth.updateUser(uid, {
        displayName: oldUserUsername,
      });

      operationFromUsername = oldUserUsername;
    } else {
      operationFromUsername = displayName;
    }

    if (req.method === "POST") {
      const { operationTo: operationToUsername, opCode } = req.body;

      if (!operationFromUsername || !operationToUsername) {
        res.status(405).json({ error: "Missing Prop" });
        console.error("Missing Prop");
        return;
      }

      try {
        await firestore.doc(`users/${operationFromUsername}`).update({
          followingCount: admin.firestore.FieldValue.increment(opCode),
          followings:
            opCode === 1
              ? admin.firestore.FieldValue.arrayUnion(operationToUsername)
              : admin.firestore.FieldValue.arrayRemove(operationToUsername),
        });

        await firestore.doc(`users/${operationToUsername}`).update({
          followerCount: admin.firestore.FieldValue.increment(opCode),
          followers:
            opCode === 1
              ? admin.firestore.FieldValue.arrayUnion(operationFromUsername)
              : admin.firestore.FieldValue.arrayRemove(operationFromUsername),
        });
        res.status(200).json({});
      } catch (error) {
        console.error("Firebase Error while follow process", error);
        res.status(500).json({ firebaseError: error });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
