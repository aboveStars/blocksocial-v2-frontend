import getDisplayName from "@/apiUtils";
import AsyncLock from "async-lock";
import { NextApiRequest, NextApiResponse } from "next";
import * as CryptoJS from "crypto-js";
import { firestore } from "../../firebase/adminApp";
import { randomUUID } from "crypto";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);

  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  await lock.acquire(`encryptDataAPI-${operationFromUsername}`, async () => {
    const likesSnapshot = await firestore
      .doc(`users/${operationFromUsername}/activities/likes`)
      .get();

    if (!likesSnapshot.exists)
      return res
        .status(418)
        .json({ Error: "You don't have enough data to sell" });

    const likesDatas: string[] = likesSnapshot.data()?.likesDatas;

    if (!likesDatas || !(likesDatas.length > 0)) {
      return res
        .status(418)
        .json({ Error: "You don't have enough data to sell" });
    }

    const likesDatasJson = {
      data: likesDatas,
    };

    const key = randomUUID();

    const likesDatasJsonString = JSON.stringify(likesDatasJson);

    const buffer = Buffer.from(likesDatasJsonString, "utf-8");
    const data = buffer.toString("base64");

    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();

    const decryptedDataBase64 = CryptoJS.AES.decrypt(
      encryptedData,
      key
    ).toString(CryptoJS.enc.Utf8);

    const decryptBuffer = Buffer.from(decryptedDataBase64, "base64");
    const decryptedData = decryptBuffer.toString("utf-8");

    return res.status(200).json({
      encryptedData: encryptedData,
      key: key,
      decryptedData: decryptedData,
    });
  });
}
