// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { run, ethers } from "hardhat";
import { AddressProvider__factory } from "@gearbox-protocol/sdk";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();

  const ACCOUNT0 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  
  const accounts = await provider.getSigner(ACCOUNT0);

  const AddressProviderContract = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";

  const ap = AddressProvider__factory.connect(AddressProviderContract, provider);

  const version = await ap.version();

  console.log(version);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });  
