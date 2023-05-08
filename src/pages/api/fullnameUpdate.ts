import AsyncLock from "async-lock";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore } from "../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { newRequestedUsername } = req.body;

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

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  const fullnameRegex = /^[\p{L}_ ]{3,20}$/u;
  if (!fullnameRegex.test(newRequestedUsername)) {
    console.error(
      "Error while updating fullname. (fullname regex couldn't pass)"
    );
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`fullnameUpdateAPI-${operationFromUsername}`, async () => {
    try {
      await firestore.doc(`users/${operationFromUsername}`).update({
        fullname: newRequestedUsername,
      });
    } catch (error) {
      console.error(
        "Error while updating username. (We were updating userdoc)",
        error
      );
      return res.status(503).json({ error: "firebase error" });
    }

    return res.status(200).json({});
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
