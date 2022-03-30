import {AccountFactory__factory, AddressProvider__factory, ContractsRegister__factory, CreditAccount__factory, CreditFilter__factory, CreditManager__factory, DataCompressor__factory, ERC20__factory} from '@diesellabs/gearbox-sdk';
import {Contract, Provider} from 'ethcall';
import {ethers, run} from 'hardhat';

const decimal = ethers.BigNumber.from('1000000000000000000');


const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

class TradingBot {
  wallet_signer

  constructor (private_key: string, provider: any) {
    this.wallet_signer = (new ethers.Wallet(private_key)).connect(provider);
  }
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Account #0
  const ACCOUNT0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  // Create a wallet signer by private key
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  let wallet_signer = wallet.connect(provider);

  // The address of Gearbox's AddressProvider contract
  const AddressProviderContract = '0xcF64698AFF7E5f27A11dff868AF228653ba53be0';
  const ap =
      await AddressProvider__factory.connect(AddressProviderContract, provider);

  // Start to query AddressProvider
  //
  // Get the latest version of Gearbox's contracts
  const version = await ap.version();
  console.log('version of Gearbox Contract is ', version);

  const network = await provider.getNetwork();
  console.log(network.name, ' ', network.chainId);

  const DataCompressor = await ap.getDataCompressor();
  const dc = await DataCompressor__factory.connect(DataCompressor, provider);

  // input your wallet to my_wallet
  const my_wallet = '0x10cCD4136471c7c266a9Fc4569622989Fb4caB99';
  const my_ca_list = await dc.getCreditAccountList(my_wallet);
  
}

// We recommend this pattern to be able to use async/await
// everywhere and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
