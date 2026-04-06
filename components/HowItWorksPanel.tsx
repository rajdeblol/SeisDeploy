"use client";

export function HowItWorksPanel() {
  const steps = [
    {
      title: "1. CONNECT",
      body: "Connect MetaMask and switch to Seismic Testnet automatically."
    },
    {
      title: "2. CHOOSE TYPE",
      body: "Pick ERC-20, ERC-721, or Simple Storage and fill the friendly form."
    },
    {
      title: "3. SELECT SPEED",
      body: "Choose Slow, Medium, or Fast gas speed based on how quickly you want confirmation."
    },
    {
      title: "4. DEPLOY & VERIFY",
      body: "Deploy in one click, then open the explorer link to verify your contract address."
    }
  ];

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#0b0b0b] md:text-5xl">HOW IT WORKS</h2>
        <p className="mt-3 max-w-2xl text-lg text-[#525252]">Simple flow for deploying and checking contracts on Seismic testnet.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="rounded-full border-2 border-[#0b0b0b] bg-white px-4 py-1.5 text-sm font-semibold">No bytecode required</span>
        <span className="rounded-full border-2 border-[#0b0b0b] bg-white px-4 py-1.5 text-sm font-semibold">MetaMask only</span>
        <span className="rounded-full border-2 border-[#0b0b0b] bg-white px-4 py-1.5 text-sm font-semibold">Explorer verification</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border-[3px] border-[#0b0b0b] bg-white p-6 shadow-[8px_8px_0_0_#0b0b0b]">
            <p className="text-3xl font-extrabold leading-tight text-[#ec4899]">{step.title}</p>
            <p className="mt-4 text-lg leading-relaxed text-[#525252]">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
