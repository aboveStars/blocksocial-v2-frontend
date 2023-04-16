import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore } from "../../firebase/adminApp";

// Updating "auth" object for now, in future other updates can be managed from here.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.error("Non-User Request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await verifyToken(authorization as string);
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST")
    return res.status(405).json({ Error: "Method not allowed" });

  const uid = decodedToken.uid;

  let username: string;
  try {
    username = (
      await firestore.collection("users").where("uid", "==", uid).get()
    ).docs[0].id;
  } catch (error) {
    console.error(
      "Error while updating. (We were looking for username for dispayname",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  try {
    await auth.updateUser(uid, {
      displayName: username,
    });
  } catch (error) {
    console.error(
      "Error while update. (We were updating 'auth' object)",
      error
    );
    return res.status(503).json({ error: "Firebase error" });
  }

  return res.status(200).json({
    createdDisplayName: username,
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
