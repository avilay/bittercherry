import "dotenv/config";

export const config = {
  // WhatsApp contact name as it appears in your chat list
  contactName: process.env.CONTACT_NAME || "Anika Parekh",

  // Discord webhook URL for error notifications
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || "",

  // Directory to store downloaded PDFs
  downloadDir: "downloads",

  // Directory to store browser session
  authDir: "auth_info",
};
