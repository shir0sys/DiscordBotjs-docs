---
title: "Error Handling"
description: "Catch and distinguish REST, rate-limit and gateway errors."
---

Every REST call (and anything built on top of it — `message.reply()`, `guild.bans.create()`, etc.) can reject. There are three distinct error types depending on what went wrong.

## `DiscordAPIError` — Discord rejected the request

The most common case: your bot tried something Discord's API itself refused (missing permission, unknown channel, invalid payload, ...).

```js
const { DiscordAPIError } = require("discordbot.js");

try {
  await guild.bans.create(userId);
} catch (error) {
  if (error instanceof DiscordAPIError) {
    console.error(`Discord refused the request (${error.status}):`, error.payload);
    // error.payload is Discord's raw JSON error body — e.g. { code: 50013, message: "Missing Permissions" }
  } else {
    throw error;
  }
}
```

`error.status` is the HTTP status code, `error.payload` is whatever JSON body Discord sent back (often has a `code` matching [Discord's JSON error code list](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json)).

## `RateLimitError` — retries exhausted on a 429

The REST client already retries rate-limited requests automatically. `RateLimitError` only surfaces once it's given up after `maxRetries` attempts (default 3) — a sign something is hammering the same route too hard.

```js
const { RateLimitError } = require("discordbot.js");

try {
  await channel.send("spam");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Still rate limited on ${error.route} after retries (would need ${error.retryAfterMs}ms more)`);
  }
}
```

## `HTTPError` — retries exhausted on a 5xx

Same idea, but for Discord's own server errors (5xx) instead of rate limits.

```js
const { HTTPError } = require("discordbot.js");

try {
  await guild.roles.create({ name: "New Role" });
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(`Discord's API had a server error (status ${error.status}) and retries didn't help`);
  }
}
```

## `GatewayError` — the connection died for good

Unlike REST errors, gateway problems aren't thrown from an `await` — they're emitted as an `error` event on the client, since the gateway connection runs independently of any single call you made.

```js
const { GatewayError } = require("discordbot.js");

client.on("error", (error) => {
  if (error instanceof GatewayError) {
    console.error(`Gateway closed with code ${error.closeCode}: ${error.message}`);
    // Typical unrecoverable causes: bad token, disallowed/invalid intents, invalid shard config.
    // The client will NOT reconnect on its own for these — you likely need to fix config and restart.
  }
});
```

:::caution
Node's `EventEmitter` throws if an `error` event has no listener attached. Always register a `client.on("error", ...)` handler — without one, an unrecoverable gateway failure will crash your process with an unhandled exception instead of giving you a clean error to log.
:::

## A general pattern

For code that might fail for several different reasons, check the most specific type first:

```js
const { DiscordAPIError, RateLimitError, HTTPError } = require("discordbot.js");

async function safeBan(guild, userId, reason) {
  try {
    await guild.bans.create(userId, { reason });
    return true;
  } catch (error) {
    if (error instanceof DiscordAPIError && error.status === 403) {
      console.warn("Missing permission to ban this user");
    } else if (error instanceof RateLimitError || error instanceof HTTPError) {
      console.warn("Discord-side issue, try again later:", error.message);
    } else {
      throw error; // something unexpected — don't swallow it
    }
    return false;
  }
}
```
