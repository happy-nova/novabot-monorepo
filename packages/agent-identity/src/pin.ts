/**
 * Pin registration.json to IPFS via Pinata
 * 
 * Usage: PINATA_JWT=xxx npm run pin
 * 
 * After pinning, update the agentURI on-chain with:
 *   npm run update-uri -- --chain base --cid <new-cid>
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRATION_PATH = join(__dirname, '..', 'registration.json');
const PINS_PATH = join(__dirname, '..', 'pins.json');

interface PinRecord {
  cid: string;
  timestamp: string;
  version: number;
}

async function pinToIPFS() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    console.error('Error: PINATA_JWT environment variable required');
    console.error('Get one at https://app.pinata.cloud/developers/api-keys');
    process.exit(1);
  }

  // Read registration file
  const registration = JSON.parse(readFileSync(REGISTRATION_PATH, 'utf-8'));
  
  // Load existing pins history
  let pins: PinRecord[] = [];
  try {
    pins = JSON.parse(readFileSync(PINS_PATH, 'utf-8'));
  } catch {
    // First pin
  }

  const nextVersion = pins.length > 0 ? pins[pins.length - 1].version + 1 : 1;

  console.log(`Pinning registration.json (version ${nextVersion})...`);
  console.log('Content:', JSON.stringify(registration, null, 2));

  // Pin to Pinata
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: registration,
      pinataMetadata: {
        name: `nova-registration-v${nextVersion}.json`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Pinata error:', error);
    process.exit(1);
  }

  const result = await response.json() as { IpfsHash: string };
  const cid = result.IpfsHash;

  // Record the pin
  const pinRecord: PinRecord = {
    cid,
    timestamp: new Date().toISOString(),
    version: nextVersion,
  };
  pins.push(pinRecord);
  writeFileSync(PINS_PATH, JSON.stringify(pins, null, 2));

  console.log('\n✓ Pinned successfully!');
  console.log(`  CID: ${cid}`);
  console.log(`  URI: ipfs://${cid}`);
  console.log(`  Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
  console.log(`\nNext step: Update on-chain URI with:`);
  console.log(`  npm run update-uri -- --chain base --cid ${cid}`);
}

pinToIPFS().catch(console.error);
