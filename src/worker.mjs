export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    // 1. Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    let targetUrl;

    // 2. Handle /v1/models query specifically
    if (url.pathname.endsWith("/models") || url.pathname.endsWith("/models/")) {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models${url.search}`;
    } else {
      // 3. Forward chat completions directly to Google's OpenAI endpoint
      const cleanPath = url.pathname.replace(/^\/v1/, "");
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/openai${cleanPath}${url.search}`;
    }

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

    // 4. Return response with CORS headers
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
