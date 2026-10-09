import { Clock, MapPin, Heart, BookOpen, Users, Navigation } from 'lucide-react'
import { useConfigSite } from '../hooks/useConfigSite'

const ENDERECO_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Rua+Jorge+Alcides+Moreira,+157,+Cidade+Nova'

export default function Sobre() {
  const { config } = useConfigSite()

  return (
    <main>
      <section
        className="relative flex min-h-[50vh] items-end bg-ink text-white"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(10,8,8,0.92) 10%, rgba(10,8,8,0.55) 100%), url(${config.imagemHeroSobre})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="wrap py-14">
          <p className="eyebrow text-gold">Nossa igreja</p>
          <h1 className="text-h1 text-white">IBVEC — Igreja Batista<br />Viver em Cristo</h1>
          <p className="mt-3 text-lead font-semibold text-gold">Viver é Cristo, morrer é lucro</p>
        </div>
      </section>

      <section className="section bg-bg">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Quem somos?</p>
            <h2 className="text-h2 text-ink">Uma igreja que vive a palavra todos os dias</h2>
            <p className="mt-4 max-w-prose text-muted">
              A IBVEC — Igreja Batista Viver em Cristo nasceu do desejo de levar a Palavra de Deus além dos domingos.
              Criamos este espaço de devocionais diários pra que cada membro e visitante tenha, todos os dias, um
              momento de reflexão, oração e proximidade com Deus — onde quer que esteja.
            </p>
            <p className="mt-4 max-w-prose text-muted">
              Acreditamos que a fé se constrói no dia a dia: na leitura constante da Bíblia, na oração e na vida em
              comunidade. É esse o propósito por trás de cada devocional publicado aqui.
            </p>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="card flex gap-4">
              <BookOpen className="size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <div>
                <h3 className="text-h3">Palavra viva</h3>
                <p className="text-sm text-muted">Devocionais escritos pela liderança da igreja, direto pra sua rotina.</p>
              </div>
            </div>
            <div className="card flex gap-4">
              <Heart className="size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <div>
                <h3 className="text-h3">Fé em comunidade</h3>
                <p className="text-sm text-muted">Mais que um site, um convite pra caminhar junto na fé.</p>
              </div>
            </div>
            <div className="card flex gap-4">
              <Users className="size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <div>
                <h3 className="text-h3">Todos são bem-vindos</h3>
                <p className="text-sm text-muted">Membro ou visitante, você tem um lugar reservado entre nós.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-ink text-white">
        <div className="wrap grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="eyebrow text-gold">Venha nos visitar</p>
            <h2 className="text-h2 text-white">Nossos cultos</h2>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-semibold">Quarta · 20h</p>
                <p className="text-sm text-white/65">Culto de Milagres e Testemunhos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-semibold">Sexta · 20h</p>
                <p className="text-sm text-white/65">Culto de Oração</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <p className="font-semibold">Domingo · 19h</p>
                <p className="text-sm text-white/65">Culto da Família</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.75} />
              <p className="text-sm text-white/65">Rua Jorge Alcides Moreira, 157 — Bairro Cidade Nova</p>
            </div>
            <a
              href={ENDERECO_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-gold hover:underline"
            >
              <Navigation className="size-4" strokeWidth={1.75} /> Como chegar
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <div className="aspect-video overflow-hidden rounded-ui-lg">
              <iframe
                src="https://www.google.com/maps?q=Rua+Jorge+Alcides+Moreira,+157,+Cidade+Nova&output=embed"
                title="Localização da IBVEC no mapa"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
