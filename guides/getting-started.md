# Getting Started

`discordbot.js` is a zero-dependency Discord API v10 wrapper for Node.js. It needs **Node.js 22 or later** — nothing else to install, since it relies entirely on Node's built-in `fetch` and `WebSocket`.

## Installation

```bash
npm install discordbot.js
```

## Creating your first bot

```js
const { Client, IntentBits } = require("discordbot.js");

const client = new Client({
  intents: [IntentBits.Guilds, IntentBits.GuildMessages, IntentBits.MessageContent],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content === "!ping") {
    await message.reply("Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN);
```

Run it with:

```bash
node --env-file=.env bot.js
```

(Node's `--env-file` flag loads a `.env` file natively — no `dotenv` package needed, keeping the zero-dependency spirit.)

## Intents

Intents tell Discord which events your bot wants to receive. `IntentBits` lists every flag; pass an array to `Client`:

```js
new Client({ intents: [IntentBits.Guilds, IntentBits.GuildMembers] });
```

Some intents (`GuildMembers`, `GuildPresences`, `MessageContent`) are **privileged** — you must enable them for your application in the [Discord Developer Portal](https://discord.com/developers/applications) under Bot → Privileged Gateway Intents, or the gateway will reject your connection with a `DisallowedIntents` close code.

## Where to go next

- [Slash Commands](./slash-commands.md)
- [Components (buttons, select menus, modals)](./components.md)
- [Handling interactions](./interactions.md)
- [Sharding](./sharding.md)
- [OAuth2](./oauth2.md)
- Full [API reference](../index.html)
