import { ethers } from "ethers";

import contractAbi from "./ContractABI.json";
import { mumbaiContractAddress } from "./ContractAddresses";

const provider = new ethers.AlchemyProvider(
  "maticmum",
  process.env.NEXT_PUBLIC_MUMBAI_API
);

const wallet = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
);

const blockSocialV2SimplePayment = new ethers.Contract(
  mumbaiContractAddress,
  contractAbi.abi,
  wallet
);

export { blockSocialV2SimplePayment };
