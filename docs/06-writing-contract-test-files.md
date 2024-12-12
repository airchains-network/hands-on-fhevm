# Smart Contract Testing Tutorial (JavaScript)

Let's test your smart contract functionality using JavaScript. We will interact with a smart contract by performing various actions like minting tokens, transferring tokens, decrypting balances, and more. We won't be using Hardhat in this tutorial but will rely on ethers.js for blockchain interactions.

---

## Importing Necessary Libraries

To begin, we need to import a few necessary libraries and modules for interacting with the blockchain and reading our ABI files.

### Code for Imports:

```js
import path from "path";
import fs from "fs";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { createInstance } from "../utils/createIntance.js";
```

### **About `createInstance`**

The `createInstance` function returns an instance of **fhevmjs**, a powerful tool for cryptographic operations on encrypted blockchain data.

### **Key Capabilities of an fhevmjs Instance**
- **Encrypt inputs with the blockchain's public key**: Ensures data privacy before sending it to the blockchain.
- **Manage user keys to re-encrypt contract data**: Allows re-encryption of blockchain-stored encrypted data.

## **Now, let's start by retrieving the basic token details of the token.** 🚀

### **Token Details**

This function retrieves essential details about the token, including its name, symbol, total supply, and contract owner. These details provide a comprehensive overview of the token's key attributes.

We achieve this by calling the respective functions from the smart contract to fetch each of these properties.

### **Code Breakdown**

```javascript
export const TokenDetails = async (filename, networkUrl, privateKey, contractAddress) => {
  try {
    //  Loads the ABI for the contract.
    const abi = getABI(filename);

    //  Provider & Wallet Setup
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);

    // Contract Initialization to interact with the blockchain.
    const contract = new Contract(contractAddress, abi, wallet);

    // Call Contract Functions**: Calls the following contract functions and logs the results.
    const name = await contract.name();
    console.log("Token Name:", name);

    const symbol = await contract.symbol();
    console.log("Token Symbol:", symbol);

    const totalSupply = await contract.totalSupply();
    console.log("Total Supply:", totalSupply);

    const owner = await contract.getOwner();
    console.log("Contract Owner:", owner);
  } catch (error) {
    // Error Handling
    console.log("Token Details Error:", error);
  }
};
```

## **Mint Token Test**

This function calls the **`mint`** function from the smart contract, which increases the total supply and assigns new tokens to owner.

---

### **Code Breakdown**

```javascript
export const intractionMint = async (
  filename,
  networkUrl,
  privateKey1,
  contractAddress,
) => {
  try {

    const abi = getABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey1, provider);
    const contract = new Contract(contractAddress, abi, wallet);

    // Call the Mint Function
    const tx = await contract.mint(1000);

    // Return Transaction Hash
    return await tx.hash;

  } catch (error) {
    console.log("Mint Token Error:", error);
  }
};
```

## **Transfer Token Test**

### **Decryption Process Breakdown**

1. **Create Encrypted Input**:
   - An encrypted input is created using the **user address** and **contract address**. This prevents reuse of the same encrypted input in other contexts, ensuring security and privacy.
   - The encrypted input can contain multiple values of different types, all packed into a single ciphertext.
    ```javascript
    const input = fhevmInstance.createEncryptedInput(contractAddress, wallet.address);
    ```

2. **Input Object Methods**:
   - The input object provides methods to add values of different data types, such as:
     - `addBool()`
     - `add4()`, `add8()`, `add16()`, etc.
     - `addAddress()`
   - These methods allow us to add integers, addresses, and other data types to the input.
   ```javascript
   input.add64(1337);
   ```

3. **Encryption**:
   - The `encrypt()` method encrypts all the added values into a single ciphertext.
   - The encryption generates the following parameters:
     - **inputs.handles[0]**: Encrypted handle for the amount to be transferred.
     - **inputs.inputProof**: Proof that validates the encrypted input's authenticity.
    ```javascript
    const inputs = input.encrypt();
     ```

4. **Passing Encrypted Inputs**:
   - When calling a smart contract function (like `transfer()`), we pass:
     - **inputs.handles[0]**: Represents the encrypted amount.
     - **inputs.inputProof**: Provides proof for input verification.
    ```javascript
    const tx = await contract["transfer(address,bytes32,bytes)"](
      "0x85f0556CB63CfCE1796Ff0B2781202dcC33377Af", // Recipient address
      inputs.handles[0], // Encrypted handle for the amount
      inputs.inputProof, // Encrypted proof for input validation
    );
    ```

Below is the complete code for the transfer function.
```javascript
export const intractionTransfer = async (
  filename,
  networkUrl,
  privateKey,
  contractAddress,
) => {
  try {
    const abi = getABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, abi, wallet);

    const fhevmInstance = await createInstance();

    const input = fhevmInstance.createEncryptedInput(
      contractAddress,
      wallet.address,
    );
    input.add64(1337);
    const inputs = input.encrypt();
    const tx = await contract["transfer(address,bytes32,bytes)"](
      "0x85f0556CB63CfCE1796Ff0B2781202dcC33377Af",
      inputs.handles[0],
      inputs.inputProof,
    );

    return await tx.hash;
  } catch (error) {
    console.log(error);
  }
};
```

## Reencryption

Re-encryption allows secure access to encrypted blockchain data using user-specific keypairs. This process involves generating keypairs, verifying ownership of the public key, and re-encrypting ciphertexts. Below are the key steps of the process.

### **Keypair Generation**
A **keypair** consists of a **private key** and a **public key**, both generated by the dApp. These keys enable the re-encryption of blockchain ciphertexts, ensuring secure access to encrypted data.

#### Generate the private and public key, used for re-encryption
```javascript
const { publicKey, privateKey } = instance.generateKeypair();
```
#### Create an EIP712 object for the user to sign

To verify ownership of the public key, the user signs it along with the contract address using the EIP712 standard. This signature allows re-encryption of ciphertexts linked to the user and contract.

```javascript
const eip712 = instance.createEIP712(publicKey, contractAddress);
const signature = await wallet.signTypedData(eip712.domain, { Reencrypt: eip712.types.Reencrypt }, eip712.message);
```

#### Reencryption
reencrypt method will use the gatewayUrl to get the reencryption of a ciphertext and decrypt it.

```javascript
const balance = await contract.balanceOf(wallet.address) // returns the handle of hte ciphertext as a uint256 (bigint)
const userBalance = await instance.reencrypt(balance, privateKey, publicKey, signature, contractAddress, userAddress);
```
Below is the complete code for the reencryption.
```javascript
export const reencryptBalance = async (
  filename,
  networkUrl,
  privateKey1,
  contractAddress,
) => {
  try {
    const abi = getABI(filename);
    const provider = new JsonRpcProvider(networkUrl);
    const wallet = new Wallet(privateKey1, provider);
    const contract = new Contract(contractAddress, abi, wallet);
    const instance = await createInstance();

    const { publicKey, privateKey } = instance.generateKeypair();
    const eip712 = instance.createEIP712(publicKey, contractAddress);
    const signature = await wallet.signTypedData(eip712.domain, { Reencrypt: eip712.types.Reencrypt }, eip712.message);
    const balance = await contract.balanceOf(wallet.address)

    const userBalance = await instance.reencrypt(
      balance, // the encrypted balance
      privateKey, // the private key generated by the dApp
      publicKey, // the public key generated by the dApp
      signature.replace("0x", ""), // the user's signature of the public key
      contractAddress, // The contract address where the ciphertext is
      wallet.address, // The user address where the ciphertext is
    );

    console.log(userBalance)

  } catch (error) {
    console.log(error);
  }
};
```

View the complete test file here: [Link]
