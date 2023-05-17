import getDisplayName from "@/apiUtils";
import { INotificationServerData } from "@/components/types/User";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";

import { fieldValue, firestore } from "../../../firebase/adminApp";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { opCode, postDocPath } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (
    (opCode !== 1 && opCode !== -1) ||
    !postDocPath ||
    !operationFromUsername
  ) {
    return res.status(422).json({ error: "Invalid prop or props" });
  }

  await lock.acquire(`postLikeApi-${operationFromUsername}`, async () => {
    const operationFromHaveLikeAlready: boolean = (
      await firestore.doc(`${postDocPath}/likes/${operationFromUsername}`).get()
    ).exists;

    if (opCode === 1) {
      if (operationFromHaveLikeAlready) {
        console.error("Error while like operation. (Detected already liked.)");
        return res.status(422).json({ error: "Invalid prop or props" });
      }
    } else {
      if (!operationFromHaveLikeAlready) {
        console.error(
          "Error while follow operation. (Detected already not-liked.)"
        );
        return res.status(422).json({ error: "Invalid prop or props" });
      }
    }

    try {
      await firestore.doc(postDocPath).update({
        likeCount: fieldValue.increment(opCode as number),
      });
    } catch (error) {
      console.error("Error while like operation, we were on increment", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    const likeTimestamp = Date.now();

    try {
      if (opCode === 1) {
        if (
          (
            await firestore
              .doc(`users/${operationFromUsername}/activities/likes`)
              .get()
          ).exists
        ) {
          await firestore
            .doc(`users/${operationFromUsername}/activities/likes`)
            .update({
              likesDatas: fieldValue.arrayUnion({
                likeTime: likeTimestamp,
                likedPostDocPath: postDocPath,
              }),
            });
        } else {
          await firestore
            .doc(`users/${operationFromUsername}/activities/likes`)
            .set({
              likesDatas: fieldValue.arrayUnion({
                likeTime: likeTimestamp,
                likedPostDocPath: postDocPath,
              }),
            });
        }
      } else {
        const likeTime = (
          await firestore
            .doc(postDocPath)
            .collection("likes")
            .doc(operationFromUsername)
            .get()
        ).data()?.likeTime;
        await firestore
          .doc(`users/${operationFromUsername}/activities/likes`)
          .update({
            likesDatas: fieldValue.arrayRemove({
              likeTime: likeTime,
              likedPostDocPath: postDocPath,
            }),
          });
      }
    } catch (error) {
      console.error("Error while updating activities of user", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    try {
      if (opCode === 1) {
        await firestore
          .doc(`${postDocPath}/likes/${operationFromUsername}`)
          .set({
            likeTime: likeTimestamp,
          });
      } else {
        await firestore
          .doc(`${postDocPath}/likes/${operationFromUsername}`)
          .delete();
      }
    } catch (error) {
      console.error(
        "Error while like operation, we were creating or deleting new like doc.",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    // send notification
    try {
      if (opCode === 1) {
        const newLikeNotificationObject: INotificationServerData = {
          seen: false,
          notificationTime: likeTimestamp,
          sender: operationFromUsername,
          cause: "like",
        };

        const postSenderUsername = (
          await firestore.doc(postDocPath).get()
        ).data()?.senderUsername;

        await firestore
          .collection(`users/${postSenderUsername}/notifications`)
          .add({ ...newLikeNotificationObject });
      } else {
        const postSenderUsername = (
          await firestore.doc(postDocPath).get()
        ).data()?.senderUsername;

        const likeNotificationDoc = (
          await firestore
            .collection(`users/${postSenderUsername}/notifications`)
            .where("cause", "==", "like")
            .where("sender", "==", operationFromUsername)
            .get()
        ).docs[0];

        if (likeNotificationDoc) await likeNotificationDoc.ref.delete();
      }
    } catch (error) {
      console.error(
        "Error while like. (We were sending or deleting notification)",
        error
      );
      return res.status(503).json({ error: "Firebase error" });
    }

    return res.status(200).json({});
  });
}
