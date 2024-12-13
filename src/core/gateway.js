import {
  getCreateAddress,
  JsonRpcProvider,
  ContractFactory,
  Wallet,
  Contract,
} from "ethers";
import dotenv from "dotenv";
import getCompiledContract from "../compile.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import logger from "../../utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function computeCreateAddress(from, nonce) {
  return getCreateAddress({ from, nonce });
}

function writeToFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, { flag: "w" });
    logger.info(`File written successfully: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to write file at ${filePath}: ${err}`);
  }
}

async function computePredeployAddress(deployerAddress) {
  const gatewayContractAddressPrecomputed = computeCreateAddress(
    deployerAddress,
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

async function deployGateway(privateKey, networkUrl, deployerAddress) {
  try {
    const compiledContract = getCompiledContract(
      path.resolve(
        __dirname,
        "../../node_modules/fhevm/gateway/GatewayContract.sol",
      ),
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const envConfig = dotenv.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          "../../node_modules/fhevm/lib/.env.kmsverifier",
        ),
      ),
    );
    const contract = await factory.deploy(
      deployerAddress,
      envConfig.KMS_VERIFIER_CONTRACT_ADDRESS,
    );

    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    logger.error(`Error deploying contract: ${error.message}`);
    throw error;
  }
}

// TODO: CHECK IF THIS IS WORKING
async function addRelayer(
  privateKey,
  gatewayAddress,
  networkUrl,
  relayerAddress,
) {
  const provider = new JsonRpcProvider(networkUrl);
  try {
    // Validate if the address is a contract
    const codeAtAddress = await provider.getCode(gatewayAddress);
    if (codeAtAddress === "0x") {
      throw new Error(`${gatewayAddress} is not a smart contract`);
    }

    // Set up wallet and contract instance
    const owner = new Wallet(privateKey, provider);
    const gateway = new Contract(
      gatewayAddress,
      ["function addRelayer(address relayer) public"],
      owner,
    );

    // Call addRelayer method
    const tx = await gateway.addRelayer(relayerAddress);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      logger.info(
        `Account ${relayerAddress} was successfully added as a gateway relayer`,
      );
    } else {
      logger.info("Adding relayer failed");
    }
  } catch (error) {
    logger.error("Error in addRelayer:", error);
  }
}

export async function gateway(privateKey, networkUrl, deployerAddress) {
  try {
    await computePredeployAddress(deployerAddress);
    await deployGateway(privateKey, networkUrl, deployerAddress);

    // Read environment configuration
    const envConfig = dotenv.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          "../../node_modules/fhevm/gateway/lib/.env.gateway",
        ),
      ),
    );

    // Add relayer
    await addRelayer(
      privateKey,
      envConfig.GATEWAY_CONTRACT_PREDEPLOY_ADDRESS,
      networkUrl,
      deployerAddress,
    );
  } catch (error) {
    logger.error("Error in gateway function:", error);
  }
}
