import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, UserRound, ChevronDown, BookOpen, Clapperboard, Coffee, Sun, Waves, HeartHandshake } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre a IBVEC' },
]

const submenuDevocionais = [
  { to: '/devocionais', label: 'Todos os devocionais', icone: BookOpen },
  { to: '/devocionais?categoria=Café Expresso', label: 'Café Expresso', icone: Coffee },
  { to: '/devocionais?categoria=Pão Diário', label: 'Pão Diário', icone: Sun },
  { to: '/devocionais?categoria=Águas Profundas', label: 'Águas Profundas', icone: Waves },
  { to: '/devocionais?categoria=Bálsamo e Ânimo', label: 'Bálsamo e Ânimo', icone: HeartHandshake },
  { to: '/devocionais?filtro=video', label: 'Palavras em vídeo', icone: Clapperboard },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(false)
  const [abrirDevocionaisMobile, setAbrirDevocionaisMobile] = useState(false)
  const { user, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <img src="/uploads/logo-preta.png" alt="IBVEC" className="size-10 shrink-0 object-contain md:size-12" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-wide md:text-xl text-[#8F141F]">IBVEC</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted md:text-[11px]">Igreja Batista Viver em Cristo</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `text-sm font-medium transition hover:text-accent ${isActive ? 'text-accent' : 'text-ink'}`}
          >
            Início
          </NavLink>

          <div className="relative" onMouseEnter={() => setOpenSubmenu(true)} onMouseLeave={() => setOpenSubmenu(false)}>
            <NavLink
              to="/devocionais"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 text-sm font-medium transition hover:text-accent ${isActive ? 'text-accent' : 'text-ink'}`
              }
            >
              Devocionais
              <ChevronDown className={`size-3.5 transition ${openSubmenu ? 'rotate-180' : ''}`} strokeWidth={2} />
            </NavLink>

            {openSubmenu && (
              <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3">
                <div className="flex flex-col gap-1 rounded-ui-lg border border-line bg-surface p-2 shadow-ui">
                  {submenuDevocionais.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="flex items-center gap-2.5 rounded-ui px-3 py-2.5 text-sm font-medium text-ink hover:bg-accent-soft hover:text-accent"
                    >
                      <item.icone className="size-4 shrink-0" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {links.slice(1).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-accent ${isActive ? 'text-accent' : 'text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {isAdmin && <Link to="/admin" className="btn btn-ghost">Área da equipe</Link>}
          {user ? (
            <Link to="/minha-conta" className="btn btn-primary">
              <UserRound className="size-4" strokeWidth={1.75} /> Minha conta
            </Link>
          ) : (
            <Link to="/entrar" className="btn btn-primary">Entrar</Link>
          )}
        </nav>

        <button
          className="inline-flex size-11 items-center justify-center rounded-ui border border-line lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-surface lg:hidden">
          <div className="wrap flex flex-col gap-1 py-3">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-ui px-3 py-3 text-base font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-ink'}`
              }
            >
              Início
            </NavLink>

            <button
              type="button"
              onClick={() => setAbrirDevocionaisMobile((v) => !v)}
              className="flex items-center justify-between rounded-ui px-3 py-3 text-base font-medium text-ink"
            >
              Devocionais
              <ChevronDown className={`size-4 transition ${abrirDevocionaisMobile ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>
            {abrirDevocionaisMobile && (
              <div className="ml-3 flex flex-col gap-1 border-l border-line pl-3">
                {submenuDevocionais.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => { setOpen(false); setAbrirDevocionaisMobile(false) }}
                    className="flex items-center gap-2.5 rounded-ui px-3 py-2.5 text-sm font-medium text-muted hover:text-accent"
                  >
                    <item.icone className="size-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <NavLink
              to="/sobre"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-ui px-3 py-3 text-base font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-ink'}`
              }
            >
              Sobre a IBVEC
            </NavLink>

            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="btn btn-ghost mt-2 w-full">
                Área da equipe
              </Link>
            )}
            {user ? (
              <Link to="/minha-conta" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">
                <UserRound className="size-4" strokeWidth={1.75} /> Minha conta
              </Link>
            ) : (
              <Link to="/entrar" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
