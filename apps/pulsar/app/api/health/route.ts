import { NextResponse } from "next/server";
import { getQueueLength, isProcessing } from "@/lib/jobs";

export async function GET() {
  return NextResponse.json({
    service: "BeatMints",
    version: "1.0.0",
    status: "operational",
    queue: {
      length: getQueueLength(),
      processing: isProcessing(),
      estimatedWaitSeconds: getQueueLength() * 90,
    },
    pricing: {
      generate: "$0.20 USDC",
      status: "free",
    },
  });
}
