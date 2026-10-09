import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Loader2, Palette, Check } from 'lucide-react'
import { useConfigSite } from '../../hooks/useConfigSite'
import { uploadFile } from '../../lib/brixly'
import type { ConfigSite } from '../../lib/configSite'
import { validarCorHex, validarUrlOpcional, validarArquivoImagem, ValidacaoError } from '../../lib/validacao'

const PRESETS_COR = [
  { nome: 'Vermelho IBVEC', valor: '#8F141F' },
  { nome: 'Vermelho vivo', valor: '#C2232F' },
  { nome: 'Bordô', valor: '#6E1021' },
  { nome: 'Verde-petróleo', valor: '#145F52' },
  { nome: 'Azul profundo', valor: '#1C3A5E' },
]

const PRESETS_DOURADO = [
  { nome: 'Dourado clássico', valor: '#F2B705' },
  { nome: 'Dourado suave', valor: '#D4A64A' },
  { nome: 'Âmbar', valor: '#E08E2C' },
]

export default function ConfigAdmin() {
  const { config, loading, salvar } = useConfigSite()
  const [form, setForm] = useState<ConfigSite>(config)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [enviandoHero, setEnviandoHero] = useState(false)
  const [enviandoSobre, setEnviandoSobre] = useState(false)
  const inputHeroRef = useRef<HTMLInputElement>(null)
  const inputSobreRef = useRef<HTMLInputElement>(null)

  // sincroniza o formulário quando a config terminar de carregar do servidor
  useEffect(() => {
    if (!loading) setForm(config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const onEnviarImagem = async (e: ChangeEvent<HTMLInputElement>, campo: 'imagemHeroHome' | 'imagemHeroSobre') => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const setEnviando = campo === 'imagemHeroHome' ? setEnviandoHero : setEnviandoSobre
    setErro('')
    try {
      validarArquivoImagem(file)
    } catch (err: any) {
      setErro(err instanceof ValidacaoError ? err.message : 'Arquivo inválido.')
      return
    }
    setEnviando(true)
    try {
      const url = await uploadFile(file)
      setForm((f) => ({ ...f, [campo]: url }))
    } catch (err: any) {
      setErro(err.message || 'Não foi possível enviar a imagem.')
    } finally {
      setEnviando(false)
    }
  }

  const onSalvar = async () => {
    setErro('')
    setSucesso(false)
    let dados: ConfigSite
    try {
      dados = {
        corAccent: validarCorHex(form.corAccent, 'Cor principal'),
        corDourado: validarCorHex(form.corDourado, 'Cor de destaque'),
        imagemHeroHome: validarUrlOpcional(form.imagemHeroHome, 'Imagem do início'),
        imagemHeroSobre: validarUrlOpcional(form.imagemHeroSobre, 'Imagem da página Sobre'),
      }
    } catch (err: any) {
      setErro(err instanceof ValidacaoError ? err.message : 'Confira os dados informados.')
      return
    }
    setSalvando(true)
    try {
      await salvar(dados)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro(err.message || 'Não foi possível salvar as configurações.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return <p className="text-muted">Carregando configurações...</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Aparência</p>
        <h1 className="text-h2 text-ink">Personalizar o site</h1>
        <p className="mt-2 text-muted">Ajuste as cores e as imagens de destaque usadas no site, sem precisar mexer em código.</p>
      </div>

      {/* Cores */}
      <section className="card flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Palette className="size-5 text-accent" strokeWidth={1.75} />
          <h2 className="text-h3 text-ink">Cores</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Cor principal (vermelho)</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS_COR.map((p) => (
              <button
                key={p.valor}
                type="button"
                onClick={() => setForm({ ...form, corAccent: p.valor })}
                title={p.nome}
                className="relative size-10 shrink-0 rounded-full border-2 transition"
                style={{ backgroundColor: p.valor, borderColor: form.corAccent === p.valor ? p.valor : 'transparent' }}
              >
                {form.corAccent === p.valor && <Check className="absolute inset-0 m-auto size-5 text-white" strokeWidth={3} />}
              </button>
            ))}
            <input
              type="color"
              value={form.corAccent}
              onChange={(e) => setForm({ ...form, corAccent: e.target.value })}
              className="size-10 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-0"
              aria-label="Escolher cor personalizada"
            />
            <span className="text-sm text-muted">{form.corAccent}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Cor de destaque (dourado)</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS_DOURADO.map((p) => (
              <button
                key={p.valor}
                type="button"
                onClick={() => setForm({ ...form, corDourado: p.valor })}
                title={p.nome}
                className="relative size-10 shrink-0 rounded-full border-2 transition"
                style={{ backgroundColor: p.valor, borderColor: form.corDourado === p.valor ? p.valor : 'transparent' }}
              >
                {form.corDourado === p.valor && <Check className="absolute inset-0 m-auto size-5 text-white" strokeWidth={3} />}
              </button>
            ))}
            <input
              type="color"
              value={form.corDourado}
              onChange={(e) => setForm({ ...form, corDourado: e.target.value })}
              className="size-10 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-0"
              aria-label="Escolher cor personalizada"
            />
            <span className="text-sm text-muted">{form.corDourado}</span>
          </div>
        </div>
      </section>

      {/* Imagens */}
      <section className="card flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-accent" strokeWidth={1.75} />
          <h2 className="text-h3 text-ink">Imagens das páginas</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Imagem de fundo do início (hero)</label>
          <input ref={inputHeroRef} type="file" accept="image/*" onChange={(e) => onEnviarImagem(e, 'imagemHeroHome')} className="hidden" />
          {form.imagemHeroHome ? (
            <div className="relative overflow-hidden rounded-ui border border-line">
              <img src={form.imagemHeroHome} alt="Fundo do início" className="aspect-[21/9] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 bg-surface p-2">
                <button type="button" onClick={() => inputHeroRef.current?.click()} className="text-xs font-semibold text-accent hover:underline">
                  Trocar imagem
                </button>
                <button type="button" onClick={() => setForm({ ...form, imagemHeroHome: '' })} className="text-xs font-semibold text-muted hover:underline">
                  Remover (usar fundo padrão)
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputHeroRef.current?.click()}
              disabled={enviandoHero}
              className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-ui border border-dashed border-line text-muted hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {enviandoHero ? (
                <>
                  <Loader2 className="size-6 animate-spin" strokeWidth={1.75} />
                  <span className="text-sm">Enviando...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="size-6" strokeWidth={1.5} />
                  <span className="text-sm">Sem imagem — usando o fundo padrão. Clique para enviar uma foto.</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Imagem de fundo da página "Sobre a IBVEC"</label>
          <input ref={inputSobreRef} type="file" accept="image/*" onChange={(e) => onEnviarImagem(e, 'imagemHeroSobre')} className="hidden" />
          {form.imagemHeroSobre ? (
            <div className="relative overflow-hidden rounded-ui border border-line">
              <img src={form.imagemHeroSobre} alt="Fundo da página Sobre" className="aspect-[21/9] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 bg-surface p-2">
                <button type="button" onClick={() => inputSobreRef.current?.click()} className="text-xs font-semibold text-accent hover:underline">
                  Trocar imagem
                </button>
                <button type="button" onClick={() => setForm({ ...form, imagemHeroSobre: '' })} className="text-xs font-semibold text-muted hover:underline">
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputSobreRef.current?.click()}
              disabled={enviandoSobre}
              className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-ui border border-dashed border-line text-muted hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {enviandoSobre ? (
                <>
                  <Loader2 className="size-6 animate-spin" strokeWidth={1.75} />
                  <span className="text-sm">Enviando...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="size-6" strokeWidth={1.5} />
                  <span className="text-sm">Clique para enviar uma foto</span>
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {erro && <p className="text-sm text-accent">{erro}</p>}
      {sucesso && <p className="text-sm font-semibold text-ink">Configurações salvas — o site já reflete as mudanças.</p>}

      <button type="button" onClick={onSalvar} disabled={salvando} className="btn btn-primary w-fit disabled:opacity-60">
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  )
}
