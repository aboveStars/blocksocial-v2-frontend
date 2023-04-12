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
      const { commentDocPath, postDocPath } = req.body;

      if (!commentDocPath || !postDocPath) {
        throw new Error("Missing Prop");
      }

      const ss = await firestore.doc(commentDocPath).get();
      if (!ss.exists) {
        throw new Error("Could't be accessed the comment, comment not exists");
      }

      if (ss.data()?.commentSenderUsername !== deleteRequestSender) {
        throw new Error("Not-Owner of the comment");
      }

      await firestore.doc(commentDocPath).delete();
      await firestore.doc(postDocPath).update({
        commentCount: admin.firestore.FieldValue.increment(-1),
      });

      res.status(200).json({});
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error while deleting comment", error);
    res.status(401).json({ error: error });
  }
}
