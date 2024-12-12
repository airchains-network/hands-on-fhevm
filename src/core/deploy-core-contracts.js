import getCompiledContract from "../compile.js";
import logger from "../../utils/logger.js";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function deployACL(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      "../../node_modules/fhevm/lib/ACL.sol",
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const envConfig = dotenv.parse(
      fs.readFileSync("../../node_modules/fhevm/lib/.env.exec"),
    );
    const contract = await factory.deploy(
      envConfig.TFHE_EXECUTOR_CONTRACT_ADDRESS,
    );

    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    logger.error(`Error deploying contract:`, error.message);
    throw error;
  }
}

async function deployTFHEExecutor(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      "../../node_modules/fhevm/lib/TFHEExecutor.sol",
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const contract = await factory.deploy();

    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    logger.error(`Error deploying contract:`, error.message);
    throw error;
  }
}

async function deployKMSVerifier(privateKey, networkUrl) {
  try {
    const compiledContract = getCompiledContract(
      "../../node_modules/fhevm/lib/KMSVerifier.sol",
    );
    const { abi, evm } = compiledContract;

    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    const factory = new ContractFactory(abi, evm.bytecode, wallet);
    const contract = await factory.deploy();

    await contract.waitForDeployment();
    return contract;
  } catch (error) {
    logger.error(`Error deploying contract:`, error.message);
    throw error;
  }
}

export async function deployCoreContracts() {
  const networkUrl = process.env.NETWORK_URL;
  const privateKey = process.env.PRIVATE_KEY;

  await deployACL(privateKey, networkUrl);
  await deployTFHEExecutor(privateKey, networkUrl);
  await deployKMSVerifier(privateKey, networkUrl);
}

//   const envConfig2 = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/lib/.env.kmsverifier"),
//   );

//   const gatewayFactory = await ethers.getContractFactory(
//     "fhevm/gateway/GatewayContract.sol:GatewayContract",
//     deployer,
//   );
//   const gateway = await gatewayFactory.deploy(
//     ownerAddress,
//     envConfig2.KMS_VERIFIER_CONTRACT_ADDRESS,
//   );
//   await gateway.deployed();

//   const gatewayContractAddress = gateway.address;

//   const envConfig = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/gateway/lib/.env.gateway"),
//   );

//   if (gatewayContractAddress !== envConfig.GATEWAY_CONTRACT_PREDEPLOY_ADDRESS) {
//     throw new Error(
//       `The nonce of the deployer account is not null. Please use another deployer private key or relaunch a clean instance of the fhEVM`,
//     );
//   }

//   console.log(
//     "GatewayContract was deployed at address: ",
//     gatewayContractAddress,
//   );
// }

// export async function deployACL() {
//   const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
//   const deployer = (await provider.listAccounts())[0];

//   const factory = await ethers.getContractFactory(
//     "fhevm/lib/ACL.sol:ACL",
//     deployer,
//   );
//   const envConfigExec = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/lib/.env.exec"),
//   );

//   const acl = await factory.deploy(
//     envConfigExec.TFHE_EXECUTOR_CONTRACT_ADDRESS,
//   );
//   await acl.deployed();

//   const address = acl.address;
//   const envConfigAcl = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/lib/.env.acl"),
//   );

//   if (address !== envConfigAcl.ACL_CONTRACT_ADDRESS) {
//     throw new Error(
//       `The nonce of the deployer account is not correct. Please relaunch a clean instance of the fhEVM`,
//     );
//   }

//   console.log("ACL was deployed at address:", address);
// }

// export async function deployTFHEExecutor() {
//   const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
//   const deployer = (await provider.listAccounts())[0];

//   const factory = await ethers.getContractFactory("TFHEExecutor", deployer);

//   const exec = await factory.deploy();
//   await exec.deployed();

//   const address = exec.address;
//   const envConfig = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/lib/.env.exec"),
//   );

//   if (address !== envConfig.TFHE_EXECUTOR_CONTRACT_ADDRESS) {
//     throw new Error(
//       `The nonce of the deployer account is not correct. Please relaunch a clean instance of the fhEVM`,
//     );
//   }

//   console.log("TFHEExecutor was deployed at address:", address);
// }

// export async function deployKMSVerifier() {
//   const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
//   const deployer = (await provider.listAccounts())[0];

//   const factory = await ethers.getContractFactory(
//     "fhevm/lib/KMSVerifier.sol:KMSVerifier",
//     deployer,
//   );

//   const exec = await factory.deploy();
//   await exec.deployed();

//   const address = exec.address;
//   const envConfig = dotenv.parse(
//     fs.readFileSync("node_modules/fhevm/lib/.env.kmsverifier"),
//   );

//   if (address !== envConfig.KMS_VERIFIER_CONTRACT_ADDRESS) {
//     throw new Error(
//       `The nonce of the deployer account is not correct. Please relaunch a clean instance of the fhEVM`,
//     );
//   }

//   console.log("KMSVerifier was deployed at address:", address);
// }
