"use client";

import { useCallback, useState } from "react";

export type LogType = "INFO" | "OK" | "ERROR";

export type TxLogEntry = {
  id: string;
  type: LogType;
  message: string;
  timestamp: string;
};

export function useTxLog() {
  const [logs, setLogs] = useState<TxLogEntry[]>([]);

  const addLog = useCallback((type: LogType, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry: TxLogEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      message,
      timestamp
    };

    setLogs((prev) => [entry, ...prev]);
  }, []);

  return { logs, addLog };
}
