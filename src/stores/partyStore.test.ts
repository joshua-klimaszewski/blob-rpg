/**
 * Party Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePartyStore } from './partyStore';

describe('PartyStore', () => {
  beforeEach(() => {
    // Reset store
    usePartyStore.setState({ roster: [], activePartyIds: [] });
  });

  describe('initializeRoster', () => {
    it('creates 6 party members from all classes', () => {
      usePartyStore.getState().initializeRoster();
      const { roster } = usePartyStore.getState();

      expect(roster).toHaveLength(6);
      expect(roster[0].classId).toBe('ironblob');
      expect(roster[1].classId).toBe('strikblob');
      expect(roster[2].classId).toBe('hexblob');
      expect(roster[3].classId).toBe('sparkblob');
      expect(roster[4].classId).toBe('mendblob');
      expect(roster[5].classId).toBe('toxblob');
    });

    it('sets first 4 as active party', () => {
      usePartyStore.getState().initializeRoster();
      const { activePartyIds } = usePartyStore.getState();

      expect(activePartyIds).toHaveLength(4);
    });

    it('all members start at level 1', () => {
      usePartyStore.getState().initializeRoster();
      const { roster } = usePartyStore.getState();

      for (const member of roster) {
        expect(member.level).toBe(1);
        expect(member.xp).toBe(0);
        expect(member.skillPoints).toBe(0);
      }
    });
  });

  describe('getActiveParty', () => {
    it('returns the active 4 members', () => {
      usePartyStore.getState().initializeRoster();
      const active = usePartyStore.getState().getActiveParty();

      expect(active).toHaveLength(4);
      expect(active[0].name).toBe('Ironblob');
    });

    it('returns empty if roster not initialized', () => {
      const active = usePartyStore.getState().getActiveParty();
      expect(active).toHaveLength(0);
    });
  });

  describe('awardXp', () => {
    it('awards XP to active party members only', () => {
      usePartyStore.getState().initializeRoster();
      usePartyStore.getState().awardXp(500);

      const { roster, activePartyIds } = usePartyStore.getState();
      for (const member of roster) {
        if (activePartyIds.includes(member.id)) {
          expect(member.xp).toBe(500);
        } else {
          expect(member.xp).toBe(0);
        }
      }
    });

    it('triggers level up when XP exceeds threshold', () => {
      usePartyStore.getState().initializeRoster();
      usePartyStore.getState().awardXp(500); // L2 needs 400

      const active = usePartyStore.getState().getActiveParty();
      for (const member of active) {
        expect(member.level).toBe(2);
        expect(member.skillPoints).toBe(1);
      }
    });
  });

  describe('syncHpTpFromCombat', () => {
    it('updates HP/TP from combat entities', () => {
      usePartyStore.getState().initializeRoster();
      const active = usePartyStore.getState().getActiveParty();

      const combatParty = active.map((m) => ({
        ...m,
        definitionId: m.classId,
        hp: 10,
        tp: 5,
        position: null,
        binds: { head: 0, arm: 0, leg: 0 },
        ailments: { poison: null, paralyze: null, sleep: null, blind: null },
        resistances: { head: 0, arm: 0, leg: 0, poison: 0, paralyze: 0, sleep: 0, blind: 0 },
        isParty: true as const,
        skills: [] as string[],
        buffs: [],
        passiveModifiers: [],
      }));

      usePartyStore.getState().syncHpTpFromCombat(combatParty);

      const updatedActive = usePartyStore.getState().getActiveParty();
      for (const member of updatedActive) {
        expect(member.hp).toBe(10);
        expect(member.tp).toBe(5);
      }
    });
  });

  describe('restParty', () => {
    it('full rest restores HP/TP to max', () => {
      usePartyStore.getState().initializeRoster();

      // Damage the party
      usePartyStore.setState((state) => ({
        roster: state.roster.map((m) => ({ ...m, hp: 1, tp: 1 })),
      }));

      usePartyStore.getState().restParty(1.0);

      const { roster } = usePartyStore.getState();
      for (const member of roster) {
        expect(member.hp).toBe(member.maxHp);
        expect(member.tp).toBe(member.maxTp);
      }
    });

    it('half rest restores 50% of max', () => {
      usePartyStore.getState().initializeRoster();

      usePartyStore.setState((state) => ({
        roster: state.roster.map((m) => ({ ...m, hp: 0, tp: 0 })),
      }));

      usePartyStore.getState().restParty(0.5);

      const { roster } = usePartyStore.getState();
      for (const member of roster) {
        expect(member.hp).toBe(Math.floor(member.maxHp * 0.5));
        expect(member.tp).toBe(Math.floor(member.maxTp * 0.5));
      }
    });
  });

  describe('setActiveParty', () => {
    it('sets active party IDs', () => {
      usePartyStore.getState().initializeRoster();
      usePartyStore.getState().setActiveParty(['party-2', 'party-3', 'party-5', 'party-6']);

      const active = usePartyStore.getState().getActiveParty();
      expect(active).toHaveLength(4);
      expect(active[0].classId).toBe('strikblob');
      expect(active[3].classId).toBe('toxblob');
    });

    it('limits to 4 members', () => {
      usePartyStore.getState().initializeRoster();
      usePartyStore.getState().setActiveParty(['party-1', 'party-2', 'party-3', 'party-4', 'party-5']);

      const { activePartyIds } = usePartyStore.getState();
      expect(activePartyIds).toHaveLength(4);
    });
  });

  describe('investSkillPoint', () => {
    it('learns a skill when requirements met', () => {
      usePartyStore.getState().initializeRoster();
      // Give skill points via XP
      usePartyStore.getState().awardXp(500); // Level 2, 1 SP

      const success = usePartyStore.getState().investSkillPoint('party-1', 'ironblob-shield-bash');
      expect(success).toBe(true);

      const member = usePartyStore.getState().roster.find((m) => m.id === 'party-1');
      expect(member!.learnedSkills).toContain('ironblob-shield-bash');
      expect(member!.skillPoints).toBe(0);
    });

    it('fails if not enough SP', () => {
      usePartyStore.getState().initializeRoster();
      const success = usePartyStore.getState().investSkillPoint('party-1', 'ironblob-shield-bash');
      expect(success).toBe(false);
    });
  });
});
