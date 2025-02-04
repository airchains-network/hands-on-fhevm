# Setting up Network

This section will guide you through setting up your **fhevm network** using docker.

---

## Spin up the network

```bash
make run-full
```
This will start the network and the fhevm-service along with generation of necessary keys.

---

## Fund accounts

```bash
npm run fund
```

---

## Deploy the essential core contracts
```bash
npm run core
```
> [!NOTE]
> On running this command, you will see `Error: Gateway contract not found at: <gateway-contract-deployed-address>`  This is expected and can be ignored.
>
> Once you rerun the same command, this won't happen.
>
> It is a known issue and will be fixed in the future.
---

## Stop the network

```bash
make stop-full
```
This will stop the network and all the running containers.

---

## What's Next?
Your fhevm-network is now ready to use. Now you can proceed to [Compiling and Deploying](./05-compiling-and-deploying.md) your smart contracts.
