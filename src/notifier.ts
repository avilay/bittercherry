import axios from "axios";
import { config } from "./config.js";

/**
 * Send an error notification to Discord via webhook.
 * Failures here are caught and logged so they don't mask the original error.
 */
export async function notifyError(err: Error): Promise<void> {
  if (!config.discordWebhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not set, skipping notification");
    return;
  }

  try {
    await axios.post(
      config.discordWebhookUrl,
      {
        content: `**bittercherry failed**\n\`\`\`\n${err.message}\n\`\`\``,
      },
      { timeout: 10000 },
    );
  } catch (notifyErr) {
    console.error("Failed to send Discord notification:", notifyErr);
  }
}
