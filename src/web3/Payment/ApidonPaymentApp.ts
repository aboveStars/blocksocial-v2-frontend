import { ethers } from "ethers";

import apidonPaymentContract from "./ApidonPaymentContract.json";

const apidonPaymentContractAddressMumbai =
  "0xA9A28Daa55e94e057ad70B6966BC6bC4A36f876b";

const provider = new ethers.AlchemyProvider(
  "maticmum",
  process.env.NEXT_PUBLIC_MUMBAI_API
);

const wallet = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
);

const apidonPayment = new ethers.Contract(
  apidonPaymentContractAddressMumbai,
  apidonPaymentContract.abi,
  wallet
);

export { apidonPayment };
