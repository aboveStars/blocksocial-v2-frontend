import type { NextApiRequest, NextApiResponse } from "next";

import { UserInformation } from "@/components/types/User";
import * as admin from "firebase-admin";
const serviceAccount = require(process.env
  .NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS as string);
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
  if (req.method === "POST") {
    const { email, fullname, username, password } = req.body;

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org)$/i;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "BadEmail" });
      return;
    }
    const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
    if (!fullnameRegex.test(fullname)) {
      res.status(400).json({ error: "BadFullname" });
      return;
    }
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({ error: "BadUsername" });
      return;
    }
    const susUsernameSnapshot = await firestore
      .doc(`usernames/${username}`)
      .get();

    const isTaken = susUsernameSnapshot.exists;

    if (isTaken) {
      res.status(400).json({ error: "TakenUsername" });
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ error: "BadPassword" });
      return;
    }

    try {
      // Create User
      const { uid } = await authentication.createUser({
        email: email,
        password: password,
        displayName: username,
      });

      const batch = firestore.batch();

      // Add usrname to usernames
      batch.set(firestore.doc(`usernames/${username}`), {});
      // Add user to firestore
      const newUserData: UserInformation = {
        username: username,
        fullname: fullname,
        profilePhoto: "",

        followingCount: 0,
        followings: [],

        followerCount: 0,
        followers: [],

        email: email || "", // Users also authenticate with something else than email
        uid: uid,
      };
      batch.set(firestore.doc(`users/${username}`), newUserData);

      // commit changes
      await batch.commit();

      res.status(200).json(newUserData);
    } catch (error) {
      console.error(error);

      res.status(500).json({ firebaseError: error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
