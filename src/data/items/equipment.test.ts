/**
 * Equipment Data Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EQUIPMENT, getEquipment, getAllEquipment } from './index';
import { usePartyStore } from '../../stores/partyStore';

describe('Equipment Registry', () => {
  it('has 21 equipment items', () => {
    expect(getAllEquipment()).toHaveLength(21);
  });

  it('all IDs are unique', () => {
    const ids = EQUIPMENT.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can look up each item by ID', () => {
    for (const item of EQUIPMENT) {
      expect(getEquipment(item.id)).toBeDefined();
      expect(getEquipment(item.id)!.id).toBe(item.id);
    }
  });

  it('returns undefined for unknown ID', () => {
    expect(getEquipment('nonexistent')).toBeUndefined();
  });

  it('each item has at least one stat bonus', () => {
    for (const item of EQUIPMENT) {
      const bonusValues = Object.values(item.bonuses).filter((v) => v !== undefined && v > 0);
      expect(bonusValues.length).toBeGreaterThan(0);
    }
  });

  it('has weapons, armor, and accessories', () => {
    const slots = new Set(EQUIPMENT.map((e) => e.slot));
    expect(slots.has('weapon')).toBe(true);
    expect(slots.has('armor')).toBe(true);
    expect(slots.has('accessory1')).toBe(true);
  });
});

describe('Equipment Integration with PartyStore', () => {
  beforeEach(() => {
    usePartyStore.setState({ roster: [], activePartyIds: [] });
    usePartyStore.getState().initializeRoster();
  });

  it('equipping a weapon increases STR', () => {
    const before = usePartyStore.getState().roster[0];
    const baseStr = before.stats.str;

    usePartyStore.getState().equipItem('party-1', 'weapon', 'rusty-sword');

    const after = usePartyStore.getState().roster.find((m) => m.id === 'party-1')!;
    expect(after.stats.str).toBe(baseStr + 3);
    expect(after.equipment.weapon).toBe('rusty-sword');
  });

  it('equipping armor increases HP', () => {
    const before = usePartyStore.getState().roster[0];
    const baseHp = before.maxHp;

    usePartyStore.getState().equipItem('party-1', 'armor', 'leather-vest');

    const after = usePartyStore.getState().roster.find((m) => m.id === 'party-1')!;
    expect(after.maxHp).toBe(baseHp + 10);
  });
});
