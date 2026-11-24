# Betawi Motion

An Indonesian wedding invitation in Betawi style, packaged as a static website. Event content is stored separately from the template.

The page opens on a cover with an arch portrait. Tapping **Buka Undangan** plays the opening scene: a rumah kebaya by a lake under pastel mountains. The camera pulls back from the meadow, then:

- flowers rise from the bottom
- the kembang kelapa pop up and keep spinning
- the banana and blossom trees grow
- the gigi balang trim drops in from the top
- the hanging blossoms swing
- Javan kingfishers flap their wings and cloud motifs drift
- a mist gathers, and the couple's names appear letter by letter

Scroll-revealed sections follow, covering:

- the couple
- a countdown
- the schedule
- the love story
- a gallery
- the live stream
- gift accounts
- guest wishes
- the closing

## Run locally

Use Node.js 20 or newer.

```sh
node build.mjs
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/. Add `?to=Ibu%20Dewi` for a personalized greeting. The recipient parameter only personalizes the page. It does not authenticate guests.

## Make an invitation

1. Copy `events/ayu-raka/` to a new event slug.
2. Edit `wedding.js` in the new folder and replace the files in its `assets/` folder. The sample couple, photos, and details are fictional.
3. Run `node build.mjs <event-slug>` and deploy the contents of `dist/` to a static web host.
4. Set `demo: false` for a real wedding. In demo mode, guest wishes are saved only in each visitor's browser. Collecting them for real needs a shared endpoint. Set `contactEmail` to offer email instead.

### Event fields

**Dates.** Give each event `startsAt` and `endsAt` as ISO 8601 timestamps with explicit offsets. These drive the countdown and the calendar links.

**Map location.** Set `mapPin` to verified `latitude,longitude` coordinates. Without a pin, the map link searches by venue name and address.

**Optional fields:**

- `shortDate`
- `quote`
- `inviteLine`
- `couple[].instagram`
- `streamUrl`
- `giftAccounts`
- `giftAddress`
- `closing`

## Deploy to Vercel

The site is built, not served from the repository root. `vercel.json` tells Vercel to run `node build.mjs` and publish `dist/`. To build another event, change `buildCommand` to `node build.mjs <event-slug>`.

## Animation timing

Every step of the opening is a `--t-*` variable at the top of the Betawi theme block in `templates/betawi-motion/style.css`. Edit those values to retime the scene.

## Illustrations

The illustrations are drawn procedurally. To regenerate them, run the commands below. They need Python with Pillow, plus Playwright with Chromium.

```sh
python3 templates/betawi-motion/tools/draw.py /tmp/betawi/svg
node templates/betawi-motion/tools/render.mjs /tmp/betawi/svg /tmp/betawi/png
python3 templates/betawi-motion/tools/pack.py /tmp/betawi/png /tmp/betawi/gigi-balang.svg
```

You can replace any `.webp` in `templates/betawi-motion/assets/` with a painted version of the same size and transparency.

Keep guest lists, RSVP records, and other private event data out of the repository.
