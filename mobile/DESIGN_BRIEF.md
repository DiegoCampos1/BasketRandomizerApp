# Design Brief — Sorteador de Times Mobile

The source of truth for every visual and interaction decision in this app. When building a new screen or component, start here. When something isn't covered, extend this document in the same PR that introduces the pattern.

**Identity in one line:** pre-game locker room — near-black surfaces, hot basketball orange, condensed uppercase type, scoreboard numerals, tactile motion. Every screen should feel like game day.

**Stack contract:** Expo (Expo Go compatible), NativeWind v4 backed by `src/theme/tokens.ts`, `react-native-reanimated` for ALL motion, `react-native-gesture-handler`, `expo-haptics`, `@gorhom/bottom-sheet`, `expo-linear-gradient`. No other UI/animation libraries.

---

## 1. Tokens (`src/theme/tokens.ts`)

Components **never hardcode hex values** — import from tokens (or use the mirrored Tailwind classes from `tailwind.config.js`).

### Background layers

| Token | Value | Use |
|---|---|---|
| `bg.base` | `#0A0A0F` | Screen background (slight blue-violet cast, never pure black) |
| `bg.raised` | `#14141B` | Cards, list rows, inputs |
| `bg.elevated` | `#1C1C26` | Bottom sheets, toasts, drag overlay |
| `bg.sunken` | `#070709` | Tab bar, behind hero headers |
| `bg.scrim` | `rgba(4,4,8,0.70)` | Sheet/modal backdrop |

### Borders, text, brand

- Borders: `hairline #23232E` (default card/input), `strong #33333F` (active), `focus #FF6B2C`.
- Text: `primary #F7F7FA` (18:1), `secondary #A8A8B8` (8.5:1), `tertiary #6E6E80` (3.6:1 — meta only, ≥13pt, never essential info), `onBrand #1A0B02`.
- **Never put white text on brand orange — it fails AA (2.6:1). Use `text.onBrand`.**
- Brand orange: 300 `#FFA266` (text/icons on dark) · 400 `#FF8A4D` · **500 `#FF6B2C` (primary — CTAs, active tab, selection, focus)** · 600 `#E85A1F` (pressed) · `tint rgba(255,107,44,.10)` (selected fills) · `glow rgba(255,107,44,.35)` · gradient `#FF6B2C → #FF8A4D`.
- Indigo (web heritage `#4F46E5`) is demoted to **informational accent** (`accent.400 #818CF8`, `accent.500 #6366F1`, tint) — mode chips, info badges, links. It never competes with orange for actions.

### Team identities (critical)

Detection mirrors the web (`name/group` contains "preto" → black team, else red). On dark, the web's `#0F172A` black is invisible, so **Team Preto becomes ONYX silver**:

| | Red (Vermelho) | Onyx (Preto) |
|---|---|---|
| accent | `#F4524D` | `#E8EAF2` |
| tint | `rgba(244,82,77,.12)` | `rgba(232,234,242,.07)` |
| glow | `rgba(244,82,77,.40)` | `rgba(232,234,242,.35)` |
| header | red tint fade | carbon gradient `#2A2D38 → #16161E` |

Team card anatomy: 4px top accent bar + tinted header strip + uppercase condensed team name in the accent. 4-team mode: oversized ghosted numeral (15% opacity, 64pt) behind the header's right edge. Share-text emojis stay `🟥`/`⬛` (parity with web).

### Semantic & misc

`success #34D399` · `warning #FBBF24` (= pending-approval identity) · `error #F87171` · star gold `#FFC53D` / empty `#3A3A46`. Each has a `.tint` at ~12% alpha for fills.

### Typography (Barlow + Barlow Condensed, loaded via Expo Google Fonts)

| Style | Font / size / line | Use |
|---|---|---|
| `displayXl` | Condensed Bold 40/44, +0.5, UPPERCASE | Login brand, "GAME DAY" |
| `display` | Condensed Bold 32/36, UPPERCASE | Screen titles, team names |
| `stat` | Condensed Bold 36/40, tabular-nums | Counters, quality totals |
| `title1` | Condensed Bold 24/30 | Section headers |
| `title2` | Condensed SemiBold 20/26, UPPERCASE | Card headers, sheet titles |
| `headline` | Barlow SemiBold 17/24 | Player names, button labels |
| `body` | Barlow Regular 15/22 | Default copy |
| `caption` | Barlow Medium 13/18 | Meta, chips |
| `micro` | Barlow SemiBold 11/14, +1.2, UPPERCASE | Overlines, tab labels, field labels |

Rule: anything that counts (totals, heights, scores) uses `tabular` (tabular-nums). Use the `AppText` component, never raw `<Text>`.

### Spacing, radius, elevation

- 4pt spacing scale; screen gutter **20**, card padding **16**, list row gap **10**, section gap **32**.
- Radius: pill (buttons/chips) · 12 input · 16 card · 24 sheet top corners.
- **Elevation on dark (Android-safe):** shadows are invisible on `#0A0A0F`. Cards = `bg.raised` + 1px hairline, NO shadow. Sheets/toasts/drag overlay = `bg.elevated` + `border.strong` + iOS soft shadow / Android `elevation:16`. Emphasis = **glow**: iOS colored shadow (`<accent>.glow`, radius 16); Android fallback = 1.5px border at 50% alpha + vertical gradient overlay. Build with `GlowView` once it exists — never ad-hoc.

## 2. Motion (`src/theme/motion.ts`)

One physics system, three springs:

```
gentle  { damping: 20, stiffness: 180, mass: 1   }  sheets, layout reflow, drag return
snappy  { damping: 18, stiffness: 280, mass: 0.8 }  press, selection, tab indicator, hover
bouncy  { damping: 12, stiffness: 220, mass: 0.9 }  reveals, check pops, success
timing: micro 120ms · standard 200ms · entrance 320ms
```

- Button press scale `0.96`, card press `0.97` (use `usePressScale`).
- List entrance: `FadeInDown.duration(320).delay(i * 40)`, stagger capped at 8 items; never stagger on refresh/pagination.
- Selection toggle: border `withTiming(150)` + check pop `bouncy` + selection haptic.
- Respect `useReducedMotion()`: entrances/staggers/reveals collapse to a 200–250ms fade. Haptics stay.

### Signature moment — THE TEAM REVEAL (division result)

The only theatrical animation in the app. On `createDivision` resolve:

1. CTA morphs to loading; on resolve `impactAsync(Medium)`, selection screen fades out 200ms.
2. Scoreboard header drops in (`FadeInDown` 280ms).
3. Team card *i*: starts `opacity 0, translateY 48, scale 0.96` → `withDelay(200 + i*350, withSpring(..., bouncy))`; haptic Medium at each landing.
4. Player rows cascade inside each card (delay `+120 + j*40`).
5. Quality total counts 0→N over 600ms (animated props on a read-only TextInput), starting when its card lands.
6. Finale after the last card: `notificationAsync(Success)` + share row fades in.
7. Any tap skips to the final state. Reduced motion: single crossfade + one success haptic.

## 3. Component rules (`src/components/ui/`)

- **Button**: variants `primary` (brand fill, onBrand label) / `secondary` (raised + hairline) / `ghost` (brand.300 label) / `destructive` (error tint). Sizes lg 52 / md 44 / sm 36 (hitSlop keeps 44pt). Loading = label fades, spinner, width locked. Primary press = light haptic.
- **PlayerCard**: 64pt row — initials avatar (40pt, muted 5-hue hash palette), name `headline`, position chip (outlined) + height chip (filled), `StarRating` right. Pending variant: 3px warning left border + "PENDENTE" chip.
- **SelectablePlayerCard**: hairline → 1.5px brand border + brand tint when selected, check pops in top-right, selection haptic. At cap: 50% opacity + shake (±4pt, 3 cycles) on tap.
- **TextField**: 52pt, `bg.raised`, radius 12, micro uppercase label above, focus = brand border + glow, `keyboardAppearance="dark"`.
- **Sheets**: `@gorhom/bottom-sheet`, `bg.elevated`, radius 24 top, grab handle, scrim backdrop, keyboard-interactive. Forms (player create/edit/approve) live in sheets, not separate screens.
- **Skeletons** (never spinners for content): `bg.raised` base + looped gradient shimmer; prebuilt per card type; min display 300ms.
- **Toast**: custom top toast, accent left bar, slide in `snappy` / out 160ms, swipe-up dismiss, one at a time. Success toasts only for background ops.
- **EmptyState**: tinted icon circle + `title2` + body secondary + optional CTA.

## 4. Haptics map (only these)

| Event | Call |
|---|---|
| Selection/toggle/star change/drag hover change | `selectionAsync()` |
| Primary CTA press | `impactAsync(Light)` |
| Drag lift · card reveal landing | `impactAsync(Medium)` |
| Success finale / approval | `notificationAsync(Success)` |
| Error / rollback | `notificationAsync(Error)` |

Never on scroll or passive events.

## 5. Drag-and-drop (division result)

Custom engine (`src/components/division/dnd/`), no library. Long-press 250ms lifts the row (haptic Medium, scroll disabled, original at 30% opacity) into a root-level overlay clone (elevated + glow, scale 1.04, 1° tilt). Team cards register drop zones in scroll-content coordinates (re-measure on layout/roster change); hover = team-accent border glow + selection haptic; auto-scroll near edges (~14pt/frame, proportional). Drop = optimistic cache move + `LinearTransition` reflow; error = rollback + toast + error haptic; cancel = spring back `gentle`. **Tap-to-move sheet is the mandatory accessible fallback** (also `accessibilityActions` + `announceForAccessibility`).

## 6. Screen directions

- **Login**: radial brand glow top, two-line condensed brand block with orange underline, staggered fields, CTA in thumb zone. Dev builds show the resolved API URL in a footer caption.
- **Dashboard**: micro eyebrow "GAME DAY · {ORG}", display greeting, 2 stat tiles (pressable), hero gradient CTA "SORTEAR TIMES" (the one loud element), last-division teaser, pending-approvals warning banner.
- **Elenco**: sticky search, pending section pinned first with inline approve, then roster with stagger; "+" opens the create sheet.
- **Seleção**: mode cards (2/4 teams), selectable list, floating bottom bar ({n}/20 + progress-to-minimum + CTA).
- **Resultado**: scoreboard header "PRETO {q} ✕ {q} VERMELHO" with count-up, team cards (DnD), share row (image/text/new draw).
- **Histórico**: timeline rail with team-red dots, month group labels, mode chips in indigo accent.
- **Notificações**: modal; unread = brand dot + raised row; tap pending → approve sheet directly.

## 7. Non-negotiables

- Touch targets ≥ 44pt (hitSlop where the visual is smaller).
- Safe areas via `react-native-safe-area-context` on every screen; floating bars respect bottom inset.
- Primary CTAs in the bottom 40% of the screen (one-handed reach).
- Pull-to-refresh on every list (brand tint).
- Every icon-only button has `accessibilityLabel`; rows merge chips into one a11y label ("Diego, Armador, Alto, 4 estrelas").
- `allowFontScaling` on; display/stat capped at 1.4×, body at 2×; min-heights, not fixed heights.
- All user-facing strings via i18n (`src/i18n/messages/{pt-BR,en}/`) — both locales, always. Keys mirror the web app.
- Errors come from the API in Portuguese — surface `detail` / field errors inline, same semantics as web.
