import type { NextApiRequest, NextApiResponse } from "next";
import { UserInformation } from "@/components/types/User";
import { auth, firestore } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron } = req.headers;
  const { email, fullname, username, password, captchaToken } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.warn("Warm-Up Request");
    return res.status(200).json({ status: "Follow fired by Cron" });
  }

  try {
    if (req.method === "POST") {
      // verify if user real

      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        {
          method: "POST",
        }
      );

      const responseJson = await response.json();

      if (responseJson.success === false) {
        throw new Error("Human verification failed");
      } else {
        console.log("HUMAN!!!!");
      }

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

      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({ error: "BadPassword" });
        return;
      }

      try {
        // Create User
        const { uid } = await auth.createUser({
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
  } catch (error) {
    console.error("Error while signing up:", error);
    res.status(400).json({ error: "No-Real-User" });
  }
}
