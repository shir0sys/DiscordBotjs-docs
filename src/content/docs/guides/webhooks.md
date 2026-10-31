---
title: "Webhooks"
description: "Send messages to a channel without a bot presence, using a webhook's id and token."
---

A webhook lets you post messages into a channel using just an id + token — no bot client, no gateway connection, no bot even needing to be in the server. This is what services like CI pipelines or external integrations typically use.

## Creating a webhook

```js
const channel = await client.channels.fetch(channelId);
const webhook = await channel.createWebhook({ name: "Deploy Bot" });

console.log(webhook.id, webhook.token);
```

Keep the `id` and `token` somewhere safe (a `.env` file, a secret store) — anyone with both can post to that channel as the webhook.

List existing webhooks on a channel:

```js
const webhooks = await channel.fetchWebhooks();
// or, for every webhook across a guild:
const guildWebhooks = await guild.fetchWebhooks();
```

## Sending through a webhook

Once you have the id/token (from creating one above, or one a user pasted from Discord's own channel settings → Integrations → Webhooks), use the standalone `WebhookClient` — it needs no bot token at all:

```js
const { WebhookClient } = require("discordbot.js");

const webhook = new WebhookClient(webhookId, webhookToken);

await webhook.send("Deployment finished ✅");

await webhook.send({
  content: "Build failed",
  embeds: [new EmbedBuilder().setTitle("Build #482").setColor(0xed4245)],
});
```

`WebhookClient.send()` supports the same payload shape as `channel.send()` — content, embeds, components, files.

## Managing an existing webhook through your bot

If your bot already knows a webhook's id (e.g. it created it, or you stored it from the REST call above), wrap it in a `Webhook` instance to edit, delete, or send through it using your bot's regular rate-limited REST client instead of a bare `fetch`:

The `webhook` returned by `channel.createWebhook()`/`fetchWebhooks()`/`guild.fetchWebhooks()` is already a `Webhook` instance:

```js
await webhook.send("Hello via the bot's REST client");
await webhook.edit({ name: "Renamed Webhook" }, "Rebranding");
await webhook.delete("No longer needed");
```
