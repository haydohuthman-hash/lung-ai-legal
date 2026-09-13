# Public Patch progress cards

Deploy this directory unchanged to `share/` on the existing `haydohuthman-hash/lung-ai-legal` GitHub Pages site. Existing legal files are not part of this release.

Example: `https://haydohuthman-hash.github.io/lung-ai-legal/share/?d=14&q=small-steps`

The query contains only the journey day number and one stable ID from six original Patch quotes. It never includes a name, habit, account ID, log, or authentication token. A card is a share-time snapshot: a later check-in or setback does not change its count. The count is a journey day, not a verified abstinence streak. This is a public, editable URL, not proof of an achievement.

The app and this page share `model.js` and `card.js`, keeping quote wording, URL validation, and 1080×1350 PNG export identical. Unknown quotes, missing or repeated fields, malformed or out-of-range counts show an unavailable state. Text from a query is never injected as HTML. The page makes no API, analytics, account, or storage calls.

Messages/social crawlers receive the static branded `og.png`. The personalized count and quote are visible after opening the link. Use the app's share image action for a personalized feed/story attachment. Dynamic personalized Open Graph previews would need a server/edge image service and are not represented as supported.

Brand assets are copied from the existing Patch app: `mascot.png` is the happy sprite cropped from `public/patch/mascot-atlas.png`; `favicon.svg` is the existing app mark. Fonts are the existing Fraunces and Inter assets, with their licenses. No new AI-generated artwork is used.
