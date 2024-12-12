# Compiling and Deploying fhEVM Smart Contracts
This guide provides instructions on compiling and deploying Fully Homomorphic Encryption Virtual Machine (fhEVM) smart contracts. These contracts operate in an environment where data remains encrypted, offering enhanced privacy.

If you are new to blockchain development, **learn the basics of compiling, deploying, and interacting with standard Ethereum smart contracts first**. There are many tutorials online that explain these foundational concepts, which will make it easier to understand fhEVM development.
The template repository contains pre-written codes for compilation and deployment, along with sample contracts. Follow the steps below to get started.

---

## Quick Start: Compilation and Deployment

The repository provides a simplified workflow for compiling and deploying fhEVM smart contracts. All you need is one command:

```bash
node index.js
```

This command automatically compiles and deploys the specified smart contract using the `index.js` script. Ensure you configure the environment variables in a `.env` file as explained below.

---

## Core Steps

### Compiling fhEVM Smart Contracts

The compilation script uses the Solidity compiler (`solc`) to compile smart contracts and extract their ABI and bytecode. It also handles special import resolutions required for fhEVM contracts.

#### Steps to Compile
1. Ensure your contract file is placed in the `contracts/` directory.
2. Use the following command to compile your contract:
   ```bash
   node scripts/compile.js <ContractName>
   ```
   Replace `<ContractName>` with the name of your Solidity file (without the `.sol` extension).

#### Output
The compiled ABI and bytecode are stored in the `build/` directory. For example:
- ABI: `build/<ContractName>.json`
- Bytecode: Generated and used internally by the deployment script.

**Note**: The script resolves imports from `node_modules/` automatically.

---

### Deploying fhEVM Smart Contracts

Deployment uses the `ethers.js` library, connecting to an fhEVM-compatible blockchain network.

#### Deployment Script
The deployment script expects:
- A JSON-RPC endpoint of the fhEVM-compatible network.
- A private key for deploying the contract.
- The compiled contract file (from the `build/` directory).
- Constructor arguments (if any).

#### Steps to Deploy
1. Run the deployment script with the following command:
   ```bash
   node scripts/deploy.js <NetworkURL> <PrivateKey> <ContractName> [ConstructorArgs]
   ```
   Replace:
   - `<NetworkURL>`: URL of the fhEVM network's RPC endpoint.
   - `<PrivateKey>`: Your Ethereum wallet's private key.
   - `<ContractName>`: Name of the contract file (without `.sol`).
   - `[ConstructorArgs]`: Optional arguments required by the contract's constructor.

2. After deployment, the script outputs the deployed contract's address.

#### Example
```bash
node scripts/deploy.js http://localhost:8545 0xYourPrivateKey MyContract "arg1" "arg2"
```

---

## Special Considerations for fhEVM

When working with fhEVM smart contracts:
1. **Encrypted State**: Ensure all data processed by the contract is encrypted using the fhEVM.js library.
2. **Homomorphic Functions**: Write functions that perform operations on encrypted data, adhering to the constraints of the fhEVM.
3. **Pre-Defined Templates**: Use the sample contracts provided in the repository as a starting point.

---

## Next Steps

With your contracts compiled and deployed, you can now interact with them using the `ethers.js` library or the `fhEVM.js` utilities provided in the repository. Refer to the `README.md` in the cloned repo for additional examples and usage instructions.
