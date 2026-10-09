import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookOpen } from 'lucide-react'
import { useDevocionais } from '../hooks/useDevocionais'
import { useVideos } from '../hooks/useVideos'
import DevocionalCard from '../components/DevocionalCard'
import VideoCard from '../components/VideoCard'
import { CATEGORIAS, type Categoria } from '../lib/types'

type Filtro = 'Todas' | 'Palavras em vídeo' | Categoria

function filtroDaUrl(searchParams: URLSearchParams): Filtro {
  if (searchParams.get('filtro') === 'video') return 'Palavras em vídeo'
  const categoriaParam = searchParams.get('categoria') as Categoria | null
  if (categoriaParam && CATEGORIAS.includes(categoriaParam)) return categoriaParam
  return 'Todas'
}

export default function Devocionais() {
  const { records, loading, error } = useDevocionais()
  const { records: videos, loading: carregandoVideos, error: erroVideos } = useVideos()
  const [busca, setBusca] = useState('')
  const [searchParams] = useSearchParams()
  const [filtro, setFiltro] = useState<Filtro>(() => filtroDaUrl(searchParams))

  // os itens do submenu do header sempre apontam pra /devocionais — como é a MESMA rota,
  // o React Router não remonta a página ao trocar só a query string, então sem isto o
  // filtro só reagia da primeira vez que a página carregava
  useEffect(() => {
    setFiltro(filtroDaUrl(searchParams))
  }, [searchParams])

  const q = busca.trim().toLowerCase()

  const devocionaisFiltrados =
    filtro === 'Palavras em vídeo'
      ? []
      : records.filter((r) => {
          if (filtro !== 'Todas' && r.data.categoria !== filtro) return false
          if (!q) return true
          return (
            r.data.titulo.toLowerCase().includes(q) ||
            r.data.referencia.toLowerCase().includes(q) ||
            r.data.texto.toLowerCase().includes(q)
          )
        })

  const videosFiltrados =
    filtro !== 'Todas' && filtro !== 'Palavras em vídeo'
      ? []
      : videos.filter((v) => {
          if (!q) return true
          return (
            v.data.titulo.toLowerCase().includes(q) ||
            v.data.ministrante.toLowerCase().includes(q) ||
            (v.data.descricao || '').toLowerCase().includes(q)
          )
        })

  const carregandoTudo = loading || carregandoVideos
  const semResultado = !carregandoTudo && devocionaisFiltrados.length === 0 && videosFiltrados.length === 0
  const semConteudoAlgum = records.length === 0 && videos.length === 0

  return (
    <main>
      <section className="bg-ink text-white">
        <div className="wrap flex flex-col gap-4 py-14 md:py-20">
          <p className="eyebrow text-gold">Acervo</p>
          <h1 className="text-h1 text-white">Devocionais da IBVEC</h1>
          <p className="max-w-prose text-lead text-white/70">
            Reflexões em texto e palavras em vídeo, em ordem do mais recente pro mais antigo.
          </p>
        </div>
      </section>

      <section className="section bg-bg">
        <div className="wrap">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" strokeWidth={1.75} />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, versículo ou ministrante..."
                className="w-full rounded-ui border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent"
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('Todas')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtro === 'Todas' ? 'bg-accent text-accent-ink' : 'border border-line text-ink hover:bg-surface'
              }`}
            >
              Todos os devocionais
            </button>
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filtro === c ? 'bg-accent text-accent-ink' : 'border border-line text-ink hover:bg-surface'
                }`}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setFiltro('Palavras em vídeo')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtro === 'Palavras em vídeo' ? 'bg-accent text-accent-ink' : 'border border-line text-ink hover:bg-surface'
              }`}
            >
              Palavras em vídeo
            </button>
          </div>

          {carregandoTudo && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-48 animate-pulse" />
              ))}
            </div>
          )}

          {!carregandoTudo && (error || erroVideos) && (
            <div className="card text-sm text-muted">Não foi possível carregar o conteúdo agora.</div>
          )}

          {!carregandoTudo && !error && !erroVideos && semResultado && (
            <div className="card flex flex-col items-start gap-3">
              <BookOpen className="size-6 text-accent" strokeWidth={1.75} />
              <h3 className="text-h3">Nenhum conteúdo encontrado</h3>
              <p className="text-muted">
                {semConteudoAlgum ? 'A equipe ainda não publicou nenhum devocional ou vídeo.' : 'Tente buscar por outro termo ou série.'}
              </p>
            </div>
          )}

          {!carregandoTudo && !error && !erroVideos && !semResultado && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {devocionaisFiltrados.map((r) => (
                <DevocionalCard key={r.id} record={r} />
              ))}
              {videosFiltrados.map((v) => (
                <VideoCard key={v.id} record={v} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
