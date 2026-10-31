# Slash Commands

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

Each accepts a config object: `{ required, choices, minValue, maxValue, channelTypes }`.

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
