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

const blockSocialSmartContract = new ethers.Contract(
  mumbaiContractAddress,
  contractAbi.abi,
  wallet
);

export { blockSocialSmartContract };
