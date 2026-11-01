---
title: "Slash Commands"
description: "Register and handle slash commands, subcommands and context menu commands."
---


## Registering a command

Build a command with `SlashCommandBuilder`, then register it once your client is ready:

```js
const { Client, IntentBits, SlashCommandBuilder } = require("discordbot.js");

const client = new Client({ intents: [IntentBits.Guilds] });

const ping = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!");

const say = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Echoes back a message")
  .addStringOption("text", "What to echo", { required: true });

client.on("ready", async () => {
  await client.application.set([ping, say]);
});
```

`application.set([...])` registers **global** commands (available in every server, but can take up to an hour to propagate). Pass a guild id as the second argument to register instantly in a single server while developing:

```js
await client.application.set([ping, say], "123456789012345678");
```

## Handling a command

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "say") {
    await interaction.deferReply();
    await interaction.editReply(`You said: ${interaction.getOption("text")}`);
  }
});
```

- `interaction.reply()` must be called within 3 seconds of receiving the interaction.
- If your handler needs longer, call `interaction.deferReply()` first (shows "Bot is thinking...") and `interaction.editReply()` once you have the result.
- `interaction.followUp()` sends an additional message after the initial reply.

## Options

`SlashCommandBuilder` supports every Discord option type: `addStringOption`, `addIntegerOption`, `addNumberOption`, `addBooleanOption`, `addUserOption`, `addChannelOption`, `addRoleOption`, `addMentionableOption`, `addAttachmentOption`.

Each accepts a config object: `{ required, choices, minValue, maxValue, channelTypes, autocomplete }`. `autocomplete` and `choices` are mutually exclusive — Discord rejects a command declaring both.

## Localization, NSFW, install contexts

```js
const ping = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")
  .setNameLocalizations({ fr: "ping", "es-ES": "ping" })
  .setDescriptionLocalizations({ fr: "Répond Pong !" })
  .setNSFW(false)
  .setIntegrationTypes([0, 1]) // 0 = guild install, 1 = user install
  .setContexts([0, 1, 2]); // guild, bot DM, private channel
```

## Managing registered commands

```js
const commands = await client.application.fetchAll();
const command = await client.application.fetch(commandId);

await command.edit({ description: "New description" });
await command.delete();
```

Per-guild command permissions (which roles/users/channels can use a guild command) go through the command itself:

```js
const permissions = await command.fetchPermissions();
await command.editPermissions(
  [{ id: roleId, type: 1, permission: true }],
  oauthBearerToken, // needs applications.commands.permissions.update from the guild owner — the bot token isn't accepted here
);
```

`guild.commands` mirrors every one of these calls pre-scoped to one guild, caching the results:

```js
await guild.commands.create(say);
const guildCommands = await guild.commands.fetchAll();
await guild.commands.setAll([ping, say]); // bulk overwrite — named setAll, not set, since guild.commands is itself a Collection
```

## Subcommands

```js
const mod = new SlashCommandBuilder()
  .setName("mod")
  .setDescription("Moderation actions")
  .addSubcommand("ban", "Ban a member", (sub) => sub.addUserOption("target", "Who to ban", { required: true }));
```

```js
if (interaction.commandName === "mod" && interaction.subcommand === "ban") {
  const target = interaction.getOption("target");
  // ...
}
```

## Context menu commands

User and message context menu commands (the right-click menu in Discord) use `ContextMenuCommandBuilder`:

```js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discordbot.js");

const userInfo = new ContextMenuCommandBuilder().setName("User info").setType(ApplicationCommandType.User);

client.on("interactionCreate", async (interaction) => {
  if (interaction.commandName === "User info") {
    await interaction.reply(`Target user id: ${interaction.targetId}`);
  }
});
```
