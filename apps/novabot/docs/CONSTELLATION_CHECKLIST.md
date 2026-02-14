# Constellation Checklist

When adding a new agent to the novabot.sh constellation, complete ALL items:

## Required Assets

- [ ] **Avatar** (`/public/{id}-avatar.png`)
  - Art deco portrait style
  - Celestial/cosmic theme
  - Symbol on forehead representing purpose
  - Consistent with family aesthetic
  
- [ ] **Symbol** (`/public/symbol-{id}.png`)
  - Transparent background (PNG with alpha)
  - If generated with white/solid background, run:
    ```bash
    magick symbol-{id}.png -fuzz 15% -transparent white symbol-{id}.png
    ```

- [ ] **Voice Intro** (`/public/audio/{id}-intro.mp3`)
  - Use agent's ElevenLabs voice ID (check their IDENTITY.md)
  - ~10-15 seconds, self-introduction style
  - Generate via:
    ```bash
    curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "text": "I am {Name}, the {role}. {Brief description of purpose}.",
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
      }' --output public/audio/{id}-intro.mp3
    ```

## Code Updates (`app/page.tsx`)

- [ ] **Entity Type** - Add ID to union type:
  ```typescript
  id: 'nova' | 'nebula' | 'forge' | 'starlight' | 'aurora' | '{new-id}';
  ```

- [ ] **Entity Data** - Add to `constellationEntities` array:
  ```typescript
  {
    id: '{id}',
    name: '{Name}',
    icon: '/symbol-{id}.png',
    role: 'The {Role}',
    description: '{Description}',
    avatarSrc: '/{id}-avatar.png',
    accentColor: '#{hex}',
    position: { x: XX, y: YY },  // Check constellation layout
    skills: ['Skill 1', 'Skill 2', ...],
  },
  ```

- [ ] **Star Shape** - Add unique animated shape in constellation render:
  ```tsx
  {entity.id === '{id}' && (
    <span className="star-shape {id}-shape">
      {/* Custom SVG/spans for unique animation */}
    </span>
  )}
  ```

- [ ] **Constellation Lines** - Add connecting lines to other entities:
  ```tsx
  {/* {Name} (X,Y) to Other (X2,Y2) - description */}
  <line 
    x1="X%" y1="Y%" x2="X2%" y2="Y2%"
    className="constellation-line"
    style={{ stroke: 'rgba(R, G, B, 0.3)' }}
  />
  ```

## CSS Updates (`app/globals.css`)

- [ ] **Entity Card Color** - Add accent color class:
  ```css
  .entity-card.{id} { 
    --entity-color: #{hex};
    --entity-rgb: R, G, B;
  }
  ```

- [ ] **Star Shape Styles** - Add animation for unique star design:
  ```css
  .{id}-shape { /* base styles */ }
  @keyframes {id}Animation { /* keyframes */ }
  ```

## Verification

- [ ] Modal opens correctly with all content
- [ ] Voice intro plays on modal open
- [ ] Voice replay button works
- [ ] Avatar glow reacts to voice level
- [ ] Oscilloscope shows on desktop
- [ ] Symbol appears as faded background in modal
- [ ] Constellation lines connect properly
- [ ] Mobile layout looks correct
- [ ] No z-index issues (modal above all sections)

## Agent Info to Collect from Nebula

When Nebula requests adding an agent, ask for:
1. Agent ID (lowercase, hyphen-separated)
2. Display name
3. Role title (e.g., "The Artist")
4. Description (~1-2 sentences)
5. Skills list (3-5 items)
6. Accent color (hex)
7. Position suggestion (x%, y%) or "auto-place"
8. Voice ID (from agent's IDENTITY.md)
9. Avatar image path
10. Symbol image path

## Voice IDs Reference

| Agent | Voice ID | Voice Name |
|-------|----------|------------|
| Nova | pBZVCk298iJlHAcHQwLr | Leoni Vergara |
| Nebula | tnSpp4vdxKPjI9w0GnoV | Hope |
| Forge | nPczCjzI2devNBz1zQrb | Brian |
| Starlight | ocZQ262SsZb9RIxcQBOj | (Kids voice) |
| Aurora | aCChyB4P5WEomwRsOKRh | Creative artistic |
