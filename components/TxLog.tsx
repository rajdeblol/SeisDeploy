"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TxLogEntry } from "@/lib/useTxLog";

function colorByType(type: TxLogEntry["type"]) {
  if (type === "OK") return "text-emerald-400";
  if (type === "ERROR") return "text-red-400";
  return "text-sky-400";
}

export function TxLog({ logs }: { logs: TxLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto rounded-md border bg-black/40 p-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <p key={log.id}>
                  <span className="text-muted-foreground">[{log.timestamp}]</span>{" "}
                  <span className={colorByType(log.type)}>[{log.type}]</span> {log.message}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
