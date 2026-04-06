"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { CheckCircle2, Copy, ExternalLink, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { INTERNAL_CONTRACTS, ContractKind } from "@/lib/contracts";
import { deployContract, estimateDeploymentGas } from "@/lib/deploy";
import { explorerAddressLink } from "@/lib/seismic";
import { toast } from "@/components/ui/toaster";

type WalletLike = {
  signer: ethers.Signer | null;
  connected: boolean;
  isWrongNetwork: boolean;
};

export type DeployResult = {
  address: string;
  txHash: string;
};

type DeployPanelProps = {
  wallet: WalletLike;
  addLog: (type: "INFO" | "OK" | "ERROR", message: string) => void;
  onDeployed: (result: DeployResult | null) => void;
};

type GasSpeed = "slow" | "medium" | "fast";

const GAS_SPEEDS: Array<{
  id: GasSpeed;
  emoji: string;
  label: string;
  eta: string;
  multiplier: number;
}> = [
  { id: "slow", emoji: "🐢", label: "Slow", eta: "~30s", multiplier: 0.8 },
  { id: "medium", emoji: "⚡", label: "Medium", eta: "~15s", multiplier: 1.0 },
  { id: "fast", emoji: "🚀", label: "Fast", eta: "~5s", multiplier: 1.5 }
];

const CONTRACT_CARDS: Array<{
  id: ContractKind;
  icon: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: "erc20",
    icon: "🪙",
    title: "ERC-20 Token",
    subtitle: "Create your own cryptocurrency"
  },
  {
    id: "erc721",
    icon: "💎",
    title: "ERC-721 NFT",
    subtitle: "Launch an NFT collection"
  },
  {
    id: "storage",
    icon: "📦",
    title: "Simple Storage",
    subtitle: "Store a message on blockchain"
  }
];

export function DeployPanel({ wallet, addLog, onDeployed }: DeployPanelProps) {
  const [contractType, setContractType] = useState<ContractKind>("erc20");
  const [gasSpeed, setGasSpeed] = useState<GasSpeed>("medium");

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [baseUri, setBaseUri] = useState("");

  const [message, setMessage] = useState("");

  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [successAddress, setSuccessAddress] = useState("");

  const selectedSpeed = useMemo(() => GAS_SPEEDS.find((s) => s.id === gasSpeed)!, [gasSpeed]);

  const resetForm = () => {
    setTokenName("");
    setTokenSymbol("");
    setTotalSupply("");
    setCollectionName("");
    setCollectionSymbol("");
    setBaseUri("");
    setMessage("");
    setFormError("");
    setSuccessAddress("");
    onDeployed(null);
  };

  const getArgs = (): unknown[] | null => {
    if (contractType === "erc20") {
      if (!tokenName.trim()) {
        setFormError("Please enter a token name.");
        return null;
      }

      const normalizedSymbol = tokenSymbol.trim().toUpperCase();
      if (!normalizedSymbol) {
        setFormError("Please enter a token symbol.");
        return null;
      }

      if (!totalSupply.trim() || Number(totalSupply) <= 0 || !/^\d+$/.test(totalSupply.trim())) {
        setFormError("Please enter a valid total supply number.");
        return null;
      }

      setFormError("");
      return [tokenName.trim(), normalizedSymbol, ethers.BigNumber.from(totalSupply.trim())];
    }

    if (contractType === "erc721") {
      const normalizedSymbol = collectionSymbol.trim().toUpperCase();

      if (!collectionName.trim()) {
        setFormError("Please enter a collection name.");
        return null;
      }

      if (!normalizedSymbol) {
        setFormError("Please enter a collection symbol.");
        return null;
      }

      if (!baseUri.trim()) {
        setFormError("Please enter a base URI.");
        return null;
      }

      setFormError("");
      return [collectionName.trim(), normalizedSymbol, baseUri.trim()];
    }

    if (!message.trim()) {
      setFormError("Please enter a message.");
      return null;
    }

    setFormError("");
    return [message.trim()];
  };

  const getGasPriceBySpeed = async (signer: ethers.Signer) => {
    const provider = signer.provider;
    if (!provider) {
      throw new Error("Wallet provider is not available.");
    }

    const baseGasPrice = await provider.getGasPrice();

    if (selectedSpeed.multiplier === 1) return baseGasPrice;
    if (selectedSpeed.multiplier === 0.8) return baseGasPrice.mul(8).div(10);
    return baseGasPrice.mul(15).div(10);
  };

  const onDeploy = async () => {
    if (!wallet.signer || !wallet.connected) return;

    const args = getArgs();
    if (!args) return;

    const contract = INTERNAL_CONTRACTS[contractType];

    try {
      setIsPending(true);
      setFormError("");
      addLog("INFO", "Preparing deployment transaction...");

      const gasPrice = await getGasPriceBySpeed(wallet.signer);
      const estimatedGas = await estimateDeploymentGas({
        signer: wallet.signer,
        bytecode: contract.bytecode,
        abi: contract.abi,
        args,
        gasPrice,
        valueEth: "0"
      });

      const gasLimit = estimatedGas.mul(120).div(100);

      const result = await deployContract({
        signer: wallet.signer,
        bytecode: contract.bytecode,
        abi: contract.abi,
        args,
        gasLimit: gasLimit.toNumber(),
        gasPrice,
        valueEth: "0"
      });

      setSuccessAddress(result.address);
      onDeployed(result);
      addLog("OK", `Deployed at: ${result.address}`);
    } catch (error: unknown) {
      const maybeError = error as { code?: number; message?: string; reason?: string };

      if (maybeError?.code === 4001) {
        setFormError("You cancelled the transaction in your wallet.");
        addLog("ERROR", "User rejected");
      } else if ((maybeError?.message || "").toLowerCase().includes("insufficient")) {
        setFormError("Not enough funds to deploy this contract.");
      } else {
        setFormError("Deployment failed. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const copyAddress = async () => {
    if (!successAddress) return;
    await navigator.clipboard.writeText(successAddress);
    toast("Address copied");
  };

  return (
    <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0b0b0b]">
          <Rocket className="h-5 w-5" /> Deploy Contract
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          {CONTRACT_CARDS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setContractType(item.id);
                setFormError("");
              }}
              disabled={isPending}
              className={`rounded-xl border-2 p-4 text-left transition ${
                contractType === item.id
                  ? "border-[#0b0b0b] bg-[#fdf2f8]"
                  : "border-[#0b0b0b] bg-white hover:bg-[#fafafa]"
              }`}
            >
              <p className="text-2xl">{item.icon}</p>
              <p className="mt-2 font-semibold text-[#0b0b0b]">{item.title}</p>
              <p className="mt-1 text-sm text-[#525252]">{item.subtitle}</p>
            </button>
          ))}
        </div>

        {contractType === "erc20" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g. My Token"
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="token-symbol">Token Symbol</Label>
              <Input
                id="token-symbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="e.g. MTK"
                maxLength={8}
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="total-supply">Total Supply</Label>
              <Input
                id="total-supply"
                type="number"
                min={1}
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                placeholder="e.g. 1000000"
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
          </div>
        ) : null}

        {contractType === "erc721" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. My NFT Collection"
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="collection-symbol">Symbol</Label>
              <Input
                id="collection-symbol"
                value={collectionSymbol}
                onChange={(e) => setCollectionSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. MNFT"
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="base-uri">Base URI</Label>
              <Input
                id="base-uri"
                value={baseUri}
                onChange={(e) => setBaseUri(e.target.value)}
                placeholder="e.g. https://mysite.com/metadata/"
                disabled={isPending}
                className="border-2 border-[#0b0b0b] bg-white"
              />
            </div>
          </div>
        ) : null}

        {contractType === "storage" ? (
          <div className="space-y-1">
            <Label htmlFor="message">Your Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hello Seismic!"
              disabled={isPending}
              className="border-2 border-[#0b0b0b] bg-white"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Gas Speed</Label>
          <div className="flex flex-wrap gap-2">
            {GAS_SPEEDS.map((speed) => (
              <button
                key={speed.id}
                onClick={() => setGasSpeed(speed.id)}
                disabled={isPending}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                  gasSpeed === speed.id ? "border-[#0b0b0b] bg-[#ec4899] text-white" : "border-[#0b0b0b] bg-white"
                }`}
              >
                {speed.emoji} {speed.label} <span className="opacity-80">({speed.eta})</span>
              </button>
            ))}
          </div>
        </div>

        {formError ? (
          <div className="rounded-md border-2 border-[#0b0b0b] bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{formError}</div>
        ) : null}

        {!successAddress ? (
          <Button
            className="w-full border-[3px] border-[#0b0b0b] bg-[#ec4899] text-white shadow-[4px_4px_0_0_#0b0b0b] hover:bg-[#db2777]"
            disabled={!wallet.connected || wallet.isWrongNetwork || isPending}
            onClick={onDeploy}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner /> Deploying...
              </span>
            ) : (
              "Deploy Contract"
            )}
          </Button>
        ) : (
          <div className="space-y-3 rounded-xl border-2 border-[#0b0b0b] bg-[#ecfdf3] p-4">
            <p className="flex items-center gap-2 text-lg font-semibold text-[#106b46]">
              <CheckCircle2 className="h-5 w-5" /> Contract Deployed!
            </p>

            <div className="rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2">
              <p className="mb-1 text-xs text-[#525252]">Contract Address</p>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-sm">{successAddress}</span>
                <Button variant="outline" size="sm" className="border-2 border-[#0b0b0b]" onClick={copyAddress}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="border-[3px] border-[#0b0b0b] bg-[#ec4899] text-white shadow-[4px_4px_0_0_#0b0b0b] hover:bg-[#db2777]">
                <a href={explorerAddressLink(successAddress)} target="_blank" rel="noreferrer">
                  View on Explorer <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
              <Button variant="outline" className="border-2 border-[#0b0b0b]" onClick={resetForm}>
                Deploy Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
