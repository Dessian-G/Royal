import { Minus, Plus } from 'lucide-react'

interface CounterProps {
  label: string
  value: number
  onChange: (v: number) => void
}

export default function Counter({ label, value, onChange }: CounterProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-cream-dark">
      <span className="text-sm font-medium text-indigo-950">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-300 transition-colors cursor-pointer"
          aria-label={`Diminuer ${label}`}
        >
          <Minus className="w-5 h-5" />
        </button>
        <input
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-14 text-center text-lg font-bold text-indigo-950 bg-transparent border-b-2 border-indigo-300 focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-gold/20 text-gold hover:bg-gold/30 active:bg-gold/40 transition-colors cursor-pointer"
          aria-label={`Augmenter ${label}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
