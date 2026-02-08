import { useCombatStore } from '../../stores/combatStore';

export function CombatScreen() {
  const combat = useCombatStore((s) => s.combat);

  if (!combat) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Combat</h1>
        <p className="text-gray-600">No combat active</p>
      </div>
    );
  }

  const aliveEnemies = combat.enemies.filter((e) => e.hp > 0);
  const aliveParty = combat.party.filter((e) => e.hp > 0);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Combat</h1>

      {/* Phase indicator */}
      {combat.phase === 'victory' && (
        <div className="text-xl font-bold text-green-700">Victory!</div>
      )}
      {combat.phase === 'defeat' && (
        <div className="text-xl font-bold text-red-700">Defeat!</div>
      )}

      {/* Enemies */}
      <div className="w-full max-w-xs border-2 border-ink p-4 flex flex-col gap-2">
        <div className="font-bold mb-2">Enemies</div>
        {aliveEnemies.map((enemy) => (
          <div key={enemy.id} className="flex justify-between">
            <span>{enemy.name}</span>
            <span>
              HP: {enemy.hp}/{enemy.maxHp}
            </span>
          </div>
        ))}
        {aliveEnemies.length === 0 && (
          <div className="text-gray-500">All defeated</div>
        )}
      </div>

      {/* Party */}
      <div className="w-full max-w-xs border-2 border-ink p-4 flex flex-col gap-2">
        <div className="font-bold mb-2">Party</div>
        {aliveParty.map((member) => (
          <div key={member.id} className="flex justify-between">
            <span>{member.name}</span>
            <span>
              HP: {member.hp}/{member.maxHp}
            </span>
          </div>
        ))}
        {aliveParty.length === 0 && <div className="text-gray-500">All defeated</div>}
      </div>

      {/* Combat state info (MVP placeholder) */}
      <div className="text-sm text-gray-600 text-center">
        <div>Turn: {combat.currentActorIndex + 1}</div>
        <div>Combo: {combat.comboCounter}</div>
        <div>Phase 3 combat system active</div>
        <div className="mt-2 text-xs">UI polish coming in Phase 3b</div>
      </div>
    </div>
  );
}
