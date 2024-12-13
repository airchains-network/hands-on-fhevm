import getCompiledContract from "../compile.js";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import logger from "../../utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployACL(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      path.resolve(__dirname, "../../node_modules/fhevm/lib/ACL.sol"),
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const envConfig = dotenv.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../../node_modules/fhevm/lib/.env.exec"),
      ),
    );
    const contract = await factory.deploy(
      envConfig.TFHE_EXECUTOR_CONTRACT_ADDRESS,
    );

    await contract.waitForDeployment();
    logger.info(`ACL contract deployed at address: ${contract.target}`);
    return contract;
  } catch (error) {
    logger.error(`Error deploying ACL contract: ${error.message}`);
    throw error;
  }
}

async function deployTFHEExecutor(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      path.resolve(__dirname, "../../node_modules/fhevm/lib/TFHEExecutor.sol"),
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const contract = await factory.deploy();

    await contract.waitForDeployment();
    logger.info(
      `TFHEExecutor contract deployed at address: ${contract.target}`,
    );
    return contract;
  } catch (error) {
    logger.error(`Error deploying TFHEExecutor contract: ${error.message}`);
    throw error;
  }
}

async function deployKMSVerifier(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      path.resolve(__dirname, "../../node_modules/fhevm/lib/KMSVerifier.sol"),
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const contract = await factory.deploy();

    await contract.waitForDeployment();
    logger.info(`KMSVerifier contract deployed at address: ${contract.target}`);
    return contract;
  } catch (error) {
    logger.error(`Error deploying KMSVerifier contract: ${error.message}`);
    throw error;
  }
}

export async function deployCoreContracts(privateKey, networkUrl) {
  await deployACL(privateKey, networkUrl);
  await deployTFHEExecutor(privateKey, networkUrl);
  await deployKMSVerifier(privateKey, networkUrl);
}
