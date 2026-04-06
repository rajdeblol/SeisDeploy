"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import {
  EthereumProvider,
  SEISMIC_CHAIN_ID,
  shortAddress,
  switchNetwork
} from "@/lib/seismic";

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function useWallet() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const refreshBalance = useCallback(async () => {
    if (!provider || !account) return;
    const rawBalance = await provider.getBalance(account);
    setBalance(ethers.utils.formatEther(rawBalance));
  }, [provider, account]);

  const bootstrapWallet = useCallback(async () => {
    if (!window.ethereum) return;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const network = await web3Provider.getNetwork();
    setProvider(web3Provider);
    setChainId(network.chainId);

    const accounts = await web3Provider.listAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setSigner(web3Provider.getSigner());
    }
  }, []);

  useEffect(() => {
    bootstrapWallet();
  }, [bootstrapWallet]);

  useEffect(() => {
    if (!window.ethereum?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const nextAccount = accounts[0] ?? "";
      setAccount(nextAccount);
      setSigner(nextAccount && provider ? provider.getSigner() : null);
    };

    const handleChainChanged = (nextChainIdHex: string) => {
      setChainId(Number.parseInt(nextChainIdHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [provider]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const accounts = (await web3Provider.send("eth_requestAccounts", [])) as string[];

    if (!accounts[0]) {
      throw new Error("No accounts found");
    }

    const network = await web3Provider.getNetwork();
    if (network.chainId !== SEISMIC_CHAIN_ID) {
      await switchNetwork(window.ethereum);
    }

    const seismicNetwork = await web3Provider.getNetwork();

    setProvider(web3Provider);
    setSigner(web3Provider.getSigner());
    setAccount(accounts[0]);
    setChainId(seismicNetwork.chainId);

    return accounts[0];
  }, []);

  const isWrongNetwork = chainId !== null && chainId !== SEISMIC_CHAIN_ID;

  return useMemo(
    () => ({
      provider,
      signer,
      account,
      chainId,
      balance,
      isWrongNetwork,
      shortAccount: shortAddress(account),
      connected: Boolean(account),
      connect,
      refreshBalance
    }),
    [provider, signer, account, chainId, balance, isWrongNetwork, connect, refreshBalance]
  );
}
