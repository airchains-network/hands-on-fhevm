# Preparation

This section will guide you through setting up your environment to work with fhevm and give you a basic understanding of how to use JS to compile, deploy and interact your fhevm-contracts on a fhe-enabled ethermint chain.

Follow these simple steps to ensure you have the necessary tools and dependencies.

---

## Prerequisites

Before proceeding, ensure your system meets the following requirements:

- **Operating System**: Linux, macOS, or Windows with WSL2
- **Go**: Version `v1.23.x` or higher
- **Docker**: Version `v26.x.x` or higher
- **Node.js**: Node.js `v20.x` or higher

---

## Step 1: Install Go

1. Visit the [Go Downloads Page](https://go.dev/dl/) and download the installer for your operating system.
2. Follow the installation instructions specific for your OS.
3. Verify the installation by running the following command:
   ```bash
   go version
   ```
   You should see the installed Go version in the output.

---

## Step 2: Install Docker

1. Follow the official Docker installation guide for your operating system:
   - [Install Docker on Linux](https://docs.docker.com/engine/install/)
   - [Install Docker on macOS](https://docs.docker.com/docker-for-mac/install/)
2. After installation, verify Docker is installed correctly:
   ```bash
   docker --version
   ```
   You should see the installed Docker version in the output.
3. Ensure Docker can run without `sudo` (Linux users only):
   ```bash
   sudo groupadd docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```
   Verify it works:
   ```bash
   docker run hello-world
   ```

---

## Step 3: Install Docker Compose Plugin

1. Follow the official Docker Compose plugin installation guide for your operating system:
   - [Install Docker Compose Plugin on Linux](https://docs.docker.com/compose/install/linux/)
   - [Install Docker Compose Plugin on macOS](https://docs.docker.com/compose/install/mac/)
2. After installation, verify Docker Compose plugin is installed correctly:
   ```bash
   docker compose version
   ```
   You should see the installed Docker Compose plugin version in the output.

---

## Step 4: Install Node.js

1. Install Node.js and npm using the official guide for your operating system: [Node.js Downloads](https://nodejs.org/en/download/)

   - Select the **LTS** version for better stability.

2. Verify the installation by running the following commands:
   ```bash
   node -v
   npm -v
   ```
   These should output the installed Node.js and npm versions.

---

## Step 5: Clone the Project Repository and Setup

Once Go and Docker are installed, clone the **hands-on-fhevm** repository from GitHub:

1. Open a terminal and navigate to the directory where you want to clone the repository.
2. Run the following command:
   ```bash
   git clone https://github.com/airchains-network/hands-on-fhevm.git
   ```
3. Navigate to the project directory:
   ```bash
   cd hands-on-fhevm
   ```
4. Install dependencies
   ```bash
   npm install
   ```
5. Create a .env file
   ```bash
   cp .env.example .env
   ```
6. Deploy essential contracts on network setup
   ```bash
   npm start
   ```

---

## What's Next?

With your prerequisites set up, move on to the **[Setting up Network](./04-setting-up-network.md)** section to set up your fhevm network.
