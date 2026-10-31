import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://shir0sys.github.io",
  base: "/DiscordBotjs-docs",
  integrations: [
    starlight({
      title: "discordbot.js",
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
      },
      favicon: "/favicon.png",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/shir0sys/discordbot.js" }],
      customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/shir0sys/DiscordBotjs-docs/edit/main/",
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: ["./vendor/discordbot.js/src/index.ts"],
          tsconfig: "./vendor/discordbot.js/tsconfig.typedoc.json",
          sidebar: {
            label: "API Reference",
            collapsed: false,
          },
          typeDoc: {
            excludePrivate: true,
            excludeInternal: true,
            sort: ["source-order"],
          },
        }),
      ],
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Getting Started", slug: "guides/getting-started" },
            { label: "Slash Commands", slug: "guides/slash-commands" },
            { label: "Components", slug: "guides/components" },
            { label: "Interactions", slug: "guides/interactions" },
            { label: "Moderation", slug: "guides/moderation" },
            { label: "Permissions", slug: "guides/permissions" },
            { label: "Threads", slug: "guides/threads" },
            { label: "Emojis & Stickers", slug: "guides/emojis-and-stickers" },
            { label: "Webhooks", slug: "guides/webhooks" },
            { label: "Error Handling", slug: "guides/error-handling" },
            { label: "Sharding", slug: "guides/sharding" },
            { label: "OAuth2", slug: "guides/oauth2" },
            { label: "Advanced Features", slug: "guides/advanced-features" },
          ],
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
