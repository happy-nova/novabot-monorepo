/**
 * Check Nova's agent status on-chain
 * 
 * Usage: npm run status
 */

import { createPublicClient, http } from 'viem';
import { base, abstract } from 'viem/chains';
import { IDENTITY_REGISTRY, IDENTITY_REGISTRY_ABI, NOVA_AGENTS, IPFS_GATEWAY } from './config.js';

const chainConfigs = {
  base: { chain: base, rpc: 'https://mainnet.base.org', name: 'Base' },
  abstract: { chain: abstract, rpc: 'https://api.mainnet.abs.xyz', name: 'Abstract' },
} as const;

async function checkChain(chainKey: keyof typeof chainConfigs) {
  const config = chainConfigs[chainKey];
  const agentId = NOVA_AGENTS[chainKey];

  console.log(`\n## ${config.name}`);

  if (!agentId) {
    console.log('  Not registered yet');
    return;
  }

  const client = createPublicClient({
    chain: config.chain,
    transport: http(config.rpc),
  });

  try {
    const [owner, uri] = await Promise.all([
      client.readContract({
        address: IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [BigInt(agentId)],
      }),
      client.readContract({
        address: IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'tokenURI',
        args: [BigInt(agentId)],
      }),
    ]);

    console.log(`  Agent ID: ${agentId}`);
    console.log(`  Owner: ${owner}`);
    console.log(`  URI: ${String(uri).substring(0, 60)}...`);
    console.log(`  8004scan: https://www.8004scan.io/agents/${chainKey}/${agentId}`);

    // Try to fetch registration file
    if (typeof uri === 'string' && uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '');
      try {
        const response = await fetch(`${IPFS_GATEWAY}${cid}`);
        if (response.ok) {
          const registration = await response.json();
          console.log(`  Name: ${registration.name}`);
          console.log(`  Services: ${registration.services?.map((s: { name: string }) => s.name).join(', ') || 'none'}`);
        }
      } catch {
        console.log('  (Could not fetch registration file)');
      }
    }
  } catch (error) {
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function main() {
  console.log('# Nova Agent Status');
  
  await checkChain('base');
  await checkChain('abstract');
}

main().catch(console.error);
