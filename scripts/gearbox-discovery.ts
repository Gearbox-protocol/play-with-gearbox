// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { run, ethers } from "hardhat";
import { AccountFactory__factory, AddressProvider__factory, ContractsRegister__factory } from "@gearbox-protocol/sdk";


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

  // Get ContractsRegister
  const ContractsRegister = await ap.getContractsRegister();
  console.log("ContractsRegister is ", ContractsRegister);
  //******************** ContractsRegister ********************
  const cr = await ContractsRegister__factory.connect(ContractsRegister, provider);
  const pool_list = await cr.getPools();
  console.log("Pool List: ", pool_list);
  const credit_manager_list = await cr.getCreditManagers();
  console.log("Credit Manager List: ", credit_manager_list);
  //******************** ContractsRegister ********************

  // Get ACL
  const ACL = await ap.getACL();
  console.log("ACL is ", ACL);

  // Get PriceOracle
  const PriceOracle = await ap.getPriceOracle();
  console.log("PriceOracle is ", PriceOracle);

  // Get AccountFactory
  const AccountFactory = await ap.getAccountFactory();
  console.log("AccountFactory is ", AccountFactory);
  //******************** AccountFactory ********************
  const ac = await AccountFactory__factory.connect(AccountFactory, provider);
  const count_credit_account = await ac.countCreditAccounts();
  console.log("Count of Credit Accounts: ", count_credit_account);
  const count_credit_account_instock = await ac.countCreditAccountsInStock();
  console.log("Count of Credit Accounts InStock: ", count_credit_account_instock);
  //******************** AccountFactory ********************



  // Get DataCompressor
  const DataCompressor = await ap.getDataCompressor();
  console.log("DataCompressor is ", DataCompressor);

  // Get WETH Token
  const WETHGateway = await ap.getWETHGateway();
  console.log("WETHGateway is ", WETHGateway);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });  
