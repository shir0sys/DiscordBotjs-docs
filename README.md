# discordbot.js — Documentation

This is the documentation site for [discordbot.js](https://github.com/shir0sys/discordbot.js), a zero-dependency Discord API v10 wrapper for Node.js.

## What's here

- `guides/` — hand-written guides (getting started, slash commands, components, interactions, sharding, OAuth2).
- Everything else is generated: the API reference is built by [TypeDoc](https://typedoc.org/) directly from `discordbot.js`'s TypeScript source and type signatures, not maintained by hand.

## Building locally

```bash
npm install
npm run build   # clones/updates discordbot.js into vendor/, then runs TypeDoc
npm run serve   # serves the generated docs/ folder at http://localhost:8080
```

`npm run build` always pulls the latest `main` branch of `discordbot.js` — this repo carries no copy of the library's source itself, only the guides and the TypeDoc configuration pointing at it.

## Updating guides

Guides live in `guides/*.md` as plain Markdown and are wired into `typedoc.json`'s `projectDocuments`. Add a new guide by creating the file and adding its path there.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
