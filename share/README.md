# Public Patch progress cards

The [public share page](https://haydohuthman-hash.github.io/lung-ai-legal/share/?s=1789257600000&q=small-steps) launched on 13 September 2026. This is the reviewed timer edition: 316 app tests and 46 browser checks passed before publication. Exact deployment commits and live verification results are recorded separately in `output/journey-timer-publication/deployment.json` and `output/journey-timer-publication/live-results.json` so this source does not contain a self-referential commit ID. Publication preserves all files outside `share/` byte-for-byte.

The original static day-card release remains documented in `output/progress-share-qa/deployment.json` and `output/progress-share-qa/live-results.json`; its old links stay compatible.

Deploy this directory unchanged to `share/` on the existing `haydohuthman-hash/lung-ai-legal` GitHub Pages site. Existing legal files are not part of this release.

New timer example: `https://haydohuthman-hash.github.io/lung-ai-legal/share/?s=1789257600000&q=small-steps`

New links contain the original journey start as Unix **milliseconds** (`s`) and one stable ID (`q`) from six original Patch quotes. The precise timestamp is public so another browser can run the same timer. Links never include a name, habit, account ID, log, or authentication token. Day 1 begins at 00:00:00; Day 2 begins after 24 elapsed hours. Every tick is calculated from the original start and the current wall clock, including after reload, background suspension, or timezone changes. A check-in or setback does not reset this journey timer. It measures time since starting, not a verified abstinence streak. This is a public, editable URL, not proof of an achievement.

Existing `?d=14&q=small-steps` links remain static snapshots of their original day count. They do not contain a start timestamp, so the page does not invent one. Mixed `s` and `d` links are rejected.

The live card updates only its text each second. The **Create image** action captures the timer at that tap and prepares a still image. A second **Save snapshot** tap shares or downloads it with browser user activation intact. The page labels the captured day and clock and offers **Refresh image snapshot**. The exported filename, pixels, and caption use the same captured instant (`File.lastModified`), even if the live timer has since reached another day. The app uses the same captured-time contract. PNGs do not animate.

The app and this page share `model.js` and `card.js`, keeping elapsed-time math, quote wording, URL validation, and 1080×1350 PNG export identical. Unknown quotes, missing or repeated fields, malformed or out-of-range timestamps/counts show an unavailable state. Invalid stored starts and future starts display Day 1 at 00:00:00; invalid new public starts are rejected. Text from a query is never injected as HTML. The page makes no API, analytics, account, or storage calls.

Messages/social crawlers receive the static branded `og.png`. The personalized timer and quote are visible after opening the link. Use the app's share image action for a personalized feed/story attachment. Dynamic personalized Open Graph previews would need a server/edge image service and are not represented as supported.

Brand assets are copied from the existing Patch app: `mascot.png` is the happy sprite cropped from `public/patch/mascot-atlas.png`; `favicon.svg` is the existing app mark. Fonts are the existing Fraunces and Inter assets, with their licenses. No new AI-generated artwork is used.
