import { Contract, ethers } from "ethers";

const contractAddress = "0x78B8CC3260f06822Bd98c74165BB67DCEE01753A";
import contractAbi from "./ContractABI.json";

const provider = new ethers.AlchemyProvider(
  "sepolia",
  process.env.NEXT_PUBLIC_SEPOLIA_API
);

const wallet = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
);

const blockSocialSmartContract = new ethers.Contract(
  contractAddress,
  contractAbi.abi,
  wallet
);

export { blockSocialSmartContract };
