import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle, Headphones, Clock } from 'lucide-react'
import type { DevocionalRecord } from '../lib/types'
import CategoriaBadge from './CategoriaBadge'
import CapaGerada from './CapaGerada'

function formatarData(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DevocionalCard({ record }: { record: DevocionalRecord }) {
  const d = record.data
  return (
    <Link to={`/devocionais/${record.id}`} className="card group flex flex-col gap-3 overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-ui">
      <div className="relative aspect-video w-full overflow-hidden">
        {d.imagemUrl ? (
          <img
            src={d.imagemUrl}
            alt={d.titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <CapaGerada categoria={d.categoria} className="h-full w-full transition duration-300 group-hover:scale-105" />
        )}
        {d.videoUrl && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <PlayCircle className="size-10 text-white drop-shadow" strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow">{formatarData(d.data)}</span>
          <CategoriaBadge categoria={d.categoria} />
        </div>
        <h3 className="text-h3 text-ink">{d.titulo}</h3>
        {d.tempoLeitura && (
          <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted">
            <Clock className="size-3.5" strokeWidth={1.75} /> Leitura: {d.tempoLeitura}
          </span>
        )}
        <p className="line-clamp-3 text-sm text-muted">{d.texto}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="truncate text-sm font-semibold text-accent">{d.referencia}</p>
          <div className="flex shrink-0 items-center gap-2">
            {d.audioUrl && <Headphones className="size-4 text-muted" strokeWidth={1.75} />}
            <ArrowRight className="size-4 text-accent transition group-hover:translate-x-1" strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </Link>
  )
}
