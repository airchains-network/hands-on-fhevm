# Preparation

This section will guide you through setting up your environment to work with fhevm and give you a basic understanding of how to use javascript to compile, deploy and interact your fhevm-contracts on a fhe-enabled ethermint chain.  Follow these simple steps to ensure you have the necessary tools and dependencies.

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
2. Follow the installation instructions specific to your OS.
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

## Step 3: Install Node.js

1. Install Node.js and npm using the official guide for your operating system: [Node.js Downloads](https://nodejs.org/en/download/)

   - Select the **LTS** version for better stability.

2. Verify the installation by running the following commands:
   ```bash
   node -v
   npm -v
   ```
   These should output the installed Node.js and npm versions.

---


## Step 4: Clone the Project Repository and Setup

Once Go and Docker are installed, clone the **[Your Project Name]** repository from GitHub:

1. Open a terminal and navigate to the directory where you want to clone the repository.
2. Run the following command:
   ```bash
   git clone https://github.com/your-org/your-repo.git
   ```
3. Navigate to the project directory:
   ```bash
   cd your-repo
   ```
4. Checkout the branch
   ```bash
   git checkout <branch-name>
   ```
5. Install dependencies
   ```bash
   npm install
   ```
6. Create a .env file
   ```bash
   cp .env.example .env
   ```
<!-- 7. Add your private key and network url to the .env file
   ```bash
   PRIVATE_KEY=<your-private-key>
   NETWORK_URL=<your-network-url>
   ``` -->
---

## What's Next?

With your environment prepared, you're ready to start exploring on fhevm. Move on to the **[Writing smart contracts](04-Writing-Smart-Contracts.md)** section to learn how to configure and setup your project.
