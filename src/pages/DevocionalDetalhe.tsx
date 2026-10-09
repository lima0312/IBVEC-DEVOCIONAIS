import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Share2, Headphones, Clock, Tag, Sparkles, Heart, CheckCircle2, NotebookPen, Check } from 'lucide-react'
import { api } from '../lib/brixly'
import type { DevocionalRecord } from '../lib/types'
import CategoriaBadge from '../components/CategoriaBadge'
import CapaGerada from '../components/CapaGerada'
import { getEmbedUrl } from '../lib/video'
import { useAuth } from '../hooks/useAuth'
import { useProgresso } from '../hooks/useProgresso'
import { segundosParaProximaTentativa } from '../lib/antiAbuso'

const MAX_ANOTACAO = 2000

function formatarDataLonga(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DevocionalDetalhe() {
  const { id } = useParams()
  const [record, setRecord] = useState<DevocionalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const { user } = useAuth()
  const { encontrar, alternar, salvarAnotacao } = useProgresso(user)
  const progresso = id ? encontrar(id) : undefined
  const [salvandoProgresso, setSalvandoProgresso] = useState<'lido' | 'favorito' | null>(null)

  const onAlternar = async (campo: 'lido' | 'favorito') => {
    if (!id) return
    setSalvandoProgresso(campo)
    try {
      await alternar(id, campo)
    } finally {
      setSalvandoProgresso(null)
    }
  }

  // anotação pessoal — salva sozinha um instante depois que a pessoa para de digitar
  const [anotacao, setAnotacao] = useState('')
  const [anotacaoSalva, setAnotacaoSalva] = useState(false)
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false)
  const timeoutAnotacao = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAnotacao(progresso?.data.anotacao || '')
  }, [progresso?.id])

  const onMudarAnotacao = (valorBruto: string) => {
    const valor = valorBruto.slice(0, MAX_ANOTACAO)
    setAnotacao(valor)
    setAnotacaoSalva(false)
    if (timeoutAnotacao.current) clearTimeout(timeoutAnotacao.current)
    if (!id) return
    timeoutAnotacao.current = setTimeout(async () => {
      if (segundosParaProximaTentativa('salvar-anotacao', 30, 60_000)) return
      setSalvandoAnotacao(true)
      try {
        await salvarAnotacao(id, valor.trim())
        setAnotacaoSalva(true)
      } finally {
        setSalvandoAnotacao(false)
      }
    }, 1500)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setErro(false)
    api<{ id: string; data: any; created_at: string }>('db/get', { collection: 'devocionais', id })
      .then((r) => setRecord(r as DevocionalRecord))
      .catch(() => setErro(true))
      .finally(() => setLoading(false))
  }, [id])

  const compartilhar = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: record?.data.titulo, text: record?.data.versiculo, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
    }
  }

  return (
    <main>
      <section className="section bg-bg">
        <div className="wrap max-w-3xl">
          <Link to="/devocionais" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            <ArrowLeft className="size-4" strokeWidth={2} /> Voltar aos devocionais
          </Link>

          {loading && (
            <div className="animate-pulse">
              <div className="h-4 w-40 rounded bg-line" />
              <div className="mt-4 h-10 w-3/4 rounded bg-line" />
              <div className="mt-6 h-24 w-full rounded bg-line" />
            </div>
          )}

          {!loading && (erro || !record) && (
            <div className="card">
              <h2 className="text-h3">Devocional não encontrado</h2>
              <p className="mt-2 text-muted">Ele pode ter sido removido. Confira o acervo completo.</p>
              <Link to="/devocionais" className="btn btn-primary mt-4">Ver devocionais</Link>
            </div>
          )}

          {!loading && record && (
            <article>
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">{formatarDataLonga(record.data.data)}</p>
                <CategoriaBadge categoria={record.data.categoria} />
              </div>
              <h1 className="mt-3 text-h1 text-ink">{record.data.titulo}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {record.data.tempoLeitura && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
                    <Clock className="size-4" strokeWidth={1.75} /> Leitura: {record.data.tempoLeitura}
                  </span>
                )}
                {record.data.tags && record.data.tags.length > 0 && (
                  <span className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted">
                    <Tag className="size-4" strokeWidth={1.75} />
                    {record.data.tags.join(', ')}
                  </span>
                )}
              </div>

              {record.data.videoUrl ? (
                <div className="mt-6 aspect-video overflow-hidden rounded-ui-lg bg-ink">
                  {getEmbedUrl(record.data.videoUrl) ? (
                    <iframe
                      src={getEmbedUrl(record.data.videoUrl)!}
                      title={record.data.titulo}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <video src={record.data.videoUrl} controls className="h-full w-full" />
                  )}
                </div>
              ) : record.data.imagemUrl ? (
                <div className="mt-6 aspect-video overflow-hidden rounded-ui-lg">
                  <img
                    src={record.data.imagemUrl}
                    alt={record.data.titulo}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <CapaGerada categoria={record.data.categoria} className="mt-6 aspect-video rounded-ui-lg" />
              )}

              <div className="card my-8 border-l-4 border-l-accent bg-accent-soft">
                <p className="text-h3 leading-snug text-accent">"{record.data.versiculo}"</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-ink/70">{record.data.referencia}</p>
              </div>

              <div className="whitespace-pre-line text-lead text-muted">{record.data.texto}</div>

              {record.data.tipoFechamento && record.data.tipoFechamento !== 'Nenhum' && record.data.textoFechamento && (
                <div className="card mt-8 border-l-4 border-l-gold bg-surface">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
                    <Sparkles className="size-4" strokeWidth={1.75} /> {record.data.tipoFechamento}
                  </div>
                  <div className="mt-3 whitespace-pre-line text-ink">{record.data.textoFechamento}</div>
                </div>
              )}

              {record.data.audioUrl && (
                <div className="card mt-8 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Headphones className="size-4 text-accent" strokeWidth={1.75} /> Ouvir este devocional
                  </div>
                  <audio src={record.data.audioUrl} controls className="w-full" />
                </div>
              )}

              {record.data.autor && (
                <p className="mt-8 text-sm font-semibold text-ink">— {record.data.autor}</p>
              )}

              {user ? (
                <div className="card mt-8 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <NotebookPen className="size-4 text-accent" strokeWidth={1.75} /> Minhas anotações
                    </div>
                    <span className="text-xs text-muted">
                      {salvandoAnotacao ? 'Salvando...' : anotacaoSalva && anotacao ? (
                        <span className="inline-flex items-center gap-1 text-accent"><Check className="size-3.5" strokeWidth={2.5} /> Salvo</span>
                      ) : null}
                    </span>
                  </div>
                  <textarea
                    value={anotacao}
                    onChange={(e) => onMudarAnotacao(e.target.value)}
                    rows={4}
                    maxLength={MAX_ANOTACAO}
                    placeholder="Escreva aqui o que esse devocional falou ao seu coração..."
                    className="w-full rounded-ui border border-line px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">Só você vê suas anotações. Elas ficam salvas automaticamente.</p>
                    <p className="text-xs text-muted">{anotacao.length}/{MAX_ANOTACAO}</p>
                  </div>
                </div>
              ) : (
                <div className="card mt-8 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <NotebookPen className="size-4 text-accent" strokeWidth={1.75} /> Minhas anotações
                  </div>
                  <p className="text-sm text-muted">Entre na sua conta pra anotar o que esse devocional falou ao seu coração.</p>
                  <Link to="/entrar" state={{ from: `/devocionais/${id}` }} className="btn btn-ghost mt-1">
                    Entrar para anotar
                  </Link>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onAlternar('lido')}
                      disabled={salvandoProgresso === 'lido'}
                      className={`btn disabled:opacity-60 ${progresso?.data.lido ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      <CheckCircle2 className="size-4" strokeWidth={1.75} />
                      {progresso?.data.lido ? 'Lido' : 'Marcar como lido'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlternar('favorito')}
                      disabled={salvandoProgresso === 'favorito'}
                      className={`btn disabled:opacity-60 ${progresso?.data.favorito ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      <Heart className="size-4" strokeWidth={1.75} fill={progresso?.data.favorito ? 'currentColor' : 'none'} />
                      {progresso?.data.favorito ? 'Favoritado' : 'Favoritar'}
                    </button>
                  </>
                ) : (
                  <Link to="/entrar" state={{ from: `/devocionais/${id}` }} className="btn btn-ghost">
                    <Heart className="size-4" strokeWidth={1.75} /> Entrar para favoritar
                  </Link>
                )}
                <button onClick={compartilhar} className="btn btn-ghost">
                  <Share2 className="size-4" strokeWidth={1.75} /> Compartilhar
                </button>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
