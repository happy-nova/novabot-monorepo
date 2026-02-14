import { NextRequest, NextResponse } from "next/server";
import { withX402, x402ResourceServer } from "@x402/next";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { createJob, getQueueLength } from "@/lib/jobs-kv";
import crypto from "crypto";

export const runtime = "nodejs";

const ESTIMATED_GENERATION_TIME = 90;

const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";

const NETWORK = "eip155:8453"; // Base mainnet
const PAY_TO = "0x178517854cA110D421140f5Ab4653F7F39339ACD";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PRICE_USDC_AMOUNT = "200000"; // $0.20 USDC (6 decimals)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6955936851";

const inputSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Track title prompt (for example: Stellar Drift).",
    },
    style: {
      type: "string",
      description: "Genre/style prompt (for example: lo-fi, jazzy, chill beats).",
    },
  },
  required: ["title", "style"],
  additionalProperties: false,
};

const outputSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    jobId: { type: "string" },
    status: { type: "string", enum: ["queued", "processing", "completed", "failed"] },
    position: { type: "number" },
    estimatedWaitSeconds: { type: "number" },
    message: { type: "string" },
    statusUrl: { type: "string" },
  },
  required: ["success", "jobId", "status", "position", "estimatedWaitSeconds", "message", "statusUrl"],
  additionalProperties: true,
};

const discoveryBazaar = declareDiscoveryExtension({
  input: {
    title: "Stellar Drift",
    style: "lo-fi, jazzy, chill beats",
  },
  inputSchema,
  bodyType: "json",
  output: {
    schema: outputSchema,
    example: {
      success: true,
      jobId: "a1b2c3d4",
      status: "queued",
      position: 1,
      estimatedWaitSeconds: 90,
      message: 'Your track "Stellar Drift" is queued. Poll /api/status/a1b2c3d4 for updates.',
      statusUrl: "/api/status/a1b2c3d4",
    },
  },
});

const facilitatorClient = new HTTPFacilitatorClient({
  url: CDP_FACILITATOR_URL,
  createAuthHeaders: async () => {
    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      throw new Error("Missing CDP_API_KEY_ID / CDP_API_KEY_SECRET (required for CDP x402 facilitator)");
    }

    const requestHost = "api.cdp.coinbase.com";
    const basePath = "/platform/v2/x402";

    const makeAuth = async (requestMethod: "GET" | "POST", requestPath: string) => {
      const jwt = await generateJwt({
        apiKeyId,
        apiKeySecret,
        requestMethod,
        requestHost,
        requestPath,
        expiresIn: 120,
      });
      return { Authorization: `Bearer ${jwt}` };
    };

    return {
      supported: await makeAuth("GET", `${basePath}/supported`),
      verify: await makeAuth("POST", `${basePath}/verify`),
      settle: await makeAuth("POST", `${basePath}/settle`),
    };
  },
});

const server = new x402ResourceServer(facilitatorClient).register(NETWORK as any, new ExactEvmScheme());

function extractPayerFromPaymentHeader(paymentHeader: string | null): string | undefined {
  if (!paymentHeader) return undefined;

  const candidates = [paymentHeader];
  try {
    candidates.push(Buffer.from(paymentHeader, "base64").toString());
  } catch {
    // Ignore malformed base64 and continue trying other parsing options.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const payer =
        parsed?.payload?.authorization?.from ||
        parsed?.payload?.from ||
        parsed?.payer ||
        parsed?.from;
      if (typeof payer === "string" && payer.length > 0) {
        return payer;
      }
    } catch {
      // Not JSON; skip.
    }
  }

  return undefined;
}

async function notifyNewOrder(jobId: string, title: string, style: string, payer: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[Pulsar] No Telegram token - skipping notification");
    return;
  }

  const message = `🎵 <b>New Pulsar Order!</b>

<b>Job:</b> <code>${jobId}</code>
<b>Title:</b> ${title}
<b>Style:</b> ${style}
<b>Payer:</b> <code>${payer.slice(0, 10)}...</code>

💰 $0.20 USDC received`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
    console.log("[Pulsar] Telegram notification sent");
  } catch (e) {
    console.error("[Pulsar] Telegram notification failed:", e);
  }
}

const handler = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const { title, style } = body;

    if (!title || !style) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Both 'title' and 'style' are required",
        },
        { status: 400 },
      );
    }

    const paymentHeader = request.headers.get("x-payment") || request.headers.get("payment-signature");
    const payer = extractPayerFromPaymentHeader(paymentHeader) || "unknown";

    const jobId = crypto.randomBytes(8).toString("hex");
    const trackTitle = `${title} [${jobId.slice(0, 8)}]`;
    const job = await createJob(jobId, trackTitle, style, paymentHeader || undefined, undefined, payer);

    const queueLength = await getQueueLength();
    const estimatedWait = queueLength * ESTIMATED_GENERATION_TIME;

    console.log(`[BeatMints] Job ${jobId} created for "${trackTitle}"`);

    notifyNewOrder(jobId, trackTitle, style, payer).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: "queued",
        position: queueLength,
        estimatedWaitSeconds: estimatedWait,
        message: `Your track "${title}" is queued. Poll /api/status/${jobId} for updates.`,
        statusUrl: `/api/status/${jobId}`,
        createdAt: job.createdAt,
        payment: {
          amount: "$0.20 USDC",
          payer,
        },
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("[BeatMints] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
};

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      network: NETWORK as any,
      payTo: PAY_TO,
      price: {
        amount: PRICE_USDC_AMOUNT,
        asset: USDC_BASE,
        extra: { name: "USD Coin", version: "2" },
      },
      maxTimeoutSeconds: 300,
    },
    description:
      "Generate royalty-free instrumental music. Returns 2 unique tracks per request. Styles: lo-fi, ambient, cinematic, chiptune, synthwave, and more.",
    mimeType: "application/json",
    extensions: {
      cdp: {},
      bazaar: {
        ...discoveryBazaar.bazaar,
        name: "Pulsar AI Music Generator",
        description: "Generate royalty-free instrumental tracks from title + style prompts.",
        iconUrl: "https://pulsar.novabot.sh/favicon.ico",
        tags: ["music", "audio", "ai", "generation", "instrumental"],
        category: "media",
        integrationType: "api",
        curator: "novabot",
        payPerUse: true,
        popUp: false,
        inputSchema,
        outputSchema,
      },
    },
  },
  server,
);
