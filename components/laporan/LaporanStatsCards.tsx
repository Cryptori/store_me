'use client'

type Card = { label: string; value: string; color: 'green' | 'cyan' | 'yellow' | 'red' }

const colorMap = {
  green:  'text-green-400',
  cyan:   'text-cyan-400',
  yellow: 'text-yellow-400',
  red:    'text-red-400',
}

export default function LaporanStatsCards({ cards }: { cards: Card[] }) {
  return (
    <div className={`grid gap-4 mb-6 ${cards.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {cards.map(({ label, value, color }) => (
        <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
          <div className="text-xs text-[#64748b] mb-1">{label}</div>
          <div className={`text-xl font-black font-mono ${colorMap[color]}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}