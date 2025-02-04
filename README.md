# Hands-on fhEVM

Welcome to the Hands-on fhEVM guide! 🚀

This repository provides a step-by-step guide to setting up your own fhEVM network and deploying fhEVM smart contracts. Follow the instructions below to get started.

## 📖 Overview
fhEVM (Fully Homomorphic Encryption Virtual Machine) enables encrypted computation on blockchain smart contracts. This guide walks you through the setup process, from network initialization to contract deployment and testing.

## 📂 Table of Contents

1. [Basics](./docs/01-basics.md)
2. [Architecture Overview](./docs/02-architecture-overview.md)
3. [Preparation](./docs/03-preparation.md)
4. [Setting Up Network](./docs/04-setting-up-network.md)
5. [Compiling and Deploying](./docs/05-compiling-and-deploying.md)
6. [Writing Smart Contracts](./docs/06-writing-smart-contract.md)
7. [Writing Contract Test Files](./docs/07-writing-contract-test-files.md)
8. [Conclusion](./docs/08-conclusion.md)

## 🛠️ Installation

### Prerequisites
Ensure you have the following installed:

- **Node.js (>=20)**
- **Docker (>=24) with docker compose plugin**

### Setup
Clone the repository and install dependencies:

```sh
git clone https://github.com/airchains-network/hands-on-fhevm.git
cd hands-on-fhevm
npm install
```

### Environment Configuration
Create an `.env` file and configure the necessary environment variables:

```sh
cp .env.example .env
```

### Running the Network
Follow the instructions in [Setting Up Network](./docs/04-setting-up-network.md) to start the network, then proceed through the remaining documentation to learn how to deploy and interact with smart contracts.

## 🤝 Contributing
We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch:
   ```sh
   git checkout -b feature/feature-name/patch-${version}
   ```
3. Commit your changes:
   ```sh
   git commit -m "Description of changes"
   ```
4. Push to your branch:
   ```sh
   git push origin feature/feature-name/patch-${version}
   ```
5. Open a Pull Request.

## 📬 Feedback and Support
If you have any feedback or encounter any issues, feel free to:

- Open an issue in this repository.
- Reach out to us at **support@airchains.network**.

## 📜 License
This project is licensed under the **MIT License**.
