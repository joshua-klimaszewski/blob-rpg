I want to start building some sort of RPG game. Your first implementation task is to build out our CLAUDE.md file and build a plan into source control documenting our journey. I have written this prompt into initial-thoughts.md. this is gonna be a doozy!

Requirements

1. works well on mobile
2. react + github actions stack, the repository is already connected, public, and has github actions set up in settings/pages

I'm inspired especially by the feedback loop of etrian odyssey. I think we can start here to form the general game experience. What i love about it is the core game cycle of

1. adventuring into a dungeon, mapping out what you can, the tension between progressing further and maybe dying and losing your loot/needing to spend resources reviving party members at the benefit of reaching the next checkpoint where you can safely warp back to town with more of the dungeon explored.

2. returning to town, resting/reviving your characters, buying/selling/unlocking new equipment from the monster loot you accuired, improving each character's skill tree from the experience they gained, progressing the story, etc.

3. adventuring further into the dungeon, loop loop loop, etc...

So we need to research etrian odyssey heavily so you understand the core game mechanics. The skill tree and class tree is also my favorite of any rpg i've played so i want to use those as a starting placement.

other games that i enjoy the skill tree for: final fantasy tactics, final fantasy 6, stella glow

---

The dungeon experience we will want to design from the ground up to work on mobile. i want to retain the core etrian odyssey experience, but have more of a tap experience to move the character along - i.e. a swipe up will progress the character and any enemies one square.. this actually sounds a lot like pokemon mystery dungeon to me now that i'm thinking about it. enemies/dungeon layout can be arrange in a puzzle like fashion that the character could either smartly avoid or collide into and trigger battles. We should also have random battles that trigger the more steps the character takes. again etrian odyssey has a great system for this where a bar goes from green to red with every step. characters can have specific skills in their skill trees to manage this and you can build exploration parties that can gather resources and avoid enemies.

---

save state: for the MVP, we can leverage local storage to save a characters progress. however this will be very important technically to build into the game as i expect it to be something to be played in multiple sessions in the browser. If the game grows outside the bounds of what local storage can provide we will just build a server.

---

aesthetics: i want to focus for now on minimal, black and white design. think wire-framing for rapid development. we want to avoid clutter as much as possible and make smart design descisions to let the game be great on mobile devices.

---

workflow (build this into CLAUDE.md):

- we want to develop in short cycles of work and then push and publish to github. we want to track all work in plan.md files in source control. we want to meticulously update plan files as we accomplish and discover new work. this will be key for context.

- for our conversation cycle, think deeply about the problem and then interview me first with any questions you may have and then any and all options you can come up with. we might want to save multiple options into our plan.md files so we can save our work. again, these .md files are crucial for use to document our journey together.
