/**
 * Update Nova's agentURI on-chain after pinning new registration.json
 * 
 * Usage: 
 *   PRIVATE_KEY=xxx npm run update-uri -- --chain base --cid <ipfs-cid>
 * 
 * For initial registration (no agentId yet):
 *   PRIVATE_KEY=xxx npm run update-uri -- --chain base --cid <ipfs-cid> --register
 */

import { createWalletClient, createPublicClient, http, parseArgs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, abstract } from 'viem/chains';
import { IDENTITY_REGISTRY, IDENTITY_REGISTRY_ABI, NOVA_AGENTS } from './config.js';

const chainConfigs = {
  base: { chain: base, rpc: 'https://mainnet.base.org' },
  abstract: { chain: abstract, rpc: 'https://api.mainnet.abs.xyz' },
} as const;

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const chainArg = args.find((_, i) => args[i - 1] === '--chain') || 'base';
  const cid = args.find((_, i) => args[i - 1] === '--cid');
  const isRegister = args.includes('--register');

  if (!cid) {
    console.error('Error: --cid <ipfs-cid> required');
    process.exit(1);
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable required');
    process.exit(1);
  }

  const chainConfig = chainConfigs[chainArg as keyof typeof chainConfigs];
  if (!chainConfig) {
    console.error(`Error: Unknown chain "${chainArg}". Use: base, abstract`);
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const agentURI = `ipfs://${cid}`;

  console.log(`Chain: ${chainArg}`);
  console.log(`Account: ${account.address}`);
  console.log(`Agent URI: ${agentURI}`);

  const publicClient = createPublicClient({
    chain: chainConfig.chain,
    transport: http(chainConfig.rpc),
  });

  const walletClient = createWalletClient({
    account,
    chain: chainConfig.chain,
    transport: http(chainConfig.rpc),
  });

  if (isRegister) {
    // Initial registration
    console.log('\nRegistering new agent...');
    
    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'register',
      args: [agentURI],
    });

    console.log(`Transaction: ${hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // Get agentId from logs (Transfer event)
    // The tokenId is in the third topic of the Transfer event
    const transferLog = receipt.logs.find(
      log => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );
    
    if (transferLog && transferLog.topics[3]) {
      const agentId = parseInt(transferLog.topics[3], 16);
      console.log(`\n✓ Registered! Agent ID: ${agentId}`);
      console.log(`  View at: https://www.8004scan.io/agents/${chainArg}/${agentId}`);
      console.log(`\n⚠️  Update NOVA_AGENTS.${chainArg} in config.ts to: ${agentId}`);
    } else {
      console.log(`\n✓ Registered! Check explorer for agent ID.`);
    }
  } else {
    // Update existing agent URI
    const agentId = NOVA_AGENTS[chainArg as keyof typeof NOVA_AGENTS];
    if (!agentId) {
      console.error(`Error: No agent ID configured for ${chainArg}. Use --register for initial registration.`);
      process.exit(1);
    }

    console.log(`\nUpdating agent ${agentId} URI...`);

    const hash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'setAgentURI',
      args: [BigInt(agentId), agentURI],
    });

    console.log(`Transaction: ${hash}`);
    console.log('Waiting for confirmation...');

    await publicClient.waitForTransactionReceipt({ hash });
    
    console.log(`\n✓ Updated! View at: https://www.8004scan.io/agents/${chainArg}/${agentId}`);
  }
}

main().catch(console.error);
