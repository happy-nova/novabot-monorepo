# STYLE.md - Nova Dreams Design Guidelines

## ⚠️ NO EMOJIS RULE

**Never use emoji characters in this project.** Always use custom imagery:

1. **For the compass/navigation** → Use `/compass.png`
2. **For other icons** → Generate with the `icon-gen` skill using Nova's style

### Why?
- Emojis render differently across platforms
- They break the cohesive art deco aesthetic
- Custom icons maintain brand consistency

### Icon Generation
Use the icon-gen skill to create consistent icons:
```bash
~/Workspaces/nova/skills/icon-gen/scripts/gen-icon.sh "subject description" name --style art-deco --size 64
```

Preferred styles: `art-deco`, `watercolor`, `abstract`

---

## Current Icons Needed

The following trait icons need to be generated to replace emojis:

| Trait | Current Emoji | Needed Icon |
|-------|---------------|-------------|
| Navigator | 🧭 | Use compass.png ✅ |
| Keeper | 📜 | Scroll/tome icon |
| Oracle | 🔮 | Crystal orb icon |
| Guide | ✨ | Star/light icon |

---

## Color Palette

```css
--bg-deep: #0a0a12        /* Deep navy, almost black */
--bg-surface: #12121f      /* Slightly lighter navy */
--accent-gold: #d4a843     /* Warm art deco gold */
--accent-gold-light: #e8c976
--text-primary: #e8e6e3    /* Warm off-white */
--text-secondary: rgba(232, 230, 227, 0.7)
```

---

## Typography

- **Display/Headers:** Cinzel (serif, art deco feel)
- **Body:** Inter (clean, readable)
- **Monospace:** JetBrains Mono (for coordinates/data)

---

## Design Principles

1. **Celestial navigation theme** — stars, constellations, compass roses
2. **Art deco aesthetic** — geometric patterns, gold accents, elegant lines
3. **Navy + gold palette** — deep space navy with warm gold highlights
4. **Mystery over exposition** — hint at depth, don't over-explain
5. **Custom over generic** — every visual element should feel intentional

---

## Assets

- `/compass.png` — Main Nova compass (use for brand/navigation)
- `/nova-v01.jpg` — Evolution v0.1 "Stardust" portrait
- `/nova-v02.jpg` — Evolution v0.2 "Dreamer" portrait  
- `/nova-v03.png` — Evolution v0.3 mystery badge
- `/sounds/stellar-drift.mp3` — Ambient background music
