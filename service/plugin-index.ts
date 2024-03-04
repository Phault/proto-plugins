import { join } from "https://deno.land/std@0.218.2/path/mod.ts";

export type PluginType = "toml" | "wasm";

export type PluginInfo = {
  id: string;
  type: PluginType;
  url: string;
};

const pluginsDir = join(import.meta.dirname!, "../plugins");
const pluginIndex = new Map<string, PluginInfo>();

export async function getPluginInfo(id: string) {
  const pluginFromCache = pluginIndex.get(id);
  if (pluginFromCache) {
    return pluginFromCache;
  }

  try {
    const json = await Deno.readTextFile(join(pluginsDir, `${id}.json`));
    const plugin = JSON.parse(json) as PluginInfo;
    pluginIndex.set(plugin.id, plugin);
    return plugin;
  } catch {
    return undefined;
  }
}
