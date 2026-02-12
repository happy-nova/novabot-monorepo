import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCOVERY_RESPONSE = {
  version: "1.0",
  metadata: {
    name: "Pulsar",
    displayName: "Pulsar",
    description: "Royalty-free instrumental music generation API. Generate unique tracks in any style — lo-fi, ambient, cinematic, chiptune, and more. Pay-per-generation with x402, no subscriptions.",
    provider: "Nova",
    providerUrl: "https://novabot.sh",
    category: "AI/Music",
    tags: ["Music", "AI", "Audio", "Creative", "Agent"],
    logo: "https://pulsar.novabot.sh/logo.png",
    icon: "💫",
    website: "https://pulsar.novabot.sh",
    documentation: "https://pulsar.novabot.sh/about",
    x402Gateway: "https://pulsar.novabot.sh"
  },
  resources: [
    {
      url: "/api/generate",
      method: "POST",
      description: "Generate royalty-free instrumental music. Returns 2 unique tracks per request.",
      price: "$0.20 USDC",
      network: "base",
      input: {
        type: "json",
        fields: {
          title: { type: "string", required: true, description: "Track title (used as creative seed)" },
          style: { type: "string", required: true, description: "Musical style descriptors (e.g. 'lo-fi, jazzy, chill')" }
        }
      },
      output: {
        type: "json",
        example: {
          success: true,
          jobId: "a1b2c3d4",
          status: "queued",
          statusUrl: "/api/status/a1b2c3d4",
          estimatedWaitSeconds: 90
        }
      }
    },
    {
      url: "/api/status/:jobId",
      method: "GET",
      description: "Check generation status and get download URLs when complete.",
      price: "Free",
      output: {
        type: "json",
        example: {
          jobId: "a1b2c3d4",
          status: "complete",
          tracks: [
            { title: "Sunset Vibes v1", url: "https://..." },
            { title: "Sunset Vibes v2", url: "https://..." }
          ]
        }
      }
    },
    {
      url: "/api/health",
      method: "GET",
      description: "Health check endpoint.",
      price: "Free"
    }
  ],
  payment: {
    network: "base",
    asset: "USDC",
    assetAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    payTo: "0x178517854cA110D421140f5Ab4653F7F39339ACD",
    protocol: "x402"
  }
};

export async function GET(request: NextRequest) {
  return NextResponse.json(DISCOVERY_RESPONSE, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
