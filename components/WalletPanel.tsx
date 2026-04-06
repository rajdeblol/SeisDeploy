"use client";

import { Copy, ExternalLink, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEISMIC_FAUCET_URL } from "@/lib/seismic";
import { toast } from "@/components/ui/toaster";

type WalletLike = {
  account: string;
  shortAccount: string;
  connected: boolean;
  balance: string;
  isWrongNetwork: boolean;
  connect: () => Promise<string>;
  refreshBalance: () => Promise<void>;
  addLog?: (type: "INFO" | "OK" | "ERROR", message: string) => void;
};

export function WalletPanel({ wallet }: { wallet: WalletLike }) {
  const copyAddress = async () => {
    if (!wallet.account) return;
    await navigator.clipboard.writeText(wallet.account);
    toast("Address copied");
  };

  const onConnect = async () => {
    try {
      const account = await wallet.connect();
      wallet.addLog?.("OK", `Wallet connected: ${account}`);
    } catch (error: unknown) {
      const maybeError = error as { code?: number; message?: string };
      if (maybeError?.code === 4001) {
        wallet.addLog?.("ERROR", "User rejected");
        return;
      }

      wallet.addLog?.("ERROR", maybeError?.message ?? "Wallet connection failed");
    }
  };

  const onRefreshBalance = async () => {
    try {
      await wallet.refreshBalance();
      wallet.addLog?.("INFO", "Balance refreshed");
    } catch (error: unknown) {
      wallet.addLog?.("ERROR", (error as Error).message);
    }
  };

  const lowBalance = Number.parseFloat(wallet.balance || "0") < 0.01;

  return (
    <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0b0b0b]">
          <Wallet className="h-5 w-5" /> Wallet
        </CardTitle>
        <CardDescription className="text-[#525252]">Connect MetaMask on Seismic Testnet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallet.connected ? (
          <Button
            onClick={onConnect}
            className="w-full border-[3px] border-[#0b0b0b] bg-[#ec4899] text-white shadow-[4px_4px_0_0_#0b0b0b] hover:bg-[#db2777]"
          >
            Connect MetaMask
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2">
              <span className="font-mono text-sm text-[#0b0b0b]">{wallet.shortAccount}</span>
              <Button variant="ghost" size="icon" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2 text-sm">
              <span>Balance</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{Number.parseFloat(wallet.balance).toFixed(6)} ETH</span>
                <Button variant="ghost" size="icon" onClick={onRefreshBalance}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {wallet.isWrongNetwork ? <Badge variant="destructive">Wrong network detected. Please switch.</Badge> : null}

            {lowBalance ? (
              <a
                href={SEISMIC_FAUCET_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-[#ec4899] hover:underline"
              >
                Need test ETH? Open faucet <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
