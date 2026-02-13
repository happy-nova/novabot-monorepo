import { NextResponse } from "next/server";
import { getStats } from "@/lib/jobs-kv";

export async function GET() {
  const stats = await getStats();
  
  return NextResponse.json({
    service: "Pulsar",
    version: "1.1.0",
    status: "operational",
    queue: {
      length: stats.queueLength,
      estimatedWaitSeconds: stats.queueLength * 90,
    },
    history: {
      total: stats.historyLength,
      recentCompleted: stats.recentCompleted,
      recentFailed: stats.recentFailed,
    },
    pricing: {
      generate: "$0.20 USDC",
      status: "free",
      history: "free",
    },
  });
}
