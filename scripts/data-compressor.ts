import { run, ethers } from "hardhat";
import { AddressProvider__factory, DataCompressor__factory } from "@diesellabs/gearbox-sdk";


async function main() {
  // If you don't specify a //url//, Ethers connects to the default 
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider(); 
  // The address of Account #0
  const ACCOUNT0 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  const accounts = await provider.getSigner(ACCOUNT0);
  // The address of Gearbox's AddressProvider contract
  const AddressProviderContract = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";
  const ap = AddressProvider__factory.connect(AddressProviderContract, provider);

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await ap.version();
  console.log("version of Gearbox Contract is ", version);

  // Get DataCompressor
  const DataCompressor = await ap.getDataCompressor();
  console.log("DataCompressor is ", DataCompressor);
  const dc = await DataCompressor__factory.connect(DataCompressor, provider);
  const pool_data_list = await dc.getPoolsList();
  console.log(" Pools data: ", pool_data_list);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });  
