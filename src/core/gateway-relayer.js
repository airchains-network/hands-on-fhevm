import { JsonRpcProvider, Wallet, Contract, isAddress } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import logger from "../../utils/logger.js";
import { loadABI } from "../../utils/load-abi.js";

dotenv.config();

// Function to add a relayer to the gateway contract
async function addRelayer(
  gatewayOwnerPrivateKey,
  gatewayAddress,
  networkUrl,
  relayerAddress,
) {
  if (!isAddress(gatewayAddress)) {
    throw new Error(`Invalid gateway contract address: ${gatewayAddress}`);
  }
  if (!isAddress(relayerAddress)) {
    throw new Error(`Invalid relayer address: ${relayerAddress}`);
  }

  const provider = new JsonRpcProvider(networkUrl);

  // Ensure that the gateway contract is deployed at the given address
  const codeAtAddress = await provider.getCode(gatewayAddress);
  if (codeAtAddress === "0x") {
    throw new Error(`Gateway contract not found at: ${gatewayAddress}`);
  }

  const abi = loadABI("GatewayContract");
  const ownerWallet = new Wallet(gatewayOwnerPrivateKey, provider);
  const gatewayContract = new Contract(gatewayAddress, abi, ownerWallet);

  // Check if the relayer is already added
  const isAlreadyRelayer = await gatewayContract.isRelayer(relayerAddress);
  if (isAlreadyRelayer) {
    logger.info(`Relayer already added: ${relayerAddress}`);
    return;
  }

  logger.info(`Initiating transaction to add relayer: ${relayerAddress}`);
  const tx = await gatewayContract.addRelayer(relayerAddress);
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    logger.info(`✅ Successfully added relayer: ${relayerAddress}`);
  } else {
    logger.error(`❌ Failed to add relayer: ${relayerAddress}`);
  }
}

// Function to set up the relayer
export async function setupRelayer(
  privateKeyGateway,
  networkUrl,
  privateKeyRelayer,
) {
  const envFilePath = path.resolve(
    process.cwd(),
    "contracts/core/gateway/lib/.env.gateway",
  );

  if (!fs.existsSync(envFilePath)) {
    throw new Error(".env.gateway file not found at: " + envFilePath);
  }

  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
  const gatewayAddress = envConfig.GATEWAY_CONTRACT_PREDEPLOY_ADDRESS;

  if (!gatewayAddress) {
    throw new Error(
      "GATEWAY_CONTRACT_PREDEPLOY_ADDRESS is not set in .env.gateway",
    );
  }

  // Validate the extracted gateway contract address
  if (!isAddress(gatewayAddress)) {
    throw new Error(
      `Invalid gateway address found in .env.gateway: ${gatewayAddress}`,
    );
  }

  // Derive the relayer address
  const provider = new JsonRpcProvider(networkUrl);
  const relayerWallet = new Wallet(privateKeyRelayer, provider);
  // console.log(relayerWallet);
  const relayerAddress = relayerWallet.address;

  // Add the relayer to the gateway contract
  await addRelayer(
    privateKeyGateway,
    gatewayAddress,
    networkUrl,
    relayerAddress,
  );
}
