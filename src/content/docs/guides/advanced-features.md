---
title: "Advanced Features"
description: "Monetization, soundboard sounds, and guild templates."
---

These are niche features most bots never touch — included here for completeness rather than as something every bot needs.

## Monetization

If your application sells premium features through Discord (SKUs configured in the Developer Portal), `client.monetization` manages entitlements:

```js
const skus = await client.monetization.fetchSKUs();

const entitlements = await client.monetization.fetchEntitlements({ guildId: guild.id });
const isPremium = entitlements.some((e) => e.skuId === premiumSkuId && !e.deleted);
```

Testing without real purchases:

```js
const testEntitlement = await client.monetization.createTestEntitlement({
  skuId: premiumSkuId,
  ownerId: guild.id,
  ownerType: 2, // 1 = user, 2 = guild
});

await client.monetization.deleteTestEntitlement(testEntitlement.id);
```

Mark a one-time-purchase entitlement as consumed once the user has used it:

```js
await entitlement.consume();
```

## Soundboard

Play one of a guild's soundboard sounds into a voice channel the bot is connected to:

```js
await client.soundboard.play(voiceChannelId, { soundId: someSoundId });

const defaults = await client.soundboard.fetchDefaultSounds();
```

Managing a guild's own custom sounds (`guild.soundboardSounds`) works like emoji uploads — a base64 data URI, not multipart:

```js
const sound = await guild.soundboardSounds.create({
  name: "airhorn",
  sound: `data:audio/ogg;base64,${audioBuffer.toString("base64")}`,
  volume: 1,
});

const sounds = await guild.soundboardSounds.list();
```

:::note
Actually *joining* a voice channel to play audio isn't implemented in this library — see the [project's scope notes](https://github.com/shir0sys/discordbot.js) on why voice support was left out. `soundboard.play()` only works for triggering a soundboard sound in a channel the bot (or a user) is already connected to.
:::

## Guild templates

Templates let you snapshot a guild's structure (channels, roles, settings) and let others create new guilds from it.

```js
// On an existing guild
const template = await guild.templates.create({ name: "Starter Server", description: "My community template" });
const templates = await guild.templates.list();
```

```js
const { fetchGuildTemplate, createGuildFromTemplate } = require("discordbot.js");

const template = await fetchGuildTemplate(client, templateCode); // the code from a discord.new/<code> link
const newGuild = await createGuildFromTemplate(client, templateCode, { name: "My New Server" });
```

Keep a template in sync with the guild it was made from:

```js
await template.sync();
await template.edit({ description: "Updated description" });
await template.delete();
```
