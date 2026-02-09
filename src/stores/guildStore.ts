import { create } from 'zustand';

interface GuildStore {
  currentGuildId: string | null;
  currentGuildName: string | null;
  lastLoadedSlotId: string | null;

  setActiveGuild: (guildId: string, guildName: string) => void;
  setLastLoadedSlot: (slotId: string | null) => void;
  clearActiveGuild: () => void;
}

export const useGuildStore = create<GuildStore>((set) => ({
  currentGuildId: null,
  currentGuildName: null,
  lastLoadedSlotId: null,

  setActiveGuild: (guildId, guildName) =>
    set({ currentGuildId: guildId, currentGuildName: guildName }),

  setLastLoadedSlot: (slotId) =>
    set({ lastLoadedSlotId: slotId }),

  clearActiveGuild: () =>
    set({ currentGuildId: null, currentGuildName: null, lastLoadedSlotId: null }),
}));
