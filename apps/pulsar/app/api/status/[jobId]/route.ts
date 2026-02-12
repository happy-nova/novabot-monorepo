import { NextRequest, NextResponse } from "next/server";
import { getJob, getQueuePosition, isProcessing } from "@/lib/jobs";

const ESTIMATED_GENERATION_TIME = 90;

function getStatusMessage(
  status: string,
  position: number,
  processing: boolean
): string {
  switch (status) {
    case "queued":
      return `Your track is #${position} in queue. Estimated wait: ~${Math.ceil(position * 1.5)} minutes.`;
    case "processing":
      return "Your track is being generated now. This typically takes 60-90 seconds.";
    case "completed":
      return "Your tracks are ready! URLs are valid for streaming and download.";
    case "failed":
      return "Generation failed. Contact support for assistance.";
    default:
      return "Unknown status";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

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

  const position = getQueuePosition(jobId);
  const processing = job.status === "processing";

  return NextResponse.json({
    success: true,
    jobId,
    status: job.status,
    position: processing ? 0 : position,
    estimatedWaitSeconds: processing
      ? ESTIMATED_GENERATION_TIME / 2
      : position * ESTIMATED_GENERATION_TIME,
    title: job.title,
    style: job.style,
    tracks: job.tracks,
    message: getStatusMessage(job.status, position, processing),
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  });
}
