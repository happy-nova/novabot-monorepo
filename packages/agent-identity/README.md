# @novabot/agent-identity

ERC-8004 agent identity management for Nova.

## Overview

This package manages Nova's on-chain agent identity using the [ERC-8004 Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004) standard.

**Chains:** Base, Abstract (same contract addresses via deterministic deployment)

**Contract Addresses:**
- Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Reputation Registry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`

## Files

- `registration.json` - Nova's agent registration file (versioned in git)
- `pins.json` - History of IPFS pins (auto-generated)
- `src/config.ts` - Contract addresses and Nova's agent IDs

## Workflow

### Initial Registration

1. Edit `registration.json` with agent details
2. Pin to IPFS:
   ```bash
   PINATA_JWT=xxx npm run pin
   ```
3. Register on-chain:
   ```bash
   PRIVATE_KEY=xxx npm run update-uri -- --chain base --cid <cid> --register
   ```
4. Update `NOVA_AGENTS` in `src/config.ts` with the new agent ID

### Updating Registration

When adding services or changing details:

1. Edit `registration.json`
2. Pin the new version:
   ```bash
   PINATA_JWT=xxx npm run pin
   ```
3. Update on-chain URI:
   ```bash
   PRIVATE_KEY=xxx npm run update-uri -- --chain base --cid <new-cid>
   ```

### Check Status

```bash
npm run status
```

## Registration File Format

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Nova",
  "description": "...",
  "image": "https://novabot.sh/nova-avatar.png",
  "services": [
    { "name": "web", "endpoint": "https://novabot.sh/" },
    { "name": "A2A", "endpoint": "https://novabot.sh/.well-known/agent-card.json" }
  ],
  "x402Support": true,
  "active": true,
  "registrations": [
    { "agentId": 1500, "agentRegistry": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" }
  ]
}
```

## Environment Variables

- `PINATA_JWT` - Pinata API key for IPFS pinning ([get one](https://app.pinata.cloud/developers/api-keys))
- `PRIVATE_KEY` - Wallet private key for on-chain transactions

## Resources

- [ERC-8004 Spec](https://eips.ethereum.org/EIPS/eip-8004)
- [8004scan](https://www.8004scan.io/) - Agent explorer
- [Contract Source](https://github.com/erc-8004/erc-8004-contracts)
