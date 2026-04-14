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

## PDF URL Patterns

* https://epaper.bombaysamachar.com/media/2026-03/ms_290326_msmu_01-16-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-03/ms_300326_msmu_01--14-pages-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-03/ms_310326_msmu_01-14-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-03/ms_010426_msmu_01-12-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_020426_msmu_01--14-pages-mor-insert.pdf
* `https://epaper.bombaysamachar.com/media/2026-04/ms_030426_msmu_01-16__-pages-mor-insert.pdf`
* https://epaper.bombaysamachar.com/media/2026-04/ms_040426_msmu_01-16-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_050426_msmu_01-20-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_060426_msmu_01-14-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_070426_msmu_01-14-pages-mo-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_080426_msmu_01---14-pages-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_090426_msmu_01--14-page-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_100426_msmu_01--12-pages-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_110426_msmu_01-18-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_120426_msmu_01-18-mor-insert.pdf
* https://epaper.bombaysamachar.com/media/2026-04/ms_130426_msmu_01--12-pages-mor-insert.pdf

## HTML URL Patterns

* https://epaper.bombaysamachar.com/view/2415/29-03-2026
* https://epaper.bombaysamachar.com/view/2417/30-03-2026
* https://epaper.bombaysamachar.com/view/2419/31-03-2026
* https://epaper.bombaysamachar.com/view/2421/01-04-2026
* https://epaper.bombaysamachar.com/view/2423/02-04-2026
* https://epaper.bombaysamachar.com/view/2425/03-04-2026
* https://epaper.bombaysamachar.com/view/2429/04-04-2026
* https://epaper.bombaysamachar.com/view/2431/05-04-2026
* https://epaper.bombaysamachar.com/view/2433/06-04-2026
* https://epaper.bombaysamachar.com/view/2435/07-04-2026
* https://epaper.bombaysamachar.com/view/2440/08-04-2026
* https://epaper.bombaysamachar.com/view/2442/09-04-2026
* https://epaper.bombaysamachar.com/view/2446/10-04-2026
* https://epaper.bombaysamachar.com/view/2447/11-04-2026
* https://epaper.bombaysamachar.com/view/2449/12-04-2026
* https://epaper.bombaysamachar.com/view/2451/13-04-2026

