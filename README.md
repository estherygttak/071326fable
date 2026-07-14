# 🌱 Seed of the Word — Scripture Memory App

A web app that helps you hide God's Word in your heart, built around four themes:
**The Gospel**, **God With Us (Immanuel)**, **The Faithful God Who Answers Prayer**, and **World Evangelization**.

Scripture text is from the **New International Version (NIV)**.

## Features

| Feature | Description |
|---|---|
| Today's Verse | A different verse for each day of the year |
| Verse Cards | Browse 37 verses across the 4 themes |
| Memorize | Flashcard · Fill in the Blanks (3 levels) · Type It Out (auto-graded) |
| Progress | Each verse grows through Seed → Sprout → Growing → Fruit stages, saved in your browser |
| Prayer | Generates a prayer that meditates on the selected verse, via the Claude API |
| Card Images | Generates devotional background art for a verse with Higgsfield (Soul model) |

## Running the app

It's a static web app — no build step required.

```bash
# Option 1: open the file directly
open index.html

# Option 2: local server (recommended)
npx serve .
# or
python3 -m http.server 8000
```

## API keys

Enter your keys via the **⚙️ Settings** button in the top-right corner.
Keys are stored only in your browser's `localStorage` and sent directly to each service only when that feature is used.

| Key | Used for | Where to get it |
|---|---|---|
| Anthropic API key | Prayer writing | https://platform.claude.com/ |
| Higgsfield API key + secret | Image generation | https://higgsfield.ai/ |

## APIs used

### Prayer writing — Anthropic Messages API

Called directly from the browser (with the `anthropic-dangerous-direct-browser-access: true` header).
Model: `claude-opus-4-8`

### Image generation — Higgsfield Soul

```
POST https://platform.higgsfield.ai/v1/text2image/soul
Headers: hf-api-key, hf-secret
Body: { "params": { "prompt", "width_and_height", "quality", "batch_size" } }
```

After submitting, the app polls `GET /v1/job-sets/{id}` and shows the image when it's ready.
Result links expire after about 1 hour, so download the image if you want to keep it.

> **CORS note**: If the Higgsfield API does not allow direct browser calls (CORS),
> you'll see a "Could not reach the Higgsfield API" error. In that case, run a small
> proxy server and point `HF_BASE` in `app.js` at it.

## Project structure

```
index.html   # Page structure
styles.css   # Styles
verses.js    # Verse data (4 themes × 37 verses, NIV)
app.js       # App logic (memorization, prayer/image generation, progress)
```

## Verse themes

- ✝️ **The Gospel** — John 3:16, Rom 3:23, Rom 6:23, Rom 5:8, John 14:6, Eph 2:8-9, John 1:12, 2 Cor 5:17, Rom 10:9, Acts 4:12
- 🕊️ **God With Us** — Matt 1:23, Matt 28:20, Josh 1:9, Isa 41:10, Ps 23:1, Ps 23:4, Deut 31:8, Ps 46:1, Isa 43:2
- 🙏 **God Who Answers Prayer** — Jer 33:3, Matt 7:7-8, Phil 4:6-7, 1 John 5:14, Ps 50:15, Lam 3:22-23, 1 Cor 10:13, John 15:7, 1 Thess 5:24
- 🌍 **World Evangelization** — Matt 28:19, Acts 1:8, Mark 16:15, Matt 24:14, Rom 1:16, Isa 6:8, Hab 2:14, Rev 7:9, Ps 96:3

> "I have hidden your word in my heart that I might not sin against you." (Psalm 119:11)

---

Scripture quotations taken from The Holy Bible, New International Version® NIV®.
Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission. All rights reserved worldwide.
