import { tryResolvePluginUrl } from "./resolver.ts";

Deno.serve(async (request) => {
  const requestUrl = new URL(request.url);
  const pluginUrl = await tryResolvePluginUrl(requestUrl);

  if (pluginUrl) {
    return new Response(null, {
      status: 302,
      headers: {
        location: pluginUrl,
      },
    });
  }

  return new Response(null, {
    status: 404,
    statusText: "Not Found",
  });
});
