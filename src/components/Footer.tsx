import { Instagram, Youtube, MapPin, Clock, Navigation } from 'lucide-react'

const ENDERECO_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Rua+Jorge+Alcides+Moreira,+157,+Cidade+Nova'
const INSTAGRAM_URL = 'https://www.instagram.com/ibvec'
const YOUTUBE_URL = 'https://www.youtube.com/@IBVEC'

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="wrap section grid gap-10 md:grid-cols-3 font-normal">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/uploads/logo-branca-v2.png" alt="IBVEC" className="size-10 object-contain" />
            <span className="font-display text-lg tracking-wide">IBVEC</span>
          </div>
          <p className="max-w-prose text-sm text-white/60">
            Igreja Batista Viver em Cristo. Um devocional novo a cada dia pra te aproximar da Palavra.
          </p>
          <p className="text-lg font-semibold text-gold">Viver é Cristo</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Cultos</h3>
          <div className="flex items-start gap-2 text-sm text-white/60">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
            <span>
              Quarta · 20h — Culto de Milagres e Testemunhos<br />
              Sexta · 20h — Culto de Oração<br />
              Domingo · 19h — Culto da Família
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-white/60">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
            <span>Rua Jorge Alcides Moreira, 157<br />Bairro Cidade Nova</span>
          </div>
          <a
            href={ENDERECO_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 pl-6 text-sm font-semibold text-gold hover:underline"
          >
            <Navigation className="size-3.5" strokeWidth={1.75} /> Como chegar
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Siga a IBVEC</h3>
          <div className="flex gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10"
            >
              <Instagram className="size-4" strokeWidth={1.75} />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10"
            >
              <Youtube className="size-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <p className="wrap text-center text-xs text-white/40">
          © {new Date().getFullYear()} Igreja Batista Viver em Cristo — IBVEC.
        </p>
      </div>
    </footer>
  )
}
