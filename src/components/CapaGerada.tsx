import { Coffee, Sun, Waves, HeartHandshake } from 'lucide-react'
import type { Categoria } from '../lib/types'

const ESTILO: Record<Categoria, { from: string; to: string; Icone: typeof Coffee }> = {
  'Café Expresso': { from: '#8F141F', to: '#4A0C12', Icone: Coffee },
  'Pão Diário': { from: '#B3391F', to: '#6E1A0E', Icone: Sun },
  'Águas Profundas': { from: '#1A1412', to: '#3A1012', Icone: Waves },
  'Bálsamo e Ânimo': { from: '#8F141F', to: '#F2B705', Icone: HeartHandshake },
}

export default function CapaGerada({ categoria, className = '' }: { categoria: Categoria; className?: string }) {
  const { from, to, Icone } = ESTILO[categoria] || ESTILO['Pão Diário']
  const id = `capa-${categoria.replace(/\s+/g, '-')}`

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <svg className="absolute inset-0 h-full w-full opacity-15" aria-hidden="true">
        <defs>
          <pattern id={id} width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="17" cy="17" r="1.4" fill="#F2B705" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <Icone className="relative size-12 text-white/90 md:size-14" strokeWidth={1.25} />
      <span className="absolute bottom-3 right-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">IBVEC</span>
    </div>
  )
}
