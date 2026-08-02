import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

// SENIOR (2026-08-02, "quero tudo (site + backend) no CloudPanel" - Alvaro
// decidiu hospedar o site na Hostinger/CloudPanel em vez de Cloudflare
// Workers, que é pra onde esse template foi construído originalmente):
// esse projeto SÓ builda pra Cloudflare Workers por padrão (plugin
// `cloudflare()` abaixo, entry em worker/index.ts, bindings D1/R2 em
// .openai/hosting.json - hoje null/desligados). CloudPanel roda processo
// Node comum, não Workers - não dá pra simplesmente publicar o output do
// `vinext build` lá.
//
// Caminho oficial do próprio vinext pra isso (ver node_modules/vinext/
// README.md, seção "Other platforms via Nitro" > "Node.js server"): plugin
// Nitro com NITRO_PRESET=node gera um server Node standalone em
// `.output/server/index.mjs`, "suitable for Docker, VMs, or any environment
// that can run Node" - exatamente o caso do CloudPanel.
//
// Os dois caminhos de build coexistem sem se atrapalhar: quando
// NITRO_PRESET está definido, usamos nitro() no lugar de cloudflare() (as
// duas plugins mexem no mesmo pipeline de build e não podem rodar juntas).
// `vinext dev`/`vinext build`/`vinext deploy` sem essa variável continuam
// funcionando exatamente como antes, caso um dia vocês queiram voltar pra
// Cloudflare Workers ou usar os dois em paralelo (ex: preview na Cloudflare,
// produção na Hostinger).
//
// NÃO TESTADO AINDA - meu ambiente de sandbox estava fora do ar quando fiz
// essa mudança e não consegui rodar `npm install nitro` nem confirmar que o
// build sai limpo. Antes de depender disso em produção, rodar localmente:
//   npm install nitro
//   set NITRO_PRESET=node && npx vite build   (Windows)
//   NITRO_PRESET=node npx vite build          (Mac/Linux)
//   node .output/server/index.mjs
// e conferir se o site abre normalmente em http://localhost:3000 (ou na
// porta que o Nitro imprimir) antes de publicar no CloudPanel.
const nitroPreset = process.env.NITRO_PRESET;

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const platformPlugins = [];
  if (nitroPreset) {
    // Node.js/VPS build (Hostinger CloudPanel) - só carrega o pacote nitro
    // quando realmente vai ser usado, pra não quebrar `vinext dev`/`build`
    // padrão em máquinas que ainda não rodaram `npm install nitro`.
    const { nitro } = await import("nitro/vite");
    platformPlugins.push(nitro());
  } else {
    // Wrangler snapshots its log path while the Cloudflare plugin is imported.
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    platformPlugins.push(
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    );
  }

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [vinext(), sites(), ...platformPlugins],
  };
});
