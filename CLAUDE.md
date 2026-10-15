# Iris root rules

Before building anything here, read the iris root CLAUDE.md first and follow it every time:

- Relative path: `../CLAUDE.md`
- Absolute path: `~/Desktop/web-dev/iris/CLAUDE.md`

Anything below this line is specific to this folder.

## Local dev: ports and processes
- Every app gets its OWN Metro / web / API / DB ports that no other iris app claims. Never reuse another app's ports or keep the boilerplate's. `npm run rename -- <slug>` auto-picks free ones; `npm run ports` lists every claim and `node scripts/ports.js --next` prints the next free set. `scripts/ports.js` reads each sibling's `app.identity.js` plus a small LEGACY list for apps that predate it — keep that list current if you touch those ports.
- `npm run dev` must start clean every time: it refuses on a port clash (`ports.js --self`), then frees the app's ports with `scripts/free-port.sh`, which kills the listener AND its `tsx watch` / `npm run` supervisors (killing only the listener lets a surviving supervisor respawn it on the next file save → EADDRINUSE). The backend's `predev` hook calls it too, so `npm run api:dev` is safe.
- Don't leave dev servers you started running in the background; a stray `tsx watch` outlives its terminal.

## Pickers: use searchable dropdowns, not big modals
- Long or open-ended lists (timezones, countries, currencies, jobs, members, any list over ~8 options) must use `<Select searchable … />`, which renders a compact inline search dropdown (type to filter, short scrollable list under the field). Never build a full-height modal/sheet or a plain scrolling list for these.
- Short fixed lists (under ~8 options) use plain `<Select>`; multi-select keeps the sheet. Reuse `Select` — don't hand-roll a new picker.
