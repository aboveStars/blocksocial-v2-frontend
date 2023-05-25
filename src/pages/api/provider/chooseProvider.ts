import getDisplayName from "@/apiUtils";
import { IProviderSettings } from "@/components/types/User";
import { firestore } from "@/firebase/adminApp";
import AsyncLock from "async-lock";

import { NextApiRequest, NextApiResponse } from "next";

const lock = new AsyncLock();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { providerName } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  if (!providerName)
    return res.status(422).json({ error: "Invalid prop or props" });

  await lock.acquire(`chooseProvider-${operationFromUsername}`, async () => {
    let initialProviderSettings: IProviderSettings;
    try {
      const providerSettingsSnapshotInServer = await firestore
        .doc(`providers/${providerName}`)
        .get();

      if (!providerSettingsSnapshotInServer.exists)
        throw new Error(`There is no provider with this name: ${providerName}`);

      const currentTimeStamp = Date.now();

      initialProviderSettings = {

        currency: providerSettingsSnapshotInServer.data()?.currency,
        deal: providerSettingsSnapshotInServer.data()?.deal,
        endTime: currentTimeStamp + 30 * 24 * 60 * 60 * 1000,
        name: providerSettingsSnapshotInServer.id,
        startTime: currentTimeStamp,
      };
    } catch (error) {
      console.error(
        "Error while getting provider settings from database",
        error
      );
      return res.status(422).json({ Error: "Invalid Prop or Props" });
    }

    try {
      await firestore
        .doc(`users/${operationFromUsername}/provider/currentProvider`)
        .set({
          ...initialProviderSettings,
        });
    } catch (error) {
      console.error("Error while creating doc for choosen proivder", error);
      return res.status(503).json({ error: "Firebase error" });
    }

    return res.status(200).json({});
  });
}
