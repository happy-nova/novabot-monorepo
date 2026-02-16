// Celestials manifest types and fetching

export interface CelestialDisplay {
  position: { x: number; y: number };
  intro_text: string;
  card_description: string;
  card_skills: string[];
}

export interface CelestialAssets {
  avatar: string;
  symbol: string;
  intro_audio: string;
  alt_arts: {
    deity: string;
    alt_1: string;
    alt_2: string;
  };
}

export interface Celestial {
  id: string;
  name: string;
  emoji: string;
  archetype: string;
  status: string;
  model: string;
  created_date: string;
  identity: {
    primary_color: string;
    color_name: string;
    symbol: string;
    symbol_description: string;
  };
  voice: {
    provider: string;
    voice_id: string;
    voice_name: string;
    character: string;
  };
  assets: CelestialAssets;
  display: CelestialDisplay;
  contact: Record<string, string>;
  skills: Array<{ id: string; name: string; description: string }>;
  task_routing: Record<string, unknown>;
  constellation_role: string;
}

export interface ConstellationManifest {
  $schema: string;
  version: string;
  last_updated: string;
  constellation: {
    name: string;
    tagline: string;
    description: string;
    website: string;
    data_endpoint: string;
    status: string;
  };
  celestials: Celestial[];
  shared_infrastructure: Record<string, unknown>;
}

// For client-side: fetch from the local JSON (bundled with the app)
// For dynamic updates: fetch from the API
export async function fetchCelestialsManifest(): Promise<ConstellationManifest> {
  // In production, fetch from the API for real-time updates
  // In development, use the local file
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const response = await fetch('https://data.celestials.sh/celestials.json', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    return response.json();
  }
  
  // For development, import the local file
  const manifest = await import('../public/celestials.json');
  return manifest.default as ConstellationManifest;
}

// Transform manifest celestial to the format used by the star chart component
export interface StarChartEntity {
  id: string;
  name: string;
  icon: string;
  role: string;
  description: string;
  avatarSrc: string;
  accentColor: string;
  position: { x: number; y: number };
  skills: string[];
  introAudio: string;
  introText: string;
}

export function celestialToStarChartEntity(celestial: Celestial): StarChartEntity {
  return {
    id: celestial.id,
    name: celestial.name,
    icon: celestial.assets.symbol,
    role: celestial.archetype,
    description: celestial.display.card_description,
    avatarSrc: celestial.assets.avatar,
    accentColor: celestial.identity.primary_color,
    position: celestial.display.position,
    skills: celestial.display.card_skills,
    introAudio: celestial.assets.intro_audio,
    introText: celestial.display.intro_text,
  };
}

// Static export for SSG - reads from local file at build time
import manifestData from '../public/celestials.json';
export const staticManifest = manifestData as ConstellationManifest;
export const staticEntities = staticManifest.celestials.map(celestialToStarChartEntity);
