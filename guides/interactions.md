# Handling Interactions

Every interaction — slash command, button click, select menu pick, modal submit, autocomplete request — arrives through the same `interactionCreate` event. Use the type guards to narrow it:

```js
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    // CommandInteraction: commandName, subcommand, getOption(name)
  } else if (interaction.isMessageComponent()) {
    // MessageComponentInteraction: customId, componentType, values (for select menus)
  } else if (interaction.isModalSubmit()) {
    // ModalSubmitInteraction: customId, getTextInputValue(customId)
  } else if (interaction.isAutocomplete()) {
    // AutocompleteInteraction: getFocused(), respond(choices)
  }
});
```

## Response methods (shared by every interaction type)

| Method | What it does |
| --- | --- |
| `interaction.reply(payload)` | Sends the initial response. Must happen within 3 seconds. |
| `interaction.deferReply(ephemeral?)` | Acknowledges now, shows "thinking...", lets you reply later. |
| `interaction.editReply(payload)` | Edits the (deferred or sent) reply. |
| `interaction.followUp(payload)` | Sends an additional message after the first reply. |
| `interaction.update(payload)` | Component interactions only: edits the message the component is attached to. |
| `interaction.deferUpdate()` | Component interactions only: acknowledges without visibly changing anything yet. |
| `interaction.showModal(modal)` | Opens a modal instead of replying. |

An interaction can only be responded to **once** via `reply`/`update`/`deferReply`/`deferUpdate` — calling a second one throws. Use `editReply`/`followUp` for anything after that.

## Autocomplete

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const focused = interaction.getFocused();
  const matches = ["apple", "banana", "cherry"].filter((f) => f.startsWith(focused.value));
  await interaction.respond(matches.map((m) => ({ name: m, value: m })));
});
```

## Collectors: waiting for a response instead of listening forever

Instead of a global `interactionCreate` listener, you can wait for a specific component click tied to a message you just sent:

```js
const sent = await channel.send({ content: "Pick one", components: [buttons] });

try {
  const click = await sent.awaitMessageComponent({ time: 30000 });
  await click.update({ content: `You picked ${click.customId}`, components: [] });
} catch {
  await sent.edit({ content: "Timed out.", components: [] });
}
```

Similarly, `channel.awaitMessages(options)` and `message.awaitReactions(options)` resolve a `Collection` of everything collected before `time`/`idle`/`max` ends the collector. For an ongoing stream instead of a one-shot promise, use `channel.createMessageCollector(options)` or `message.createReactionCollector(options)` and listen to their `collect`/`end` events.
