import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import logger from "../utils/logger.js";

async function deployContract(
  networkUrl,
  privateKey,
  compiledContract,
  constructorArgs = [],
) {
  try {
    // Retrieve the compiled contract object from the specified file
    const { abi, evm } = compiledContract; // Destructure ABI and EVM bytecode

    // Initialize a JSON-RPC provider to interact with the Ethereum network
    const provider = new JsonRpcProvider(networkUrl);
    // Create a wallet instance using the provided private key and provider
    const wallet = new Wallet(privateKey, provider);

    // Create a contract factory for deploying the contract
    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    // Deploy the contract with the specified constructor arguments
    const contract = await factory.deploy(...constructorArgs);

    // Wait for the contract deployment to be mined and confirmed
    await contract.waitForDeployment();
    return { contract }; // Return the deployed contract instance
  } catch (error) {
    logger.error(`Error deploying contract: ${error.message}`);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export default deployContract;
