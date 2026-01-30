# deploy-notify

A Cloudflare Worker that forwards Cloudflare Pages deployment notifications to [ntfy.sh](https://ntfy.sh) as push notifications.

## Setup

1. Clone this repo
2. Copy `.dev.vars.example` to `.dev.vars` and set your ntfy topic
3. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```
4. Set the `NTFY_TOPIC` secret for production:
   ```bash
   npx wrangler secret put NTFY_TOPIC
   ```
5. In the Cloudflare dashboard:
   - Go to **Notifications → Destinations → Webhooks → Create**
   - Set the URL to your Worker (`https://deploy-notify.<account>.workers.dev`)
   - Go to **Notifications → Create Notification**
   - Select **Project updates** (under Pages)
   - Filter by **Deployment success**
   - Set delivery to your webhook
6. Subscribe to your ntfy topic on your phone (app or browser)

## How it works

Cloudflare fires a webhook to this Worker when a Pages deploy completes. The Worker forwards the notification to your ntfy topic as a push notification.
