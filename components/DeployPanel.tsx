"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { AlertTriangle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { deployContract, estimateDeploymentGas, isValidHexBytecode, sanitizeBytecode } from "@/lib/deploy";

type WalletLike = {
  signer: ethers.Signer | null;
  connected: boolean;
  isWrongNetwork: boolean;
};

export type DeployResult = {
  address: string;
  txHash: string;
};

const DEFAULT_GAS_LIMIT = 3_000_000;

type DeployPanelProps = {
  wallet: WalletLike;
  addLog: (type: "INFO" | "OK" | "ERROR", message: string) => void;
  onDeployed: (result: DeployResult) => void;
};

export function DeployPanel({ wallet, addLog, onDeployed }: DeployPanelProps) {
  const [bytecodeInput, setBytecodeInput] = useState("");
  const [gasLimit, setGasLimit] = useState<number>(DEFAULT_GAS_LIMIT);
  const [valueEth, setValueEth] = useState<string>("0");
  const [bytecodeError, setBytecodeError] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string>("-");

  const normalizedBytecode = useMemo(() => sanitizeBytecode(bytecodeInput), [bytecodeInput]);
  const bytecodeChars = normalizedBytecode.startsWith("0x") ? normalizedBytecode.length - 2 : normalizedBytecode.length;
  const contractSizeKb = bytecodeChars > 0 ? (bytecodeChars / 2 / 1024).toFixed(2) : "0.00";

  const validateBytecode = () => {
    if (!normalizedBytecode) {
      setBytecodeError("Bytecode is required");
      return false;
    }

    if (!isValidHexBytecode(normalizedBytecode)) {
      setBytecodeError("Invalid bytecode: must be even-length hex");
      return false;
    }

    setBytecodeError("");
    return true;
  };

  useEffect(() => {
    const runEstimate = async () => {
      if (!wallet.signer || !wallet.connected || wallet.isWrongNetwork) return;
      if (!normalizedBytecode || !isValidHexBytecode(normalizedBytecode)) return;

      try {
        const gas = await estimateDeploymentGas({
          signer: wallet.signer,
          bytecode: normalizedBytecode,
          valueEth
        });

        setEstimatedGas(gas.toString());
      } catch {
        setEstimatedGas("-");
      }
    };

    const timeout = window.setTimeout(runEstimate, 600);
    return () => window.clearTimeout(timeout);
  }, [wallet.signer, wallet.connected, wallet.isWrongNetwork, normalizedBytecode, valueEth]);

  const onDeploy = async () => {
    if (!wallet.signer || !wallet.connected) return;

    const validBytecode = validateBytecode();
    if (!validBytecode) {
      addLog("ERROR", "Invalid bytecode");
      return;
    }

    try {
      setIsPending(true);
      addLog("INFO", "Submitting deployment transaction...");

      const result = await deployContract({
        signer: wallet.signer,
        bytecode: normalizedBytecode,
        gasLimit: Math.max(21000, gasLimit),
        valueEth: valueEth || "0"
      });

      addLog("OK", `Tx submitted: ${result.txHash}`);
      addLog("INFO", "Waiting confirmation...");
      addLog("OK", `Deployed at: ${result.address}`);
      onDeployed(result);
    } catch (error: unknown) {
      const maybeError = error as { code?: number; reason?: string; message?: string; error?: { message?: string } };
      if (maybeError?.code === 4001) {
        addLog("ERROR", "User rejected");
      } else {
        const reason = maybeError?.reason ?? maybeError?.error?.message ?? maybeError?.message ?? "Deployment failed";
        addLog("ERROR", reason);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0b0b0b]">
          <Rocket className="h-5 w-5" /> Deploy Contract
        </CardTitle>
        <CardDescription className="text-[#525252]">Simple deploy: paste bytecode and submit.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bytecode">Contract Bytecode (hex)</Label>
          <Textarea
            id="bytecode"
            className="min-h-[220px] border-2 border-[#0b0b0b] bg-white font-mono"
            disabled={isPending}
            placeholder="0x608060405234..."
            value={bytecodeInput}
            onChange={(e) => {
              setBytecodeInput(e.target.value);
              if (bytecodeError) setBytecodeError("");
            }}
            onBlur={validateBytecode}
          />
          <div className="flex items-center justify-between text-xs text-[#525252]">
            <span>Characters: {bytecodeChars}</span>
            <span>Size: {contractSizeKb} KB</span>
          </div>
          {bytecodeError ? (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> {bytecodeError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="gas">Gas Limit</Label>
            <Input
              id="gas"
              type="number"
              min={21000}
              className="border-2 border-[#0b0b0b] bg-white"
              disabled={isPending}
              value={gasLimit}
              onChange={(e) => setGasLimit(Number.parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="value">Value (ETH)</Label>
            <Input
              id="value"
              type="text"
              className="border-2 border-[#0b0b0b] bg-white"
              disabled={isPending}
              value={valueEth}
              onChange={(e) => setValueEth(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2 text-sm text-[#0b0b0b]">
          Estimated Gas: <span className="font-mono">{estimatedGas}</span>
        </div>

        <Button
          className="w-full border-[3px] border-[#0b0b0b] bg-[#ec4899] text-white shadow-[4px_4px_0_0_#0b0b0b] hover:bg-[#db2777]"
          disabled={!wallet.connected || wallet.isWrongNetwork || !bytecodeInput.trim() || isPending}
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
      </CardContent>
    </Card>
  );
}
