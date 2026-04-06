import { ethers } from "ethers";

export const SEISMIC_CHAIN_ID = 5124;
export const SEISMIC_CHAIN_ID_HEX = "0x1404";
export const SEISMIC_RPC_URL = "https://gcp-1.seismictest.net/rpc";
export const SEISMIC_EXPLORER_URL = "https://seismic-testnet.socialscan.io";
export const SEISMIC_FAUCET_URL = "https://community-faucet.seismictest.net/";

export const SEISMIC_NETWORK_PARAMS = {
  chainId: SEISMIC_CHAIN_ID_HEX,
  chainName: "Seismic Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: [SEISMIC_RPC_URL],
  blockExplorerUrls: [SEISMIC_EXPLORER_URL]
};

export type EthereumProvider = ethers.providers.ExternalProvider & {
  request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
};

export async function addNetwork(provider: EthereumProvider) {
  if (!provider.request) {
    throw new Error("Wallet provider does not support RPC requests");
  }

  return provider.request({
    method: "wallet_addEthereumChain",
    params: [SEISMIC_NETWORK_PARAMS]
  });
}

export async function switchNetwork(provider: EthereumProvider) {
  if (!provider.request) {
    throw new Error("Wallet provider does not support RPC requests");
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEISMIC_CHAIN_ID_HEX }]
    });
  } catch (error: unknown) {
    const maybeError = error as { code?: number; message?: string };
    if (maybeError?.code === 4902) {
      await addNetwork(provider);
      return;
    }

    throw error;
  }
}

export function shortAddress(address?: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function explorerAddressLink(address: string) {
  return `${SEISMIC_EXPLORER_URL}/address/${address}`;
}

export function explorerTxLink(hash: string) {
  return `${SEISMIC_EXPLORER_URL}/tx/${hash}`;
}
