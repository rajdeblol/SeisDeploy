"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEISMIC_CHAIN_ID, SEISMIC_CHAIN_ID_HEX, SEISMIC_RPC_URL } from "@/lib/seismic";

type NetworkStatusState = {
  blockNumber: number | null;
  online: boolean;
  error: string;
};

export function NetworkStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<NetworkStatusState>({
    blockNumber: null,
    online: false,
    error: ""
  });

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(SEISMIC_RPC_URL);
    let mounted = true;

    const check = async () => {
      try {
        const block = await provider.getBlockNumber();
        if (!mounted) return;
        setState({ blockNumber: block, online: true, error: "" });
      } catch (error: unknown) {
        if (!mounted) return;
        setState({
          blockNumber: null,
          online: false,
          error: (error as Error).message || "RPC unreachable"
        });
      }
    };

    check();
    const interval = window.setInterval(check, 10000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const dotClass = useMemo(
    () => (state.online ? "bg-emerald-500" : "bg-red-500"),
    [state.online]
  );

  if (compact) {
    return (
      <Badge variant="secondary" className="gap-2 border-2 border-[#0b0b0b] bg-white text-[#0b0b0b]">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
        {state.online ? `Block ${state.blockNumber}` : "RPC down"}
      </Badge>
    );
  }

  return (
    <Card className="border-[3px] border-[#0b0b0b] bg-[#ffffff] shadow-[7px_7px_0_0_#0b0b0b]">
      <CardHeader>
        <CardTitle className="text-[#0b0b0b]">Network Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-[#0b0b0b]">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          <span>{state.online ? "Online" : "Offline"}</span>
        </div>
        <p>
          Chain ID: <span className="font-mono">{SEISMIC_CHAIN_ID}</span> ({SEISMIC_CHAIN_ID_HEX})
        </p>
        <p className="truncate">
          RPC: <span className="font-mono text-xs">{SEISMIC_RPC_URL}</span>
        </p>
        <p>
          Latest Block: <span className="font-mono">{state.blockNumber ?? "-"}</span>
        </p>
        {!state.online && state.error ? <p className="text-destructive">{state.error}</p> : null}
      </CardContent>
    </Card>
  );
}
