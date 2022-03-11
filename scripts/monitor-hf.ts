import {AccountFactory__factory, AddressProvider__factory, ContractsRegister__factory, CreditAccount__factory, CreditFilter__factory, CreditManager__factory, DataCompressor__factory, ERC20__factory} from '@diesellabs/gearbox-sdk';
import {Contract, Provider} from 'ethcall';
import {ethers, run} from 'hardhat';

const decimal = ethers.BigNumber.from('1000000000000000000');


const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  // The address of Account #0
  const ACCOUNT0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
  const accounts = await provider.getSigner(ACCOUNT0);
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

  let last_block_num: number = 0;
  while (true) {
    let cur_block_num = await provider.getBlockNumber();
    if (cur_block_num > last_block_num) {
      last_block_num = cur_block_num;
      for (let i = 0; i < my_ca_list.length; ++i) {
        const cm = await CreditManager__factory.connect(
            my_ca_list[i].creditManager, provider);
        const CreditFilter = await cm.creditFilter();
        const cf = await CreditFilter__factory.connect(CreditFilter, provider);
        const healh_factor =
            await cf.calcCreditAccountHealthFactor(my_ca_list[i].addr);
        console.log(`BlockNumber ${cur_block_num}, CreditAccount ${
            my_ca_list[i].addr}'s healh factor is ${healh_factor}`);
      }
    }
    await sleep(5000);
  }
}

// We recommend this pattern to be able to use async/await
// everywhere and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
