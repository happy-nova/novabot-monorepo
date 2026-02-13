import { NextRequest, NextResponse } from "next/server";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { createJob, getQueueLength } from "@/lib/jobs-kv";
import crypto from "crypto";

// Force Node.js runtime (not Edge)
export const runtime = "nodejs";

// Gigaverse wallet - NOT the AWAL wallet (to avoid self-pay rejection)
const PAY_TO = "0x178517854cA110D421140f5Ab4653F7F39339ACD";
const ESTIMATED_GENERATION_TIME = 90;
const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";
const PRICE_ATOMIC = "200000"; // $0.20 USDC (6 decimals)

// Telegram notification
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6955936851";

async function notifyNewOrder(jobId: string, title: string, style: string, payer: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[Pulsar] No Telegram token - skipping notification");
    return;
  }
  
  const message = `🎵 <b>New Pulsar Order!</b>

<b>Job:</b> <code>${jobId}</code>
<b>Title:</b> ${title}
<b>Style:</b> ${style}
<b>Payer:</b> <code>${payer?.slice(0, 10)}...</code>

💰 $0.20 USDC received`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML"
      })
    });
    console.log("[Pulsar] Telegram notification sent");
  } catch (e) {
    console.error("[Pulsar] Telegram notification failed:", e);
  }
}

// Build payment requirements for the 402 response (array format)
// Includes bazaar extension metadata for x402 discovery indexing
function buildPaymentRequirements(resourceUrl: string) {
  return [{
    scheme: "exact",
    network: "base",
    maxAmountRequired: PRICE_ATOMIC,
    resource: resourceUrl,
    description: "Generate royalty-free instrumental music. Returns 2 unique tracks per request. Styles: lo-fi, ambient, cinematic, chiptune, synthwave, and more.",
    mimeType: "application/json",
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    extra: { name: "USD Coin", version: "2" },
    // x402 v2 bazaar discovery extension - enables auto-indexing by facilitator
    // Format per https://github.com/coinbase/x402/go/extensions/types/types.go
    extensions: {
      bazaar: {
        info: {
          input: {
            type: "http",
            method: "POST",
            bodyType: "json",
            body: {
              title: "Stellar Drift",
              style: "lo-fi, jazzy, chill beats, relaxed"
            }
          },
          output: {
            type: "json",
            example: {
              success: true,
              jobId: "a1b2c3d4e5f6",
              status: "queued",
              position: 1,
              estimatedWaitSeconds: 90,
              message: "Your track is queued. Poll /api/status/{jobId} for updates.",
              statusUrl: "/api/status/a1b2c3d4e5f6"
            }
          }
        }
      }
    }
  }];
}

// Generate JWT for CDP facilitator
async function generateCdpJwt(path: string, method: "POST" | "GET") {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  
  if (!apiKeyId || !apiKeySecret) {
    throw new Error("CDP API credentials not configured");
  }
  
  return generateJwt({
    apiKeyId,
    apiKeySecret,
    requestMethod: method,
    requestHost: "api.cdp.coinbase.com",
    requestPath: path,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resourceUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/generate`;
  
  // Check for payment header
  const paymentHeader = request.headers.get("X-PAYMENT");
  
  if (!paymentHeader) {
    // Return 402 with payment requirements
    return NextResponse.json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: buildPaymentRequirements(resourceUrl)
    }, { status: 402 });
  }
  
  // Decode payment
  let decodedPayment;
  const requestId = crypto.randomUUID().slice(0, 8);
  try {
    const rawDecoded = Buffer.from(paymentHeader, 'base64').toString();
    decodedPayment = JSON.parse(rawDecoded);
    console.log(`[BeatMints][${requestId}] === PAYMENT PAYLOAD ===`);
    console.log(`[BeatMints][${requestId}] headerLen=${paymentHeader.length} prefix=${paymentHeader.slice(0, 24)}...`);
    console.log(`[BeatMints][${requestId}] paymentMeta=${JSON.stringify({
      topKeys: Object.keys(decodedPayment || {}),
      scheme: decodedPayment?.scheme,
      network: decodedPayment?.network,
      hasPayload: !!decodedPayment?.payload,
      payloadKeys: Object.keys(decodedPayment?.payload || {}),
      authKeys: Object.keys(decodedPayment?.payload?.authorization || {}),
      hasSig: !!decodedPayment?.payload?.signature,
    })}`);
    console.log(`[BeatMints][${requestId}] ======================`);
  } catch (e) {
    console.error(`[BeatMints][${requestId}] Failed to decode payment header`, e);
    return NextResponse.json({
      x402Version: 1,
      error: "Invalid payment format",
      requestId,
      accepts: buildPaymentRequirements(resourceUrl)
    }, { status: 402 });
  }
  
  // Debug payer payload inspection path
  if (request.nextUrl.searchParams.get("debugEcho") === "1") {
    return NextResponse.json({
      success: true,
      requestId,
      mode: "debugEcho",
      paymentSummary: {
        topKeys: Object.keys(decodedPayment || {}),
        scheme: decodedPayment?.scheme,
        network: decodedPayment?.network,
        hasPayload: !!decodedPayment?.payload,
        payloadKeys: Object.keys(decodedPayment?.payload || {}),
        authorizationKeys: Object.keys(decodedPayment?.payload?.authorization || {}),
        from: decodedPayment?.payload?.authorization?.from || decodedPayment?.from || null,
      },
      rawPayment: decodedPayment,
    }, { status: 200 });
  }

  // Build payment requirements object for verify/settle (single object, not array)
  // Strip extensions for CDP - they don't expect bazaar metadata in verify/settle
  const fullRequirements = buildPaymentRequirements(resourceUrl)[0];
  const { extensions, ...paymentRequirements } = fullRequirements;
  
  try {
    // Verify payment with CDP facilitator
    const verifyJwt = await generateCdpJwt("/platform/v2/x402/verify", "POST");
    
    const verifyBody = {
      x402Version: 1,
      paymentPayload: decodedPayment,  // Decoded payment object
      paymentRequirements
    };
    
    console.log(`[BeatMints][${requestId}] === VERIFY REQUEST ===`);
    console.log(`[BeatMints][${requestId}] Verify body:`, JSON.stringify(verifyBody, null, 2));
    console.log(`[BeatMints][${requestId}] ======================`);
    
    const verifyRes = await fetch(`${CDP_FACILITATOR_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${verifyJwt}`
      },
      body: JSON.stringify(verifyBody)
    });
    
    const verifyText = await verifyRes.text();
    let verifyData: any = null;
    try {
      verifyData = verifyText ? JSON.parse(verifyText) : {};
    } catch {
      verifyData = { raw: verifyText };
    }
    
    console.log(`[BeatMints][${requestId}] === VERIFY RESPONSE ===`);
    console.log(`[BeatMints][${requestId}] Status:`, verifyRes.status);
    console.log(`[BeatMints][${requestId}] Response:`, JSON.stringify(verifyData, null, 2));
    console.log(`[BeatMints][${requestId}] ======================`);
    
    if (!verifyRes.ok || !verifyData?.isValid) {
      console.error(`[BeatMints][${requestId}] Verification failed:`, JSON.stringify(verifyData, null, 2));
      console.error(`[BeatMints][${requestId}] Verify response status:`, verifyRes.status);
      console.error(`[BeatMints][${requestId}] Payment payload keys:`, Object.keys(decodedPayment || {}));
      return NextResponse.json({
        x402Version: 1,
        error: verifyData?.invalidReason || verifyData?.error || verifyData?.message || `Payment verification failed (${verifyRes.status})`,
        requestId,
        cdpResponse: verifyData,
        cdpStatus: verifyRes.status,
        paymentPayloadKeys: Object.keys(decodedPayment || {}),
        paymentPayload: {
          scheme: decodedPayment?.scheme,
          network: decodedPayment?.network,
          hasPayload: !!decodedPayment?.payload,
          payloadKeys: Object.keys(decodedPayment?.payload || {}),
          payloadAuthorizationKeys: Object.keys(decodedPayment?.payload?.authorization || {}),
        },
        paymentFrom: decodedPayment?.payload?.authorization?.from || decodedPayment?.from || "unknown",
        accepts: buildPaymentRequirements(resourceUrl)
      }, { status: 402 });
    }
    
    console.log("[BeatMints] Payment verified, payer:", verifyData.payer);
    
    // Parse request body
    const body = await request.json();
    const { title, style } = body;
    
    if (!title || !style) {
      // Don't settle if request is invalid
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        message: "Both 'title' and 'style' are required",
      }, { status: 400 });
    }
    
    // Generate job ID first
    const jobId = crypto.randomBytes(8).toString("hex");
    
    // Settle payment with CDP facilitator
    const settleJwt = await generateCdpJwt("/platform/v2/x402/settle", "POST");
    
    const settleRes = await fetch(`${CDP_FACILITATOR_URL}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settleJwt}`
      },
      body: JSON.stringify({
        x402Version: 1,
        paymentPayload: decodedPayment,  // Decoded payment object
        paymentRequirements
      })
    });
    
    const settleText = await settleRes.text();
    let settleData: any = null;
    try {
      settleData = settleText ? JSON.parse(settleText) : {};
    } catch {
      settleData = { raw: settleText };
    }
    
    if (!settleRes.ok || !settleData?.success) {
      console.error(`[BeatMints][${requestId}] Settlement failed:`, settleData);
      return NextResponse.json({
        x402Version: 1,
        requestId,
        error: settleData?.errorReason || settleData?.error || "Payment settlement failed",
        cdpSettleStatus: settleRes.status,
        cdpSettleResponse: settleData,
        accepts: buildPaymentRequirements(resourceUrl)
      }, { status: 402 });
    }
    
    console.log(`[BeatMints] Payment settled, tx: ${settleData.transaction}`);
    
    // Create job with payment info (title includes jobId for tracking)
    const trackTitle = `${title} [${jobId.slice(0, 8)}]`;
    const job = await createJob(jobId, trackTitle, style, paymentHeader, settleData.transaction, settleData.payer);
    const queueLength = await getQueueLength();
    const estimatedWait = queueLength * ESTIMATED_GENERATION_TIME;
    
    console.log(`[BeatMints] Job ${jobId} created for "${trackTitle}"`);
    
    // Notify about new order (async, don't block response)
    notifyNewOrder(jobId, trackTitle, style, settleData.payer).catch(() => {});
    
    // Return success with X-PAYMENT-RESPONSE header
    const paymentResponse = Buffer.from(JSON.stringify({
      success: true,
      transaction: settleData.transaction,
      network: settleData.network,
      payer: settleData.payer
    })).toString('base64');
    
    return NextResponse.json({
      success: true,
      jobId,
      status: "queued",
      position: queueLength,
      estimatedWaitSeconds: estimatedWait,
      message: `Your track "${title}" is queued. Poll /api/status/${jobId} for updates.`,
      statusUrl: `/api/status/${jobId}`,
      createdAt: job.createdAt,
      payment: {
        transaction: settleData.transaction,
        amount: "$0.20 USDC",
        payer: settleData.payer
      }
    }, {
      status: 202,
      headers: {
        "X-PAYMENT-RESPONSE": paymentResponse
      }
    });
    
  } catch (error) {
    console.error("[BeatMints] Error:", error);
    return NextResponse.json({
      x402Version: 1,
      error: "Internal server error during payment processing",
      accepts: buildPaymentRequirements(resourceUrl)
    }, { status: 402 });
  }
}
