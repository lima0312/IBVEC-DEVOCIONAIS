import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { X, Image as ImageIcon, Loader2, Upload, ChevronDown, ExternalLink } from 'lucide-react'
import { useVideos } from '../../hooks/useVideos'
import { uploadFile } from '../../lib/brixly'
import type { VideoPalavra, VideoPalavraRecord } from '../../lib/types'
import {
  obrigatorioCurto, opcionalTexto, validarData, validarUrlObrigatoria,
  validarArquivoImagem, ValidacaoError,
} from '../../lib/validacao'
import { segundosParaProximaTentativa } from '../../lib/antiAbuso'

const vazio: VideoPalavra = { titulo: '', ministrante: '', descricao: '', videoUrl: '', imagemUrl: '', data: '' }

export interface VideoFormHandle {
  abrirNovo: () => void
  abrirEditar: (r: VideoPalavraRecord) => void
}

// Formulário de criar/editar uma "Palavra em vídeo". Fica num componente à parte pra não
// inchar o Dashboard, mas é controlado de fora (ele mora na mesma listagem de Devocionais).
export default function VideoForm({
  abrir,
  editando,
  onFechar,
  onSalvo,
}: {
  abrir: boolean
  editando: VideoPalavraRecord | null
  onFechar: () => void
  onSalvo: () => void
}) {
  const { create, update } = useVideos()
  const [form, setForm] = useState<VideoPalavra>(editando ? editando.data : { ...vazio, data: new Date().toISOString().slice(0, 10) })
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [erroImagem, setErroImagem] = useState('')
  const inputImagemRef = useRef<HTMLInputElement>(null)
  const [mostrarPasso, setMostrarPasso] = useState(false)

  if (!abrir) return null

  const onEnviarImagem = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErroImagem('')
    try {
      validarArquivoImagem(file)
    } catch (err: any) {
      setErroImagem(err instanceof ValidacaoError ? err.message : 'Arquivo inválido.')
      return
    }
    setEnviandoImagem(true)
    try {
      const url = await uploadFile(file)
      setForm((f) => ({ ...f, imagemUrl: url }))
    } catch (err: any) {
      setErroImagem(err.message || 'Não foi possível enviar a imagem.')
    } finally {
      setEnviandoImagem(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErroForm('')
    const espera = segundosParaProximaTentativa('salvar-video', 20, 60_000)
    if (espera) {
      setErroForm(`Muitos envios seguidos. Aguarde ${espera}s e tente de novo.`)
      return
    }
    let dados: VideoPalavra
    try {
      dados = {
        titulo: obrigatorioCurto(form.titulo, 'Título', 160),
        ministrante: obrigatorioCurto(form.ministrante, 'Quem está levando a palavra', 120),
        descricao: opcionalTexto(form.descricao, 1000) || '',
        videoUrl: validarUrlObrigatoria(form.videoUrl, 'Link do vídeo'),
        imagemUrl: form.imagemUrl || undefined,
        data: validarData(form.data),
      }
    } catch (err: any) {
      setErroForm(err instanceof ValidacaoError ? err.message : 'Confira os dados do formulário.')
      return
    }
    setSalvando(true)
    try {
      if (editando) {
        await update(editando.id, dados)
      } else {
        await create(dados)
      }
      onSalvo()
    } catch (e: any) {
      setErroForm(e.message || 'Não foi possível salvar o vídeo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 md:items-center md:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-t-ui-lg bg-surface p-6 shadow-ui md:rounded-ui-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-ink">{editando ? 'Editar palavra em vídeo' : 'Nova palavra em vídeo'}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="inline-flex size-9 items-center justify-center rounded-ui hover:bg-bg">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Data</label>
            <input
              type="date"
              required
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Título</label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
              placeholder="Ex: Uma palavra de esperança"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Quem está levando a palavra</label>
            <input
              type="text"
              required
              value={form.ministrante}
              onChange={(e) => setForm({ ...form, ministrante: e.target.value })}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
              placeholder="Ex: Pr. Fulano de Tal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Descrição (opcional)</label>
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
              placeholder="Sobre o que é essa mensagem..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Link do vídeo</label>
            <input
              type="url"
              required
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
              placeholder="Link do YouTube, Vimeo ou Instagram"
            />

            <div className="rounded-ui border border-line bg-bg">
              <button
                type="button"
                onClick={() => setMostrarPasso((v) => !v)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm font-semibold text-ink"
              >
                <span className="inline-flex items-center gap-2">
                  <Upload className="size-4 text-accent" strokeWidth={1.75} /> Como enviar um vídeo da galeria
                </span>
                <ChevronDown className={`size-4 shrink-0 transition ${mostrarPasso ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>

              {mostrarPasso && (
                <div className="flex flex-col gap-3 border-t border-line p-3 text-sm text-muted">
                  <p>
                    O site não recebe o arquivo de vídeo direto — ele guarda o <strong>link</strong> de onde o vídeo
                    está hospedado. Pra subir um vídeo gravado no celular ou tirado da galeria, o caminho mais simples
                    e gratuito é o YouTube:
                  </p>
                  <ol className="flex flex-col gap-2.5">
                    <li className="flex gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">1</span>
                      <span>Abra o YouTube Studio (app ou site) com a conta/canal da igreja.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">2</span>
                      <span>Toque em "Criar" → "Enviar vídeo" e escolha o arquivo salvo na galeria do celular.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">3</span>
                      <span>
                        Preencha o título e, na visibilidade, escolha <strong>"Não listado"</strong> — assim o vídeo
                        fica fora de busca e do seu canal público; só quem tem o link consegue assistir.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">4</span>
                      <span>Finalize o envio e copie o link do vídeo (botão "Compartilhar").</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">5</span>
                      <span>Cole esse link no campo acima e salve — pronto, sem limite de tamanho e sem custo.</span>
                    </li>
                  </ol>
                  <a
                    href="https://studio.youtube.com/channel/UC/videos/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost w-fit"
                  >
                    <ExternalLink className="size-4" strokeWidth={1.75} /> Abrir YouTube Studio
                  </a>
                  <p className="text-xs">
                    Prefere o Instagram? Publique o vídeo como Reels ou post normal e cole o link dele aqui — também
                    funciona direto, sem limite de tamanho.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Imagem de capa (opcional)</label>
            <input ref={inputImagemRef} type="file" accept="image/*" onChange={onEnviarImagem} className="hidden" />
            {form.imagemUrl ? (
              <div className="relative overflow-hidden rounded-ui border border-line">
                <img src={form.imagemUrl} alt="Capa do vídeo" className="aspect-video w-full object-cover" />
                <div className="flex items-center justify-between gap-2 bg-surface p-2">
                  <button type="button" onClick={() => inputImagemRef.current?.click()} className="text-xs font-semibold text-accent hover:underline">
                    Trocar imagem
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, imagemUrl: '' })} className="text-xs font-semibold text-muted hover:underline">
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputImagemRef.current?.click()}
                disabled={enviandoImagem}
                className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-ui border border-dashed border-line text-muted hover:border-accent hover:text-accent disabled:opacity-60"
              >
                {enviandoImagem ? (
                  <>
                    <Loader2 className="size-6 animate-spin" strokeWidth={1.75} />
                    <span className="text-sm">Enviando...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="size-6" strokeWidth={1.5} />
                    <span className="text-sm">Clique para enviar uma imagem</span>
                  </>
                )}
              </button>
            )}
            {erroImagem && <p className="text-sm text-accent">{erroImagem}</p>}
          </div>

          {erroForm && <p className="text-sm text-accent">{erroForm}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onFechar} className="btn btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn btn-primary flex-1 disabled:opacity-60">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
