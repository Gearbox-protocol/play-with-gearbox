import {
  ICreditManager__factory,
  IERC20,
  IERC20__factory,
  IERC20Metadata__factory,
  IUniswapV3Adapter__factory,
  IYVault__factory,
} from "@gearbox-protocol/sdk";
import { Wallet } from "ethers";
import { ethers } from "hardhat";

import { manipulateBalance } from "./manipulate-balance";
import {
  ACCOUNT_1_PRIVATE_KEY,
  USDC_ADDRESS,
  USDC_STORAGE_SLOT,
  WBTC_ADDRESS,
  WBTC_CM_UNISWAPV3_ADAPTER_ADDRESS,
  WBTC_CM_YEARN_ADAPTER_ADDRESS,
  WBTC_CREDIT_MANAGER_ADDRESS,
  WBTC_STORAGE_SLOT,
} from "./utils";

// In this example, we will do Composable BTC short
const approveContract = async (tokenContract: IERC20, contract: string) => {
  const amount = ethers.BigNumber.from(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
  );
  await tokenContract.approve(contract, amount, { gasLimit: 2500000 });
};

async function openCreditAccount(
  creditManagerAddress: string,
  underlyingTokenAddress: string,
  depositAmount: number,
  leverageFactor: number,
  walletSigner: Wallet,
  gasPrice: number,
  gasLimit: number,
) {
  // Assume we have got the address of wBTC Credit Manager contract
  const creditManager = ICreditManager__factory.connect(
    creditManagerAddress,
    walletSigner,
  );
  const underlyingToken = IERC20__factory.connect(
    underlyingTokenAddress,
    walletSigner,
  );
  const underlyingTokenMeta = IERC20Metadata__factory.connect(
    underlyingTokenAddress,
    walletSigner,
  );
  const underlyingTokenDecimals = await underlyingTokenMeta.decimals();

  await approveContract(underlyingToken, creditManagerAddress);
  console.log(
    "openCreditAccount txn; ",
    await creditManager.openCreditAccount(
      depositAmount * 10 ** underlyingTokenDecimals,
      walletSigner.address,
      leverageFactor,
      0,
      { gasPrice: gasPrice, gasLimit: gasLimit },
    ),
  );
}

async function addCollateral(
  tokenAddress: string,
  depositAmount: number,
  creditManagerAddress: string,
  walletSigner: Wallet,
  gasPrice: number,
  gasLimit: number,
) {
  const token = IERC20__factory.connect(tokenAddress, walletSigner);
  const tokenMeta = IERC20Metadata__factory.connect(tokenAddress, walletSigner);
  const tokenDecimals = await tokenMeta.decimals();
  await approveContract(token, creditManagerAddress);
  const creditManager = ICreditManager__factory.connect(
    creditManagerAddress,
    walletSigner,
  );
  console.log(
    "Add collateralL: ",
    await creditManager.addCollateral(
      walletSigner.address,
      tokenAddress,
      depositAmount * 10 ** tokenDecimals,
      { gasPrice: gasPrice, gasLimit: gasLimit },
    ),
  );
}

async function increaseBorrowedAmount(
  borrowAmount: number,
  underlyingTokenAddress: string,
  creditManagerAddress: string,
  walletSigner: Wallet,
  gasPrice: number,
  gasLimit: number,
) {
  const creditManager = ICreditManager__factory.connect(
    creditManagerAddress,
    walletSigner,
  );
  const underlyingToken = IERC20Metadata__factory.connect(
    underlyingTokenAddress,
    walletSigner,
  );
  const underlyingTokenDecimals = await underlyingToken.decimals();
  console.log(
    await creditManager.increaseBorrowedAmount(
      Math.floor(borrowAmount * 10 ** underlyingTokenDecimals),
      { gasPrice: gasPrice, gasLimit: gasLimit },
    ),
  );
}

async function exactInputSingleUniswapV3(
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInAmount: number,
  walletSigner: Wallet,
  gasPrice: number,
  gasLimit: number,
) {
  const wBTCCreditManagerUniswapv3Adapter = IUniswapV3Adapter__factory.connect(
    WBTC_CM_UNISWAPV3_ADAPTER_ADDRESS,
    walletSigner,
  );
  const tokenIn = IERC20Metadata__factory.connect(tokenInAddress, walletSigner);
  const tokenInDecimals = await tokenIn.decimals();

  const exactInputSingleOrder = {
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    fee: 3000,
    recipient: walletSigner.address,
    amountIn: Math.floor(tokenInAmount * 10 ** tokenInDecimals),
    amountOutMinimum: 0,
    deadline: Math.floor(Date.now() / 1000) + 1200,
    sqrtPriceLimitX96: 0,
  };

  console.log(
    await wBTCCreditManagerUniswapv3Adapter.exactInputSingle(
      exactInputSingleOrder,
      { gasPrice: gasPrice, gasLimit: gasLimit },
    ),
  );
}

async function depositToYearn(
  walletSigner: Wallet,
  gasPrice: number,
  gasLimit: number,
) {
  const wBTCCreditManagerYearnAdapter = IYVault__factory.connect(
    WBTC_CM_YEARN_ADAPTER_ADDRESS,
    walletSigner,
  );
  console.log(
    "deposit all USDC to yearn: ",
    await wBTCCreditManagerYearnAdapter["deposit()"]({
      gasPrice: gasPrice,
      gasLimit: gasLimit,
    }),
  );
}

async function composableWBTCShort(
  wBTCDepositAmount: number,
  usdcDepositAmount: number,
  wBTCBorrowAmount: number,
  walletSigner: any,
) {
  // Assume we have got the address of wBTC Credit Manager contract
  let wbtc = IERC20__factory.connect(WBTC_ADDRESS, walletSigner);
  let usdc = IERC20__factory.connect(USDC_ADDRESS, walletSigner);

  console.log("wBTC balance: ", await wbtc.balanceOf(walletSigner.address));
  console.log("USDC balanceOf: ", await usdc.balanceOf(walletSigner.address));

  // gasPrice and gasLimit for hardhat testnet
  const gasPrice = 30;
  const gasLimit = 2500000;

  //
  // So after we got wBTC, we'll do composable BTC short in 5 steps:
  // 1. Open wBTC credit account
  await openCreditAccount(
    WBTC_CREDIT_MANAGER_ADDRESS,
    WBTC_ADDRESS,
    wBTCDepositAmount,
    1,
    walletSigner,
    gasPrice,
    gasLimit,
  );
  // 2. put there USDC as collateral
  await addCollateral(
    USDC_ADDRESS,
    usdcDepositAmount,
    WBTC_CREDIT_MANAGER_ADDRESS,
    walletSigner,
    gasPrice,
    gasLimit,
  );
  // 3. borrow x4 wBTC
  await increaseBorrowedAmount(
    wBTCBorrowAmount,
    WBTC_ADDRESS,
    WBTC_CREDIT_MANAGER_ADDRESS,
    walletSigner,
    gasPrice,
    gasLimit,
  );
  // 4. sell wBTC for USDC
  await exactInputSingleUniswapV3(
    WBTC_ADDRESS,
    USDC_ADDRESS,
    wBTCDepositAmount + wBTCBorrowAmount,
    walletSigner,
    gasPrice,
    gasLimit,
  );
  // 5. put USDC to Yearn
  await depositToYearn(walletSigner, gasPrice, gasLimit);
}

async function main() {
  // hardhat local net rpc
  const provider = new ethers.providers.JsonRpcProvider();
  // Create a wallet signer by private key
  const wallet = new ethers.Wallet(ACCOUNT_1_PRIVATE_KEY);
  // const wallet = new ethers.Wallet(private_key);
  let walletSigner = wallet.connect(provider);

  //* **************************************************************************
  // For test locally, we need some wBTC and USDC in hardhat's test wallet. I think there are two ways to get tokens:
  //    1. Swap eth to tokens at Uniswap
  //    2. Use 'hardhat_setStorageAt' method to manipulate the banlance.
  await manipulateBalance(
    USDC_ADDRESS,
    walletSigner.address,
    USDC_STORAGE_SLOT,
    "4000",
    provider,
  );
  await manipulateBalance(
    WBTC_ADDRESS,
    walletSigner.address,
    WBTC_STORAGE_SLOT,
    "4000",
    provider,
  );

  await composableWBTCShort(0.1, 4000, 0.45, walletSigner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
