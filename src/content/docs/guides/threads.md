---
title: "Threads"
description: "Create, join and manage threads on text and forum channels."
---

## Creating a thread

Every text-like channel exposes a `.threads` manager:

```js
const channel = await client.channels.fetch(channelId);

const thread = await channel.threads.create({
  name: "Bug report #42",
  auto_archive_duration: 1440, // minutes: 60, 1440, 4320 or 10080
});

await thread.send("Thread created automatically.");
```

### Starting a thread from an existing message

```js
const thread = await channel.threads.createFromMessage(message.id, { name: "Discussion" });
```

## Sending messages in a thread

A `ThreadChannel` behaves like any other text channel:

```js
await thread.send("Hello from inside the thread!");
```

## Joining, leaving, archiving, locking

```js
await thread.join();
await thread.leave();

await thread.setArchived(true, "Conversation resolved");
await thread.setLocked(true, "Prevent further replies");
```

## Thread members

```js
await thread.members.add(userId);
await thread.members.remove(userId);

const member = await thread.members.fetch(userId);
const all = await thread.members.fetchAll();
```

## Listing threads on a channel

```js
const active = await channel.threads.fetchActive();
const archived = await channel.threads.fetchArchivedPublic();
```

## Forum channels

Forum channels (`ChannelType.GuildForum`) don't take regular messages — every post **is** a thread, created with its own starting message:

```js
const forum = await client.channels.fetch(forumChannelId); // a ForumChannel

const post = await forum.createPost({
  name: "Feature request: dark mode",
  message: { content: "Please add a dark mode toggle!" },
  appliedTags: [tagId],
});
```

`forum.availableTags` lists the tags configured on the forum (`{ id, name, moderated, emoji_id, emoji_name }`), which you'll need the `id` of to apply via `appliedTags`.

## Reacting to thread events

```js
client.on("threadCreate", (thread) => console.log("New thread:", thread.name));
client.on("threadUpdate", (thread) => console.log("Thread changed:", thread.name, thread.archived));
client.on("threadDelete", ({ id, guildId }) => console.log("Thread deleted:", id));
```
