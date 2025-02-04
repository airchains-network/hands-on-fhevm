import fs from "fs";
import path from "path";
import logger from "./utils/logger.js";
import { getEnvironmentVariables } from "./utils/env.js";
import { deriveWalletsAndDetails } from "./utils/wallet.js";
import {
  mintTokens,
  decryptMintedTokens,
  fetchTokenDetails,
  transferTokens,
  // reencryptUserBalance,
  approveTransaction,
} from "./test/encrypted-erc20.js";

let { networkUrl, mnemonic } = getEnvironmentVariables();
let { privateKeyTest } = deriveWalletsAndDetails(mnemonic);
let contractName = "EncryptedERC20.sol";
let filename = contractName.split(".")[0];

async function interactWithContract() {
  try {
    const contractAddress = fs.readFileSync(
      path.join(process.cwd(), "data", "contractAddress.txt"),
      "utf8",
    );
    const mintResult = await mintTokens(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress,
    );

    logger.info(`Mint Result: ${mintResult}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await decryptMintedTokens(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress,
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await fetchTokenDetails(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress,
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await transferTokens(filename, networkUrl, privateKeyTest, contractAddress);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // await reencryptUserBalance(
    //   filename,
    //   networkUrl,
    //   privateKeyTest,
    //   contractAddress,
    // );
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    const approveResult = await approveTransaction(
      filename,
      networkUrl,
      privateKeyTest,
      contractAddress,
    );
    logger.info(`Approve Result: ${approveResult}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    logger.error("Error during tests:", error);
  }
}
interactWithContract();
