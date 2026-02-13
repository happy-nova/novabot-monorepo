/**
 * Persistent job storage using Vercel KV (Redis)
 * 
 * Keys:
 *   job:{jobId} - Job data (hash)
 *   queue - List of pending job IDs
 *   history - List of completed job IDs (last 100)
 */

import { kv } from '@vercel/kv';

export interface Job {
  id: string;
  title: string;
  style: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  paymentHeader?: string;
  txHash?: string;
  payer?: string;
  createdAt: string;
  completedAt?: string;
  audioUrl?: string;
  songUrl?: string;
  error?: string;
}

// Type for KV storage (all values as strings)
type JobRecord = Record<string, string | undefined>;

// Worker secret from env
export const WORKER_SECRET = process.env.WORKER_SECRET || process.env.BEATMINTS_WORKER_SECRET || '';

/**
 * Create a new job
 */
export async function createJob(
  jobId: string,
  title: string,
  style: string,
  paymentHeader?: string,
  txHash?: string,
  payer?: string
): Promise<Job> {
  const job: Job = {
    id: jobId,
    title,
    style,
    status: 'queued',
    paymentHeader,
    txHash,
    payer,
    createdAt: new Date().toISOString(),
  };

  // Store job data
  await kv.hset(`job:${jobId}`, job as unknown as JobRecord);
  
  // Add to queue
  await kv.lpush('queue', jobId);

  console.log(`[Jobs] Created job ${jobId}: "${title}"`);
  return job;
}

/**
 * Get a job by ID
 */
export async function getJob(jobId: string): Promise<Job | null> {
  const job = await kv.hgetall(`job:${jobId}`);
  return job as Job | null;
}

/**
 * Get all queued jobs
 */
export async function getQueuedJobs(): Promise<Job[]> {
  const jobIds = await kv.lrange('queue', 0, -1);
  if (!jobIds || jobIds.length === 0) return [];

  const jobs: Job[] = [];
  for (const jobId of jobIds) {
    const job = await getJob(jobId as string);
    if (job && job.status === 'queued') {
      jobs.push(job);
    }
  }
  return jobs;
}

/**
 * Get queue length
 */
export async function getQueueLength(): Promise<number> {
  const len = await kv.llen('queue');
  return len || 0;
}

/**
 * Claim a job for processing (atomic)
 */
export async function claimNextJob(): Promise<Job | null> {
  // Pop from queue
  const jobId = await kv.rpop('queue');
  if (!jobId) return null;

  const job = await getJob(jobId as string);
  if (!job) return null;

  // Mark as processing
  await kv.hset(`job:${job.id}`, { status: 'processing' });
  
  console.log(`[Jobs] Claimed job ${job.id}`);
  return { ...job, status: 'processing' };
}

/**
 * Update job status
 */
export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  await kv.hset(`job:${jobId}`, updates as unknown as JobRecord);
  console.log(`[Jobs] Updated job ${jobId}:`, Object.keys(updates));
}

/**
 * Complete a job
 */
export async function completeJob(
  jobId: string,
  audioUrl: string,
  songUrl?: string
): Promise<void> {
  await kv.hset(`job:${jobId}`, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    audioUrl,
    songUrl,
  });

  // Add to history (keep last 100)
  await kv.lpush('history', jobId);
  await kv.ltrim('history', 0, 99);

  console.log(`[Jobs] Completed job ${jobId}`);
}

/**
 * Fail a job
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  await kv.hset(`job:${jobId}`, {
    status: 'failed',
    completedAt: new Date().toISOString(),
    error,
  });

  // Add to history
  await kv.lpush('history', jobId);
  await kv.ltrim('history', 0, 99);

  console.log(`[Jobs] Failed job ${jobId}: ${error}`);
}

/**
 * Get recent job history
 */
export async function getHistory(limit = 20): Promise<Job[]> {
  const jobIds = await kv.lrange('history', 0, limit - 1);
  if (!jobIds || jobIds.length === 0) return [];

  const jobs: Job[] = [];
  for (const jobId of jobIds) {
    const job = await getJob(jobId as string);
    if (job) jobs.push(job);
  }
  return jobs;
}

/**
 * Get stats
 */
export async function getStats(): Promise<{
  queueLength: number;
  historyLength: number;
  recentCompleted: number;
  recentFailed: number;
}> {
  const queueLength = await kv.llen('queue') || 0;
  const historyLength = await kv.llen('history') || 0;
  
  const history = await getHistory(20);
  const recentCompleted = history.filter(j => j.status === 'completed').length;
  const recentFailed = history.filter(j => j.status === 'failed').length;

  return { queueLength, historyLength, recentCompleted, recentFailed };
}
