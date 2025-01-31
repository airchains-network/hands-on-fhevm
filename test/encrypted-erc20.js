import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../utils/create-instance.js";
import { loadABI } from "../utils/load-abi.js";
import logger from "../utils/logger.js";

const handleError = (functionName, error) => {
  logger.error(`Error in ${functionName}:`, error);
};

const initializeContract = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  const abi = loadABI(filename);
  const provider = new JsonRpcProvider(networkUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, abi, wallet);
  return { contract, wallet };
};

export const mintTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const transaction = await contract.mint(1000);
    return transaction.hash;
  } catch (error) {
    handleError("mintTokens", error);
    throw error;
  }
};

export const decryptMintedTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const encryptedBalance = await contract.balanceOf(wallet.address);
    logger.info(`Encrypted Balance: ${encryptedBalance}`);

    const requestTx = await contract.requestDecryptedBalanceOf(wallet.address);
    await requestTx.wait();

    const decryptedBalance = await contract.decryptedBalanceOf(wallet.address);
    logger.info(`Decrypted Balance: ${decryptedBalance}`);
  } catch (error) {
    handleError("decryptMintedTokens", error);
    throw error;
  }
};

export const fetchTokenDetails = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const [tokenName, tokenSymbol, totalSupply, ownerAddress] =
      await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.getOwner(),
      ]);

    logger.info(`Token Name: ${tokenName}`);
    logger.info(`Token Symbol: ${tokenSymbol}`);
    logger.info(`Total Supply: ${totalSupply}`);
    logger.info(`Owner Address: ${ownerAddress}`);
  } catch (error) {
    handleError("fetchTokenDetails", error);
    throw error;
  }
};

export const transferTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const fhevmInstance = await createInstance();

    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.add64(1337);
    const encryptedInputs = encryptedInput.encrypt();

    const transaction = await contract["transfer(address,bytes32,bytes)"](
      wallet.address,
      encryptedInputs.handles[0],
      encryptedInputs.inputProof,
    );

    logger.info(`Tx Receipt: ${transaction.hash}`);
    return transaction.hash;
  } catch (error) {
    handleError("transferTokens", error);
    throw error;
  }
};

export const reencryptUserBalance = async (
  filename,
  networkUrl,
  privateKeyA,
  contractAddress,
) => {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKeyA,
      contractAddress,
    );
    const instance = await createInstance();

    const { publicKey, privateKeyB } = instance.generateKeypair();
    const eip712 = instance.createEIP712(publicKey, contractAddress);
    const signature = await wallet.signTypedData(
      eip712.domain,
      { Reencrypt: eip712.types.Reencrypt },
      eip712.message,
    );
    const balance = await contract.balanceOf(wallet.address);
    logger.info(`Balance: ${balance}`);

    const userBalance = await instance.reencrypt(
      balance,
      privateKeyB,
      publicKey,
      signature.replace("0x", ""),
      contractAddress,
      wallet.address,
    );

    logger.info(`User Balance: ${userBalance}`);
  } catch (error) {
    handleError("reencryptUserBalance", error);
    throw error;
  }
};

export const approveTransaction = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );
    const fhevmInstance = await createInstance();

    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.add64(1337);
    const encryptedInputs = encryptedInput.encrypt();

    const transaction = await contract["approve(address,bytes32,bytes)"](
      wallet.address,
      encryptedInputs.handles[0],
      encryptedInputs.inputProof,
    );

    return transaction.hash;
  } catch (error) {
    handleError("approveTransaction", error);
    throw error;
  }
};
