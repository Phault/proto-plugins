import {
  Command,
  EnumType,
  ValidationError,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { urlType } from "./utils/argument-types.ts";
import type { PluginInfo, PluginType } from "../service/plugin-index.ts";
import { join } from "https://deno.land/std@0.218.2/path/join.ts";

const pluginType = new EnumType<PluginType | "auto">(["auto", "toml", "wasm"]);

type Options = {
  force?: boolean;
  dryRun?: boolean;
  type: PluginType | "auto";
};

function inferPluginType(url: URL) {
  const ext = url.pathname.split(".").at(-1);

  // TODO: could be smarter with a HEAD request and looking at content-type
  switch (ext) {
    case "wasm":
      return "wasm";
    case "toml":
      return "toml";
    default:
      throw new ValidationError(
        "Unable to infer plugin type, please specify it manually using --type [wasm|toml]",
      );
  }
}

async function writePluginInfoFile(
  plugin: PluginInfo,
  options: { dryRun?: boolean; force?: boolean },
) {
  const pluginsDir = join(import.meta.dirname!, "../plugins");
  const targetFile = join(pluginsDir, `${plugin.id}.json`);
  const fileExists = await Deno.stat(targetFile)
    .then(() => true)
    .catch(() => false);

  if (fileExists && !options.force) {
    throw new ValidationError(
      `A plugin with the given id already exists. Rerun with --force if you wish to overwrite it.`,
    );
  }

  if (fileExists) console.info(`Overwriting ${targetFile}`);
  else console.info(`Writing to ${targetFile}`);

  const json = JSON.stringify(plugin);
  if (!options.dryRun) {
    await Deno.writeTextFile(targetFile, json);
  }

  console.info("Formatting the file");
  if (!options.dryRun) {
    const command = new Deno.Command("deno", {
      args: ["fmt", targetFile],
    });
    const { success, stderr } = await command.output();

    if (!success) {
      const denoLog = new TextDecoder().decode(stderr);
      throw new Error(`Failed to format file due to:\n\n${denoLog}`);
    }
  }
}

async function addPlugin(id: string, url: URL, options: Options) {
  const { dryRun } = options;

  if (dryRun) {
    console.warn("Dry run is enabled, no changes will be written to disk.");
  }

  const type = options.type === "auto" ? inferPluginType(url) : options.type;

  const plugin: PluginInfo = {
    id,
    url: url.toString(),
    type,
  };

  await writePluginInfoFile(plugin, options);
  console.info("All done!");
}

await new Command()
  .name("add-plugin")
  .type("url", urlType)
  .type("plugin-type", pluginType)
  .option(
    "-n, --dry-run",
    "Show what would happen, but don't write anything to disk.",
  )
  .option("--force", "Overwrite any existing plugin with the given id.")
  .option("-t, --type <plugin-type:plugin-type>", "Set plugin type", {
    default: "auto" as const,
  })
  .arguments("<plugin-id:string> <plugin-url:url>")
  .action((options, ...args) => addPlugin(...args, options))
  .parse(Deno.args);
