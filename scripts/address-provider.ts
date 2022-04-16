import { ethers } from "hardhat";
import { AddressProvider__factory } from "@gearbox-protocol/sdk";
import { ADDRESS_PROVIDER_ADDRESS } from "./utils";

async function main() {
  // If you don't specify a //url//, Ethers connects to the default 
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider(); 
  // The address of Account #0
  // The address of Gearbox's AddressProvider contract
  const addressProvider = AddressProvider__factory.connect(ADDRESS_PROVIDER_ADDRESS, provider);

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await addressProvider.version();
  console.log("version of Gearbox Contract is ", version);

  // Get ContractsRegister
  const contractsRegisterAddress = await addressProvider.getContractsRegister();
  console.log("ContractsRegister is ", contractsRegisterAddress);

  // Get ACL
  const ACLAddress = await addressProvider.getACL();
  console.log("ACL is ", ACLAddress);

  // Get PriceOracle
  const priceOracleAddress = await addressProvider.getPriceOracle();
  console.log("PriceOracle is ", priceOracleAddress);

  // Get AccountFactory
  const accountFactoryAddress = await addressProvider.getAccountFactory();
  console.log("AccountFactory is ", accountFactoryAddress);

  // Get DataCompressor
  const dataCompressorAddress = await addressProvider.getDataCompressor();
  console.log("DataCompressor is ", dataCompressorAddress);

  // Get WETH Token
  const wETHGatewayAddress = await addressProvider.getWETHGateway();
  console.log("WETHGateway is ", wETHGatewayAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });  
