import { getPluginInfo } from "./plugin-index.ts";

const pluginIdPattern = "([A-Za-z0-9-]+)";
const versionPattern = "([A-Za-z0-9._-]+)";

const wasmPluginPattern = new URLPattern({
  pathname: `/${pluginIdPattern}@${versionPattern}`,
});

// would love to support a checksum for toml plugins, but need to figure out
// what to do if the file location changes
const tomlPluginPattern = new URLPattern({
  pathname: `/${pluginIdPattern}`,
});

async function tryResolveTomlPluginUrl(url: URL) {
  const result = tomlPluginPattern.exec(url);
  if (!result) return undefined;

  const id = result.pathname.groups[0]!;

  const plugin = await getPluginInfo(id);
  if (!plugin || plugin.type !== "toml") return undefined;
  return plugin.url;
}

async function tryResolveWasmPluginUrl(url: URL) {
  const result = wasmPluginPattern.exec(url);
  if (!result) return undefined;

  const id = result.pathname.groups[0]!;
  const version = result.pathname.groups[1]!;

  const plugin = await getPluginInfo(id);
  if (!plugin || plugin.type !== "wasm") return undefined;

  return plugin.url.replaceAll("{version}", version);
}

export async function tryResolvePluginUrl(url: URL) {
  return (
    (await tryResolveWasmPluginUrl(url)) ?? (await tryResolveTomlPluginUrl(url))
  );
}
