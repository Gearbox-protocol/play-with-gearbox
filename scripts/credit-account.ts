// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {
  IAccountFactory__factory,
  IAddressProvider__factory,
  ICreditAccount__factory,
} from "@gearbox-protocol/sdk";
import { Contract, Provider } from "ethcall";
import { ethers } from "hardhat";

async function main() {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Account #0
  const ACCOUNT0 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  // The address of Gearbox's AddressProvider contract
  const AddressProviderContract = "0xcF64698AFF7E5f27A11dff868AF228653ba53be0";
  const ap = IAddressProvider__factory.connect(
    AddressProviderContract,
    provider,
  );

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await ap.version();
  console.log("version of Gearbox Contract is ", version);

  const network = await provider.getNetwork();
  console.log(network.name, " ", network.chainId);

  // Get AccountFactory
  const AccountFactory = await ap.getAccountFactory();
  console.log("AccountFactory is ", AccountFactory);
  //* ******************* AccountFactory ********************
  const mcallProvider = new Provider();
  await mcallProvider.init(provider);

  const af = new Contract(AccountFactory, IAccountFactory__factory.abi);
  let count_credit_account = ethers.BigNumber.from(
    (await mcallProvider.all([af.countCreditAccounts()]))[0],
  ).toNumber();
  console.log(count_credit_account);

  let batch_size = 100;
  let all_ca: string[] = [];
  let all_cm: string[] = [];
  let all_ba: number[] = [];
  let all_since: string[] = [];
  for (let idx = 0; idx < count_credit_account; idx += batch_size) {
    if (idx + batch_size > count_credit_account) {
      batch_size = count_credit_account - idx;
    }
    const call_batch = Array.from({ length: batch_size }, (_, i) =>
      af.creditAccounts(i + idx),
    );
    const ca_batch: string[] = await mcallProvider.all(call_batch);
    let ca_call_batch = [];
    let ba_call_batch = [];
    let since_call_batch = [];
    console.log("ca_batch", idx);
    for (let addr of ca_batch) {
      const ca = new Contract(addr, ICreditAccount__factory.abi);
      ca_call_batch.push(ca.creditManager());
      ba_call_batch.push(ca.borrowedAmount());
      since_call_batch.push(ca.since());
    }
    const cm_batch: string[] = await mcallProvider.all(ca_call_batch);
    console.log("cm_batch", idx);
    const ba_batch: number[] = await mcallProvider.all(ba_call_batch);
    console.log("ba_batch", idx);
    const since_batch: string[] = await mcallProvider.all(since_call_batch);
    console.log("since_batch", idx);

    all_ca = all_ca.concat(ca_batch);
    all_cm = all_cm.concat(cm_batch);
    all_ba = all_ba.concat(ba_batch);
    all_since = all_since.concat(since_batch);
  }

  for (let i = 0; i < all_ca.length; ++i) {
    if (all_cm[i] === AccountFactory) {
      continue;
    }
    console.log(all_ca[i], ",", all_cm[i], ",", all_ba[i], ",", all_since[i]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
