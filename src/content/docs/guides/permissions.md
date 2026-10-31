---
title: "Permissions"
description: "Check what a member is actually allowed to do, in a guild or a specific channel."
---

Discord permissions are a 64-bit bitfield. `PermissionsBitField` wraps that bitfield with a usable API, and `channel.permissionsFor()` computes a member's *effective* permissions in a specific channel (accounting for role permissions and per-channel overwrites).

## The permission flags

Every permission is a property on `PermissionFlags`:

```js
const { PermissionFlags } = require("discordbot.js");

PermissionFlags.BanMembers;
PermissionFlags.ManageChannels;
PermissionFlags.Administrator;
// ... see the API reference for the full list
```

Each value is a `bigint`, since permissions don't fit in a regular 32-bit number.

## Working with a bitfield

```js
const { PermissionsBitField, PermissionFlags } = require("discordbot.js");

const perms = new PermissionsBitField(PermissionFlags.SendMessages | PermissionFlags.AddReactions);

perms.has(PermissionFlags.SendMessages); // true
perms.has(PermissionFlags.BanMembers); // false

perms.add(PermissionFlags.BanMembers);
perms.remove(PermissionFlags.AddReactions);

perms.toArray(); // ["SendMessages", "BanMembers"] — human-readable flag names currently set
```

`PermissionsBitField.has()` always returns `true` for every permission if `Administrator` is set — that's how Discord itself behaves, so you don't need to special-case it.

## A role's raw permissions

```js
const role = guild.roles.get(roleId);
const rolePerms = new PermissionsBitField(role.permissions);
```

## A member's base permissions

`member.permissions` rolls up `@everyone` plus every role the member has, into a `PermissionsBitField`. It needs the guild to already be cached (fetch it first if it isn't):

```js
const member = await guild.members.fetch(userId);
member.permissions.has(PermissionFlags.BanMembers);
```

## Computing effective permissions in a channel

A member's permissions in a specific channel aren't just their roles' permissions — channel-specific overwrites (for `@everyone`, specific roles, or the member directly) can grant or deny on top of that. `member.permissionsIn(channel)` applies those overwrites on top of `member.permissions`, in Discord's real priority order (`@everyone` → roles → member-specific):

```js
const member = await guild.members.fetch(userId);
const channel = await client.channels.fetch(channelId);

const effective = member.permissionsIn(channel);

if (!effective.has(PermissionFlags.SendMessages)) {
  await interaction.reply("You can't send messages in that channel.");
}
```

If you already have a `PermissionsBitField` from elsewhere, `channel.permissionsFor(base, memberId, roleIds)` does the same overwrite computation without needing a full `Member` instance.

## Guarding a command with a permission check

A common pattern: refuse to run a moderation command unless the *invoking* member has the right permission, independent of whether the bot itself has it.

```js
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "ban") return;
  if (!interaction.guildId) return;

  const guild = await client.guilds.fetch(interaction.guildId);
  const invoker = await guild.members.fetch(interaction.user.id);

  if (!invoker.permissions.has(PermissionFlags.BanMembers)) {
    await interaction.reply({ content: "You don't have permission to do that.", flags: 64 /* ephemeral */ });
    return;
  }

  const target = interaction.getOption("user");
  await guild.bans.create(target, { reason: `Requested by ${invoker.displayName}` });
  await interaction.reply(`Banned <@${target}>.`);
});
```
