import { NextRequest, NextResponse } from "next/server";
import {
  getQueuedJobs,
  getQueueLength,
  getJob,
  claimNextJob,
  completeJob,
  failJob,
  getHistory,
  getStats,
  WORKER_SECRET,
} from "@/lib/jobs-kv";

// Authenticate worker requests
function authenticateWorker(request: NextRequest): boolean {
  const auth = request.headers.get("Authorization");
  if (auth) {
    const token = auth.replace("Bearer ", "");
    if (token === WORKER_SECRET) return true;
  }
  
  const headerSecret = request.headers.get("X-Worker-Secret");
  if (headerSecret === WORKER_SECRET) return true;
  
  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === WORKER_SECRET) return true;
  
  return false;
}

// GET /api/worker - Get status, queue, or history
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");
  
  // Public: status check
  if (action === "status") {
    const stats = await getStats();
    return NextResponse.json(stats);
  }
  
  // Public: job history
  if (action === "history") {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const history = await getHistory(limit);
    return NextResponse.json({ jobs: history });
  }

  // Auth required below
  if (!authenticateWorker(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Claim next job (atomic - removes from queue)
  if (action === "claim") {
    const job = await claimNextJob();
    if (!job) {
      return NextResponse.json({ job: null, message: "No jobs in queue" });
    }
    return NextResponse.json({ job });
  }

  // List all queued jobs (without claiming)
  const jobs = await getQueuedJobs();
  return NextResponse.json({
    jobs: jobs.map(job => ({
      jobId: job.id,
      title: job.title,
      style: job.style,
      createdAt: job.createdAt,
      payer: job.payer,
    }))
  });
}

// POST /api/worker - Complete, fail, or add a job
export async function POST(request: NextRequest) {
  if (!authenticateWorker(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, jobId, audioUrl, songUrl, error, style, title } = body;
  
  // Admin: add test job (for e2e testing without payment)
  if (action === "add") {
    if (!style) {
      return NextResponse.json({ error: "Missing style" }, { status: 400 });
    }
    const { createJob } = await import("@/lib/jobs-kv");
    const crypto = await import("crypto");
    const testJobId = crypto.randomBytes(8).toString("hex");
    const testTitle = title || `Test ${testJobId.slice(0, 8)}`;
    const job = await createJob(testJobId, testTitle, style, undefined, undefined, "test-admin");
    return NextResponse.json({ success: true, job });
  }
  
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (action === "complete") {
    if (!audioUrl) {
      return NextResponse.json({ error: "Missing audioUrl" }, { status: 400 });
    }
    await completeJob(jobId, audioUrl, songUrl);
    return NextResponse.json({ success: true, jobId, status: "completed" });
  }
  
  if (action === "fail") {
    await failJob(jobId, error || "Unknown error");
    return NextResponse.json({ success: true, jobId, status: "failed" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
