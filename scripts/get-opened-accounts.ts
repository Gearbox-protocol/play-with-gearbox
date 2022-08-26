// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node
// <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the
// Hardhat Runtime Environment's members available in the global scope.
import {
  IAddressProvider__factory,
  IContractsRegister__factory,
  ICreditManager__factory,
  IERC20Metadata__factory,
} from "@gearbox-protocol/sdk";
import { Event } from "ethers";
import { ethers } from "hardhat";

import { ADDRESS_PROVIDER_ADDRESS } from "./utils";

function compareBlockNumberAndTransactionIndex(a: Event, b: Event) {
  if (a.blockNumber === b.blockNumber) {
    return a.transactionIndex < b.transactionIndex ? -1 : 1;
  }
  return a.blockNumber < b.blockNumber ? -1 : 1;
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Gearbox's AddressProvider contract
  const addressProvider = IAddressProvider__factory.connect(
    ADDRESS_PROVIDER_ADDRESS,
    provider,
  );

  const contractsRegisterAddress = await addressProvider.getContractsRegister();
  console.log("ContractsRegister is ", contractsRegisterAddress);
  //* ******************* ContractsRegister ********************
  const contractsRegister = IContractsRegister__factory.connect(
    contractsRegisterAddress,
    provider,
  );
  const creditManagerList = await contractsRegister.getCreditManagers();

  console.log(
    "Borrower,CreditAccount,CreditManager,UnderlyingToken,BorrowerOwnedAmount,BorrowedAmount",
  );
  for (const cmAddr of creditManagerList) {
    // connect to ith CreditManager contract
    const creditManager = ICreditManager__factory.connect(cmAddr, provider);
    const token = await creditManager.underlyingToken();
    const erc20 = IERC20Metadata__factory.connect(token, provider);
    const tokenSymbol = await erc20.symbol();

    // We get all the CreditAccounts through all the OpenAccountEvent and filter
    // out those have been closed or liquidated. query OpenCreditAccount event
    // in this CreditManager from block 13858003 to the latest block
    let openCreditAccountEvents = await creditManager.queryFilter(
      creditManager.filters.OpenCreditAccount(),
      13858003,
      "latest",
    );
    // query CloseCreditAccount event in this CreditManager from block 13858003
    // to the latest block
    let closeCreditAccountEvents = await creditManager.queryFilter(
      creditManager.filters.CloseCreditAccount(),
      13858003,
      "latest",
    );
    // query LiquidateCreditAccount event in this CreditManager from block
    // 13858003 to the latest block
    let liquidateCreditAccountEvents = await creditManager.queryFilter(
      creditManager.filters.LiquidateCreditAccount(),
      13858003,
      "latest",
    );

    // sorting for avoid some errors
    openCreditAccountEvents = openCreditAccountEvents.sort(
      compareBlockNumberAndTransactionIndex,
    );
    closeCreditAccountEvents = closeCreditAccountEvents.sort(
      compareBlockNumberAndTransactionIndex,
    );
    liquidateCreditAccountEvents = liquidateCreditAccountEvents.sort(
      compareBlockNumberAndTransactionIndex,
    );

    openCreditAccountEvents.forEach(event => {
      let closedOrLiqudated = false;
      // Check if it has been closed
      closeCreditAccountEvents.every(closeEvent => {
        if (
          event.blockNumber < closeEvent.blockNumber ||
          (event.blockNumber === closeEvent.blockNumber &&
            event.transactionIndex < closeEvent.transactionIndex)
        ) {
          if (event.args.onBehalfOf === closeEvent.args.owner) {
            closedOrLiqudated = true;
            return false;
          }
        }
        return true;
      });
      // Check if it has been liquidated
      liquidateCreditAccountEvents.every(liquidateEvent => {
        if (
          event.blockNumber < liquidateEvent.blockNumber ||
          (event.blockNumber === liquidateEvent.blockNumber &&
            event.transactionIndex < liquidateEvent.transactionIndex)
        ) {
          if (event.args.onBehalfOf === liquidateEvent.args.owner) {
            closedOrLiqudated = true;
            return false;
          }
        }
        return true;
      });
      if (!closedOrLiqudated) {
        console.log(
          event.args.onBehalfOf,
          ",",
          event.args.creditAccount,
          ",",
          event.address,
          ",",
          tokenSymbol,
          ",",
          event.args.amount,
          ",",
          event.args.borrowAmount,
        );
      }
    });
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
