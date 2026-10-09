import { Coffee, Sun, Waves, HeartHandshake } from 'lucide-react'
import type { Categoria } from '../lib/types'

const ICONES: Record<Categoria, typeof Coffee> = {
  'Café Expresso': Coffee,
  'Pão Diário': Sun,
  'Águas Profundas': Waves,
  'Bálsamo e Ânimo': HeartHandshake,
}

export default function CategoriaBadge({ categoria, className = '' }: { categoria: Categoria; className?: string }) {
  const Icone = ICONES[categoria] || Sun
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent ${className}`}>
      <Icone className="size-3.5" strokeWidth={2} />
      {categoria}
    </span>
  )
}
