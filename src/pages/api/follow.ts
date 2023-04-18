import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NextApiRequest, NextApiResponse } from "next";
import { auth, firestore, fieldValue } from "../../firebase/adminApp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { operationTo: operationToUsername, opCode } = req.body;

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

  if (
    !operationFromUsername ||
    !operationToUsername ||
    (opCode !== 1 && opCode !== -1)
  ) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  // check if we already follow or not
  const doesOperationFromFollowOperationTo = (
    await firestore
      .doc(`users/${operationFromUsername}/followings/${operationToUsername}`)
      .get()
  ).exists;
  if (opCode === 1) {
    if (doesOperationFromFollowOperationTo) {
      console.error(
        "Error while follow operation. (Detected already followed.)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }
  } else {
    if (!doesOperationFromFollowOperationTo) {
      console.error(
        "Error while follow operation. (Detected already not-followed.)"
      );
      return res.status(422).json({ error: "Invalid prop or props" });
    }
  }

  try {
    const props: followOperationInterface = {
      opCode: opCode,
      operationFromUsername: operationFromUsername,
      operationToUsername: operationToUsername,
    };
    await Promise.all([handleOperationFrom(props), handleOperationTo(props)]);
  } catch (error) {
    console.error("Error while follow operation", error);
    return res.status(503).json({ error: "Firebase error" });
  }

  return res.status(200).json({});
}

interface followOperationInterface {
  operationFromUsername: string;
  opCode: number;
  operationToUsername: string;
}

async function handleOperationFrom(props: followOperationInterface) {
  try {
    await firestore.doc(`users/${props.operationFromUsername}`).update({
      followingCount: fieldValue.increment(props.opCode),
    });
    if (props.opCode === 1) {
      await firestore
        .doc(
          `users/${props.operationFromUsername}/followings/${props.operationToUsername}`
        )
        .set({
          followTime: Date.now(),
        });
    } else {
      await firestore
        .doc(
          `users/${props.operationFromUsername}/followings/${props.operationToUsername}`
        )
        .delete();
    }
  } catch (error) {
    throw new Error(
      `Error while follow operation from HANDLE-OPERATION-FROM: ${error} `
    );
  }
}

async function handleOperationTo(props: followOperationInterface) {
  try {
    await firestore.doc(`users/${props.operationToUsername}`).update({
      followerCount: fieldValue.increment(props.opCode),
    });

    if (props.opCode === 1) {
      await firestore
        .doc(
          `users/${props.operationToUsername}/followers/${props.operationFromUsername}`
        )
        .set({
          followTime: Date.now(),
        });
    } else {
      await firestore
        .doc(
          `users/${props.operationToUsername}/followers/${props.operationFromUsername}`
        )
        .delete();
    }
  } catch (error) {
    throw new Error(
      `Error while follow operation from HANDLE-OPERATION-TO: ${error} `
    );
  }
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
