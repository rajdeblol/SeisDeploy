"use client";

import { useMemo, useState } from "react";
import { WalletPanel } from "@/components/WalletPanel";
import { NetworkStatus } from "@/components/NetworkStatus";
import { DeployPanel, DeployResult } from "@/components/DeployPanel";
import { ResultCard } from "@/components/ResultCard";
import { FaucetPanel } from "@/components/FaucetPanel";
import { HowItWorksPanel } from "@/components/HowItWorksPanel";
import { useWallet } from "@/lib/useWallet";
import { useTxLog } from "@/lib/useTxLog";

export default function HomePage() {
  const wallet = useWallet();
  const { addLog } = useTxLog();
  const [result, setResult] = useState<DeployResult | null>(null);
  const [tab, setTab] = useState<"home" | "faucet" | "how">("home");

  const walletWithLogging = useMemo(
    () => ({
      ...wallet,
      addLog
    }),
    [wallet, addLog]
  );

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#0b0b0b]">
      <div className="border-b-4 border-[#0b0b0b] bg-[#ffffff]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 rounded-xl border-[3px] border-[#0b0b0b] bg-[#0b0b0b] px-5 py-3 text-white shadow-[5px_5px_0_0_#0b0b0b]">
            <span className="text-2xl font-extrabold tracking-wide">SeisDeploy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("home")}
              className={`rounded-2xl border-[3px] px-5 py-2 text-sm font-semibold transition ${
                tab === "home"
                  ? "border-[#0b0b0b] bg-[#ec4899] text-white"
                  : "border-[#0b0b0b] bg-white text-[#0b0b0b]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setTab("faucet")}
              className={`rounded-2xl border-[3px] px-5 py-2 text-sm font-semibold transition ${
                tab === "faucet"
                  ? "border-[#0b0b0b] bg-[#ec4899] text-white"
                  : "border-[#0b0b0b] bg-white text-[#0b0b0b]"
              }`}
            >
              Faucet
            </button>
            <button
              onClick={() => setTab("how")}
              className={`rounded-2xl border-[3px] px-5 py-2 text-sm font-semibold transition ${
                tab === "how"
                  ? "border-[#0b0b0b] bg-[#ec4899] text-white"
                  : "border-[#0b0b0b] bg-white text-[#0b0b0b]"
              }`}
            >
              How it works
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "home" ? (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className="mb-2 inline-block rounded-full border-2 border-[#0b0b0b] px-3 py-1 text-xs font-semibold">
                    Seismic Testnet • Bytecode Deploy
                  </p>
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Deploy Fast. Verify On Explorer.</h1>
                  <p className="mt-3 max-w-xl text-lg text-[#525252]">
                    Clean contract deployment for Seismic testnet using MetaMask and raw bytecode.
                  </p>
                </div>

                <WalletPanel wallet={walletWithLogging} />
                <NetworkStatus />
              </div>

              <div className="space-y-6">
                <DeployPanel wallet={walletWithLogging} addLog={addLog} onDeployed={setResult} />
                {result ? <ResultCard result={result} /> : null}
              </div>
            </section>

            <p className="mt-8 text-center text-sm text-[#525252]">
              Built with <span className="text-[#ec4899]">♥</span> by{" "}
              <a
                href="https://x.com/Uniquelol181"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#ec4899] hover:underline"
              >
                RajLol
              </a>
            </p>
          </>
        ) : tab === "faucet" ? (
          <FaucetPanel wallet={walletWithLogging} />
        ) : (
          <HowItWorksPanel />
        )}
      </div>
    </main>
  );
}
