"use client";

import { Copy, ExternalLink, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEISMIC_FAUCET_URL } from "@/lib/seismic";
import { toast } from "@/components/ui/toaster";

type FaucetWallet = {
  account?: string;
  balance?: string;
};

export function FaucetPanel({ wallet }: { wallet: FaucetWallet }) {
  const lowBalance = Number.parseFloat(wallet.balance || "0") < 0.01;

  const copyAddress = async () => {
    if (!wallet.account) return;
    await navigator.clipboard.writeText(wallet.account);
    toast("Address copied");
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0b0b0b]">
            <Droplets className="h-5 w-5" /> Faucet
          </CardTitle>
          <CardDescription className="text-[#525252]">Get Seismic testnet ETH for deployment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallet.account ? (
            <div className="rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2">
              <p className="mb-1 text-xs text-[#525252]">Connected wallet</p>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-mono text-sm text-[#0b0b0b]">{wallet.account}</p>
                <Button variant="outline" size="sm" className="border-2 border-[#0b0b0b]" onClick={copyAddress}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#525252]">Connect MetaMask in Home tab, then request faucet funds.</p>
          )}

          <div className="rounded-md border-2 border-[#0b0b0b] bg-[#e6f4ea] px-3 py-2 text-sm text-[#106b46]">
            {lowBalance ? "Balance is low (< 0.01 ETH). Use faucet now." : "You can still request more test ETH if needed."}
          </div>

          <Button asChild className="border-[3px] border-[#0b0b0b] bg-[#ec4899] text-white shadow-[4px_4px_0_0_#0b0b0b] hover:bg-[#db2777]">
            <a href={SEISMIC_FAUCET_URL} target="_blank" rel="noreferrer">
              Open Seismic Faucet <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
