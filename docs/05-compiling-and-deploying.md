# Compiling and Deploying fhEVM Smart Contracts

This guide provides instructions on compiling and deploying Fully Homomorphic Encryption Virtual Machine (fhEVM) smart contracts. These contracts operate in an environment where data remains encrypted, offering enhanced privacy.

If you are new to blockchain development, **learn the basics of compiling, deploying, and interacting with standard Ethereum smart contracts first**. There are many tutorials online that explain these foundational concepts, which will make it easier to understand fhEVM development.
The template repository contains pre-written codes for compilation and deployment, along with sample contracts. Follow the steps below to get started.

---


## fhEVM Smart Contracts

The compilation codes uses the Solidity compiler (`solc`) to compile smart contracts and extract their ABI and bytecode. It also handles special import resolutions required for fhEVM contracts.

### Steps to Compile and Deploy

1. Ensure your contract file is placed in the `contracts/` directory.
2. Navigate to `contract-deploy.js` and search for `contractName` variable and replace the value with the name of the your desired contract.

### Output

The compiled ABI is stored in the `build/` directory. For example:

- ABI: `build/<ContractName>.json`
- Bytecode: Generated and used internally by the deployment script.

**Note**: The script resolves imports from `node_modules/` automatically.

### Deployment fhEVM Smart Contracts

The deployment process requires:

- A JSON-RPC endpoint of the fhEVM-compatible network.
- A private key for deploying the contract.
- The compiled contract file (from the `build/` directory).
- Constructor arguments (if any).

The `contract-deploy.js` has function call that deploys your contract with a **_test private key_** created from the mnemonic present in `.env`

---

## What's Next?

Let's continue to writing fhevm smart contracts. Move on to the **[Writing Smart Contracts](./06-writing-smart-contract.md)** section to learn.
