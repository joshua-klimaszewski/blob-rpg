import { useState, useEffect, useCallback, useRef } from 'react';
import { useCombatStore } from '../../stores/combatStore';
import { CombatGrid } from './CombatGrid';
import { ActionMenu } from './ActionMenu';
import { CombatHUD } from './CombatHUD';
import { TurnOrderTimeline } from './TurnOrderTimeline';
import { useCombatEvents } from '../../hooks/useCombatEvents';
import { findEntity, isAlive } from '../../systems/combat';
import type { GridPosition } from '../../types/combat';

export function CombatScreen() {
  const combat = useCombatStore((s) => s.combat);
  const selectAction = useCombatStore((s) => s.selectAction);
  const processEnemyTurn = useCombatStore((s) => s.processEnemyTurn);
  const advanceToNext = useCombatStore((s) => s.advanceToNext);

  const { damageDisplays, message, removeDamage } = useCombatEvents();

  const [selectedTile, setSelectedTile] = useState<GridPosition | null>(null);
  const [selectedAction, setSelectedAction] = useState<'attack' | null>(null);
  const processingRef = useRef(false);

  // Get current actor info
  const currentEntry = combat?.turnOrder[combat.currentActorIndex];
  const currentActor = combat && currentEntry ? findEntity(combat, currentEntry.entityId) : null;
  const isPlayerTurn = currentActor?.isParty === true && isAlive(currentActor);
  const isEnemyTurn =
    currentActor?.isParty === false && isAlive(currentActor) && combat?.phase === 'active';

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
  }, []);

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
          selectedTile={selectedAction === 'attack' ? selectedTile : null}
          damageDisplays={damageDisplays}
          onTileSelect={(pos) => {
            if (selectedAction === 'attack' && isPlayerTurn) {
              setSelectedTile(pos);
            }
          }}
          onDamageComplete={removeDamage}
        />
      </div>

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

      {/* Action Menu */}
      {combat.phase === 'active' && (
        <ActionMenu
          isPlayerTurn={isPlayerTurn}
          canFlee={combat.canFlee}
          selectedAction={selectedAction}
          selectedTile={selectedTile}
          onAttack={handleAttackButton}
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
