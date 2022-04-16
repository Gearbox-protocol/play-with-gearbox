import { ethers } from 'hardhat';
import { AddressProvider__factory, 
         DataCompressor__factory } from '@gearbox-protocol/sdk';
import { ADDRESS_PROVIDER_ADDRESS } from './utils';


async function main() {
  // If you don't specify a //url//, Ethers connects to the default 
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider(); 
  // The address of Gearbox's AddressProvider contract
  const addressProvider = AddressProvider__factory.connect(ADDRESS_PROVIDER_ADDRESS, provider);

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await addressProvider.version();
  console.log("version of Gearbox Contract is ", version);

  // Get DataCompressor
  const dataCompressorAddress = await addressProvider.getDataCompressor();
  console.log("DataCompressor is ", dataCompressorAddress);
  const dataCompressor = DataCompressor__factory.connect(dataCompressorAddress, provider);
  const poolDataList = await dataCompressor.getPoolsList();
  console.log(" Pools data: ", poolDataList);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });  
