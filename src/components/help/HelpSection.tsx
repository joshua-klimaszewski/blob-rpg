import type { HelpEntry } from '../../data/help/types'

export function HelpSection({ heading, body }: HelpEntry) {
  const paragraphs = body.split('\n\n')
  return (
    <div>
      <h3 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">{heading}</h3>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-600 mb-2">{p}</p>
      ))}
    </div>
  )
}
