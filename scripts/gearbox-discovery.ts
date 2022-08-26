// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {
  IAccountFactory__factory,
  IAddressProvider__factory,
  IContractsRegister__factory,
} from "@gearbox-protocol/sdk";
import { ethers } from "hardhat";

import { ADDRESS_PROVIDER_ADDRESS } from "./utils";

async function main() {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Gearbox's AddressProvider contract
  const addressProvider = IAddressProvider__factory.connect(
    ADDRESS_PROVIDER_ADDRESS,
    provider,
  );

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await addressProvider.version();
  console.log("version of Gearbox Contract is ", version);

  // Get ContractsRegister
  const contractsRegisterAddress = await addressProvider.getContractsRegister();
  console.log("ContractsRegisterAddress is ", contractsRegisterAddress);
  //* ******************* ContractsRegister ********************
  const contractsRegister = IContractsRegister__factory.connect(
    contractsRegisterAddress,
    provider,
  );
  const poolList = await contractsRegister.getPools();
  console.log("Pool List: ", poolList);
  const creditManagerList = await contractsRegister.getCreditManagers();
  console.log("Credit Manager List: ", creditManagerList);
  //* ******************* ContractsRegister ********************

  // Get ACL
  const ACLAddress = await addressProvider.getACL();
  console.log("ACL is ", ACLAddress);

  // Get PriceOracle
  const priceOracleAddress = await addressProvider.getPriceOracle();
  console.log("PriceOracle is ", priceOracleAddress);

  // Get AccountFactory
  const accountFactoryAddress = await addressProvider.getAccountFactory();
  console.log("AccountFactory is ", accountFactoryAddress);
  //* ******************* AccountFactory ********************
  const accountFactory = IAccountFactory__factory.connect(
    accountFactoryAddress,
    provider,
  );
  const countCreditAccount = await accountFactory.countCreditAccounts();
  console.log("Count of Credit Accounts: ", countCreditAccount);
  const countCreditAccountInStock =
    await accountFactory.countCreditAccountsInStock();
  console.log("Count of Credit Accounts InStock: ", countCreditAccountInStock);
  //* ******************* AccountFactory ********************

  // Get DataCompressor
  const dataCompressorAddress = await addressProvider.getDataCompressor();
  console.log("DataCompressor is ", dataCompressorAddress);

  // Get WETH Token
  const WETHGateway = await addressProvider.getWETHGateway();
  console.log("WETHGateway is ", WETHGateway);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
