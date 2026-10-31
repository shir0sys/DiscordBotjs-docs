# Sharding

Discord requires large bots (as a rule of thumb, past ~2,500 servers) to split their gateway connection into **shards**, each handling a subset of servers. `discordbot.js` supports two sharding modes.

## In-process sharding

Runs multiple gateway connections inside the same Node process. Good up to several thousand servers.

```js
const client = new Client({
  intents: [IntentBits.Guilds],
  shardCount: "auto", // or a fixed number
});
```

`"auto"` asks Discord's `/gateway/bot` endpoint for the recommended shard count. `client.gateway` always refers to shard 0; use `client.shards` to access all of them.

## Multi-process sharding (`ShardingManager`)

Runs each shard in its own child process — needed once a single process can't keep up (CPU-bound work, very large bots).

**manager.js** (the process you actually run):

```js
const { ShardingManager } = require("discordbot.js");

const manager = new ShardingManager("./bot.js", {
  totalShards: "auto",
  token: process.env.DISCORD_TOKEN,
});

manager.on("shardCreate", (id) => console.log(`Shard ${id} launched`));
manager.spawn();
```

**bot.js** (your actual bot — unchanged from a normal single-shard bot):

```js
const { Client, IntentBits } = require("discordbot.js");

const client = new Client({ intents: [IntentBits.Guilds] });
client.on("ready", () => console.log(`Shard ${client.shard.id} ready as ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN);
```

`ShardingManager` sets `SHARD_ID`/`SHARD_COUNT` environment variables on each forked process; `Client` picks them up automatically — you don't pass `shardCount` yourself in `bot.js`.

### Cross-shard communication

```js
// From manager.js: run code on every shard and collect the results
const guildCounts = await manager.broadcastEval("this.guilds.cache.size");
console.log(`Total guilds: ${guildCounts.reduce((a, b) => a + b, 0)}`);
```

## Fetching members on a large guild

For guilds large enough that Discord won't send every member on connect, request them explicitly over the gateway:

```js
const members = await guild.members.fetchViaGateway({ query: "", limit: 0 });
```

This is routed to whichever shard actually owns that guild, even in multi-shard setups.
