import { ethers } from "ethers";

import apidonNFTContract from "./ApidonNFTContract.json";

const apidonNFTMumbaiContractAddress = "0xB7F85699b9Ba123cd82A9f4dD552Cd519e11a0E8"

const provider = new ethers.AlchemyProvider(
  "maticmum",
  process.env.NEXT_PUBLIC_MUMBAI_API
);

const wallet = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
);

const apidonNFT = new ethers.Contract(
  apidonNFTMumbaiContractAddress,
  apidonNFTContract.abi,
  wallet
);

export { apidonNFT, apidonNFTMumbaiContractAddress };
