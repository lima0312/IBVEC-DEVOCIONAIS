import { Link } from 'react-router-dom'
import { BookOpen, Heart, Users, ArrowRight } from 'lucide-react'
import { useDevocionais } from '../hooks/useDevocionais'
import { useConfigSite } from '../hooks/useConfigSite'
import DevocionalCard from '../components/DevocionalCard'

function formatarDataLonga(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default function Home() {
  const { records, loading, error } = useDevocionais()
  const { config } = useConfigSite()
  const hoje = records[0]
  const recentes = records.slice(1, 4)

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        {config.imagemHeroHome ? (
          <>
            <img src={config.imagemHeroHome} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(242,183,5,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(143,20,31,0.55), transparent 45%)',
            }}
          />
        )}
        <div className="wrap relative flex flex-col gap-6 py-20 md:py-28">
          <p className="eyebrow text-gold">IBVEC · Devocional diário</p>
          <h1 className="text-display font-display uppercase leading-[0.95] text-white">
            Palavra viva<br />pra todo dia
          </h1>
          <p className="max-w-prose text-lead text-white/70">
            A cada manhã, uma reflexão bíblica pra renovar sua fé e te aproximar de Deus — direto da Igreja Batista Viver em Cristo.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/devocionais" className="btn btn-primary">
              Ler devocionais <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
            <Link to="/sobre" className="btn border border-white/25 text-white hover:bg-white/10">
              Conheça a IBVEC
            </Link>
          </div>
        </div>
      </section>

      {/* Devocional de hoje */}
      <section className="section bg-bg">
        <div className="wrap">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Devocional de hoje</p>
              <h2 className="text-h2 text-ink">Sua reflexão para hoje</h2>
            </div>
          </div>

          {loading && (
            <div className="card animate-pulse">
              <div className="h-4 w-32 rounded bg-line" />
              <div className="mt-4 h-7 w-2/3 rounded bg-line" />
              <div className="mt-4 h-20 w-full rounded bg-line" />
            </div>
          )}

          {!loading && error && (
            <div className="card border-accent/30 text-sm text-muted">
              Não foi possível carregar os devocionais agora. Tente novamente em instantes.
            </div>
          )}

          {!loading && !error && !hoje && (
            <div className="card flex flex-col items-start gap-3">
              <BookOpen className="size-6 text-accent" strokeWidth={1.75} />
              <h3 className="text-h3">Ainda não há devocionais publicados</h3>
              <p className="text-muted">Assim que a equipe cadastrar o primeiro devocional, ele aparece aqui.</p>
              <Link to="/admin" className="btn btn-ghost mt-2">Ir para a área da equipe</Link>
            </div>
          )}

          {!loading && !error && hoje && (
            <article className="card grid gap-6 lg:grid-cols-12 lg:p-10">
              <div className="lg:col-span-7">
                <p className="eyebrow">{formatarDataLonga(hoje.data.data)}</p>
                <h3 className="mt-2 text-h2 text-ink">{hoje.data.titulo}</h3>
                <p className="mt-4 max-w-prose text-muted">{hoje.data.texto}</p>
                <Link to={`/devocionais/${hoje.id}`} className="btn btn-primary mt-6">
                  Ler completo <ArrowRight className="size-4" strokeWidth={2} />
                </Link>
              </div>
              <div className="flex flex-col justify-center gap-3 border-t border-line pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="text-h3 leading-snug text-accent">"{hoje.data.versiculo}"</p>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">{hoje.data.referencia}</p>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* Recentes */}
      {recentes.length > 0 && (
        <section className="section bg-surface">
          <div className="wrap">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-h2 text-ink">Devocionais recentes</h2>
              <Link to="/devocionais" className="hidden text-sm font-semibold text-accent hover:underline md:inline">
                Ver todos
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentes.map((r) => (
                <DevocionalCard key={r.id} record={r} />
              ))}
            </div>
            <Link to="/devocionais" className="btn btn-ghost mt-8 w-full md:hidden">
              Ver todos os devocionais
            </Link>
          </div>
        </section>
      )}

      {/* Sobre a igreja em faixa */}
      <section className="section bg-ink text-white">
        <div className="wrap grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <BookOpen className="size-6 text-gold" strokeWidth={1.75} />
            <h3 className="text-h3">Palavra todo dia</h3>
            <p className="text-sm text-white/65">Um novo devocional a cada manhã, direto da liderança da IBVEC.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Heart className="size-6 text-gold" strokeWidth={1.75} />
            <h3 className="text-h3">Fé em comunidade</h3>
            <p className="text-sm text-white/65">Reflexões pensadas pra fortalecer sua caminhada com Cristo.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Users className="size-6 text-gold" strokeWidth={1.75} />
            <h3 className="text-h3">Você é bem-vindo</h3>
            <p className="text-sm text-white/65">Venha participar dos nossos cultos presenciais. Todos são bem-vindos.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
