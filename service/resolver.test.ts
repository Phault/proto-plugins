import { assert } from "https://deno.land/std@0.218.2/assert/assert.ts";
import { tryResolvePluginUrl } from "./resolver.ts";
import moonPlugin from "../plugins/moon.json" with { type: "json" };
import nodePlugin from "../plugins/node.json" with { type: "json" };

Deno.test({
  name: "can resolve valid toml plugin",
  permissions: {
    read: true,
  },
  async fn() {
    const actual = await tryResolvePluginUrl(
      new URL("https://example.com/moon.toml"),
    );
    const expected = moonPlugin.url;
    assert(actual === expected, `expected: ${expected}, actual: ${actual}`);
  },
});

Deno.test({
  name: "cannot resolve toml plugin with version",
  permissions: {
    read: true,
  },
  async fn() {
    const actual = await tryResolvePluginUrl(
      new URL("https://example.com/moon@1.0.0.toml"),
    );
    const expected = undefined;
    assert(actual === expected, `expected: ${expected}, actual: ${actual}`);
  },
});

Deno.test({
  name: "can resolve valid wasm plugin",
  permissions: {
    read: true,
  },
  async fn() {
    const actual = await tryResolvePluginUrl(
      new URL("https://example.com/node@1.0.0"),
    );
    const expected = nodePlugin.url.replaceAll("{version}", "1.0.0");
    assert(actual === expected, `expected: ${expected}, actual: ${actual}`);
  },
});

Deno.test({
  name: "cannot resolve wasm plugin without version",
  permissions: {
    read: true,
  },
  async fn() {
    const actual = await tryResolvePluginUrl(
      new URL("https://example.com/node"),
    );
    const expected = undefined;
    assert(actual === expected, `expected: ${expected}, actual: ${actual}`);
  },
});
