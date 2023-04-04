import { blockSocialSmartContract } from "@/ethers/clientApp";

export default function useSmartContractTransactions() {
  const getTokenCount = async () => {
    let tc: string = "";
    try {
      tc = await blockSocialSmartContract.getTokenCount();
    } catch (error) {
      console.error(error);
    }

    return tc.toString();
  };

  const getTokenURI = async (tokenId: number) => {
    let tokenUri: string = "";
    try {
      tokenUri = await blockSocialSmartContract.tokenURI(tokenId);
    } catch (error) {
      console.error(error);
    }
    return tokenUri;
  };

  const mintNft = async (uri: string) => {
    console.log("Request Sending");
    const tx = await blockSocialSmartContract.mint(uri);
    console.log("Request Sent.");
    console.log("Waiting for confirmations");
    await tx.wait(1);
    console.log("confirmed");
  };

  return { getTokenCount, getTokenURI, mintNft };
}
