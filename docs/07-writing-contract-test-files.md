# Writing Contract Test Files

This tutorial demonstrates how to test smart contract functionality using JavaScript. We'll cover essential operations like token minting, transfers, balance encryption, and approvals using ethers.js for blockchain interactions.

## Getting Started

### Required Dependencies
The tutorial uses several key libraries and utilities:
```javascript
import { JsonRpcProvider, Wallet, Contract } from "ethers";  // Core ethers.js components
import { createInstance } from "../utils/create-instance.js"; // FHEVM instance creation
import { loadABI } from "../utils/load-abi.js";             // ABI loading utility
import logger from "../utils/logger.js";                     // Logging utility
```

### Understanding Key Components

#### FHEVM Instance Creation
The `createInstance` function is crucial for our cryptographic operations:
- Creates an instance of the FHEVM (Fully Homomorphic Encryption Virtual Machine)
- Enables secure operations on encrypted data
- Required for privacy-preserving transactions

## Contract Initialization

The following function sets up our contract interface:

```javascript
const initializeContract = async (
  filename,      // ABI file location
  networkUrl,    // RPC endpoint URL
  privateKey,    // Signer's private key
  contractAddress, // Deployed contract address
) => {
  const abi = loadABI(filename);
  const provider = new JsonRpcProvider(networkUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(contractAddress, abi, wallet);
  return { contract, wallet };
};
```

## Core Operations

### 1. Token Information Retrieval
This function fetches basic token metadata:
```javascript
export async function fetchTokenDetails(
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );

    // Fetching basic token information
    const tokenName = await contract.name();
    const tokenSymbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const ownerAddress = await contract.getOwner();

    // Logging retrieved information
    logger.info(`Token Name: ${tokenName}`);
    logger.info(`Token Symbol: ${tokenSymbol}`);
    logger.info(`Total Supply: ${totalSupply}`);
    logger.info(`Owner Address: ${ownerAddress}`);
  } catch (error) {
    logger.error(`Fetch Token Details Error: ${error.message}`);
  }
}
```

### 2. Token Minting
Demonstrates how to create new tokens:
```javascript
export async function mintTokens(
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) {
  try {
    const { contract } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );

    // Mint 1000 tokens - adjust amount as needed
    const transaction = await contract.mint(1000);
    return transaction.hash;
  } catch (error) {
    logger.error(`Mint Tokens Error: ${error.message}`);
  }
}
```

### 3. Encrypted Token Transfer
Implements secure token transfers using encryption:
```javascript
export async function transferTokens(
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );

    // Create FHEVM instance for encryption
    const fhevmInstance = await createInstance();

    // Prepare encrypted input
    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.add64(1337); // Example amount - adjust as needed
    const encryptedInputs = encryptedInput.encrypt();

    // Execute encrypted transfer
    const transaction = await contract["transfer(address,bytes32,bytes)"](
      wallet.address,
      encryptedInputs.handles[0],
      encryptedInputs.inputProof,
    );

    const receipt = await transaction.wait();
    logger.info(`Transfer Receipt: ${receipt}`);

    return transaction.hash;
  } catch (error) {
    logger.error(`Transfer Tokens Error: ${error.message}`);
  }
}
```

### 4. Balance Re-encryption
Enables secure access to encrypted balances:
```javascript
export async function reencryptUserBalance(
  filename,
  networkUrl,
  privateKey1,
  contractAddress,
) {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey1,
      contractAddress,
    );

    // Initialize encryption instance
    const instance = await createInstance();

    // Generate keypair for re-encryption
    const { publicKey, privateKey } = instance.generateKeypair();
    logger.info(`Public Key: ${publicKey}, Private Key: ${privateKey}`);

    // Create and sign EIP712 message
    const eip712 = instance.createEIP712(publicKey, contractAddress);
    const signature = await wallet.signTypedData(
      eip712.domain,
      { Reencrypt: eip712.types.Reencrypt },
      eip712.message,
    );

    // Fetch and re-encrypt balance
    const balance = await contract.balanceOf(wallet.address);
    const userBalance = await instance.reencrypt(
      balance,
      privateKey,
      publicKey,
      signature.replace("0x", ""),
      contractAddress,
      wallet.address,
    );

    logger.info(`User Balance: ${userBalance}`);
  } catch (error) {
    logger.error(`Reencrypt User Balance Error: ${error.message}`);
  }
}
```

### 5. Approval Management
Sets up encrypted spending allowances:
```javascript
export async function approveTransaction(
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) {
  try {
    const { contract, wallet } = await initializeContract(
      filename,
      networkUrl,
      privateKey,
      contractAddress,
    );

    // Initialize encryption
    const fhevmInstance = await createInstance();

    // Prepare encrypted approval amount
    const encryptedInput = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    encryptedInput.add64(1337); // Example amount - adjust as needed
    const encryptedInputs = encryptedInput.encrypt();

    // Execute approval with encrypted amount
    const transaction = await contract["approve(address,bytes32,bytes)"](
      wallet.address,
      encryptedInputs.handles[0],
      encryptedInputs.inputProof,
    );

    return transaction.hash;
  } catch (error) {
    logger.error(`Approve Transaction Error: ${error.message}`);
  }
}
```

## Error Handling
- All functions include try-catch blocks for robust error handling
- Errors are logged using the logger utility
- Transaction failures are properly caught and reported

## Security Considerations
1. Never expose private keys in production code
2. Always verify transaction receipts
3. Implement proper access controls
4. Use secure key management practices
5. Validate all input parameters

#### For indepth information on writing comprehensive test files, refer to the **[Zama's Documentation](https://docs.zama.ai/fhevm)**

## Next Steps
For detailed information on writing comprehensive test files, refer to the **[Conclusion](./08-conclusion.md)** section.
