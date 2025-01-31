import { createRequire } from "module";
const fhevmjs = createRequire(import.meta.url)("fhevmjs");

// Function to create and return an instance of fhevmjs
export function createInstance() {
  const instance = fhevmjs.createInstance({
    networkUrl: process.env.NETWORK_URL,
    gatewayUrl: process.env.GATEWAY_URL,
  });
  return instance;
}
