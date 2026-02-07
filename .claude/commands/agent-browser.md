# Agent Browser — Visual App Testing

Open the Blob RPG app in a real browser, screenshot each screen, and report what you see.

## Instructions

1. **Start the dev server** (if not already running):
   - Run `npm run dev` in the background
   - Wait a moment for Vite to be ready

2. **Open the app**:
   - Run `agent-browser open http://localhost:5173/blob-rpg/`
   - This launches a headless Chromium browser and returns a session

3. **Create screenshot directory**:
   - Run `mkdir -p ~/Desktop/blob-rpg-screenshots`

4. **Screenshot the initial screen**:
   - Run `agent-browser screenshot --save ~/Desktop/blob-rpg-screenshots/$(date +%Y%m%d-%H%M%S)-initial.png`
   - Read the screenshot file to see what the app looks like

5. **Navigate through each screen**:
   - Use `agent-browser snapshot` to see clickable elements on the page
   - Click navigation elements (Town, Dungeon, Combat buttons) using `agent-browser click`
   - After each navigation, take a screenshot with a descriptive filename:
     - `~/Desktop/blob-rpg-screenshots/$(date +%Y%m%d-%H%M%S)-town.png`
     - `~/Desktop/blob-rpg-screenshots/$(date +%Y%m%d-%H%M%S)-dungeon.png`
     - `~/Desktop/blob-rpg-screenshots/$(date +%Y%m%d-%H%M%S)-combat.png`
   - Read each screenshot to inspect the visual state

6. **Close the browser session**:
   - Run `agent-browser close`

7. **Report**:
   - Summarize what each screen looks like
   - Note any visual issues, broken layouts, or missing elements
   - List all screenshots saved to `~/Desktop/blob-rpg-screenshots/`

## Notes

- If the dev server is already running, skip step 1
- If a screen doesn't exist yet (placeholder), still screenshot it and note that
- Use `agent-browser snapshot` before clicking to identify the correct elements
- All screenshots go to `~/Desktop/blob-rpg-screenshots/` with timestamped filenames
