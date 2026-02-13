import { NextResponse } from "next/server";
import { getStats } from "@/lib/jobs-kv";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("[Health] KV error:", error);
    return NextResponse.json({
      service: "Pulsar",
      version: "1.1.0",
      status: "degraded",
      error: "Queue status unavailable",
      kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
      pricing: {
        generate: "$0.20 USDC",
        status: "free",
      },
    });
  }
}
