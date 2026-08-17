export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // Forward path directly to Google's official OpenAI-compatible endpoint
    const url = new URL(request.url);
    const cleanPath = url.pathname.replace(/^\/v1/, "");
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/openai${cleanPath}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");

    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: "follow",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Reconstruct response with clean CORS headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
