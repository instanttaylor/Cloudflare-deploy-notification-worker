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
    console.log("Incoming payload:", JSON.stringify(payload));
    const data = payload?.data;

    // Fall back to raw JSON if we can't parse the expected structure
    if (!data || !data.project_name) {
      console.log("No structured data found, sending raw");
      const rawResp = await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: { "Title": "Deploy Webhook (raw)" },
        body: JSON.stringify(payload, null, 2),
      });
      console.log("ntfy raw response:", rawResp.status, await rawResp.text());
      return new Response("Notified (raw)", { status: 200 });
    }

    const success = data.event === "EVENT_DEPLOYMENT_SUCCESS";
    const env_name = data.environment === "ENVIRONMENT_PRODUCTION" ? "production" : "preview";
    const shortHash = data.commit_hash ? data.commit_hash.slice(0, 7) : "";
    const dashboardUrl = `https://dash.cloudflare.com/${data.account_tag}/pages/view/${data.project_name}/${data.deployment_id}`;

    const title = success
      ? `${data.project_name} deployed to ${env_name}`
      : `${data.project_name} deploy failed (${env_name})`;

    const bodyLines = [
      shortHash && `Commit: ${shortHash}`,
      data.preview_url && `Preview: ${data.preview_url}`,
      data.pages_dev_url && `Site: ${data.pages_dev_url}`,
    ].filter(Boolean);

    const headers = {
      "Title": title,
      "Tags": success ? "white_check_mark" : "x",
      "Click": dashboardUrl,
    };

    if (!success) {
      headers["Priority"] = "high";
    }

    console.log("Sending to ntfy:", { topic, title, bodyLines });
    const ntfyResp = await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers,
      body: bodyLines.join("\n"),
    });
    console.log("ntfy response:", ntfyResp.status, await ntfyResp.text());

    return new Response("Notified", { status: 200 });
  },
};
