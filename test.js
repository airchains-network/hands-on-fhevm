// import {
//   mintTokens,
//   decryptMintedTokens,
//   fetchTokenDetails,
//   transferTokens,
//   reencryptUserBalance,
//   approveTransaction,
// } from "./src/test/encrypted-erc20.js";
// import { deployedContract } from "./index.js";
// import { getEnvironmentVariables } from "./utils/env.js";
// import { deriveWalletsAndDetails } from "./utils/wallet.js";

// const { networkUrl, mnemonic } = getEnvironmentVariables();
// const { privateKeyCore, privateKeySampleTransfer } =
//   deriveWalletsAndDetails(mnemonic);

// const contractAddress = deployedContract.contractAddress;
// const filename = "EncryptedERC20.sol";

// async function runTests() {
//   try {
//     const mintResult = await mintTokens(
//       filename,
//       networkUrl,
//       privateKeyCore,
//       contractAddress,
//     );
//     console.log("Mint Result:", mintResult);

//     await decryptMintedTokens(
//       filename,
//       networkUrl,
//       privateKeyCore,
//       contractAddress,
//     );

//     await fetchTokenDetails(
//       filename,
//       networkUrl,
//       privateKeyCore,
//       contractAddress,
//     );

//     const transferResult = await transferTokens(
//       filename,
//       networkUrl,
//       privateKeySampleTransfer,
//       contractAddress,
//     );
//     console.log("Transfer Result:", transferResult);

//     await reencryptUserBalance(
//       filename,
//       networkUrl,
//       privateKeyCore,
//       contractAddress,
//     );

//     const approveResult = await approveTransaction(
//       filename,
//       networkUrl,
//       privateKeyCore,
//       contractAddress,
//     );
//     console.log("Approve Result:", approveResult);
//   } catch (error) {
//     console.error("Error during tests:", error);
//   }
// }

// runTests();
