"use client";

import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeployResult } from "@/components/DeployPanel";
import { explorerAddressLink, explorerTxLink } from "@/lib/seismic";
import { toast } from "@/components/ui/toaster";

export function ResultCard({ result }: { result: DeployResult }) {
  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast(`${label} copied`);
  };

  return (
    <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0b0b0b]">
          <CheckCircle2 className="h-5 w-5 text-[#106b46]" /> Deployment Successful
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2">
          <p className="mb-1 text-[#525252]">Contract Address</p>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-[#0b0b0b]">{result.address}</p>
            <Button variant="ghost" size="icon" onClick={() => copy(result.address, "Address")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border-2 border-[#0b0b0b] bg-white px-3 py-2">
          <p className="mb-1 text-[#525252]">Transaction Hash</p>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-[#0b0b0b]">{result.txHash}</p>
            <Button variant="ghost" size="icon" onClick={() => copy(result.txHash, "Tx hash")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="border-2 border-[#0b0b0b] bg-white">
            <a href={explorerAddressLink(result.address)} target="_blank" rel="noreferrer">
              View Address <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-2 border-[#0b0b0b] bg-white">
            <a href={explorerTxLink(result.txHash)} target="_blank" rel="noreferrer">
              View Tx <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
