# Pulsar x402 Bazaar Listing (AWAL)

Date: 2026-02-13

## Sources
- CDP skill docs:
  - https://docs.cdp.coinbase.com/agentic-wallet/skills/search-for-service
  - https://docs.cdp.coinbase.com/agentic-wallet/skills/monetize-service
- x402 Bazaar docs:
  - https://x402.gitbook.io/x402/bazaar/bazaar-integration-guide
  - https://x402.gitbook.io/x402/bazaar/discovery-and-service-registration
  - https://x402.gitbook.io/x402/bazaar/bazaar-v2-extensions

## Exact 402 Format Required For Bazaar Indexing

For 402 responses, each `accepts[]` requirement should include:

Required core fields:
- `scheme` (`"exact"`)
- `network` (e.g. `"base"`)
- `maxAmountRequired`
- `resource`
- `payTo`
- `asset`

Required discovery fields (when listing in Bazaar):
- `discoverable: true`
- `inputSchema` (JSON schema)
- `outputSchema` (JSON schema)
- `extensions.bazaar` (metadata object)
- `extensions.cdp` (present; may be empty)

`extensions.bazaar` fields:
- Required:
  - `name`
  - `description`
  - `iconUrl`
  - `tags` (string array)
- Optional:
  - `category`
  - `integrationType` (`"api" | "agent"`)
  - `curator`
  - `payPerUse`
  - `popUp`
  - `createdAt`

Common optional but useful fields in requirement:
- `description`
- `mimeType`
- `pricingCategory` (`fixed | range | dynamic`)
- `maxTimeoutSeconds`
- `extra`

## Indexing Trigger

Automatic indexing trigger:
- Service metadata is indexed by the facilitator when a payment flow is processed for a discoverable service definition.
- In practice: return 402 with discovery metadata, then complete at least one payment/settlement flow through a facilitator that supports Bazaar indexing.

Manual registration endpoint:
- `POST https://x402.org/discovery/resources/register`
- Payload shape:
  - `service` (name, description, url, seller, tags, pricing, categories, examples, etc.)
  - `paymentRequirements[]`
  - optional `facilitator`

## CDP Facilitator vs x402.org Facilitator

Observed from docs:
- Bazaar search/registration endpoints are documented on `x402.org` (`/discovery/resources`, `/discovery/resources/register`).
- CDP docs describe monetization and discovery skills but do not explicitly document a public CDP bazaar registration endpoint or guaranteed replication into `x402.org` Bazaar.

Conclusion:
- If your goal is guaranteed appearance in the public Bazaar index queried by AWAL/x402 discovery, use x402.org discovery/registration path (or a facilitator explicitly documented to publish there).
- CDP facilitator indexing into `x402.org` should be treated as unverified unless confirmed by Coinbase/x402 maintainers.

## Pulsar Implementation Status

Updated file:
- `apps/pulsar/app/api/generate/route.ts`

Changes made:
- Added `discoverable: true`
- Added `inputSchema` and `outputSchema`
- Replaced legacy `extensions.bazaar.info` format with Bazaar v2 metadata object
- Added `extensions.cdp: {}`
- Added `pricingCategory: "fixed"`

## Path To Verified Listing

Primary verification path:
- Search API: `https://x402.org/discovery/resources?query=pulsar`

Manual-registration fallback path:
1. `POST https://x402.org/discovery/resources/register`
2. Re-check `https://x402.org/discovery/resources?query=pulsar`

Current check status at doc creation time:
- `pulsar` listing was not confirmed from this environment before registration/reindex.
