# Brand-Kit-Rebrand (Stufe 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Video-Brand-Kit look (near-black + orange/cyan, Anton display + Inter, `kreuzhofer.` logo, anti-Hype) to the existing main site — purely visual, IA/content unchanged.

**Architecture:** Value-remap of the existing `globals.css` `:root` tokens so most components inherit the brand without code changes; targeted edits only for the hero (remove particle/glow → mixed-light gradient), the header logo, the Button text colors, and the typography. Spec: `docs/superpowers/specs/2026-06-25-brand-kit-rebrand-design.md`.

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4 (`@theme inline` in globals.css) / `next/font` / Jest property tests.

**Run from `frontend/`:** tests `npm test --prefix frontend -- <path>`, lint `npm run lint --prefix frontend`, build `npm run build:local --prefix frontend`, dev `npm run dev:local --prefix frontend` (port 8087).

**Brand ramps (used verbatim in globals.css AND the test in Task 2):**

```
ORANGE (--primary-*, brand #E89244 = 500):
  50 #fdf3e9 · 100 #f9e1c6 · 200 #f3c490 · 300 #eea75a · 400 #eb9b48
  500 #e89244 · 600 #d4761f · 700 #a85a18 · 800 #864718 · 900 #6e3b18 · 950 #3b1d0a

CYAN (--secondary-*, brand #4DBED4 = 400):
  50 #ecfafc · 100 #cef1f7 · 200 #a3e3ef · 300 #6fd0e3 · 400 #4dbed4
  500 #2ba7c0 · 600 #2189a1 · 700 #226d80 · 800 #235a6a · 900 #214b59 · 950 #103039
```

---

## Task 1: Brand color tokens (globals.css `:root` remap)

**Files:**
- Modify: `frontend/src/app/globals.css` (the `:root` block, lines ~3–86)

- [ ] **Step 1: Replace the `:root` palette block.** Replace lines 3–86 (everything from the `:root {` comment through `--border-muted: ...; }`) with:

```css
:root {
  /* =============================================================================
     BRAND PALETTE — Video-Brand-Kit (§4): near-black canvas, warm-orange action
     accent, cool-cyan secondary. Anti-Hype, substance-plakativ. Dark-mode-first.
     Matches the scorecard funnels (sc.css BrandTokens).
     ============================================================================= */

  /* Background layers (near-black) */
  --background: #0A0A0A;
  --surface: #161616;
  --surface-elevated: #1e1e1e;
  --surface-overlay: #0A0A0A;

  /* Foreground (white → muted → subtle) */
  --foreground: #ffffff;
  --foreground-muted: #b4b4b4;
  --foreground-subtle: #8a8a8a;

  /* Primary palette — Brand-Orange (action / CTA) */
  --primary-50: #fdf3e9;
  --primary-100: #f9e1c6;
  --primary-200: #f3c490;
  --primary-300: #eea75a;
  --primary-400: #eb9b48;
  --primary-500: #e89244;
  --primary-600: #d4761f;
  --primary-700: #a85a18;
  --primary-800: #864718;
  --primary-900: #6e3b18;
  --primary-950: #3b1d0a;

  /* Secondary palette — Brand-Cyan (eyebrows / links / focus / outlines) */
  --secondary-50: #ecfafc;
  --secondary-100: #cef1f7;
  --secondary-200: #a3e3ef;
  --secondary-300: #6fd0e3;
  --secondary-400: #4dbed4;
  --secondary-500: #2ba7c0;
  --secondary-600: #2189a1;
  --secondary-700: #226d80;
  --secondary-800: #235a6a;
  --secondary-900: #214b59;
  --secondary-950: #103039;

  /* Neutral palette — unchanged (Slate; used for borders/dividers) */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
  --neutral-950: #020617;

  /* Semantic colors — brand pain/solution */
  --success: #58D68D;
  --warning: #E89244;
  --error: #E63946;
  --info: #4DBED4;

  /* Dark text for use ON the orange accent (CTA labels) */
  --accent-ink: #1a1206;

  /* Gradients — studio mixed-light (warm-orange bottom-left + cool-cyan top-right) */
  --gradient-hero:
    radial-gradient(ellipse at 0% 100%, rgba(232, 146, 68, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 100% 0%, rgba(77, 190, 212, 0.16) 0%, transparent 55%),
    #0A0A0A;
  --gradient-section: linear-gradient(180deg, var(--background) 0%, var(--surface) 100%);
  --gradient-glow-teal: radial-gradient(ellipse at 100% 0%, rgba(77, 190, 212, 0.12) 0%, transparent 50%);
  --gradient-glow-orange: radial-gradient(ellipse at 0% 100%, rgba(232, 146, 68, 0.12) 0%, transparent 50%);

  /* Shadows — neutral film-look (no neon glow) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-hover: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.35);
  --shadow-glow-teal: none;
  --shadow-glow-orange: none;

  /* Border colors */
  --border: #3A3A3A;
  --border-muted: #2a2a2a;
}
```

- [ ] **Step 2: Verify it builds.** Run: `npm run build:local --prefix frontend`
Expected: compiles successfully (no CSS/TS errors). The color-tokens test will fail until Task 2 — that's expected; do Task 2 next.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(brand): remap globals.css tokens to the Video-Brand-Kit palette"
```

---

## Task 2: Update the color-tokens property test to the brand ramps

**Files:**
- Modify: `frontend/__tests__/properties/visual-design-color-tokens.property.test.ts`

The test reads `globals.css` and compares `--primary-*` to a hardcoded `PRIMARY_TEAL` constant and `--secondary-*` to the `colors.secondary` module. After Task 1 it fails. Replace the hardcoded expectations with the brand ramps (self-contained — do NOT touch `design-tokens.ts`, which the contrast test still reads).

- [ ] **Step 1: Run it to confirm it fails now.**
Run: `npm test --prefix frontend -- visual-design-color-tokens`
Expected: FAIL — `--primary-500` is `#e89244`, expected `#14b8a6`.

- [ ] **Step 2: Replace the `PRIMARY_TEAL` constant** with the orange ramp and add a cyan ramp. Find the `const PRIMARY_TEAL: Record<ColorShade, string> = { ... };` block and replace it with:

```ts
// Brand-Orange ramp — must match globals.css --primary-* exactly.
const PRIMARY_ORANGE: Record<ColorShade, string> = {
  '50': '#fdf3e9', '100': '#f9e1c6', '200': '#f3c490', '300': '#eea75a',
  '400': '#eb9b48', '500': '#e89244', '600': '#d4761f', '700': '#a85a18',
  '800': '#864718', '900': '#6e3b18', '950': '#3b1d0a',
};

// Brand-Cyan ramp — must match globals.css --secondary-* exactly.
const SECONDARY_CYAN: Record<ColorShade, string> = {
  '50': '#ecfafc', '100': '#cef1f7', '200': '#a3e3ef', '300': '#6fd0e3',
  '400': '#4dbed4', '500': '#2ba7c0', '600': '#2189a1', '700': '#226d80',
  '800': '#235a6a', '900': '#214b59', '950': '#103039',
};
```

- [ ] **Step 3: Update `getExpectedTokenValue`** to return the brand ramps for `primary` and `secondary` (keep `neutral` from `colors`). Replace the function body with:

```ts
function getExpectedTokenValue(palette: ColorPalette, shade: ColorShade): string {
  if (palette === 'primary') return PRIMARY_ORANGE[shade];
  if (palette === 'secondary') return SECONDARY_CYAN[shade];
  return colors[palette][shade];
}
```

(If the `colors` import becomes unused after this, leave it — `neutral` still uses it. If lint flags an unused import, remove only what's unused.) Update the now-stale doc-comment above the constant from "teal" to "brand-orange/cyan" if present.

- [ ] **Step 4: Run it — PASS.**
Run: `npm test --prefix frontend -- visual-design-color-tokens`
Expected: PASS (all `--primary-%s` / `--secondary-%s` / `--neutral-%s` cases).

- [ ] **Step 5: Run the rest of the visual-design tests** to confirm the contrast test is unaffected (it reads `design-tokens.ts`, not globals):
Run: `npm test --prefix frontend -- visual-design`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/__tests__/properties/visual-design-color-tokens.property.test.ts
git commit -m "test(brand): color-tokens test expects the brand orange/cyan ramps"
```

---

## Task 3: Anton display font + heading typography

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/globals.css` (add `.brand-display`; tweak heading classes)

- [ ] **Step 1: Load Anton in `layout.tsx`.** Add the import and font near the other fonts, and add its variable to the `<body>` className.

Add after the `Geist_Mono` import (line 3):
```tsx
import { Anton } from "next/font/google";
```
Add after the `geistMono` const (after line 18):
```tsx
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});
```
Change the `<body>` className from:
```tsx
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
```
to:
```tsx
        className={`${inter.variable} ${geistMono.variable} ${anton.variable} antialiased font-sans`}
```

- [ ] **Step 2: Add the brand display class + Inter-bold headings in `globals.css`.** After the existing `.heading-section { ... }` rule (around line 212), add:

```css
/* Brand display — Anton, ALLCAPS condensed. Hero / rare title moments only. */
.brand-display {
  font-family: var(--font-anton), "Arial Narrow", sans-serif;
  text-transform: uppercase;
  font-weight: 400; /* Anton is already heavy */
  letter-spacing: -0.01em;
  line-height: 0.95;
}

/* Section headings stay Inter Bold (sentence case). */
.heading-section {
  font-family: var(--font-inter), Inter, system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.01em;
}
```
(The second rule overrides the existing `.heading-section`; if it already exists above, edit it in place instead of duplicating — keep one definition.)

- [ ] **Step 3: Build + lint.**
Run: `npm run lint --prefix frontend` then `npm run build:local --prefix frontend`
Expected: clean / success (Anton fetched at build).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/layout.tsx frontend/src/app/globals.css
git commit -m "feat(brand): load Anton display font + Inter-bold heading classes"
```

---

## Task 4: Logo — assets + header wordmark + footer/favicon bug

**Files:**
- Create: `frontend/public/brand/kreuzhofer-wordmark-dark.svg`, `frontend/public/brand/k-bug-dark.svg` (copied from the vault)
- Modify: `frontend/src/components/Layout.tsx` (header brand, ~line 110–118)
- Modify: `frontend/src/components/Footer.tsx` (add `k.` bug)

- [ ] **Step 1: Copy the logo SVGs into `public/`.**
Run:
```bash
mkdir -p frontend/public/brand
cp "/Users/daniel/Documents/vault/06-assets/branding/kreuzhofer-wordmark-dark.svg" frontend/public/brand/kreuzhofer-wordmark-dark.svg
cp "/Users/daniel/Documents/vault/06-assets/branding/k-bug-dark.svg" frontend/public/brand/k-bug-dark.svg
ls frontend/public/brand/
```
Expected: both files present.

- [ ] **Step 2: Replace the header text brand with the wordmark in `Layout.tsx`.** Read the brand link around lines 110–118 (the `<a>`/`<Link>` with `aria-label="Daniel Kreuzhofer - Go to top of page"` wrapping the text `Daniel Kreuzhofer`). Replace the inner text `Daniel Kreuzhofer` with an `next/image` wordmark, keeping the link, aria-label, and href. Concretely, change the inner content to:

```tsx
                <img
                  src="/brand/kreuzhofer-wordmark-dark.svg"
                  alt="kreuzhofer."
                  className="h-6 w-auto"
                />
```
(Keep the surrounding `<a href="#hero" aria-label="Daniel Kreuzhofer - Go to top of page" …>`. If the brand link had text-styling classes that no longer apply to an image, leave them — they're harmless on the wrapper. Do not change the link target or aria-label.)

- [ ] **Step 3: Add the `k.` bug to the global footer.** Read `frontend/src/components/Footer.tsx`. Add the bug to the footer's right side (next to/instead of any existing brand text). If the footer uses the `.site-footer-inner` layout, add as the last child:
```tsx
        <img src="/brand/k-bug-dark.svg" alt="" aria-hidden="true" style={{ height: "18px", width: "auto" }} />
```
(Match the file's existing JSX style — className vs style. If Footer renders nothing brand-like, append the bug inside the inner container.)

- [ ] **Step 4: Set the favicon to the `k.` bug.** Next.js App Router auto-serves `src/app/icon.svg` as the favicon. Copy the bug there:
```bash
cp "/Users/daniel/Documents/vault/06-assets/branding/k-bug-dark.svg" frontend/src/app/icon.svg
```
(If a `favicon.ico` exists in `src/app/`, leave it — `icon.svg` takes precedence in modern browsers.)

- [ ] **Step 5: Build + visual check.**
Run: `npm run build:local --prefix frontend`
Expected: success. (Wordmark renders in the header; `k.` bug in the footer; favicon = `k.` bug.)

- [ ] **Step 6: Commit**

```bash
git add frontend/public/brand frontend/src/app/icon.svg frontend/src/components/Layout.tsx frontend/src/components/Footer.tsx
git commit -m "feat(brand): kreuzhofer. wordmark in header + k. bug in footer & favicon"
```

---

## Task 5: Hero — remove particle/glow, mixed-light gradient, Anton headline + eyebrow

**Files:**
- Modify: `frontend/src/components/HeroSection.tsx`
- Delete: `frontend/src/components/ParticleConstellation.tsx` (after removing the only usage)

- [ ] **Step 1: Remove the ParticleConstellation import + usage.** In `HeroSection.tsx`, delete the import (line 7: `import { ParticleConstellation } from './ParticleConstellation';`) and the entire particle block (lines ~117–122):
```tsx
      {/* Particle constellation background */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 opacity-100 pointer-events-auto" aria-hidden="true">
          <ParticleConstellation />
        </div>
      )}
```
The `<section>` already uses `bg-[var(--gradient-hero)]` — which is now the mixed-light gradient from Task 1, so the background is handled.

- [ ] **Step 2: Add the cyan eyebrow + make the headline Anton.** Inside the content container, immediately before the `<h1>` (around line 127), add the eyebrow:
```tsx
        <p className="text-[var(--secondary-400)] text-xs font-bold tracking-[0.18em] uppercase mb-3">
          KI-Coaching mit Kante
        </p>
```
Then change the `<h1>` className to use the brand display class (add `brand-display`, drop `font-bold` since Anton is already heavy). Replace the `<h1 className={...}>` so its class list is:
```tsx
          className={`
            brand-display
            text-4xl md:text-5xl lg:text-6xl
            text-[var(--foreground)]
            mb-4
            ${headlineAnimationClasses}
          `}
```

- [ ] **Step 3: Delete the now-unused ParticleConstellation component.**
Run:
```bash
grep -rl "ParticleConstellation" frontend/src || echo "no refs left"
```
If the only remaining reference is the component's own file (and its test, if any), delete them:
```bash
git rm frontend/src/components/ParticleConstellation.tsx
# if a test exists:
git rm frontend/src/components/ParticleConstellation.test.tsx 2>/dev/null || true
```
(If anything OTHER than the component+its test still imports it, STOP and report — do not delete.)

- [ ] **Step 4: Build + run hero/component tests.**
Run: `npm run build:local --prefix frontend` then `npm test --prefix frontend -- HeroSection`
Expected: success; HeroSection tests pass (update any assertion that referenced the particle background or the old headline weight — change `font-bold` expectation to `brand-display` if asserted).

- [ ] **Step 5: Commit** (Step 3's `git rm` already staged the deletion):

```bash
git add -A frontend/src/components
git commit -m "feat(brand): hero uses mixed-light gradient + Anton headline + cyan eyebrow; drop particles"
```

---

## Task 6: Button text colors for the brand accents

**Files:**
- Modify: `frontend/src/components/ui/Button.tsx` (the `getVariantClasses` switch, ~lines 34–43)

Orange (`--primary-500`) needs **dark** text, not white (contrast + brand). The secondary becomes a cyan **outline** (matches the brand mockups + avoids low-contrast white-on-cyan).

- [ ] **Step 1: Update the `primary` and `secondary` variant class strings.** Replace:
```tsx
    case 'primary':
      return 'bg-[var(--primary-500)] text-white hover:bg-[var(--primary-400)] focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
    case 'secondary':
      return 'bg-[var(--secondary-500)] text-white hover:bg-[var(--secondary-400)] focus:ring-[var(--secondary-500)] focus:ring-offset-[var(--background)]';
```
with:
```tsx
    case 'primary':
      return 'bg-[var(--primary-500)] text-[var(--accent-ink)] hover:bg-[var(--primary-400)] focus:ring-[var(--primary-500)] focus:ring-offset-[var(--background)]';
    case 'secondary':
      return 'border border-[var(--secondary-400)] text-[var(--secondary-400)] hover:bg-[var(--secondary-400)]/10 focus:ring-[var(--secondary-400)] focus:ring-offset-[var(--background)]';
```
Also update the `default:` case the same way as `primary` if it duplicates the old primary string. Update the doc-comment "primary (teal), secondary (amber)" → "primary (orange), secondary (cyan outline)".

- [ ] **Step 2: Build + run Button + page tests.**
Run: `npm test --prefix frontend -- Button` then `npm run build:local --prefix frontend`
Expected: pass / success. (Update any Button test asserting `text-white` or `bg-[var(--secondary-500)]`.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/Button.tsx
git commit -m "feat(brand): primary button = dark-on-orange, secondary = cyan outline"
```

---

## Task 7: Sweep + full verification

**Files:** none (verification) unless stragglers found.

- [ ] **Step 1: Find any hardcoded old-palette colors that won't inherit the remap.**
Run (from `frontend/`):
```bash
grep -rnE "#1a1a2e|#16213e|#1f2b47|#0f0f1a|#14b8a6|#2dd4bf|#5eead4|#f97316|#fb923c|#2a3a5c" src/components src/app | grep -v ".test." | grep -viE "scorecard|engpass|sc\.css|/dsgvo-check/"
```
Expected: ideally no hits (components use `var(--token)`). For any hit in a main-site component, replace the literal with the matching token (`#1a1a2e`→`var(--background)`, `#14b8a6`→`var(--primary-500)`, `#f97316`→`var(--secondary-500)`, `#2a3a5c`→`var(--border)`, etc.). Commit such fixes per file. (Scorecard/engpass files are out of scope — they have their own brand tokens.)

- [ ] **Step 2: Full test suite (deterministic since the fast-check seed is pinned).**
Run: `npm test --prefix frontend`
Expected: all green. Fix any test that asserted the old palette/particle/headline (test-only updates), commit them.

- [ ] **Step 3: Lint + build.**
Run: `npm run lint --prefix frontend` then `npm run build:local --prefix frontend`
Expected: lint adds no new errors (~39 pre-existing elsewhere unchanged); build succeeds; all routes compile.

- [ ] **Step 4: Visual smoke.** `npm run dev:local --prefix frontend`, open `http://localhost:8087/`, then `/blog`, `/transparency`, `/fit-analysis`, `/impressum`. Confirm: near-black canvas, `kreuzhofer.` wordmark in header, orange CTAs + cyan accents/eyebrow, Anton hero headline, mixed-light hero gradient (no particles), `k.` bug in footer. Brand should now match the scorecards (open `/ki-fuehrungs-check` to compare).

> **Visual-QA gotcha (this repo):** the Playwright MCP screenshot tool reproducibly crashes on long *dark* pages; `navigate`/DOM-snapshot work, *light* pages screenshot fine. For visual checks prefer DOM snapshots or a throwaway light-preview, or eyeball in the browser.

- [ ] **Step 5: Final commit (if any sweep/test fixes remain unstaged).**

```bash
git add -A frontend && git commit -m "fix(brand): rebrand stragglers + test updates"
```

---

## Out of scope (Stufe 2)

New coaching-focused home page, "mit Kante" copy rewrite, decisions on Recruiter-features (Fit-Analysis, Recruiter-CTA, Transparency), YouTube/content hub, booking funnel. Stufe 1 leaves all content/IA untouched.
```
