# Design System

## Platform decision

**Responsive web app**, not native mobile. Since we're all web developers, this avoids picking up
React Native/Flutter under a deadline. Built well (Tailwind, mobile-first), it works fine on a
phone browser and can be made PWA-installable later if we want that polish for the demo.

## Stack

React + Vite + Tailwind CSS across all three apps (`rider-app/`, `driver-app/`, `admin-dashboard/`).
Same stack everywhere on purpose — makes the shared component library possible and means anyone
can jump into anyone else's app folder if needed.

## How uniformity is enforced

Not just agreed by convention — actually shared through code, in `shared-ui/`:

- **`shared-ui/src/tokens.js`** — the actual colors, fonts, border radius. Change a color once here, it updates in all three apps.
- **`shared-ui/tailwind-preset.js`** — every app's `tailwind.config.js` extends this, so `bg-primary` means the same blue everywhere.
- **`shared-ui/src/components/`** — `Button`, `Input`, `Card`, `StatusBadge`. Import these instead of writing your own `<button className="...">` — that's the #1 way apps drift apart visually.

Every app is already wired up to import from `shared-ui` (see each app's `src/App.jsx` for a
working example) — this isn't something you need to set up yourself, just use it.

## Color palette

| Token | Hex | Use for |
|---|---|---|
| `primary` | `#0F62FE` | Buttons, links, active/in-progress states |
| `secondary` | `#24A148` | Success, "online", "completed" |
| `danger` | `#DA1E28` | Cancel, errors, "offline" |
| `warning` | `#F1C21B` | Pending, arriving, awaiting verification |
| `neutral` (50–900) | greys | Text, borders, backgrounds |

## Rules

1. **Don't hardcode hex colors or font names in your app's components.** Use the Tailwind classes (`bg-primary`, `text-danger`, `font-sans`) that come from the shared tokens.
2. **Don't rebuild a component that already exists in `shared-ui`.** If `Button` doesn't do what you need, extend it there (with a heads-up in chat) rather than writing a one-off version in your own app.
3. **If two+ apps need the same new piece of UI** (a modal, a ratings-stars widget, a map pin), build it in `shared-ui/`, not inside one app's folder.
4. **Mobile-first.** Design/test the small screen first, then check it holds up wider — most real usage will be on a phone browser.

## Before you start building screens

Quickly agree as a team (5 minutes in your next sync) on:
- Page layout basics: where does nav/header sit in each app?
- Any icon set (e.g. Lucide, Heroicons) — pick one, don't mix icon libraries across apps
- Loading/empty/error state look — keep it consistent (a simple spinner + message pattern is fine)
