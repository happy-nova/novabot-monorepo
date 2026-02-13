import { NextRequest, NextResponse } from "next/server";
import { getJob, getQueuedJobs } from "@/lib/jobs-kv";

const ESTIMATED_GENERATION_TIME = 90;

function getStatusMessage(status: string, position: number): string {
  switch (status) {
    case "queued":
      return `Your track is #${position} in queue. Estimated wait: ~${Math.ceil(position * 1.5)} minutes.`;
    case "processing":
      return "Your track is being generated now. This typically takes 60-90 seconds.";
    case "completed":
      return "Your track is ready! Download URL is valid for 48 hours.";
    case "failed":
      return "Generation failed. Your payment was not charged.";
    default:
      return "Unknown status";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json(
      {
        success: false,
        error: "Job not found",
        message: "Invalid job ID or job has expired",
      },
      { status: 404 }
    );
  }

  // Calculate queue position
  let position = 0;
  if (job.status === "queued") {
    const queue = await getQueuedJobs();
    position = queue.findIndex(j => j.id === jobId) + 1;
    if (position === 0) position = queue.length + 1;
  }

  const response: Record<string, unknown> = {
    success: true,
    jobId,
    status: job.status,
    title: job.title,
    style: job.style,
    message: getStatusMessage(job.status, position),
    createdAt: job.createdAt,
  };

  // Add position/wait for queued jobs
  if (job.status === "queued") {
    response.position = position;
    response.estimatedWaitSeconds = position * ESTIMATED_GENERATION_TIME;
  }

  // Add processing info
  if (job.status === "processing") {
    response.estimatedWaitSeconds = ESTIMATED_GENERATION_TIME;
  }

  // Add completion info
  if (job.status === "completed") {
    response.completedAt = job.completedAt;
    response.audioUrl = job.audioUrl;
    response.songUrl = job.songUrl;
    
    // Calculate delivery time
    if (job.createdAt && job.completedAt) {
      const created = new Date(job.createdAt).getTime();
      const completed = new Date(job.completedAt).getTime();
      response.deliverySeconds = Math.round((completed - created) / 1000);
    }
  }

  // Add error info
  if (job.status === "failed") {
    response.completedAt = job.completedAt;
    response.error = job.error;
  }

  // Add payment info if available
  if (job.txHash) {
    response.payment = {
      txHash: job.txHash,
      payer: job.payer,
      explorerUrl: `https://basescan.org/tx/${job.txHash}`,
    };
  }

  return NextResponse.json(response);
}
