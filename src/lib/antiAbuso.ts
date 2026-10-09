// Camadas de proteção que dá pra fazer no frontend contra bots e envios em excesso.
// Não substitui proteção no servidor (o backend do Brixly já limita login por IP),
// mas reduz spam de formulário, duplo-clique e scripts simples que não executam JS
// de verdade (preenchem o honeypot) ou que martelam o botão de enviar.

const PREFIXO = 'ibvec_antiabuso_'

/**
 * Limitador de tentativas por janela de tempo, guardado no localStorage do navegador.
 * Ex.: limitarTentativas('login', 5, 60_000) — no máx. 5 chamadas por minuto.
 * Retorna null se liberado, ou quantos segundos faltam pra poder tentar de novo.
 */
export function segundosParaProximaTentativa(chave: string, maxTentativas: number, janelaMs: number): number | null {
  const agora = Date.now()
  const storageKey = PREFIXO + chave
  let registros: number[] = []
  try {
    registros = JSON.parse(localStorage.getItem(storageKey) || '[]')
  } catch {
    registros = []
  }
  registros = registros.filter((t) => agora - t < janelaMs)

  if (registros.length >= maxTentativas) {
    const maisAntigo = Math.min(...registros)
    const restanteMs = janelaMs - (agora - maisAntigo)
    return Math.max(1, Math.ceil(restanteMs / 1000))
  }

  registros.push(agora)
  try {
    localStorage.setItem(storageKey, JSON.stringify(registros))
  } catch {
    // localStorage indisponível (modo privado etc.) — segue sem bloquear
  }
  return null
}

/** Limpa o histórico de tentativas (chamar depois de um sucesso, ex.: login certo). */
export function limparTentativas(chave: string): void {
  try {
    localStorage.removeItem(PREFIXO + chave)
  } catch {
    // ignora
  }
}

/**
 * Honeypot: um campo invisível para humanos mas visível para bots que preenchem
 * formulários automaticamente. Se vier preenchido, é quase certeza que é um bot.
 */
export function pareceBot(valorHoneypot: string): boolean {
  return (valorHoneypot || '').trim().length > 0
}

/** Tempo mínimo (ms) entre o formulário aparecer na tela e ser enviado — bots costumam
 *  enviar quase instantaneamente, uma pessoa de verdade leva pelo menos alguns segundos. */
export function enviadoRapidoDemais(timestampAbertura: number, minimoMs = 1500): boolean {
  return Date.now() - timestampAbertura < minimoMs
}
