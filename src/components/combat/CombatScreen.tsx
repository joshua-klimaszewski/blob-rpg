import { useState, useEffect, useCallback, useRef } from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { CombatGrid } from './CombatGrid';
import { ActionMenu } from './ActionMenu';
import type { SelectedAction } from './ActionMenu';
import { SkillList } from './SkillList';
import { CombatHUD } from './CombatHUD';
import { TurnOrderTimeline } from './TurnOrderTimeline';
import { ItemMenu } from './ItemMenu';
import { useCombatEvents } from '../../hooks/useCombatEvents';
import { useInventoryStore } from '../../stores/inventoryStore';
import { findEntity, isAlive } from '../../systems/combat';
import { getSkill } from '../../data/classes/index';
import { getAllConsumables } from '../../data/items/index';
import type { SkillDefinition } from '../../types/character';
import type { GridPosition } from '../../types/combat';

export function CombatScreen() {
  const combat = useCombatStore((s) => s.combat);
  const selectAction = useCombatStore((s) => s.selectAction);
  const processEnemyTurn = useCombatStore((s) => s.processEnemyTurn);
  const advanceToNext = useCombatStore((s) => s.advanceToNext);

  const { damageDisplays, message, removeDamage } = useCombatEvents();

  const [selectedTile, setSelectedTile] = useState<GridPosition | null>(null);
  const [selectedAction, setSelectedAction] = useState<SelectedAction>(null);
  const [showSkillList, setShowSkillList] = useState(false);
  const [pendingSkill, setPendingSkill] = useState<SkillDefinition | null>(null);
  const [allySelectMode, setAllySelectMode] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const processingRef = useRef(false);

  // Check if player has any consumable items
  const inventoryConsumables = useInventoryStore((s) => s.consumables);
  const hasItems = getAllConsumables().some((c) => (inventoryConsumables[c.id] ?? 0) > 0);

  // Get current actor info
  const currentEntry = combat?.turnOrder[combat.currentActorIndex];
  const currentActor = combat && currentEntry ? findEntity(combat, currentEntry.entityId) : null;
  const isPlayerTurn = currentActor?.isParty === true && isAlive(currentActor);
  const isEnemyTurn =
    currentActor?.isParty === false && isAlive(currentActor) && combat?.phase === 'active';

  // Resolve actor's usable skills (non-passive)
  const actorSkills: SkillDefinition[] =
    currentActor && isPlayerTurn
      ? currentActor.skills
          .map((id) => getSkill(id))
          .filter((s): s is SkillDefinition => s !== undefined && !s.isPassive)
      : [];

  // Auto-process enemy turns and skip dead actors
  useEffect(() => {
    if (!combat || combat.phase !== 'active' || processingRef.current) return;

    // Skip dead actors
    if (currentActor && !isAlive(currentActor)) {
      const timer = setTimeout(() => {
        advanceToNext();
      }, 100);
      return () => clearTimeout(timer);
    }

    // Auto-execute enemy turns
    if (isEnemyTurn) {
      processingRef.current = true;
      const timer = setTimeout(() => {
        processEnemyTurn();
        setTimeout(() => {
          advanceToNext();
          processingRef.current = false;
        }, 600);
      }, 500);
      return () => {
        clearTimeout(timer);
        processingRef.current = false;
      };
    }
  }, [combat?.currentActorIndex, combat?.phase, currentActor, isEnemyTurn, processEnemyTurn, advanceToNext]);

  // Reset UI state when turn changes
  useEffect(() => {
    setSelectedAction(null);
    setSelectedTile(null);
    setShowSkillList(false);
    setPendingSkill(null);
    setAllySelectMode(false);
    setShowItemMenu(false);
  }, [combat?.currentActorIndex]);

  const handleAttackButton = useCallback(() => {
    if (selectedAction === 'attack' && selectedTile && currentActor) {
      selectAction({
        actorId: currentActor.id,
        type: 'attack',
        targetTile: selectedTile,
      });
      setSelectedTile(null);
      setSelectedAction(null);
      setTimeout(() => advanceToNext(), 300);
    } else {
      setSelectedAction('attack');
    }
  }, [selectedAction, selectedTile, currentActor, selectAction, advanceToNext]);

  const handleSkillsButton = useCallback(() => {
    setShowSkillList(true);
    setSelectedAction(null);
    setSelectedTile(null);
  }, []);

  const handleSkillSelect = useCallback(
    (skill: SkillDefinition) => {
      if (!currentActor) return;

      setShowSkillList(false);
      setPendingSkill(skill);

      // Route based on target type
      switch (skill.targetType) {
        case 'self': {
          // Immediate: self-targeting skills execute right away
          selectAction({
            actorId: currentActor.id,
            type: 'skill',
            skillId: skill.id,
            targetTile: [0, 0], // dummy tile — self-targeting ignores it
          });
          setPendingSkill(null);
          setTimeout(() => advanceToNext(), 300);
          break;
        }
        case 'all-enemies': {
          // Immediate: hits all enemies, no target selection needed
          selectAction({
            actorId: currentActor.id,
            type: 'skill',
            skillId: skill.id,
            targetTile: [0, 0], // dummy tile — all-enemies resolves to full grid
          });
          setPendingSkill(null);
          setTimeout(() => advanceToNext(), 300);
          break;
        }
        case 'all-allies': {
          // Immediate: hits all allies
          selectAction({
            actorId: currentActor.id,
            type: 'skill',
            skillId: skill.id,
            targetTile: [0, 0], // dummy tile — all-allies resolves to party list
          });
          setPendingSkill(null);
          setTimeout(() => advanceToNext(), 300);
          break;
        }
        case 'single-ally': {
          // Show ally selection mode
          setAllySelectMode(true);
          break;
        }
        case 'single-tile':
        case 'adjacent-tiles': {
          // Enter tile targeting mode (like attack but for skill)
          setSelectedAction('skill-targeting');
          break;
        }
      }
    },
    [currentActor, selectAction, advanceToNext]
  );

  const handleAllySelect = useCallback(
    (allyIndex: number) => {
      if (!currentActor || !pendingSkill) return;

      selectAction({
        actorId: currentActor.id,
        type: 'skill',
        skillId: pendingSkill.id,
        // Encode ally index as targetTile — the skill system resolves
        // single-ally targeting by party index
        targetTile: [allyIndex, 0],
      });
      setAllySelectMode(false);
      setPendingSkill(null);
      setTimeout(() => advanceToNext(), 300);
    },
    [currentActor, pendingSkill, selectAction, advanceToNext]
  );

  const handleSkillConfirm = useCallback(() => {
    if (!currentActor || !pendingSkill || !selectedTile) return;

    selectAction({
      actorId: currentActor.id,
      type: 'skill',
      skillId: pendingSkill.id,
      targetTile: selectedTile,
    });
    setSelectedTile(null);
    setSelectedAction(null);
    setPendingSkill(null);
    setTimeout(() => advanceToNext(), 300);
  }, [currentActor, pendingSkill, selectedTile, selectAction, advanceToNext]);

  const handleDefend = useCallback(() => {
    if (!currentActor) return;
    selectAction({
      actorId: currentActor.id,
      type: 'defend',
    });
    setSelectedTile(null);
    setSelectedAction(null);
    setTimeout(() => advanceToNext(), 300);
  }, [currentActor, selectAction, advanceToNext]);

  const handleFlee = useCallback(() => {
    if (!currentActor) return;
    selectAction({
      actorId: currentActor.id,
      type: 'flee',
    });
    setSelectedTile(null);
    setSelectedAction(null);
  }, [currentActor, selectAction]);

  const handleCancel = useCallback(() => {
    setSelectedAction(null);
    setSelectedTile(null);
    setPendingSkill(null);
    setAllySelectMode(false);
    setShowSkillList(false);
    setShowItemMenu(false);
  }, []);

  const handleItemsButton = useCallback(() => {
    setShowItemMenu(true);
    setSelectedAction(null);
    setSelectedTile(null);
  }, []);

  const handleItemUse = useCallback(() => {
    setShowItemMenu(false);
    setTimeout(() => advanceToNext(), 300);
  }, [advanceToNext]);

  if (!combat) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Combat</h1>
        <p className="text-gray-600">No combat active</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-paper relative">
      {/* Combat HUD */}
      <CombatHUD combat={combat} />

      {/* Turn Order Timeline */}
      <TurnOrderTimeline combat={combat} />

      {/* Current actor indicator */}
      {combat.phase === 'active' && currentActor && (
        <div className="px-4 py-1 text-center text-sm border-b border-gray-200">
          <span className="font-bold">{currentActor.name}</span>
          {isPlayerTurn ? "'s turn" : ' is acting...'}
        </div>
      )}

      {/* Enemy Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3">
        <CombatGrid
          combat={combat}
          selectedTile={
            selectedAction === 'attack' || selectedAction === 'skill-targeting'
              ? selectedTile
              : null
          }
          damageDisplays={damageDisplays}
          onTileSelect={(pos) => {
            if ((selectedAction === 'attack' || selectedAction === 'skill-targeting') && isPlayerTurn) {
              setSelectedTile(pos);
            }
          }}
          onDamageComplete={removeDamage}
        />
      </div>

      {/* Ally Select Mode */}
      {allySelectMode && pendingSkill && (
        <div className="px-4 py-3 border-t-2 border-ink bg-paper">
          <div className="text-center text-sm font-bold mb-2">
            {pendingSkill.name} — Select Ally
          </div>
          <div className="flex flex-col gap-1 max-w-xs mx-auto">
            {combat.party.map((member, idx) => (
              <button
                key={member.id}
                type="button"
                className={`min-h-touch border-2 px-3 py-2 text-left text-sm
                  ${member.hp <= 0 ? 'border-gray-300 text-gray-400' : 'border-ink active:bg-ink active:text-paper'}
                `}
                disabled={member.hp <= 0}
                onClick={() => handleAllySelect(idx)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{member.name}</span>
                  <span className="tabular-nums text-xs">
                    {member.hp}/{member.maxHp} HP
                  </span>
                </div>
              </button>
            ))}
            <button
              type="button"
              className="min-h-touch border-2 border-ink font-bold text-sm mt-1 active:bg-ink active:text-paper"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Event message */}
      {message && (
        <div className="px-4 py-1 text-center text-xs text-gray-600 border-t border-gray-200">
          {message}
        </div>
      )}

      {/* Party Status */}
      <div className="border-t-2 border-ink px-4 py-3">
        <div className="flex flex-col gap-1 max-w-xs mx-auto">
          {combat.party.map((member) => {
            // Find damage displays targeting this party member
            const partyDamage = damageDisplays.find((d) => d.targetId === member.id);

            return (
              <div
                key={member.id}
                className={`relative flex items-center justify-between text-sm ${member.hp <= 0 ? 'text-gray-400' : ''}`}
              >
                <span
                  className={`font-bold truncate mr-2 ${currentEntry?.entityId === member.id ? 'underline' : ''}`}
                >
                  {member.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">
                    {member.hp}/{member.maxHp}
                  </span>
                  <div className="w-16 h-2 border border-ink bg-paper">
                    <div
                      className="h-full bg-ink transition-all duration-300"
                      style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                    />
                  </div>
                  {partyDamage && (
                    <span className="text-gauge-danger text-xs font-bold animate-[fadeUp_0.8s_ease-out_forwards]">
                      -{partyDamage.damage}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill List Overlay */}
      {showSkillList && currentActor && (
        <SkillList
          actor={currentActor}
          skills={actorSkills}
          onSelect={handleSkillSelect}
          onCancel={handleCancel}
        />
      )}

      {/* Item Menu Overlay */}
      {showItemMenu && currentActor && (
        <ItemMenu
          actor={currentActor}
          party={combat.party}
          onUse={handleItemUse}
          onCancel={handleCancel}
        />
      )}

      {/* Action Menu */}
      {combat.phase === 'active' && !showSkillList && !allySelectMode && !showItemMenu && (
        <ActionMenu
          isPlayerTurn={isPlayerTurn}
          canFlee={combat.canFlee}
          hasSkills={actorSkills.length > 0}
          hasItems={hasItems}
          selectedAction={selectedAction}
          selectedTile={selectedTile}
          onAttack={selectedAction === 'skill-targeting' ? handleSkillConfirm : handleAttackButton}
          onSkills={handleSkillsButton}
          onItems={handleItemsButton}
          onDefend={handleDefend}
          onFlee={handleFlee}
          onCancel={handleCancel}
        />
      )}

      {/* Victory Overlay */}
      {combat.phase === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/80 animate-[overlayFadeIn_0.3s_ease-out]">
          <div className="bg-ink text-paper px-8 py-6 border-2 border-paper text-center">
            <div className="text-2xl font-bold mb-2">Victory!</div>
            <div className="text-sm">Returning to dungeon...</div>
          </div>
        </div>
      )}

      {/* Defeat Overlay */}
      {combat.phase === 'defeat' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/80 animate-[overlayFadeIn_0.3s_ease-out]">
          <div className="bg-paper text-ink px-8 py-6 border-2 border-ink text-center">
            <div className="text-2xl font-bold mb-2">Defeat</div>
            <div className="text-sm">Returning to town...</div>
          </div>
        </div>
      )}
    </div>
  );
}
