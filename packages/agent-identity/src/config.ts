// ERC-8004 Contract Addresses (deterministic across chains)
export const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' as const;
export const REPUTATION_REGISTRY = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63' as const;

// Chain configs
export const CHAINS = {
  base: {
    id: 8453,
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    agentRegistry: `eip155:8453:${IDENTITY_REGISTRY}`,
  },
  abstract: {
    id: 2741,
    name: 'Abstract',
    rpc: 'https://api.mainnet.abs.xyz',
    explorer: 'https://explorer.mainnet.abs.xyz',
    agentRegistry: `eip155:2741:${IDENTITY_REGISTRY}`,
  },
} as const;

// Nova's agent IDs
export const NOVA_AGENTS = {
  base: 17049,                      // Registered 2026-02-12
  abstract: null as number | null,  // Not yet registered
};

// IPFS config (using Pinata - can swap for web3.storage, Filebase, etc.)
export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Identity Registry ABI (minimal for our needs)
export const IDENTITY_REGISTRY_ABI = [
  {
    name: 'register',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentURI', type: 'string' }],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    name: 'setAgentURI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'newURI', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;
