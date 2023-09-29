import getDisplayName from "@/apiUtils";
import { firestore } from "@/firebase/adminApp";
import { apidonPayment } from "@/web3/Payment/ApidonPaymentApp";

import { TransactionReceipt, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron, authorization } = req.headers;
  const { withdrawAddress } = req.body;

  if (cron === process.env.NEXT_PUBLIC_CRON_HEADER_KEY) {
    console.log("Warm-Up Request");
    return res.status(200).json({ status: "Request by Server-Warmer" });
  }

  const operationFromUsername = await getDisplayName(authorization as string);
  if (!operationFromUsername)
    return res.status(401).json({ error: "unauthorized" });

  if (req.method !== "POST") return res.status(405).json("Method not allowed");

  const isWithdrawAddressRight = ethers.isAddress(withdrawAddress);
  if (!isWithdrawAddressRight)
    return res.status(422).json({ error: "Invalid Withdraw Address" });

  // check if user has right to withdraw
  let currentProviderDocOfUser: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
  try {
    currentProviderDocOfUser = await firestore
      .doc(`users/${operationFromUsername}/provider/currentProvider`)
      .get();
  } catch (error) {
    console.error(
      "Error while withdraw. We were getting current provide doc of user",
      error
    );
    return res.status(503).json({ error: "Firebase Error" });
  }

  if (!currentProviderDocOfUser.exists) {
    console.error(
      "Error while withdraw. User has even no current provider doc."
    );
    return res.status(422).json({ error: "No-Provider" });
  }
  const dealEndTimeInServer = currentProviderDocOfUser.data()
    ?.endTime as number;
  const dealStartTimeInServer = currentProviderDocOfUser.data()
    ?.startTime as number;

  const currentTime = Date.now();
  const userHasWithdrawRight = currentTime >= dealEndTimeInServer;

  if (!userHasWithdrawRight) {
    console.error(
      "Error on withdraw. User has no right to withdraw",
      "Deal End Time: ",
      dealEndTimeInServer,
      "Server Current Time: ",
      currentTime
    );
    return res.status(422).json({ error: "No right to withdraw" });
  }

  const yieldValue = currentProviderDocOfUser.data()?.yield as string;

  if (!yieldValue) {
    console.error("Error on withdraw. (We were looking for yield.");
    return res.status(503).json({ error: "Internal Server Error" });
  }

  let withdrawTx;
  try {
    const yieldValueInWei = ethers.parseUnits(yieldValue.toString(), "ether");
    withdrawTx = await apidonPayment.withdraw(yieldValueInWei, withdrawAddress);
  } catch (error) {
    console.error(
      "Error on withdraw. We were sending request to blockchain",
      error
    );
    return res.status(503).json({ error: "Internal Server Error" });
  }

  let withdrawTxReceipt: TransactionReceipt;
  try {
    withdrawTxReceipt = await withdrawTx.wait(1);
  } catch (error) {
    console.error(
      "Error on withdraw. We were waiting for confirmation.",
      error
    );
    return res.status(503).json({ error: "Internal Server Error" });
  }

  if (!withdrawTxReceipt) {
    console.error("Error on withdraw. TxRecipt is null.", withdrawTxReceipt);
    return res.status(503).json({ error: "Blockchain error" });
  }

  const currentProviderName = currentProviderDocOfUser.data()?.name as string;

  try {
    await firestore
      .doc(
        `users/${operationFromUsername}/provider/old-${currentProviderName}-${dealStartTimeInServer}`
      )
      .set({
        ...currentProviderDocOfUser.data(),
      });
  } catch (error) {
    console.error("Error on withdraw. (we were adding old doc)", error);
    return res.status(503).json({ error: "Firebase-Error" });
  }

  try {
    await firestore
      .doc(`users/${operationFromUsername}/provider/currentProvider`)
      .delete();
  } catch (error) {
    console.error(
      "Error on withdraw. (We were deleting currentProviderDoc",
      error
    );
    return res.status(503).json({ error: "Firebase-Error" });
  }

  let response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT_TO_APIDON_PROVIDER_SERVER}/client/finishWithdraw`,
      {
        method: "POST",
        headers: {
          authorization: process.env
            .NEXT_PUBLIC_API_KEY_BETWEEN_SERVICES as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: operationFromUsername,
          provider: currentProviderName,
          startTime: dealStartTimeInServer,
        }),
      }
    );
  } catch (error) {
    console.error(
      "Error on withdraw. (We were fetching finishWithdraw API",
      error
    );
    return res.status(503).json({ error: "Internal-Server-Error" });
  }

  if (!response.ok) {
    console.error(
      "Error on withdraw from finishWithdraw-API",
      await response.text()
    );
    return res.status(503).json({ error: "Internal Server Error" });
  }

  return res.status(200).json({});
}
