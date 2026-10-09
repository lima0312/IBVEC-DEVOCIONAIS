import { Navigate, Link } from 'react-router-dom'
import { LogOut, BookOpen, Heart, CheckCircle2, NotebookPen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDevocionais } from '../../hooks/useDevocionais'
import { useProgresso } from '../../hooks/useProgresso'
import DevocionalCard from '../../components/DevocionalCard'
import BotaoVoltar from '../../components/BotaoVoltar'

export default function MinhaConta() {
  const { user, loading, logout } = useAuth()
  const { records } = useDevocionais()
  const { registros, loading: carregandoProgresso } = useProgresso(user)

  if (!loading && !user) return <Navigate to="/entrar" state={{ from: '/minha-conta' }} replace />

  const lidosIds = new Set(registros.filter((r) => r.data.lido).map((r) => r.data.devocionalId))
  const favoritosIds = new Set(registros.filter((r) => r.data.favorito).map((r) => r.data.devocionalId))
  const anotacoesPorDevocional = new Map(
    registros.filter((r) => r.data.anotacao?.trim()).map((r) => [r.data.devocionalId, r.data.anotacao!])
  )

  const lidos = records.filter((r) => lidosIds.has(r.id))
  const favoritos = records.filter((r) => favoritosIds.has(r.id))
  const comAnotacao = records.filter((r) => anotacoesPorDevocional.has(r.id))

  return (
    <main className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/uploads/logo-preta.png" alt="IBVEC" className="size-9 object-contain" />
            <span className="font-display text-lg tracking-wide text-ink">IBVEC</span>
          </Link>
          <button type="button" onClick={logout} className="btn btn-ghost">
            <LogOut className="size-4" strokeWidth={1.75} /> Sair
          </button>
        </div>
      </header>

      <div className="section">
        <div className="wrap">
          <BotaoVoltar className="mb-6" />
          <p className="eyebrow">Minha conta</p>
          <h1 className="text-h2 text-ink">Olá, {user?.name || user?.email}</h1>
          <p className="mt-2 text-muted">Acompanhe seu progresso nos devocionais e seus favoritos.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <CheckCircle2 className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-2xl font-bold text-ink">{lidos.length}</p>
                <p className="text-sm text-muted">Devocionais lidos</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Heart className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-2xl font-bold text-ink">{favoritos.length}</p>
                <p className="text-sm text-muted">Favoritos</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-h3 text-ink">Seus favoritos</h2>
            {carregandoProgresso && <p className="mt-3 text-muted">Carregando...</p>}
            {!carregandoProgresso && favoritos.length === 0 && (
              <div className="card mt-4 flex flex-col items-start gap-2">
                <Heart className="size-5 text-accent" strokeWidth={1.75} />
                <p className="text-muted">Você ainda não favoritou nenhum devocional.</p>
                <Link to="/devocionais" className="btn btn-ghost mt-2">Explorar devocionais</Link>
              </div>
            )}
            {favoritos.length > 0 && (
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favoritos.map((r) => (
                  <DevocionalCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </div>

          {comAnotacao.length > 0 && (
            <div className="mt-12">
              <h2 className="text-h3 text-ink">Suas anotações</h2>
              <div className="mt-4 flex flex-col gap-4">
                {comAnotacao.map((r) => (
                  <Link key={r.id} to={`/devocionais/${r.id}`} className="card flex flex-col gap-2 hover:border-accent">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <NotebookPen className="size-4 text-accent" strokeWidth={1.75} /> {r.data.titulo}
                    </div>
                    <p className="line-clamp-3 whitespace-pre-line text-sm text-muted">{anotacoesPorDevocional.get(r.id)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-h3 text-ink">Devocionais lidos</h2>
            {!carregandoProgresso && lidos.length === 0 && (
              <div className="card mt-4 flex flex-col items-start gap-2">
                <BookOpen className="size-5 text-accent" strokeWidth={1.75} />
                <p className="text-muted">Você ainda não marcou nenhum devocional como lido.</p>
                <Link to="/devocionais" className="btn btn-ghost mt-2">Começar a ler</Link>
              </div>
            )}
            {lidos.length > 0 && (
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lidos.map((r) => (
                  <DevocionalCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
