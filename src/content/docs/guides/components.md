---
title: "Components"
description: "Embeds, buttons, select menus, modals, Components V2, attachments and polls."
---


## Embeds

```js
const { EmbedBuilder } = require("discordbot.js");

const embed = new EmbedBuilder()
  .setTitle("Example embed")
  .setDescription("Built with EmbedBuilder")
  .setColor(0x5865f2)
  .addFields({ name: "Field 1", value: "Value 1", inline: true })
  .setFooter("discordbot.js")
  .setTimestamp();

await channel.send({ embeds: [embed] });
```

## Buttons and select menus

```js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discordbot.js");

const buttons = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger),
);

const select = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("pick")
    .setPlaceholder("Pick an option")
    .addOptions({ label: "Option A", value: "a" }, { label: "Option B", value: "b" }),
);

await interaction.reply({ components: [buttons, select] });
```

Handle the clicks via `interactionCreate`:

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isMessageComponent()) return;

  if (interaction.customId === "confirm") {
    await interaction.update({ content: "Confirmed!", components: [] });
  } else if (interaction.customId === "pick") {
    await interaction.reply(`You picked: ${interaction.values.join(", ")}`);
  }
});
```

`interaction.update()` edits the message the component is attached to. Use `interaction.reply()` instead to send a new message (e.g. a public reply to a select menu pick).

## Modals

```js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discordbot.js");

const modal = new ModalBuilder()
  .setCustomId("feedback")
  .setTitle("Send feedback")
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("text").setLabel("Your feedback").setStyle(TextInputStyle.Paragraph).setRequired(true),
    ),
  );

await interaction.showModal(modal);
```

```js
client.on("interactionCreate", async (interaction) => {
  if (interaction.isModalSubmit() && interaction.customId === "feedback") {
    const text = interaction.getTextInputValue("text");
    await interaction.reply(`Thanks: ${text}`);
  }
});
```

## Components V2

Components V2 lets you build a message entirely out of layout components instead of `content`/`embeds`. It requires `MessageFlags.IsComponentsV2`:

```js
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require("discordbot.js");

const container = new ContainerBuilder()
  .setAccentColor(0xeb459e)
  .addComponents(
    new TextDisplayBuilder().setContent("# Components V2\nThis bypasses embeds entirely."),
    new SeparatorBuilder(),
    new TextDisplayBuilder().setContent("Built from ContainerBuilder + TextDisplayBuilder."),
  );

await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
```

Other V2 building blocks: `SectionBuilder`, `ThumbnailBuilder`, `MediaGalleryBuilder`, `FileBuilder`.

## Attachments

```js
const { AttachmentBuilder } = require("discordbot.js");
const fs = require("node:fs");

const file = new AttachmentBuilder(fs.readFileSync("./logo.png"), "logo.png");
await channel.send({ content: "Here's a file", files: [file] });
```

## Polls

```js
const { PollBuilder } = require("discordbot.js");

const poll = new PollBuilder()
  .setQuestion("Best language?")
  .addAnswer({ text: "TypeScript" })
  .addAnswer({ text: "JavaScript" })
  .setDuration(24);

await channel.send({ poll });
```
