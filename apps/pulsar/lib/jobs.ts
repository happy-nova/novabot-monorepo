// Simple in-memory job store
// For production, use a database (Supabase, Redis, etc.)

export interface Job {
  id: string;
  title: string;
  style: string;
  status: "queued" | "processing" | "completed" | "failed";
  tracks: { title: string; url: string; duration: string }[] | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  paymentTx: string | null;
}

// In-memory store (resets on deploy - fine for MVP)
const jobs = new Map<string, Job>();

// Worker secret for authentication
export const WORKER_SECRET = process.env.WORKER_SECRET || "dev-secret-change-me";

export function createJob(id: string, title: string, style: string, paymentTx?: string): Job {
  const job: Job = {
    id,
    title,
    style,
    status: "queued",
    tracks: null,
    error: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    paymentTx: paymentTx || null,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getQueuedJobs(): Job[] {
  return Array.from(jobs.values())
    .filter((j) => j.status === "queued")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  
  const updated = { ...job, ...updates };
  jobs.set(id, updated);
  return updated;
}

export function getQueuePosition(id: string): number {
  const queued = getQueuedJobs();
  const index = queued.findIndex((j) => j.id === id);
  return index === -1 ? 0 : index + 1;
}

export function getQueueLength(): number {
  return getQueuedJobs().length;
}

export function isProcessing(): boolean {
  return Array.from(jobs.values()).some((j) => j.status === "processing");
}

// Cleanup old jobs (call periodically)
export function cleanupOldJobs(maxAgeMs: number = 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    const age = now - new Date(job.createdAt).getTime();
    if (age > maxAgeMs && (job.status === "completed" || job.status === "failed")) {
      jobs.delete(id);
    }
  }
}
