"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: string;
  title: string;
};

const emitter = new EventTarget();

export function toast(title: string) {
  emitter.dispatchEvent(new CustomEvent("toast", { detail: { title } }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ title: string }>;
      const item = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: customEvent.detail.title
      };

      setItems((prev) => [item, ...prev].slice(0, 4));

      window.setTimeout(() => {
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      }, 2400);
    };

    emitter.addEventListener("toast", handler);
    return () => emitter.removeEventListener("toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto rounded-lg border bg-card px-4 py-2 text-sm text-card-foreground shadow-lg",
            "animate-in fade-in slide-in-from-bottom-2"
          )}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}
