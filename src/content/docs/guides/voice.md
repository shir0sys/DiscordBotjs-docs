---
title: "Voice"
description: "Join a voice channel and play audio: gateway handshake, UDP transport and Opus encoding, all built in."
---

discordbot.js can join a voice channel and play audio without delegating to `@discordjs/voice` or any native Opus binding. The voice gateway handshake, UDP transport (IP discovery, RTP framing), and `aead_aes256_gcm_rtpsize` encryption are implemented directly on top of Node's native `WebSocket`, `dgram` and `crypto`. The one real runtime dependency in the whole library — [`opusscript`](https://www.npmjs.com/package/opusscript), a pure WASM port of libopus — is used here for Opus encoding.

:::caution
**Voice does not work on channels/guilds where Discord requires DAVE (end-to-end encryption)** — see [Scope and caveats](#scope-and-caveats) below. It's also send-only (no receiving/listening to other members), has no jitter buffering, and reconnection on a dropped voice gateway is best-effort only.
:::

## Prerequisites

- The `GuildVoiceStates` intent, so the library can resolve which voice channel a member is in and complete the voice handshake:

  ```js
  const client = new Client({ intents: [IntentBits.Guilds, IntentBits.GuildVoiceStates] });
  ```

- Audio input as raw PCM (16-bit signed little-endian, 48kHz, stereo) or already-encoded Opus frames. For anything else (an MP3, a URL, a live stream), you need [ffmpeg](https://ffmpeg.org/download.html) installed as a system binary to transcode it — it is not an npm dependency of this library.

## Joining a channel and playing audio

```js
const { AudioPlayer, AudioResource } = require("discordbot.js");
const { spawn } = require("node:child_process");

const guild = await client.guilds.fetch(guildId);
const voiceState = guild.voiceStates.get(memberId);
if (!voiceState?.channelId) throw new Error("That member isn't in a voice channel");

const connection = await client.joinVoiceChannel({
  guildId: guild.id,
  channelId: voiceState.channelId,
});

const player = new AudioPlayer();
connection.subscribe(player);

const ffmpeg = spawn("ffmpeg", ["-i", "input.mp3", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"]);
const resource = AudioResource.fromPCMStream(ffmpeg.stdout);

player.play(resource);
player.once("idle", () => ffmpeg.kill());
```

`client.joinVoiceChannel()` sends the Voice State Update on the correct shard for that guild, waits for Discord's `VOICE_STATE_UPDATE`/`VOICE_SERVER_UPDATE` dispatches, and resolves once the voice gateway handshake is ready to accept audio.

If you already have Opus frames (e.g. from a pre-encoded source), skip the PCM path:

```js
const resource = AudioResource.fromOpusFrames(opusFrameArray);
player.play(resource);
```

## Controlling playback

```js
player.pause();
player.unpause();
player.stop();

player.on("stateChange", (oldStatus, newStatus) => { /* "idle" | "playing" | "paused" */ });
player.on("idle", () => { /* resource finished or was stopped */ });
player.on("error", (error) => console.error(error));
```

## Leaving a channel

```js
client.leaveVoiceChannel(guild.id);
```

This sends the Voice State Update with `channel_id: null`, tears down the `VoiceConnection`, and removes it from `client.voiceConnections`.

## Reference

See [examples/voice-bot.js](https://github.com/shir0sys/discordbot.js/blob/main/examples/voice-bot.js) for a complete `/play` + `/stop` slash command bot, and the [API reference](/DiscordBotjs-docs/api/classes/) for `VoiceConnection`, `AudioPlayer`, `AudioResource` and `VoiceGateway`.

## Scope and caveats

- **DAVE (end-to-end encryption) is not implemented, and Discord now requires it for voice on some guilds/channels.** DAVE is an MLS-based protocol (group key ratcheting, epochs, proposals/commits) — a substantial addition in its own right, not a small one. Joining a channel where it's required fails fast with a clear `"E2EE/DAVE protocol required"` error (close code 4017) instead of hanging or crashing, but there is currently no way to actually join such a channel. Verified live: the gateway handshake, UDP IP discovery and RTP/AES-256-GCM framing all work correctly against Discord's real voice servers when DAVE isn't required.
- No voice receive — you cannot listen to other members, only send audio.
- No jitter buffering, and voice gateway reconnection only retries genuinely transient close codes — anything that would fail identically again (bad credentials, an unsupported protocol feature, a terminated call, ...) fails immediately instead of looping forever.
- Encryption is `aead_aes256_gcm_rtpsize` only (chosen because AES-256-GCM is natively available via `node:crypto`); older XSalsa20-Poly1305 modes are not implemented.
