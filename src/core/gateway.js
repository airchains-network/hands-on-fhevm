import { HDNodeWallet, getCreateAddress } from "ethers";
import dotenv from "dotenv";
import logger from "../../utils/logger.js";
import { JsonRpcProvider, Wallet, ContractFactory, Contract } from "ethers";
import getCompiledContract from "../compile.js";
import fs from "fs";
import path from "path";

dotenv.config();

const MNEMONIC = process.env.MNEMONIC2;
if (!MNEMONIC) {
  throw new Error("Gateway: MNEMONIC environment variable not set.");
}

const deployer = HDNodeWallet.fromPhrase(MNEMONIC);
const privateKey = deployer.privateKey;

logger.info(`Deployer Address: ${deployer.address}`);

function computeCreateAddress(from, nonce) {
  return getCreateAddress({ from, nonce });
}

function writeToFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, { flag: "w" });
    logger.info(`File written successfully: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to write file at ${filePath}:`, err);
  }
}

function computePredeployAddress() {
  const gatewayContractAddressPrecomputed = computeCreateAddress(
    deployer.address,
    0,
  );
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/gateway/lib/.env.gateway",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/gateway/lib/PredeployAddress.sol",
  );

  writeToFile(
    envFilePath,
    `GATEWAY_CONTRACT_PREDEPLOY_ADDRESS=${gatewayContractAddressPrecomputed}\n`,
  );
  logger.info(
    `Gateway Address written to: ${envFilePath} with address: ${gatewayContractAddressPrecomputed}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant GATEWAY_CONTRACT_PREDEPLOY_ADDRESS = ${gatewayContractAddressPrecomputed};`;
  writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `Gateway Solidity file written to: ${solidityFilePath} with address: ${gatewayContractAddressPrecomputed}`,
  );
}

async function deployGateway() {
  try {
    const compiledContract = getCompiledContract(
      "../../node_modules/fhevm/gateway/GatewayContract.sol",
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(process.env.NETWORK_URL);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const envConfig = dotenv.parse(
      fs.readFileSync("../../node_modules/fhevm/lib/.env.kmsverifier"),
    );
    const contract = await factory.deploy(
      deployer.address,
      envConfig.KMS_VERIFIER_CONTRACT_ADDRESS,
    );

    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    logger.error(`Error deploying contract:`, error.message);
    throw error;
  }
}

// TODO: CHECK IF THIS IS WORKING
// export const getCoin = async (address) => {
//   const containerName = process.env["TEST_CONTAINER_NAME"] || "zama-kms-validator-1";
//   try {
//     const response = await exec(`docker exec -i ${containerName} faucet ${address} | grep height`);
//     const res = JSON.parse(response.stdout);
//     if (res.raw_log.match("account sequence mismatch")) {
//       await getCoin(address);
//     }
//   } catch (error) {
//     console.error("Error in getCoin:", error);
//   }
// };

// TODO: CHECK IF THIS IS WORKING
// export const addRelayer = async (
//   privateKey,
//   gatewayAddress,
//   relayerAddress,
// ) => {
//   const provider = new JsonRpcProvider(process.env.NETWORK_URL);
//   try {
//     const codeAtAddress = await provider.getCode(gatewayAddress);
//     if (codeAtAddress === "0x") {
//       throw Error(`${gatewayAddress} is not a smart contract`);
//     }

//     const owner = new Wallet(privateKey, provider);
//     const gateway = new Contract(
//       gatewayAddress,
//       ["function addRelayer(address relayer) public"],
//       owner,
//     );

//     const tx = await gateway.addRelayer(relayerAddress);
//     const rcpt = await tx.wait();

//     if (rcpt.status === 1) {
//       console.log(
//         `Account ${relayerAddress} was successfully added as a gateway relayer`,
//       );
//     } else {
//       console.log("Adding relayer failed");
//     }
//   } catch (error) {
//     console.error("Error in addRelayer:", error);
//   }
// };
