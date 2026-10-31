---
title: "OAuth2"
description: "Let users log in with their own Discord account."
---


Use this when you need a user to log in with their own Discord account (not your bot's token) — e.g. a "Login with Discord" button on a website, or reading which servers a user is in.

## 1. Redirect the user to Discord

```js
const { getAuthorizationURL } = require("discordbot.js");

const url = getAuthorizationURL({
  clientId: "YOUR_CLIENT_ID",
  redirectUri: "https://your-site.com/callback",
  scopes: ["identify", "guilds"],
});

// Redirect the user's browser to `url`.
```

## 2. Exchange the returned code for a token

Discord redirects back to your `redirectUri` with a `?code=...` query parameter:

```js
const { exchangeCode } = require("discordbot.js");

const tokens = await exchangeCode({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  code: req.query.code,
  redirectUri: "https://your-site.com/callback",
});

// tokens.access_token, tokens.refresh_token, tokens.expires_in
```

## 3. Use the access token

```js
const { OAuth2User } = require("discordbot.js");

const user = new OAuth2User(tokens.access_token);
const profile = await user.fetchProfile();
const guilds = await user.fetchGuilds();
```

`OAuth2User` is a thin wrapper around the user's own Bearer token — it is completely separate from your bot's token and `Client`.

## Refreshing an expired token

```js
const { refreshAccessToken } = require("discordbot.js");

const refreshed = await refreshAccessToken({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  refreshToken: tokens.refresh_token,
});
```

## Revoking a token

```js
const { revokeToken } = require("discordbot.js");

await revokeToken({ clientId: "YOUR_CLIENT_ID", clientSecret: "YOUR_CLIENT_SECRET", token: tokens.access_token });
```
