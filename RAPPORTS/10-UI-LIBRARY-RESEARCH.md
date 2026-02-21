# UI Library Research — Magic UI & Aceternity UI

## Magic UI (magicui.design)
**License**: Free + Pro tier  
**Stack**: React, Tailwind CSS, Framer Motion  
**Install**: `npx magicui-cli add <component>`

### Relevant Components for Red Flag Games:
| Component | Use Case | Priority |
|-----------|----------|----------|
| **Confetti** | 🎉 Streak milestones (5, 10, 20...) | ⭐ HIGH |
| **Animated Gradient Text** | Title "Red FLAG" on homepage | ⭐ HIGH |
| **Animated Shiny Text** | Badge/label effects | MEDIUM |
| **Border Beam** | Animated button borders | MEDIUM |
| **Blur Fade** | Page transitions | LOW (already have) |
| **Animated Circular Progress Bar** | Score display | MEDIUM |
| **Animated List** | Leaderboard entries | MEDIUM |

## Aceternity UI (ui.aceternity.com)
**License**: Free + All-Access ($59-99)  
**Stack**: React, Tailwind CSS, Framer Motion  
**Install**: Copy-paste or `npx aceternity-ui add <component>`

### Relevant Components for Red Flag Games:
| Component | Use Case | Priority |
|-----------|----------|----------|
| **Sparkles** | Background effects on correct answer | ⭐ HIGH |
| **Text Generate Effect** | First-visit reveal text | MEDIUM |
| **Glowing Effect** | Card hover glow (like Cursor) | ⭐ HIGH |
| **Moving Border** | CTA button border animation | MEDIUM |
| **Flip Words** | Rotating taglines on homepage | MEDIUM |
| **3D Card Effect** | Game cards on hover | MEDIUM |
| **Card Spotlight** | Spotlight on selected card | LOW |
| **Background Gradient Animation** | Homepage bg | LOW (already have) |
| **Colourful Text** | Category labels | LOW |
| **Meteors** | Streak celebration | MEDIUM |

## 3D & Advanced Animations
Both libraries leverage Framer Motion heavily — we already use it.  
Key technique patterns:
- **Perspective transforms** for 3D tilt cards
- **Spring physics** for bouncy interactions
- **Layout animations** for smooth transitions
- **SVG path animations** for beams/traces

## Recommendation
**Quick wins (no install needed — Framer Motion patterns):**
1. Add confetti on streak milestones (canvas-confetti: `npm i canvas-confetti`)
2. Add 3D tilt effect on game cards (CSS transform + mouse tracking)
3. Add glow pulse on correct answers
4. Add sparkle particles on streak badge

**Future integration:**
- Install Magic UI for Confetti + Animated Gradient Text
- Install Aceternity Sparkles + Glowing Effect components
