import { Clapperboard } from 'lucide-react'
import { useVideos } from '../hooks/useVideos'
import VideoCard from '../components/VideoCard'

export default function Palavras() {
  const { records, loading, error } = useVideos()

  return (
    <main>
      <section className="bg-ink text-white">
        <div className="wrap flex flex-col gap-4 py-14 md:py-20">
          <p className="eyebrow text-gold">Assista</p>
          <h1 className="text-h1 text-white">Palavras em vídeo</h1>
          <p className="max-w-prose text-lead text-white/70">
            Mensagens e testemunhos gravados pela nossa igreja, pra você assistir quando quiser.
          </p>
        </div>
      </section>

      <section className="section bg-bg">
        <div className="wrap">
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="card text-sm text-muted">Não foi possível carregar os vídeos agora.</div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="card flex flex-col items-start gap-3">
              <Clapperboard className="size-6 text-accent" strokeWidth={1.75} />
              <h3 className="text-h3">Nenhum vídeo publicado ainda</h3>
              <p className="text-muted">Assim que a equipe cadastrar uma palavra em vídeo, ela aparece aqui.</p>
            </div>
          )}

          {!loading && !error && records.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {records.map((r) => (
                <VideoCard key={r.id} record={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
