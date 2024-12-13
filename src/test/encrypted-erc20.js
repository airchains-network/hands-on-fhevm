import path from "path";
import fs from "fs";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../../utils/createInstance.js";

function loadABI(fileName) {
  try {
    const abiFilePath = path.resolve(process.cwd(), `build/${fileName}.json`);
    const abiContent = fs.readFileSync(abiFilePath, "utf8");
    return JSON.parse(abiContent);
  } catch (error) {
    console.error("Error reading ABI file:", error.message);
    process.exit(1);
  }
}

export const mintTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

    const transaction = await contract.mint(1000);
    return await transaction.hash;
  } catch (error) {
    console.log(error);
  }
};

export const decryptMintedTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

    const encryptedBalance = await contract.balanceOf(wallet.address);
    console.log(encryptedBalance);

    const requestTx = await contract.requestDecryptedBalanceOf(wallet.address);
    await requestTx.wait();

    const decryptedBalance = await contract.decryptedBalanceOf(wallet.address);
    console.log(decryptedBalance);
  } catch (error) {
    console.log(error);
  }
};

export const fetchTokenDetails = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

    const tokenName = await contract.name();
    console.log(tokenName);

    const tokenSymbol = await contract.symbol();
    console.log(tokenSymbol);

    const totalSupply = await contract.totalSupply();
    console.log(totalSupply);

    const ownerAddress = await contract.getOwner();
    console.log(ownerAddress);
  } catch (error) {
    console.log(error);
  }
};

export const transferTokens = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

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

    const receipt = await transaction.wait();

    console.log(receipt);

    return await transaction.hash;
  } catch (error) {
    console.log(error);
  }
};

export const reencryptUserBalance = async (
  filename,
  networkUrl,
  privateKey1,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey1, provider);
    console.log(wallet);
    const contract = new Contract(contractAddress, abi, wallet);
    const instance = await createInstance();

    const { publicKey, privateKey } = instance.generateKeypair();
    console.log(publicKey, privateKey);
    const eip712 = instance.createEIP712(publicKey, contractAddress);
    const signature = await wallet.signTypedData(
      eip712.domain,
      { Reencrypt: eip712.types.Reencrypt },
      eip712.message,
    );
    const balance = await contract.balanceOf(wallet.address);
    console.log(balance);

    const userBalance = await instance.reencrypt(
      balance, // the encrypted balance
      privateKey, // the private key generated by the dApp
      publicKey, // the public key generated by the dApp
      signature.replace("0x", ""), // the user's signature of the public key
      contractAddress, // The contract address where the ciphertext is
      wallet.address, // The user address where the ciphertext is
    );

    console.log(userBalance);
  } catch (error) {
    console.log(error);
  }
};

export const approveTransaction = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = loadABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

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

    return await transaction.hash;
  } catch (error) {
    console.log(error);
  }
};
