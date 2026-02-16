// Dreams manifest types and fetching

export type DreamStatus = 'active' | 'elevated' | 'sunset';
export type DreamSource = 'seeded' | 'emergent' | 'conversation';
export type DreamType = 'web-app' | 'canvas' | 'visualization' | 'writing' | 'music' | 'api' | 'prototype';

export interface Dream {
  id: string;
  date: string;
  title: string;
  slug: string;
  source: DreamSource;
  type: DreamType;
  status: DreamStatus;
  url?: string;
  description: string;
  reflection?: string;
  evolution?: string[];
  screenshot?: string;
  promoted_to?: string;
  sunset_date?: string;
  due_date?: string;
}

export interface DreamsManifest {
  $schema: string;
  version: string;
  last_updated: string;
  metadata: {
    philosophy: string;
    lifecycle: {
      active_days: number;
      review_trigger: string;
      outcomes: string[];
    };
  };
  dreams: Dream[];
}

// Fetch dreams manifest from API (for client-side dynamic updates)
export async function fetchDreamsManifest(): Promise<DreamsManifest> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const response = await fetch('https://data.celestials.sh/dreams.json', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    return response.json();
  }
  
  // For development, import the local file
  const manifest = await import('../public/dreams.json');
  return manifest.default as DreamsManifest;
}

// Normalized dream type with camelCase aliases for legacy compatibility
export type NormalizedDream = Dream & { dueDate?: string; sunsetDate?: string };

// Static export for SSG - reads from local file at build time
import manifestData from '../public/dreams.json';
export const staticManifest = manifestData as DreamsManifest;

// Normalize all dreams to include camelCase aliases
export const dreams: NormalizedDream[] = staticManifest.dreams.map(d => ({
  ...d,
  dueDate: d.due_date,
  sunsetDate: d.sunset_date,
}));

// Helper functions
export function getActiveDreams(): NormalizedDream[] {
  return dreams.filter(d => d.status === 'active');
}

export function getElevatedDreams(): NormalizedDream[] {
  return dreams.filter(d => d.status === 'elevated');
}

export function getSunsetDreams(): NormalizedDream[] {
  return dreams.filter(d => d.status === 'sunset');
}

export function getDreamById(id: string): Dream | undefined {
  return dreams.find(d => d.id === id);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDaysUntilDue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate + 'T00:00:00');
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
