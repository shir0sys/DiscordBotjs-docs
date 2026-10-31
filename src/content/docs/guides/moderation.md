---
title: "Moderation"
description: "Kick, ban, timeout members, and manage roles."
---

All moderation actions live on `guild.members`, `guild.bans` and `guild.roles` — the managers attached to a cached `Guild` instance.

```js
const guild = await client.guilds.fetch(guildId);
```

## Kicking a member

```js
await guild.members.kick(userId, "Breaking rule #3");
```

## Banning and unbanning

```js
await guild.bans.create(userId, {
  reason: "Spamming invites",
  deleteMessageSeconds: 86400, // also delete their last 24h of messages
});

await guild.bans.remove(userId, "Appeal accepted");
```

To check or list existing bans:

```js
const ban = await guild.bans.fetch(userId); // a GuildBan (throws if the user isn't banned)
console.log(ban.user.tag, ban.reason);
await ban.revoke(); // shorthand for guild.bans.remove(ban.user.id)

const allBans = await guild.bans.list();
```

## Timing out a member

A timeout (Discord's built-in "communication disabled" state) prevents a member from sending messages, reacting, or speaking in voice until it expires.

```js
// Timeout for 10 minutes
await guild.members.timeout(userId, 10 * 60 * 1000, "Cooling off period");

// Remove an active timeout early
await guild.members.timeout(userId, null);
```

## Editing a member (nickname, mute, deaf, roles)

```js
await guild.members.edit(userId, { nick: "Timmy" }, "Nickname cleanup");
await guild.members.edit(userId, { mute: true }); // server-mute in voice
await guild.members.edit(userId, { roles: [roleIdA, roleIdB] }); // replaces the member's full role list
```

## Roles

```js
// Create a role
const role = await guild.roles.create({
  name: "Moderator",
  color: 0x5865f2,
  hoist: true, // show separately in the member list
});

// Give it to someone
const member = await guild.members.fetch(userId);
await member.addRole(role.id, "Promoted to moderator");

// Take it away
await member.removeRole(role.id);

// Edit or delete a role
await guild.roles.edit(role.id, { name: "Senior Moderator" });
await guild.roles.remove(role.id);
```

`guild.roles` is a `Collection`, so once populated (it's filled automatically from the gateway's `GUILD_CREATE`/role events) you can iterate it directly:

```js
for (const role of guild.roles.values()) {
  console.log(role.name, role.id);
}
```

## Fetching large member lists

The REST `guild.members.list()` only returns up to 1000 members per call and requires the `GuildMembers` privileged intent to see more than the few cached from recent activity. For bulk member fetching on large servers, use the gateway-based fetch instead — see [Sharding → Fetching members on a large guild](/guides/sharding/).

## Next steps

See [Permissions](/guides/permissions/) to check whether a member is actually allowed to do something before acting on their behalf, and [Error Handling](/guides/error-handling/) to handle cases like trying to ban someone you don't have permission to ban.
