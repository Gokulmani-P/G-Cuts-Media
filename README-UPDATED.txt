# G-Cuts Media — Updated Website Additions

This package preserves the existing G-Cuts Media site and adds the requested modules.

## Added
- Works tab with 5 autoplaying, muted video-phone frames; arrows + swipe; center reel is sharp, side reels softly blurred.
- Graphic Designs tab with a slow one-row horizontal wipe of 6 equal 4:5 posters.
- G-Cuts AI floating assistant with site-knowledge responses and an optional API endpoint hook in `script.js`.
- Sticky Back to Top button that appears after scrolling and returns to the home anchor.
- Founder section for Gokulmani.
- Careers section with Video Editor, Content Writer, Social Media Manager, Videographer and Ads Manager; each Apply Now button opens in a new tab.

## Before publishing
1. Replace `assets/founder-gokulmani.jpg` with the founder photo. A fallback GM avatar appears until the photo is supplied.
2. Replace the five demo MP4s in `assets/videos/` with the final reels. Keep the filenames or update the five `<video src>` paths.
3. Replace each `https://example.com/` career link with the final external application form URL.
4. For a true external LLM chatbot, set `AI_ENDPOINT` in `script.js` to your secure backend endpoint; the UI already falls back to the built-in site knowledge assistant.

The original site sections, styling and scripts are retained and extended rather than replaced.
