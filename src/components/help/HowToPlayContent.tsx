import { useState } from 'react'
import { CONTROLS_SECTIONS } from '../../data/help/controls'
import { DUNGEON_SECTIONS } from '../../data/help/dungeon'
import { COMBAT_SECTIONS } from '../../data/help/combat'
import { PROGRESSION_SECTIONS } from '../../data/help/progression'
import { GLOSSARY_ENTRIES } from '../../data/help/glossary'
import { getAllClasses, getClassSkills } from '../../data/classes/index'
import { HelpSection } from './HelpSection'

const ROLE_LABELS: Record<string, string> = {
  tank: 'Tank / Protector',
  dps: 'Melee DPS',
  binder: 'Binder / Specialist',
  mage: 'Mage / Nuker',
  healer: 'Healer / Medic',
  debuffer: 'Debuffer / Field Control',
}

const TABS = ['Controls', 'Dungeon', 'Combat', 'Progression', 'Classes', 'Glossary'] as const
type Tab = (typeof TABS)[number]

export function HowToPlayContent() {
  const [tab, setTab] = useState<Tab>('Controls')

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`flex-shrink-0 px-3 py-2 text-sm font-bold border-b-2
              ${t === tab ? 'border-ink' : 'border-transparent text-gray-400'}
            `}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {tab === 'Controls' && <ControlsTab />}
        {tab === 'Dungeon' && <DungeonTab />}
        {tab === 'Combat' && <CombatTab />}
        {tab === 'Progression' && <ProgressionTab />}
        {tab === 'Classes' && <ClassesTab />}
        {tab === 'Glossary' && <GlossaryTab />}
      </div>
    </div>
  )
}

function ControlsTab() {
  return (
    <>
      {CONTROLS_SECTIONS.map((s) => (
        <HelpSection key={s.heading} {...s} />
      ))}
    </>
  )
}

function DungeonTab() {
  return (
    <>
      {DUNGEON_SECTIONS.map((s) => (
        <HelpSection key={s.heading} {...s} />
      ))}
    </>
  )
}

function CombatTab() {
  return (
    <>
      {COMBAT_SECTIONS.map((s) => (
        <HelpSection key={s.heading} {...s} />
      ))}
    </>
  )
}

function ProgressionTab() {
  return (
    <>
      {PROGRESSION_SECTIONS.map((s) => (
        <HelpSection key={s.heading} {...s} />
      ))}
    </>
  )
}

function ClassesTab() {
  const classes = getAllClasses()
  return (
    <>
      {classes.map((cls) => {
        const skills = getClassSkills(cls.id)
        return (
          <div key={cls.id}>
            <h3 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">
              {cls.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              {ROLE_LABELS[cls.role] ?? cls.role}
            </p>
            <p className="text-sm text-gray-600 mb-2">{cls.description}</p>
            <div className="text-sm text-gray-600">
              <span className="font-bold">Skills:</span>{' '}
              {skills.map((sk) => sk.name).join(', ')}
            </div>
          </div>
        )
      })}
    </>
  )
}

function GlossaryTab() {
  return (
    <div className="space-y-2">
      {GLOSSARY_ENTRIES.map((entry) => (
        <div key={entry.term}>
          <span className="font-bold text-sm">{entry.term}</span>
          <span className="text-sm text-gray-600"> — {entry.definition}</span>
        </div>
      ))}
    </div>
  )
}
