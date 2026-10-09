import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import type { VideoPalavraRecord } from '../lib/types'
import { getEmbedUrl, isInstagramUrl, getInstagramEmbedUrl } from '../lib/video'
import InstagramEmbed from './InstagramEmbed'

function formatarData(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function VideoCard({ record }: { record: VideoPalavraRecord }) {
  const d = record.data
  const [tocando, setTocando] = useState(false)
  const instagram = isInstagramUrl(d.videoUrl)
  const embed = getEmbedUrl(d.videoUrl)

  return (
    <article className="card flex flex-col gap-3 overflow-hidden p-0">
      <div className={`relative w-full overflow-hidden bg-ink ${tocando && instagram ? '' : 'aspect-video'}`}>
        {tocando ? (
          instagram ? (
            <div className="bg-surface p-2">
              <InstagramEmbed url={getInstagramEmbedUrl(d.videoUrl) || d.videoUrl} />
            </div>
          ) : embed ? (
            <iframe
              src={`${embed}?autoplay=1`}
              title={d.titulo}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={d.videoUrl} controls autoPlay className="h-full w-full" />
          )
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            className="group relative flex h-full w-full items-center justify-center"
            aria-label={`Assistir ${d.titulo}`}
          >
            {d.imagemUrl ? (
              <img src={d.imagemUrl} alt={d.titulo} className="absolute inset-0 h-full w-full object-cover opacity-80" loading="lazy" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink to-accent/40" />
            )}
            <PlayCircle className="relative size-14 text-white drop-shadow transition group-hover:scale-110" strokeWidth={1.25} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 p-6 pt-4">
        <span className="eyebrow">{formatarData(d.data)}</span>
        <h3 className="text-h3 text-ink">{d.titulo}</h3>
        <p className="text-sm font-semibold text-accent">{d.ministrante}</p>
        {d.descricao && <p className="line-clamp-3 text-sm text-muted">{d.descricao}</p>}
      </div>
    </article>
  )
}
