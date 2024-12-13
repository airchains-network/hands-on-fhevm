import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { getCreateAddress } from "ethers";
import dotenv from "dotenv";
import logger from "../../utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MNEMONIC = process.env.MNEMONIC;
if (!MNEMONIC) {
  throw new Error("Core Contracts: MNEMONIC environment variable not set.");
}

function computeCreateAddress(from, nonce) {
  return getCreateAddress({ from, nonce });
}

async function writeToFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, { flag: "w" });
    logger.info(`File written successfully: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to write file at ${filePath}: ${err}`);
  }
}

async function computeACLAddress(deployerAddress) {
  const aclAddress = computeCreateAddress(deployerAddress, 0);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.acl",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/ACLAddress.sol",
  );

  await writeToFile(envFilePath, `ACL_CONTRACT_ADDRESS=${aclAddress}\n`);
  logger.info(
    `ACL Address written to: ${envFilePath} with address: ${aclAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant aclAdd = ${aclAddress};\n`;
  await writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `ACL Solidity file written to: ${solidityFilePath} with address: ${aclAddress}`,
  );
}

async function computeTFHEExecutorAddress(deployerAddress) {
  const execAddress = computeCreateAddress(deployerAddress, 1);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.exec",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/FHEVMCoprocessorAddress.sol",
  );

  await writeToFile(
    envFilePath,
    `TFHE_EXECUTOR_CONTRACT_ADDRESS=${execAddress}\n`,
  );
  logger.info(
    `TFHE Executor Address written to: ${envFilePath} with address: ${execAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant fhevmCoprocessorAdd = ${execAddress};\n`;
  await writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `TFHE Executor Solidity file written to: ${solidityFilePath} with address: ${execAddress}`,
  );
}

async function computeKMSVerifierAddress(deployerAddress) {
  const kmsVerifierAddress = computeCreateAddress(deployerAddress, 2);
  const envFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/.env.kmsverifier",
  );
  const solidityFilePath = path.join(
    __dirname,
    "../../node_modules/fhevm/lib/KMSVerifierAddress.sol",
  );

  await writeToFile(
    envFilePath,
    `KMS_VERIFIER_CONTRACT_ADDRESS=${kmsVerifierAddress}\n`,
  );
  logger.info(
    `KMS Verifier Address written to: ${envFilePath} with address: ${kmsVerifierAddress}`,
  );

  const solidityTemplate = `// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

address constant KMS_VERIFIER_CONTRACT_ADDRESS = ${kmsVerifierAddress};\n`;
  await writeToFile(solidityFilePath, solidityTemplate);
  logger.info(
    `KMS Verifier Solidity file written to: ${solidityFilePath} with address: ${kmsVerifierAddress}`,
  );
}

export async function computeCoreAddresses(deployerAddress) {
  await computeACLAddress(deployerAddress);
  await computeTFHEExecutorAddress(deployerAddress);
  await computeKMSVerifierAddress(deployerAddress);
}
