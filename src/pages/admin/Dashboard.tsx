import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, LogOut, X, Sparkles, Eraser, AlertTriangle, Image as ImageIcon, Loader2,
  UserPlus, Users, ShieldCheck, BookOpen, Clapperboard, Palette,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDevocionais } from '../../hooks/useDevocionais'
import { useVideos } from '../../hooks/useVideos'
import { usePerfis } from '../../hooks/usePerfis'
import { CATEGORIAS, CATEGORIA_INFO, TIPOS_FECHAMENTO, type Devocional, type DevocionalRecord, type VideoPalavraRecord } from '../../lib/types'
import CategoriaBadge from '../../components/CategoriaBadge'
import { devocionaisExemplo } from '../../lib/devocionaisExemplo'
import { uploadFile, api } from '../../lib/brixly'
import BotaoVoltar from '../../components/BotaoVoltar'
import VideoForm from './VideoForm'
import ConfigAdmin from './ConfigAdmin'
import {
  obrigatorioCurto, obrigatorioLongo, opcionalTexto, validarData, validarUrlOpcional,
  parsearTags, validarEmail, validarArquivoImagem, ValidacaoError,
} from '../../lib/validacao'
import { segundosParaProximaTentativa } from '../../lib/antiAbuso'

const vazio: Devocional = {
  titulo: '',
  categoria: 'Pão Diário',
  versiculo: '',
  referencia: '',
  texto: '',
  data: '',
  autor: '',
  tempoLeitura: '',
  tags: [],
  tipoFechamento: 'Nenhum',
  textoFechamento: '',
}

type ItemLista =
  | { tipo: 'devocional'; data: string; record: DevocionalRecord }
  | { tipo: 'video'; data: string; record: VideoPalavraRecord }

function formatarTimestamp(ts: number) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatarData(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const { user, isAdmin, loading, logout } = useAuth()
  const { records, loading: carregando, error, create, update, remove, reload, createRaw, removeRaw } = useDevocionais()
  const { records: videos, loading: carregandoVideos, error: erroVideos, remove: removerVideo, reload: recarregarVideos } = useVideos()
  const { perfis, loading: carregandoPerfis, error: erroPerfis, ehAdmin, reload: recarregarPerfis } = usePerfis()
  const [aba, setAba] = useState<'devocionais' | 'pessoas' | 'config'>('devocionais')

  // seletor de tipo de conteúdo + formulários
  const [abrirSeletor, setAbrirSeletor] = useState(false)
  const [editando, setEditando] = useState<DevocionalRecord | null>(null)
  const [editandoVideo, setEditandoVideo] = useState<VideoPalavraRecord | null>(null)
  const [abrirFormDevocional, setAbrirFormDevocional] = useState(false)
  const [abrirFormVideo, setAbrirFormVideo] = useState(false)

  const [form, setForm] = useState<Devocional>(vazio)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [processandoLote, setProcessandoLote] = useState(false)
  const [erroLote, setErroLote] = useState('')
  const [confirmando, setConfirmando] = useState<{ tipo: 'devocional' | 'video' | 'todos'; alvo?: DevocionalRecord | VideoPalavraRecord } | null>(null)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [erroImagem, setErroImagem] = useState('')
  const inputImagemRef = useRef<HTMLInputElement>(null)
  const [tagsTexto, setTagsTexto] = useState('')
  const [abrirEquipe, setAbrirEquipe] = useState(false)
  const [emailNovoAdmin, setEmailNovoAdmin] = useState('')
  const [enviandoAdmin, setEnviandoAdmin] = useState(false)
  const [erroAdmin, setErroAdmin] = useState('')
  const [sucessoAdmin, setSucessoAdmin] = useState('')

  if (!loading && !user) return <Navigate to="/admin/entrar" replace />

  if (!loading && user && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg p-4">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-ui-lg bg-surface p-7 text-center shadow-ui">
          <h1 className="text-h3 text-ink">Acesso restrito</h1>
          <p className="text-sm text-muted">Esta área é só para a equipe da IBVEC. Fale com um administrador se precisar de acesso.</p>
          <Link to="/" className="btn btn-ghost">Voltar ao site</Link>
        </div>
      </div>
    )
  }

  const itens: ItemLista[] = [
    ...records.map((record): ItemLista => ({ tipo: 'devocional', data: record.data.data, record })),
    ...videos.map((record): ItemLista => ({ tipo: 'video', data: record.data.data, record })),
  ].sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  const carregandoLista = carregando || carregandoVideos
  const erroLista = error || erroVideos

  const novoDevocional = () => {
    setForm({ ...vazio, data: new Date().toISOString().slice(0, 10) })
    setTagsTexto('')
    setEditando(null)
    setErroForm('')
    setAbrirSeletor(false)
    setAbrirFormDevocional(true)
  }

  const novoVideo = () => {
    setEditandoVideo(null)
    setAbrirSeletor(false)
    setAbrirFormVideo(true)
  }

  const editar = (item: ItemLista) => {
    if (item.tipo === 'devocional') {
      setForm(item.record.data)
      setTagsTexto((item.record.data.tags || []).join(', '))
      setEditando(item.record)
      setErroForm('')
      setAbrirFormDevocional(true)
    } else {
      setEditandoVideo(item.record)
      setAbrirFormVideo(true)
    }
  }

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
    const espera = segundosParaProximaTentativa('salvar-devocional', 20, 60_000)
    if (espera) {
      setErroForm(`Muitos envios seguidos. Aguarde ${espera}s e tente de novo.`)
      return
    }
    let dados: Devocional
    try {
      dados = {
        titulo: obrigatorioCurto(form.titulo, 'Título', 160),
        categoria: form.categoria,
        versiculo: obrigatorioLongo(form.versiculo, 'Versículo em destaque', 500),
        referencia: obrigatorioCurto(form.referencia, 'Referência bíblica', 120),
        texto: obrigatorioLongo(form.texto, 'Texto do devocional', 8000),
        data: validarData(form.data),
        autor: opcionalTexto(form.autor, 120),
        imagemUrl: validarUrlOpcional(form.imagemUrl, 'Imagem de capa'),
        videoUrl: validarUrlOpcional(form.videoUrl, 'Vídeo'),
        audioUrl: validarUrlOpcional(form.audioUrl, 'Áudio'),
        tempoLeitura: opcionalTexto(form.tempoLeitura, 40),
        tags: parsearTags(tagsTexto),
        tipoFechamento: form.tipoFechamento,
        textoFechamento:
          form.tipoFechamento && form.tipoFechamento !== 'Nenhum'
            ? obrigatorioLongo(form.textoFechamento || '', 'Texto do fechamento', 3000)
            : undefined,
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
      setAbrirFormDevocional(false)
    } catch (e: any) {
      setErroForm(e.message || 'Não foi possível salvar o devocional.')
    } finally {
      setSalvando(false)
    }
  }

  const pedirExclusao = (item: ItemLista) =>
    setConfirmando({ tipo: item.tipo === 'devocional' ? 'devocional' : 'video', alvo: item.record })
  const pedirRemoverTodos = () => {
    if (itens.length === 0) return
    setConfirmando({ tipo: 'todos' })
  }

  const confirmarAcao = async () => {
    if (!confirmando) return
    if (confirmando.tipo === 'devocional' && confirmando.alvo) {
      const id = confirmando.alvo.id
      setConfirmando(null)
      setExcluindo(id)
      try {
        await remove(id)
      } finally {
        setExcluindo(null)
      }
      return
    }
    if (confirmando.tipo === 'video' && confirmando.alvo) {
      const id = confirmando.alvo.id
      setConfirmando(null)
      setExcluindo(id)
      try {
        await removerVideo(id)
      } finally {
        setExcluindo(null)
      }
      return
    }
    setConfirmando(null)
    await removerTodos()
  }

  const removerTodos = async () => {
    setProcessandoLote(true)
    setErroLote('')
    const falhas: string[] = []
    for (const r of [...records]) {
      try {
        await removeRaw(r.id)
      } catch (e: any) {
        falhas.push(r.data?.titulo || r.id)
      }
    }
    for (const v of [...videos]) {
      try {
        await removerVideo(v.id)
      } catch (e: any) {
        falhas.push(v.data?.titulo || v.id)
      }
    }
    await reload()
    setProcessandoLote(false)
    if (falhas.length > 0) {
      setErroLote(`Não foi possível remover: ${falhas.join(', ')}.`)
    }
  }

  const carregarExemplos = async () => {
    setProcessandoLote(true)
    setErroLote('')
    const falhas: string[] = []
    for (const d of devocionaisExemplo) {
      try {
        await createRaw(d)
      } catch (e: any) {
        falhas.push(d.titulo)
      }
    }
    await reload()
    setProcessandoLote(false)
    if (falhas.length > 0) {
      setErroLote(`Não foi possível cadastrar: ${falhas.join(', ')}.`)
    }
  }

  const onAdicionarAdmin = async (e: FormEvent) => {
    e.preventDefault()
    setErroAdmin('')
    setSucessoAdmin('')
    const espera = segundosParaProximaTentativa('adicionar-admin', 10, 60_000)
    if (espera) {
      setErroAdmin(`Muitos envios seguidos. Aguarde ${espera}s e tente de novo.`)
      return
    }
    let email: string
    try {
      email = validarEmail(emailNovoAdmin)
    } catch (err: any) {
      setErroAdmin(err instanceof ValidacaoError ? err.message : 'Informe um e-mail válido.')
      return
    }
    setEnviandoAdmin(true)
    try {
      await api('db/create', { collection: 'admin_users', data: { userId: '', email } })
      setSucessoAdmin(`${email} agora tem acesso à área da equipe assim que entrar ou criar conta com esse e-mail.`)
      setEmailNovoAdmin('')
      await recarregarPerfis()
    } catch (err: any) {
      setErroAdmin(err.message || 'Não foi possível adicionar esse e-mail.')
    } finally {
      setEnviandoAdmin(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BotaoVoltar />
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/uploads/logo-preta.png" alt="IBVEC" className="size-9 object-contain" />
              <span className="hidden font-display text-lg tracking-wide text-ink sm:inline">IBVEC · Painel</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user?.name || user?.email}</span>
            <button type="button" onClick={logout} className="btn btn-ghost">
              <LogOut className="size-4" strokeWidth={1.75} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="wrap">
          <div className="mb-6 flex gap-2 border-b border-line">
            <button
              type="button"
              onClick={() => setAba('devocionais')}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${aba === 'devocionais' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
            >
              Devocionais
            </button>
            <button
              type="button"
              onClick={() => setAba('pessoas')}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${aba === 'pessoas' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
            >
              Pessoas cadastradas
            </button>
            <button
              type="button"
              onClick={() => setAba('config')}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${aba === 'config' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
            >
              <span className="inline-flex items-center gap-1.5"><Palette className="size-4" strokeWidth={1.75} /> Aparência</span>
            </button>
          </div>

          {aba === 'devocionais' && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Devocionais</p>
                  <h1 className="text-h2 text-ink">Gerenciar publicações</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAbrirEquipe(true)} className="btn btn-ghost">
                    <UserPlus className="size-4" strokeWidth={1.75} /> Gerenciar equipe
                  </button>
                  {itens.length > 0 && (
                    <button type="button" onClick={pedirRemoverTodos} disabled={processandoLote} className="btn btn-ghost disabled:opacity-60">
                      <Eraser className="size-4" strokeWidth={1.75} /> Remover todos
                    </button>
                  )}
                  <button type="button" onClick={carregarExemplos} disabled={processandoLote} className="btn btn-ghost disabled:opacity-60">
                    <Sparkles className="size-4" strokeWidth={1.75} />
                    {processandoLote ? 'Processando...' : 'Carregar exemplos'}
                  </button>
                  <button type="button" onClick={() => setAbrirSeletor(true)} className="btn btn-primary">
                    <Plus className="size-4" strokeWidth={2} /> Novo conteúdo
                  </button>
                </div>
              </div>

              {erroLote && (
                <div className="mb-6 rounded-ui border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
                  {erroLote}
                </div>
              )}

              {carregandoLista && <p className="text-muted">Carregando conteúdo...</p>}
              {!carregandoLista && erroLista && <p className="text-muted">Não foi possível carregar o conteúdo agora.</p>}

              {!carregandoLista && !erroLista && itens.length === 0 && (
                <div className="card flex flex-col items-start gap-3">
                  <h3 className="text-h3">Nenhum conteúdo cadastrado ainda</h3>
                  <p className="text-muted">Clique em "Novo conteúdo" pra publicar o primeiro devocional ou vídeo.</p>
                </div>
              )}

              {!carregandoLista && !erroLista && itens.length > 0 && (
                <div className="overflow-x-auto rounded-ui-lg border border-line bg-surface">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-line bg-bg">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-ink">Data</th>
                        <th className="px-4 py-3 font-semibold text-ink">Tipo</th>
                        <th className="px-4 py-3 font-semibold text-ink">Título</th>
                        <th className="px-4 py-3 font-semibold text-ink">Série / Quem fala</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => (
                        <tr key={`${item.tipo}-${item.record.id}`} className="border-b border-line last:border-0">
                          <td className="whitespace-nowrap px-4 py-3 text-muted">{formatarData(item.data)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {item.tipo === 'devocional' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
                                <BookOpen className="size-3.5" strokeWidth={1.75} /> Devocional
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
                                <Clapperboard className="size-3.5" strokeWidth={1.75} /> Vídeo
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-ink">{item.record.data.titulo}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted">
                            {item.tipo === 'devocional' ? <CategoriaBadge categoria={item.record.data.categoria} /> : item.record.data.ministrante}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => editar(item)} className="inline-flex size-9 items-center justify-center rounded-ui border border-line hover:bg-bg" aria-label="Editar">
                                <Pencil className="size-4" strokeWidth={1.75} />
                              </button>
                              <button
                                type="button"
                                onClick={() => pedirExclusao(item)}
                                disabled={excluindo === item.record.id}
                                className="inline-flex size-9 items-center justify-center rounded-ui border border-line text-accent hover:bg-accent-soft disabled:opacity-50"
                                aria-label="Excluir"
                              >
                                <Trash2 className="size-4" strokeWidth={1.75} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {aba === 'pessoas' && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Contas do site</p>
                  <h1 className="text-h2 text-ink">Pessoas cadastradas</h1>
                </div>
                <button type="button" onClick={() => setAbrirEquipe(true)} className="btn btn-primary">
                  <UserPlus className="size-4" strokeWidth={1.75} /> Gerenciar equipe
                </button>
              </div>

              {carregandoPerfis && <p className="text-muted">Carregando contas...</p>}
              {!carregandoPerfis && erroPerfis && <p className="text-muted">Não foi possível carregar as contas agora.</p>}

              {!carregandoPerfis && !erroPerfis && perfis.length === 0 && (
                <div className="card flex flex-col items-start gap-3">
                  <h3 className="text-h3">Nenhuma conta criada ainda</h3>
                  <p className="text-muted">Assim que alguém criar conta no site, essa pessoa aparece aqui.</p>
                </div>
              )}

              {!carregandoPerfis && !erroPerfis && perfis.length > 0 && (
                <div className="overflow-x-auto rounded-ui-lg border border-line bg-surface">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-line bg-bg">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-ink">Nome</th>
                        <th className="px-4 py-3 font-semibold text-ink">E-mail</th>
                        <th className="px-4 py-3 font-semibold text-ink">Cadastro</th>
                        <th className="px-4 py-3 font-semibold text-ink">Papel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfis.map((p) => (
                        <tr key={p.id} className="border-b border-line last:border-0">
                          <td className="px-4 py-3 text-ink">{p.data.name || '—'}</td>
                          <td className="px-4 py-3 text-muted">{p.data.email}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted">{formatarTimestamp(p.created_at)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {ehAdmin(p.data.email) ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                                <ShieldCheck className="size-3.5" strokeWidth={2} /> Equipe
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted">
                                <Users className="size-3.5" strokeWidth={1.75} /> Visitante
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {aba === 'config' && <ConfigAdmin />}
        </div>
      </main>

      {abrirSeletor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-ui-lg bg-surface p-6 shadow-ui">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-ink">Novo conteúdo</h2>
              <button type="button" onClick={() => setAbrirSeletor(false)} aria-label="Fechar" className="inline-flex size-9 items-center justify-center rounded-ui hover:bg-bg">
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-muted">O que você quer publicar?</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={novoDevocional}
                className="flex items-center gap-3 rounded-ui border border-line p-4 text-left hover:border-accent hover:bg-accent-soft"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <BookOpen className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">Devocional em texto</span>
                  <span className="block text-sm text-muted">Reflexão escrita, com versículo e série</span>
                </span>
              </button>
              <button
                type="button"
                onClick={novoVideo}
                className="flex items-center gap-3 rounded-ui border border-line p-4 text-left hover:border-accent hover:bg-accent-soft"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Clapperboard className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">Palavra em vídeo</span>
                  <span className="block text-sm text-muted">Mensagem gravada de alguém da igreja</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {abrirFormDevocional && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 md:items-center md:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-t-ui-lg bg-surface p-6 shadow-ui md:rounded-ui-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-ink">{editando ? 'Editar devocional' : 'Novo devocional'}</h2>
              <button type="button" onClick={() => setAbrirFormDevocional(false)} aria-label="Fechar" className="inline-flex size-9 items-center justify-center rounded-ui hover:bg-bg">
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
                  placeholder="Ex: A paz que excede todo entendimento"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Série</label>
                <select
                  required
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value as Devocional['categoria'] })}
                  className="w-full rounded-ui border border-line bg-surface px-4 py-3 text-sm focus:border-accent"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c} — {CATEGORIA_INFO[c].legenda}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Versículo em destaque</label>
                <textarea
                  required
                  rows={2}
                  value={form.versiculo}
                  onChange={(e) => setForm({ ...form, versiculo: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Ex: Tudo posso naquele que me fortalece"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Referência bíblica</label>
                <input
                  type="text"
                  required
                  value={form.referencia}
                  onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Ex: Filipenses 4:13"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Texto do devocional</label>
                <textarea
                  required
                  rows={6}
                  value={form.texto}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Escreva a reflexão completa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink">Tempo de leitura</label>
                  <input
                    type="text"
                    value={form.tempoLeitura || ''}
                    onChange={(e) => setForm({ ...form, tempoLeitura: e.target.value })}
                    className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                    placeholder="Ex: 45 segundos"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink">Tags</label>
                  <input
                    type="text"
                    value={tagsTexto}
                    onChange={(e) => setTagsTexto(e.target.value)}
                    className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                    placeholder="Foco, Direção, Manhã"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Fechamento (opcional)</label>
                <select
                  value={form.tipoFechamento || 'Nenhum'}
                  onChange={(e) => setForm({ ...form, tipoFechamento: e.target.value as Devocional['tipoFechamento'] })}
                  className="w-full rounded-ui border border-line bg-surface px-4 py-3 text-sm focus:border-accent"
                >
                  {TIPOS_FECHAMENTO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {form.tipoFechamento && form.tipoFechamento !== 'Nenhum' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink">Texto do fechamento</label>
                  <textarea
                    rows={4}
                    value={form.textoFechamento || ''}
                    onChange={(e) => setForm({ ...form, textoFechamento: e.target.value })}
                    className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                    placeholder={
                      form.tipoFechamento === 'Oração'
                        ? 'Escreva a oração de encerramento...'
                        : form.tipoFechamento === 'Declaração de fé'
                        ? 'Escreva a declaração para repetir em voz alta...'
                        : form.tipoFechamento === 'Perguntas para autoexame'
                        ? 'Uma pergunta por linha...'
                        : 'Escreva o desafio prático...'
                    }
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Imagem de capa (opcional)</label>
                <input
                  ref={inputImagemRef}
                  type="file"
                  accept="image/*"
                  onChange={onEnviarImagem}
                  className="hidden"
                />
                {form.imagemUrl ? (
                  <div className="relative overflow-hidden rounded-ui border border-line">
                    <img src={form.imagemUrl} alt="Capa do devocional" className="aspect-video w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 bg-surface p-2">
                      <button
                        type="button"
                        onClick={() => inputImagemRef.current?.click()}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Trocar imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imagemUrl: '' })}
                        className="text-xs font-semibold text-muted hover:underline"
                      >
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Vídeo (opcional)</label>
                <input
                  type="url"
                  value={form.videoUrl || ''}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Link do YouTube ou Vimeo"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Áudio (opcional)</label>
                <input
                  type="url"
                  value={form.audioUrl || ''}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Link do arquivo de áudio (mp3)"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Assinatura (opcional)</label>
                <input
                  type="text"
                  value={form.autor}
                  onChange={(e) => setForm({ ...form, autor: e.target.value })}
                  className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                  placeholder="Ex: Pr. Fulano de Tal"
                />
              </div>

              {erroForm && <p className="text-sm text-accent">{erroForm}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAbrirFormDevocional(false)} className="btn btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn btn-primary flex-1 disabled:opacity-60">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <VideoForm
        abrir={abrirFormVideo}
        editando={editandoVideo}
        onFechar={() => setAbrirFormVideo(false)}
        onSalvo={() => { setAbrirFormVideo(false); recarregarVideos() }}
      />

      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-ui-lg bg-surface p-6 shadow-ui">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <AlertTriangle className="size-5" strokeWidth={1.75} />
              </span>
              <h2 className="text-h3 text-ink">
                {confirmando.tipo === 'todos' ? 'Remover todo o conteúdo?' : 'Excluir este item?'}
              </h2>
            </div>
            <p className="text-sm text-muted">
              {confirmando.tipo === 'todos'
                ? `Isso vai apagar os ${itens.length} itens cadastrados (devocionais e vídeos). Essa ação não pode ser desfeita.`
                : `"${confirmando.alvo?.data.titulo}" será removido. Essa ação não pode ser desfeita.`}
            </p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setConfirmando(null)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
              <button type="button" onClick={confirmarAcao} className="btn btn-primary flex-1">
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}

      {abrirEquipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-ui-lg bg-surface p-6 shadow-ui">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-ink">Gerenciar equipe</h2>
              <button
                type="button"
                onClick={() => { setAbrirEquipe(false); setErroAdmin(''); setSucessoAdmin('') }}
                aria-label="Fechar"
                className="inline-flex size-9 items-center justify-center rounded-ui hover:bg-bg"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-muted">
              Adicione o e-mail de quem também vai poder cadastrar devocionais. A pessoa ganha acesso ao painel assim
              que entrar ou criar conta com esse e-mail.
            </p>
            <form onSubmit={onAdicionarAdmin} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={emailNovoAdmin}
                onChange={(e) => setEmailNovoAdmin(e.target.value)}
                className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                placeholder="email@exemplo.com"
              />
              {erroAdmin && <p className="text-sm text-accent">{erroAdmin}</p>}
              {sucessoAdmin && <p className="text-sm text-ink">{sucessoAdmin}</p>}
              <button type="submit" disabled={enviandoAdmin} className="btn btn-primary disabled:opacity-60">
                {enviandoAdmin ? 'Adicionando...' : 'Adicionar à equipe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
