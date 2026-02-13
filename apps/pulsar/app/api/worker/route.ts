import { NextRequest, NextResponse } from "next/server";
import {
  getQueuedJobs,
  updateJob,
  getJob,
  WORKER_SECRET,
  cleanupOldJobs,
} from "@/lib/jobs";

// Authenticate worker requests (supports multiple methods)
function authenticateWorker(request: NextRequest): boolean {
  // Method 1: Authorization header
  const auth = request.headers.get("Authorization");
  if (auth) {
    const token = auth.replace("Bearer ", "");
    if (token === WORKER_SECRET) return true;
  }
  
  // Method 2: X-Worker-Secret header
  const headerSecret = request.headers.get("X-Worker-Secret");
  if (headerSecret === WORKER_SECRET) return true;
  
  // Method 3: Query param (for GET requests)
  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === WORKER_SECRET) return true;
  
  return false;
}

// GET /api/worker - Get pending jobs
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");
  
  // Allow unauthenticated status check
  if (action === "status") {
    const queued = getQueuedJobs();
    return NextResponse.json({ queueLength: queued.length });
  }
  
  if (!authenticateWorker(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cleanup old jobs periodically
  cleanupOldJobs();

  const queued = getQueuedJobs();
  
  // Return all queued jobs (worker will process them one at a time)
  return NextResponse.json({
    jobs: queued.map(job => ({
      jobId: job.id,
      title: job.title,
      style: job.style,
      createdAt: job.createdAt
    }))
  });
}

// POST /api/worker - Update job with result
export async function POST(request: NextRequest) {
  if (!authenticateWorker(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, jobId, status, tracks, error, title, style } = body;
  
  // Test job creation (for development only)
  if (action === "create_test" && title && style) {
    const { createJob } = await import("@/lib/jobs");
    const crypto = await import("crypto");
    const testJobId = crypto.randomBytes(8).toString("hex");
    createJob(testJobId, title, style, "test-payment");
    console.log(`[Worker] Test job created: ${testJobId}`);
    return NextResponse.json({ 
      success: true, 
      jobId: testJobId, 
      message: "Test job created (no payment)" 
    });
  }

  // Handle action-based requests
  if (action === "complete") {
    // Mark job as completed with audio URL
    const { audioUrl, songUrl } = body;
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    
    if (audioUrl) updates.audioUrl = audioUrl;
    if (songUrl) updates.songUrl = songUrl;

    updateJob(jobId, updates);
    console.log(`[Worker] Job ${jobId} completed. Audio: ${audioUrl}`);

    return NextResponse.json({ success: true, jobId, status: "completed", audioUrl });
  }
  
  if (action === "fail") {
    // Mark job as failed with error
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    updateJob(jobId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      error: error || "Unknown error",
    });
    console.log(`[Worker] Job ${jobId} failed: ${error}`);

    return NextResponse.json({ success: true, jobId, status: "failed" });
  }
  
  if (action === "update") {
    if (!jobId || !status) {
      return NextResponse.json(
        { error: "Missing jobId or status" },
        { status: 400 }
      );
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { status };
    
    if (status === "completed" || status === "failed") {
      updates.completedAt = new Date().toISOString();
    }

    if (tracks) {
      updates.tracks = tracks;
    }
    if (error) {
      updates.error = error;
    }

    updateJob(jobId, updates);
    console.log(`[Worker] Job ${jobId} updated: ${status}`);

    return NextResponse.json({ success: true, jobId, status });
  }

  // Legacy format support
  if (!jobId || !status) {
    return NextResponse.json(
      { error: "Missing jobId or status" },
      { status: 400 }
    );
  }

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    status,
    completedAt: new Date().toISOString(),
  };

  if (tracks) {
    updates.tracks = tracks;
  }
  if (error) {
    updates.error = error;
  }

  updateJob(jobId, updates);

  return NextResponse.json({ success: true });
}
