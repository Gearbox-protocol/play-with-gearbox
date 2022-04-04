
import { ethers } from "hardhat";

// This function is for manipulating the balance of your wallet in hardhat local network
/**
 * @param token: the token address you want to manipulate
 * @param account: the account address you want to manipulate
 * @param slotNum: the slotNum of the token, (check https://kndrck.co/posts/local_erc20_bal_mani_w_hh/)
 * @param value: the total value of token you want to manipulate to your account
 * @param provider: rpc provider
 */
export var manipulateBalance = async (token: string, account: string, slotNum: any, value: string, provider: any) => {
  const locallyManipulatedBalance = ethers.utils.parseUnits(value);
  console.log(locallyManipulatedBalance);
  // Get storage slot index
  const index = ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    [account, slotNum] // key, slot
  );

  const setStorageAt = async (address: string, index: string, value: string) => {
    await provider.send("hardhat_setStorageAt", [address, index, value]);
    await provider.send("evm_mine", []); // Just mines to the next block
  };

  const toBytes32 = (bn : any) => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
  };

  await setStorageAt(
    token,
    index.toString(),
    toBytes32(locallyManipulatedBalance).toString()
  );
}



