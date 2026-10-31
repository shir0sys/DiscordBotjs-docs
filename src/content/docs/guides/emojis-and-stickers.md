---
title: "Emojis & Stickers"
description: "Upload and manage custom guild emojis and stickers."
---

## Guild emojis

`guild.emojis` manages a server's custom emojis. Uploads take a **base64 data URI**, not a file upload — that's how Discord's image endpoints work.

```js
const fs = require("node:fs");

const image = fs.readFileSync("./pepe.png");
const dataUri = `data:image/png;base64,${image.toString("base64")}`;

const emoji = await guild.emojis.create({ name: "pepe", image: dataUri });

console.log(emoji.toString()); // "<:pepe:123456789012345678>" — ready to drop into message content
```

Restrict an emoji to specific roles:

```js
await guild.emojis.create({ name: "staff_only", image: dataUri, roles: [staffRoleId] });
```

Fetch all of a guild's emojis (also refreshes the cache):

```js
const emojis = await guild.emojis.fetchAll();
```

Edit or delete an emoji through the instance itself:

```js
await emoji.edit({ name: "pepe_v2" });
await emoji.delete("No longer used");
```

### Using an emoji you already have

If you already know an emoji's id (e.g. from `message.content` or Discord's own "Copy ID"), you don't need the manager to use it in a message — just write the mention string directly: `<:name:id>` for a static emoji, `<a:name:id>` if it's animated.

## Stickers

Unlike emoji uploads, sticker uploads **do** use multipart file upload (`RESTFile`), since stickers are closer to full attachments.

```js
const { readFileSync } = require("node:fs");

const sticker = await guild.stickers.create({
  name: "wave",
  description: "A waving hand",
  tags: "wave, hello", // comma-separated keywords Discord uses for autocomplete
  file: { name: "wave.png", data: readFileSync("./wave.png") },
});
```

Fetch and manage:

```js
const stickers = await guild.stickers.fetchAll();

await sticker.edit({ name: "wave_v2" });
await sticker.delete();
```

To actually send a sticker in a message, `channel.send()` doesn't wire up a `stickers` option yet — use the REST client directly with `sticker_ids`:

```js
await client.rest.post(`/channels/${channel.id}/messages`, { sticker_ids: [sticker.id] });
```
