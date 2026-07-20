# Aegis Build Soul

## Product Direction

Aegis is a premium, dark, privacy-first file product built on Shelby. It should feel calm, clear, and useful — not like a generic crypto dashboard, not like a warning label, and not like AI slop.

## Modular Build Rule

All future UI work must be modular by default.

- Split UI into focused components with one clear job.
- Keep pages as orchestration layers, not giant markup dumps.
- Add small shared primitives when patterns repeat: buttons, cards, menus, states, meters, empty states.
- Preserve working behavior; avoid broad rewrites when a surgical component extraction solves it.
- Each module should be understandable without reading the whole app.
- Each UI sprint should have clear verification: tests, build, and browser screenshots.

## Drive UX North Star

The Drive should feel like a real encrypted storage product:

- First-time users understand what to do immediately.
- Upload flow explains local encryption without being scary.
- File actions are obvious, but not crowded.
- Destructive actions are separated and visually muted-danger.
- Share flow builds confidence: capability link, live folder behavior, key-in-fragment model.
- Mobile must be treated as a first-class path, not a compressed desktop layout.

## Visual Language

- Near-black background, off-white text, layered grays.
- Muted dark tonal accents only when they clarify state or hierarchy.
- Thin borders, boxed ledger/grid structure, restrained motion.
- Real Aegis logo assets only; no fake letter-mark loaders.
- No loud neon, rainbow accents, cybersecurity-gaming emblems, or generic SaaS gradients.

## Implementation Discipline

- Plan before code.
- TDD where logic/regression can be tested.
- Visual prototype/screenshot for major UI states.
- Build and test before claiming done.
- Commit incrementally with focused messages.
