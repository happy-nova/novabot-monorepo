# Adding a New Agent to the Constellation

This guide covers adding a new agent node to novabot.sh's constellation section.

## Required Assets

Before starting, prepare these files:

| Asset | Specs | Location |
|-------|-------|----------|
| **Avatar** | Square, ~500px+, art deco style | `/public/{agent}-avatar.png` |
| **Symbol** | Transparent PNG, white/gold icon on transparent bg | `/public/symbol-{agent}.png` |
| **Voice Intro** | MP3, ~10-20 seconds, agent introducing themselves | `/public/audio/{agent}-intro.mp3` |

### Converting symbols to transparent PNG

If your symbol has a white background:
```bash
magick input.png -fuzz 10% -transparent white symbol-{agent}.png
```

## Code Changes

### 1. Add to `constellationEntities` array

In `apps/novabot/app/page.tsx`, add to the array (~line 28):

```typescript
{
  id: 'agentname',  // lowercase, used for CSS classes
  name: 'AgentName',
  icon: '/symbol-agentname.png',
  role: 'The [Role]',
  description: 'Agent description...',
  avatarSrc: '/agentname-avatar.png',
  accentColor: '#hexcolor',  // See color palette below
  position: { x: 50, y: 50 },  // Percentage position on star map
  skills: [
    'Skill one',
    'Skill two',
    'Skill three',
    'Skill four',
    'Skill five',
  ],
},
```

### 2. Update TypeScript type

Update the `ConstellationEntity` type's `id` union (~line 17):

```typescript
type ConstellationEntity = {
  id: 'nova' | 'nebula' | 'forge' | 'starlight' | 'newagent';
  // ...
};
```

### 3. Add constellation lines (optional)

In the `<svg className="constellation-lines">` section, add lines connecting to other nodes:

```tsx
{/* NewAgent (x,y) to OtherAgent (x2,y2) - color */}
<line 
  x1="50" y1="50" x2="30" y2="40"
  stroke="rgba(HEX_RGB, 0.4)"
  strokeWidth="0.25"
  strokeDasharray="1,0.8"
  className="constellation-line line-{color}"
/>
```

### 4. Add star shape (optional custom shape)

Each agent can have a unique animated star shape. Add in the constellation star mapping:

```tsx
{entity.id === 'newagent' && (
  <span className="star-shape newagent-shape">
    {/* Custom shape elements */}
    <span className="star-core" />
  </span>
)}
```

Then add corresponding CSS in `globals.css` for the shape animation.

### 5. Add entity-card accent color (if needed)

In `globals.css`, add entity-specific accent overrides if the default doesn't work:

```css
.entity-card.newagent {
  --entity-color: #hexcolor;
  --entity-rgb: R, G, B;  /* For rgba() usage */
}
```

## Color Palette

Current agent colors:

| Agent | Hex | RGB |
|-------|-----|-----|
| Nova | `#d4af37` | `212, 175, 55` |
| Nebula | `#8b5cf6` | `139, 92, 246` |
| Forge | `#e67e22` | `230, 126, 34` |
| Starlight | `#f472b6` | `244, 114, 182` |

Choose a color that's visually distinct from existing agents.

## Position Guidelines

The constellation uses a percentage-based coordinate system:
- `x: 0` = left edge, `x: 100` = right edge
- `y: 0` = top edge, `y: 100` = bottom edge

Current positions:
- Nova: `{ x: 30, y: 40 }`
- Nebula: `{ x: 70, y: 60 }`
- Forge: `{ x: 50, y: 75 }`
- Starlight: `{ x: 75, y: 30 }`

Place new agents to maintain visual balance and avoid overlapping.

## Checklist

- [ ] Avatar image (`/public/{agent}-avatar.png`)
- [ ] Symbol with transparency (`/public/symbol-{agent}.png`)
- [ ] Voice intro audio (`/public/audio/{agent}-intro.mp3`)
- [ ] Added to `constellationEntities` array
- [ ] Updated TypeScript `id` union type
- [ ] Added constellation connection lines
- [ ] (Optional) Custom star shape + CSS
- [ ] (Optional) Entity card color override
- [ ] Run `pnpm -C apps/novabot typecheck`
- [ ] Test locally with `pnpm -C apps/novabot dev`
