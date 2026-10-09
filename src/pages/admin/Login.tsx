import { FormEvent, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import BotaoVoltar from '../../components/BotaoVoltar'
import { validarEmail, validarSenha, validarNome, ValidacaoError } from '../../lib/validacao'
import { segundosParaProximaTentativa, limparTentativas, pareceBot, enviadoRapidoDemais } from '../../lib/antiAbuso'

export default function Login() {
  const { user, loading, login, register } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const abertoEm = useRef(Date.now())

  if (!loading && user) return <Navigate to="/admin" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')

    if (pareceBot(honeypot) || enviadoRapidoDemais(abertoEm.current)) {
      setErro('Não foi possível continuar. Tente novamente.')
      return
    }

    const chave = modo === 'entrar' ? 'admin-entrar' : 'admin-criar'
    const limite = modo === 'entrar' ? 8 : 4
    const janela = modo === 'entrar' ? 60_000 : 5 * 60_000
    const espera = segundosParaProximaTentativa(chave, limite, janela)
    if (espera) {
      setErro(`Muitas tentativas. Aguarde ${espera >= 60 ? Math.ceil(espera / 60) + ' min' : espera + 's'} e tente de novo.`)
      return
    }

    let emailValido: string
    let senhaValida: string
    let nomeValido = ''
    try {
      emailValido = validarEmail(email)
      senhaValida = validarSenha(senha)
      if (modo === 'criar') nomeValido = validarNome(nome)
    } catch (e: any) {
      setErro(e instanceof ValidacaoError ? e.message : 'Confira os dados informados.')
      return
    }
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await login(emailValido, senhaValida)
        limparTentativas(chave)
      } else {
        await register(emailValido, senhaValida, nomeValido)
      }
    } catch (e: any) {
      setErro(e.message || 'Não foi possível continuar. Confira seus dados.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink p-4">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-ui-lg bg-surface p-7 shadow-ui">
        <BotaoVoltar />
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/uploads/logo-preta.png" alt="IBVEC" className="size-14 object-contain" />
          <h1 className="text-h3 text-ink">Área da equipe · IBVEC</h1>
          <p className="text-sm text-muted">
            {modo === 'entrar' ? 'Entre para gerenciar os devocionais.' : 'Crie seu acesso de equipe.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* honeypot: invisível para pessoas, bots de preenchimento automático costumam preencher */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          {modo === 'criar' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-sm font-medium text-ink">Nome</label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-ui border border-line px-4 py-3 text-sm focus:border-accent"
              placeholder="voce@ibvec.org"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-ink">Senha</label>
            <div className="relative">
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-ui border border-line px-4 py-3 pr-11 text-sm focus:border-accent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {erro && <p className="text-sm text-accent">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn btn-primary w-full disabled:opacity-60">
            {enviando ? 'Enviando...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          onClick={() => setModo((m) => (m === 'entrar' ? 'criar' : 'entrar'))}
          className="text-sm font-medium text-accent hover:underline"
        >
          {modo === 'entrar' ? 'Primeira vez? Criar conta da equipe' : 'Já tem conta? Entrar'}
        </button>

        <Link to="/" className="text-center text-xs text-muted hover:underline">Voltar ao site</Link>
      </div>
    </main>
  )
}
