# fhEVM Architecture Overview

The Fully Homomorphic Encryption Virtual Machine (fhEVM) ensures privacy-preserving computations on blockchain networks. Its architecture combines cryptographic principles with blockchain infrastructure to handle encrypted data without ever exposing the plaintext.

---

## Core Components

The architecture consists of several interdependent components:

- **Smart Contracts**: Interact with encrypted data to execute logic securely on the blockchain.
- **fhEVM-native**: A on-chain processing that handles homomorphic computations on ciphertexts using evaluation keys.
- **Key Management System (KMS)**: Safeguards private keys for decryption and re-encryption processes.
- **Gateway**: Acts as a bridge between the blockchain and the KMS, enabling secure operations like decryption and re-encryption.
- **Connector**: A service that connects the gateway to the KMS.
- **Gateway Store**: A service that stores the ciphertexts.
- **fhEVM.js Library**: Facilitates client-side interactions such as encryption, decryption, and re-encryption.

---

## End-to-End Confidentiality

By combining these processes, fhEVM ensures that:

- Plaintext data is never exposed during processing or transmission.
- Homomorphic computations enable complex operations on encrypted data.
- Secure mechanisms like re-encryption allow sharing and interoperability without compromising privacy.

This tightly integrated architecture supports decentralized applications (dApps) that require privacy-preserving operations, paving the way for more secure and trustless systems.
For more detailed insights, you can refer to the original documentation provided by Zama (https://docs.zama.ai/fhevm).

## What's Next?

With your understanding of the fhevm architecture, let's get started. Move on to the **[Preparation](./03-preparation.md)** section to learn how to.
