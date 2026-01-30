export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    const topic = env.NTFY_TOPIC;
    if (!topic) {
      return new Response("NTFY_TOPIC not configured", { status: 500 });
    }

    const payload = await request.json().catch(() => null);

    // Forward the raw payload until we know the exact Cloudflare field names
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Title": "Site Deployed" },
      body: JSON.stringify(payload, null, 2),
    });

    return new Response("Notified", { status: 200 });
  },
};
