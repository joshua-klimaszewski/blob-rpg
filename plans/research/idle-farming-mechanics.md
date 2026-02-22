# Idle Farming Mechanics — Research & Ideas

> **Goal:** Add a self-managing passive system that generates value while the player is dungeon diving (or offline). Think Monster Hunter Meowcenaries, Xenoblade Merc Missions, or Pokémon Pelago — a "set it and forget it" system that rewards engagement without demanding it.

---

## Design Principles (from research)

Before the ideas, a few ground rules distilled from studying idle/dispatch systems across dozens of RPGs:

1. **Supplement, never replace.** Idle output should be ~15-25% of what active dungeon runs provide. It handles the grind so active play can focus on the exciting stuff (rare drops, conditional kills, boss attempts).
2. **Interesting choices, not busywork.** If there's one obviously correct dispatch, it's not a system — it's a chore. Composition, destination, and risk/reward tradeoffs should create genuine decisions.
3. **Tie progress to the main game.** Deeper dungeon floors cleared = better idle options unlocked. The idle system should be a reward for active achievement, not a parallel track.
4. **Respect player time.** 2-5 minutes of management per session. Provide "repeat last" and eventual automation as progression rewards.
5. **Cap offline accumulation.** 3-5 completed tasks max before the system pauses. Prevents backlog anxiety while still rewarding return visits.
6. **Never gate critical progression behind timers.** Boss keys, story items, and class-defining gear come from active play only.

---

## The 10 Ideas

### 1. Blob Expeditions (Direct Meowcenary Analogue)

**Inspiration:** Monster Hunter Meowcenaries, Xenoblade Merc Missions

**Concept:** From the Guild in town, dispatch reserve blobs (those not in your active party of 4) on timed expeditions to previously-cleared dungeon regions. They return with materials, gold, and XP.

**Mechanics:**
- Unlock expedition slots as you clear dungeon floors (Floor 1 = 1 slot, Floor 3 = 2 slots, Floor 5 = 3 slots)
- Each expedition targets a specific dungeon region and has a recommended power level
- Blob class composition affects results: Toxblob finds more rare herbs, Strikblob clears faster, Mendblob reduces failure chance
- Expeditions complete after N dungeon floors explored (hybrid timer: also ticks slowly in real-time for offline)
- Returns: common materials from that dungeon region (the stuff you'd otherwise grind for the material-unlock shop)
- Risk factor: blobs can return injured (reduced HP for their next expedition) if underpowered

**Why it works for Blob RPG:** Directly feeds the existing material-unlock shop. Frees up active dungeon runs to focus on pushing deeper rather than re-farming Floor 1 for Slime Gel. Uses the 6-class system for composition decisions. Reserve blobs (the 2 not in your party) have a purpose.

**Complexity:** Medium. Needs expedition data per region, composition bonuses, timer system, reward tables.

---

### 2. The Blob Garden (Passive Growth System)

**Inspiration:** Fire Emblem Three Houses Greenhouse, Pokémon Pelago Isle Abeens, Stardew Valley

**Concept:** A garden plot in town where you plant seeds/spores found in dungeons. Crops grow over time and yield consumables, TP restoratives, or special cooking ingredients. The garden tends itself — you just plant and harvest.

**Mechanics:**
- 3-6 garden plots, unlocked gradually through town upgrades
- Seeds are dungeon drops (common, found on specific floors)
- Each seed has a grow time (3-5 dungeon runs or 2-4 hours real-time)
- Yields: healing herbs, TP tonics, status cure ingredients, rare "golden" variants at low chance
- Blob assignment: optionally assign a blob to tend the garden for bonus yield (+25% harvest) or faster growth
- Seasonal/rotation mechanic: planting the same crop repeatedly in the same plot reduces yield (encourages variety)

**Why it works for Blob RPG:** Creates a consumable pipeline independent of the shop. Gives dungeon seed drops meaning. The "assign a blob" choice creates a tradeoff (garden tender vs expedition member vs party member). Simple to understand, satisfying to harvest.

**Complexity:** Low-Medium. Seed data, plot state, growth timers, harvest rewards.

---

### 3. Blob Training Grounds (Passive XP/Stat Training)

**Inspiration:** Fire Emblem dispatch XP, Pokémon Poké Jobs, Disgaea's Chara World

**Concept:** A training facility in town where benched blobs can train specific stats while you dungeon dive. Not just generic XP — you choose WHAT they train (ATK drills, DEF drills, AGI courses), and the training takes time.

**Mechanics:**
- Assign idle blobs to training regimens: STR, VIT, INT, AGI, or general XP
- Training yields small stat bonuses (+1-2 per session) or XP equivalent to half a dungeon run
- Higher-tier training unlocked by dungeon progress (Floor 3 unlocks Advanced drills, Floor 5 unlocks Elite)
- Diminishing returns: each successive session of the same stat type yields less until you rotate
- Special paired training: two blobs training together gain a "bond" bonus (small synergy effect in combat)

**Why it works for Blob RPG:** Solves the "benched blob falls behind" problem inherent in 4-of-6 party selection. Encourages class rotation since your reserves stay competitive. The stat-choice adds meaningful decisions. Bond bonuses reward experimenting with different pairings.

**Complexity:** Low. Stat increments, diminishing returns curve, timer per regimen.

---

### 4. The Slime Foundry (Passive Crafting/Transmutation)

**Inspiration:** Warframe Foundry, Atelier series auto-synthesis, Suikoden castle workshops

**Concept:** A workshop in town where you queue up crafting recipes that process over time. Combine materials into equipment, consumables, or upgrade stones. The foundry works while you're away.

**Mechanics:**
- Deposit materials + gold into a crafting queue (1-3 slots)
- Each recipe has a crafting time (scales with item rarity)
- Early recipes: basic potions, low-tier armor upgrades
- Late recipes: equipment enchantments, rare accessories, material transmutation (convert 5 common drops into 1 uncommon)
- Foundry upgrades: spend gold/materials to add queue slots, reduce craft time, unlock new recipe tiers
- Discovery mechanic: experimenting with unusual material combinations can discover new recipes

**Why it works for Blob RPG:** Extends the existing material-unlock shop with a crafting layer. Gives excess materials a sink (transmutation). Creates a parallel progression track for equipment that doesn't require combat. The discovery mechanic adds exploration within the idle system itself.

**Complexity:** Medium-High. Recipe database, material combinations, discovery logic, queue management.

---

### 5. Dungeon Scout Network (Intel/Map Reveal System)

**Inspiration:** Etrian Odyssey's cartography emphasis, FTL's scanner upgrades, Darkest Dungeon scouting

**Concept:** Deploy scout blobs to map out unexplored dungeon sections. They return with intel: floor maps, enemy weakness data, hidden room locations, and FOE patrol patterns. Information is the reward, not materials.

**Mechanics:**
- Send a blob to scout a dungeon floor you haven't fully mapped yet
- Scout duration based on floor complexity (larger floors take longer)
- Returns: partial map reveals, enemy stat dossiers (showing weaknesses/resistances), hidden passage hints, FOE movement patterns
- Scout class bonuses: Hexblob scouts identify enemy binds vulnerabilities, Toxblob reveals ailment weaknesses, Sparkblob finds trap tile locations
- Higher risk = more intel: you can push scouts deeper into unexplored territory for better info, but they may return with less if they get overwhelmed

**Why it works for Blob RPG:** Uniquely fits EO-inspired dungeon crawling where information IS power. Knowing a FOE's patrol route or a boss's weakness before you engage is a genuine tactical advantage. Doesn't give free materials — gives free knowledge. The cartography connection is thematically perfect.

**Complexity:** Medium. Intel data per floor, map reveal system integration, scout risk calculation.

---

### 6. The Blob Bazaar (Passive Trade/Economy System)

**Inspiration:** Monster Hunter Argosy, Recettear, Moonlighter, Suikoden trade routes

**Concept:** Establish trade routes with off-screen settlements. Send a merchant blob with goods to sell; they return with different goods and gold. Market prices fluctuate, so timing and route choice matter.

**Mechanics:**
- 2-4 trade route slots, each to a different "region" (unlocked by dungeon progress)
- Load outgoing cargo: surplus materials, crafted goods, dungeon loot
- Each route has a travel time and return cargo profile (Route A favors weapon materials, Route B favors consumable ingredients)
- Market fluctuation: simple rotating multipliers (this cycle: herbs 2x value, ores 0.5x value)
- Merchant blob's class affects bargaining: any class can go, but certain classes get bonuses on certain routes
- Rare trade events: occasionally a route returns with a unique item unavailable any other way (cosmetic, lore item, or minor accessory)

**Why it works for Blob RPG:** Adds economic depth without combat. Gives surplus materials from expeditions/farming a purpose (sell high on favorable routes). Market fluctuation creates a light strategy layer. The rare trade events add a "gacha-like" surprise without actual gacha.

**Complexity:** Medium. Route data, cargo system, price fluctuation tables, rare event tables.

---

### 7. Defensive Perimeter (Town Defense / Idle Tower Defense)

**Inspiration:** Dungeon Maker, Clash of Clans, ActRaiser, Suikoden castle defense

**Concept:** Monsters periodically probe the town's defenses while you're dungeon diving. Assign reserve blobs to guard posts around town. When you return, see a battle log of what attacked and how your defenders handled it. Successful defenses yield bonus rewards.

**Mechanics:**
- Town has 2-4 guard posts (unlocked progressively)
- Assign idle blobs to posts; their stats and class determine defense effectiveness
- Attack waves are auto-resolved based on defender stats vs attacker power (no player input needed)
- Attack frequency and difficulty scales with dungeon progress (the deeper you go, the more attention your town draws)
- Rewards: bonus gold, occasional material drops from defeated attackers, town reputation points
- Failure consequence: minor (lost gold, damaged shop inventory requiring repair cost) — never catastrophic
- Upgrade guard posts with materials to provide defensive bonuses

**Why it works for Blob RPG:** Creates narrative tension (the dungeon fights back!). Gives reserve blobs a defensive role that feels different from expeditions. The battle log is fun to read. Ties dungeon progress to town risk, creating an interesting push-your-luck dynamic. The "your town was attacked while you were away" message is a compelling return hook.

**Complexity:** Medium. Attack wave generation, auto-resolve combat, guard post upgrade tree, battle log rendering.

---

### 8. Ooze Synthesis Lab (Blob Breeding/Mutation System)

**Inspiration:** Pokémon breeding/eggs, Dragon Quest Monsters fusion, Monster Rancher, Slime Rancher

**Concept:** Combine essence collected from dungeon enemies with your blobs' own ooze to synthesize new blob variants or mutate existing blobs' skill sets. The synthesis takes time and the outcome has controlled randomness.

**Mechanics:**
- Collect "essence" drops from dungeon enemies (alongside normal materials)
- Deposit essence + a blob into the Synthesis Lab
- After a synthesis period, the blob emerges with a mutation: a new passive skill, a stat redistribution, or a visual variant
- Mutation outcomes weighted by essence type (fire enemy essence + Sparkblob = fire-affinity skills; poison enemy essence + Toxblob = enhanced ailment potency)
- Rare mutations from boss essence (unique passives unavailable through normal skill trees)
- Limited synthesis slots (1-2), and each blob can only mutate N times (prevents infinite stacking)
- The blob is unavailable during synthesis (opportunity cost)

**Why it works for Blob RPG:** Adds deep character customization through the idle system. "What mutation will I get?" creates anticipation (variable ratio reinforcement). Essence collecting gives another reason to fight varied enemies. Ties back into the core combat loop since mutations affect combat effectiveness. Thematically perfect — blobs are amorphous, mutation is in their nature.

**Complexity:** High. Mutation tables, essence system, skill injection logic, variant tracking.

---

### 9. The Dream Archive (Offline Story/Lore Discovery)

**Inspiration:** Xenoblade heart-to-hearts, Persona Confidant system, Hades NPC conversations, Cookie Clicker's "news ticker"

**Concept:** While idle, blobs "dream" and uncover fragments of world lore, character backstory, and hints about dungeon secrets. It's a passive narrative system — the longer between sessions, the more dream fragments accumulate.

**Mechanics:**
- Each blob generates dream fragments over time (real-time, ticks offline)
- Dreams are short text vignettes (2-4 sentences): world lore, blob backstory, hints about hidden dungeon rooms, enemy weaknesses, NPC gossip
- Dream content is gated by dungeon progress (can't dream about Floor 5 secrets if you haven't reached Floor 4)
- Collecting full dream sets (e.g., all 5 fragments of "The Founding of Blobtown") unlocks a minor permanent bonus (5% XP boost, unique cosmetic, etc.)
- Certain dreams are only triggered by specific blob class + dungeon floor combinations
- Dream journal UI: a collectible codex the player fills over time

**Why it works for Blob RPG:** Zero management overhead — it literally runs itself. Provides a reason to return after long breaks ("what did my blobs dream about?"). Lore delivery that doesn't interrupt gameplay. The collection aspect appeals to completionists. Extremely low implementation complexity for a high-flavor feature. Can contain foreshadowing and hints that make the active game more rewarding.

**Complexity:** Low. Text content database, timestamp-based generation, codex/journal UI.

---

### 10. Guild Quest Board — Standing Orders (Automated Repeatable Quests)

**Inspiration:** Final Fantasy Tactics Propositions/Errands, MMO work orders, Assassin's Creed Brotherhood assassin missions

**Concept:** Evolve the existing Guild quest board into a system where completed quest types can be set to "standing order" — your reserve blobs automatically re-run them in the background, generating steady income at reduced rates.

**Mechanics:**
- After completing a Guild quest manually 3 times, unlock it as a "Standing Order"
- Assign 1-2 reserve blobs to fulfill the standing order passively
- Standing orders complete at 50% the reward rate of manual completion (supplement, not replace)
- Standing order types: "Hunt X enemies" returns gold + common drops; "Gather Y materials" returns specific resources; "Patrol Floor Z" returns map intel + small XP
- Standing order capacity: start with 1 slot, upgrade to 3 via Guild reputation
- Blob fitness: blobs assigned to standing orders that match their class strengths complete faster (Strikblob on hunt orders, Mendblob on gather orders)
- Weekly rotation: available standing orders rotate weekly, preventing stale optimization

**Why it works for Blob RPG:** Builds on an existing system (Guild quest board) rather than adding a completely new one. Natural progression: manual quests -> mastery -> automation. The "3 completions to unlock" mechanic from incremental game design gives a satisfying prestige moment. Low cognitive load — the player already knows these quests, they're just automating them. Weekly rotation keeps it fresh.

**Complexity:** Low-Medium. Standing order state, auto-completion timer, reward scaling, rotation schedule.

---

## Comparison Matrix

| # | Idea | Feeds Into | Management Load | Offline-Friendly | Implementation Size | Unique Factor |
|---|------|-----------|----------------|-----------------|-------------------|---------------|
| 1 | Blob Expeditions | Material shop | Medium | Yes | Medium | Class composition matters |
| 2 | Blob Garden | Consumables | Low | Yes | Low-Med | Planting/harvesting loop |
| 3 | Training Grounds | Blob stats/XP | Low | Yes | Low | Solves bench problem |
| 4 | Slime Foundry | Equipment/crafting | Medium | Yes | Med-High | Recipe discovery |
| 5 | Scout Network | Dungeon intel | Low-Med | Yes | Medium | Info as reward (unique) |
| 6 | Blob Bazaar | Gold/trade goods | Medium | Yes | Medium | Market fluctuation |
| 7 | Defensive Perimeter | Gold/reputation | Low-Med | Yes | Medium | Narrative tension |
| 8 | Ooze Synthesis | Blob customization | Low | Yes | High | Controlled randomness |
| 9 | Dream Archive | Lore/collection | None | Yes | Low | Zero-management flavor |
| 10 | Standing Orders | Gold/materials | Low | Yes | Low-Med | Builds on existing system |

---

## Recommended Combinations

These ideas aren't mutually exclusive. Some natural pairings:

**Minimum Viable Idle (pick 2):**
- **#1 Blob Expeditions + #3 Training Grounds** — Covers materials AND XP. Reserve blobs always have something useful to do. Straightforward to build.

**The Full Economy (pick 3-4):**
- **#1 Expeditions + #4 Foundry + #6 Bazaar** — Expeditions gather materials, Foundry crafts them into goods, Bazaar trades surplus for gold. A complete production chain.

**Flavor-First (pick 2-3):**
- **#9 Dream Archive + #5 Scout Network + #7 Defensive Perimeter** — All three are more about world-building and narrative than raw resource generation. Creates a living, breathing town that has things happening in it.

**Build-on-Existing (pick 2):**
- **#10 Standing Orders + #2 Blob Garden** — Standing Orders extends the Guild, Garden adds a new but simple system. Lowest total implementation cost for meaningful idle content.

---

## Open Questions for Interview

1. **How many idle systems?** One focused system or 2-3 lighter ones?
2. **Real-time vs game-time?** Pure offline timers? Tied to dungeon progress? Hybrid?
3. **Reserve blob tension?** Should idle tasks compete with party slots (send a blob = weaker party), or should idle use separate "NPC" blobs?
4. **Progression pacing?** Should idle unlock early (pre-Floor 3) as a retention hook, or later (post-Floor 5) as a reward for investment?
5. **Visual presence?** Dedicated town screen for idle management, or integrated into existing town hub (Guild/Inn/Shop)?
