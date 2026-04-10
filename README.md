# bittercherry

Downloads the daily Bombay Samachar PDF and sends it to a WhatsApp contact.

## Setup

Create a `.env` file in the project root:

```
CONTACT_NAME=Mom
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Install dependencies and build:

```bash
npm install
npx playwright install chromium
npm run build
```

First run (to scan the WhatsApp Web QR code):

```bash
node dist/main.js
```

## Scheduled execution

A systemd user timer runs the app daily at 6:00 PM local time.

### Check status

```bash
systemctl --user list-timers bittercherry.timer
systemctl --user status bittercherry.service
```

### View logs

```bash
journalctl --user -u bittercherry.service
journalctl --user -u bittercherry.service -f   # follow live
```

### Run manually

```bash
systemctl --user start bittercherry.service
```

### Disable / re-enable

```bash
systemctl --user disable --now bittercherry.timer
systemctl --user enable --now bittercherry.timer
```
