/**
 * Party Store
 *
 * Zustand store that manages the persistent party roster.
 * Bridges character system to React components and combat store.
 */

import { create } from 'zustand';
import type { PartyMemberState, CombatEntity } from '../types/combat';
import type { EquipmentSlot } from '../types/character';
import { getClass, getSkill } from '../data/classes/index';
import { getEquipment } from '../data/items/index';
import {
  createPartyMember,
  processLevelUps,
  recalculatePartyMember,
  canLearnSkill,
  learnSkill,
} from '../systems/character';

interface PartyStore {
  /** All 6 class members */
  roster: PartyMemberState[];

  /** IDs of the 4 active party members for dungeon/combat */
  activePartyIds: string[];

  /** Get the active party members */
  getActiveParty: () => PartyMemberState[];

  /** Award XP and process level-ups. By default awards to active members only (combat), set allMembers=true for quest rewards. */
  awardXp: (amount: number, allMembers?: boolean) => void;

  /** Sync HP/TP from combat back to party roster */
  syncHpTpFromCombat: (combatParty: CombatEntity[]) => void;

  /** Rest at inn (1.0 = full, 0.5 = half rest) */
  restParty: (fraction: number) => void;

  /** Equip an item to a party member */
  equipItem: (memberId: string, slot: EquipmentSlot, itemId: string | null) => void;

  /** Invest a skill point to learn a skill */
  investSkillPoint: (memberId: string, skillId: string) => boolean;

  /** Set the active party (choose 4 of 6) */
  setActiveParty: (memberIds: string[]) => void;

  /** Initialize the full 6-member roster from class data */
  initializeRoster: () => void;
}

export const usePartyStore = create<PartyStore>((set, get) => ({
      roster: [],
      activePartyIds: [],

      getActiveParty: () => {
        const { roster, activePartyIds } = get();
        return activePartyIds
          .map((id) => roster.find((m) => m.id === id))
          .filter((m): m is PartyMemberState => m !== undefined);
      },

      awardXp: (amount, allMembers = false) => {
        set((state) => {
          const newRoster = state.roster.map((member) => {
            // Skip inactive members unless allMembers is true (for quest rewards)
            if (!allMembers && !state.activePartyIds.includes(member.id)) return member;

            const updated = { ...member, xp: member.xp + amount };
            const classData = getClass(updated.classId);
            const { member: leveled } = processLevelUps(updated, classData);

            // Recalculate stats to restore equipment + passive bonuses after level-up
            const equippedItems = Object.values(leveled.equipment)
              .filter((id): id is string => id !== null)
              .map((id) => getEquipment(id))
              .filter((eq): eq is NonNullable<typeof eq> => eq !== undefined);

            return recalculatePartyMember(leveled, classData, equippedItems, getSkill);
          });

          return { roster: newRoster };
        });
      },

      syncHpTpFromCombat: (combatParty) => {
        set((state) => {
          const newRoster = state.roster.map((member) => {
            const combatEntity = combatParty.find((e) => e.id === member.id);
            if (!combatEntity) return member;

            return {
              ...member,
              hp: combatEntity.hp,
              tp: combatEntity.tp,
            };
          });

          return { roster: newRoster };
        });
      },

      restParty: (fraction) => {
        set((state) => ({
          roster: state.roster.map((member) => ({
            ...member,
            hp: Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * fraction)),
            tp: Math.min(member.maxTp, member.tp + Math.floor(member.maxTp * fraction)),
          })),
        }));
      },

      equipItem: (memberId, slot, itemId) => {
        set((state) => {
          const newRoster = state.roster.map((member) => {
            if (member.id !== memberId) return member;

            const newEquipment = { ...member.equipment, [slot]: itemId };
            const updatedMember = { ...member, equipment: newEquipment };

            // Resolve equipped items to definitions for stat recalc
            const equippedItems = Object.values(newEquipment)
              .filter((id): id is string => id !== null)
              .map((id) => getEquipment(id))
              .filter((eq): eq is NonNullable<typeof eq> => eq !== undefined);

            const classData = getClass(member.classId);
            return recalculatePartyMember(updatedMember, classData, equippedItems, getSkill);
          });

          return { roster: newRoster };
        });
      },

      investSkillPoint: (memberId, skillId) => {
        const { roster } = get();
        const member = roster.find((m) => m.id === memberId);
        if (!member) return false;

        const skill = getSkill(skillId);
        const check = canLearnSkill(member, skill);
        if (!check.canLearn) return false;

        set((state) => ({
          roster: state.roster.map((m) => {
            if (m.id !== memberId) return m;

            const learned = learnSkill(m, skill);

            // Recalculate stats to apply passive bonuses if a passive was learned
            const equippedItems = Object.values(learned.equipment)
              .filter((id): id is string => id !== null)
              .map((id) => getEquipment(id))
              .filter((eq): eq is NonNullable<typeof eq> => eq !== undefined);

            const classData = getClass(learned.classId);
            return recalculatePartyMember(learned, classData, equippedItems, getSkill);
          }),
        }));

        return true;
      },

      setActiveParty: (memberIds) => {
        set({ activePartyIds: memberIds.slice(0, 4) });
      },

      initializeRoster: () => {
        const classIds = ['ironblob', 'strikblob', 'hexblob', 'sparkblob', 'mendblob', 'toxblob'];
        const roster = classIds.map((classId, idx) => {
          const classData = getClass(classId);
          return createPartyMember(`party-${idx + 1}`, classData.name, classData);
        });

        // Default active party: first 4
        const activePartyIds = roster.slice(0, 4).map((m) => m.id);

        set({ roster, activePartyIds });
      },
}));
