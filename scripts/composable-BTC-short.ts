import {AccountFactory__factory, AddressProvider__factory, ContractsRegister__factory, CreditAccount__factory, CreditFilter__factory, CreditManager__factory, DataCompressor__factory, ERC20__factory} from '@diesellabs/gearbox-sdk';
import {Contract, Provider} from 'ethcall';
import {ethers, run} from 'hardhat';

const decimal = ethers.BigNumber.from('1000000000000000000');


const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

// 1. Open wBTC credit account
// 2. put there USDC as collateral
// 3. borrow x4 wBTC
// 4. sell wBTC for USDC
// 5. put USDC to Yearn

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Account #0
  const ACCOUNT0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  // Create a wallet signer by private key
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  let wallet_signer = wallet.connect(provider);

  // Assume we have got the address of wBTC Credit Manager contract
  const wBTC_CM_address = "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017";
  const wBTC_CM = await CreditManager__factory.connect(wBTC_CM_address, wallet_signer);
  const result = await wBTC_CM.openCreditAccount(1, ACCOUNT0, 3, 0);
  console.log(result);
  
}

// We recommend this pattern to be able to use async/await
// everywhere and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
