# shared-ui

The design system every app (`rider-app/`, `driver-app/`, `admin-dashboard/`) builds on top of.
**Don't restyle a button or pick a new color inside your own app folder** — add or edit it here
so it stays consistent everywhere.

## What's in here

- `src/tokens.js` — the actual colors, fonts, border radius values (edit this to change the whole app's look)
- `tailwind-preset.js` — wraps the tokens for Tailwind; each app's `tailwind.config.js` extends this
- `src/components/` — `Button`, `Input`, `Card`, `StatusBadge`

## Using it in your app

1. Your app's `tailwind.config.js` should include:
   ```js
   module.exports = {
     presets: [require("shared-ui/tailwind-preset")],
     content: ["./index.html", "./src/**/*.{js,jsx}", "../shared-ui/src/**/*.{js,jsx}"],
   };
   ```
2. Import components:
   ```jsx
   import { Button, Input, Card, StatusBadge } from "shared-ui";

   <Card>
     <StatusBadge status="in_progress" />
     <Button variant="primary">Accept Ride</Button>
   </Card>
   ```

## Adding a new shared component

If two or more apps need the same piece of UI (a modal, a map pin, a rating stars widget),
build it here, not inside one app's folder — then everyone imports it. Post in the group chat
before adding one so we don't get duplicate/conflicting versions.

## Changing a color or font

Edit `src/tokens.js` only. It propagates to every app automatically the next time they run
`npm run dev`. Don't hardcode hex codes anywhere else in the codebase.
