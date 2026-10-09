// Validação e sanitização de tudo que vem de formulário, antes de enviar pro backend.
// Regra geral: nunca confiar no que o usuário digitou — sempre aparar espaços, limitar
// tamanho e checar formato antes de gravar ou processar.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/
const HEX_COR_RE = /^#[0-9a-fA-F]{6}$/

export class ValidacaoError extends Error {}

/** Remove espaços nas pontas e colapsa espaços internos repetidos. */
export function limparTexto(v: string): string {
  return (v || '').replace(/\s+/g, ' ').trim()
}

/** Remove apenas espaços nas pontas, preservando quebras de linha internas (textos longos). */
export function limparTextoLongo(v: string): string {
  return (v || '').trim()
}

export function validarEmail(v: string): string {
  const email = (v || '').trim().toLowerCase()
  if (!email) throw new ValidacaoError('Informe um e-mail.')
  if (email.length > 200) throw new ValidacaoError('E-mail muito longo.')
  if (!EMAIL_RE.test(email)) throw new ValidacaoError('Informe um e-mail válido.')
  return email
}

export function validarSenha(v: string): string {
  const senha = v || ''
  if (senha.length < 6) throw new ValidacaoError('A senha precisa de pelo menos 6 caracteres.')
  if (senha.length > 200) throw new ValidacaoError('Senha muito longa.')
  return senha
}

export function validarNome(v: string, campo = 'Nome'): string {
  const nome = limparTexto(v).slice(0, 80)
  if (!nome) throw new ValidacaoError(`Informe o campo "${campo}".`)
  return nome
}

/** Campo de texto curto obrigatório (título, ministrante, referência bíblica etc). */
export function obrigatorioCurto(v: string, campo: string, max = 160): string {
  const limpo = limparTexto(v).slice(0, max)
  if (!limpo) throw new ValidacaoError(`Preencha o campo "${campo}".`)
  return limpo
}

/** Campo de texto longo obrigatório (corpo do devocional, descrição etc). */
export function obrigatorioLongo(v: string, campo: string, max = 8000): string {
  const limpo = limparTextoLongo(v).slice(0, max)
  if (!limpo) throw new ValidacaoError(`Preencha o campo "${campo}".`)
  return limpo
}

/** Campo de texto opcional — some normalizado ou undefined, nunca string vazia "suja". */
export function opcionalTexto(v: string | undefined, max = 2000): string | undefined {
  const limpo = limparTextoLongo(v || '').slice(0, max)
  return limpo || undefined
}

export function validarData(v: string): string {
  const data = (v || '').trim()
  if (!DATA_RE.test(data)) throw new ValidacaoError('Informe uma data válida.')
  const [ano] = data.split('-').map(Number)
  if (ano < 1900 || ano > 2200) throw new ValidacaoError('Informe uma data válida.')
  return data
}

/** URL opcional — só aceita http(s), rejeita javascript: e afins. String vazia vira undefined. */
export function validarUrlOpcional(v: string | undefined, campo = 'Link'): string | undefined {
  const url = (v || '').trim()
  if (!url) return undefined
  if (url.length > 2000) throw new ValidacaoError(`${campo} muito longo.`)
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new ValidacaoError(`${campo} inválido.`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ValidacaoError(`${campo} precisa começar com http:// ou https://.`)
  }
  return url
}

/** URL obrigatória — mesma regra acima, mas exige valor. */
export function validarUrlObrigatoria(v: string, campo = 'Link'): string {
  const url = validarUrlOpcional(v, campo)
  if (!url) throw new ValidacaoError(`Preencha o campo "${campo}".`)
  return url
}

export function validarCorHex(v: string, campo = 'Cor'): string {
  const cor = (v || '').trim()
  if (!HEX_COR_RE.test(cor)) throw new ValidacaoError(`${campo} inválida — use o seletor de cor.`)
  return cor
}

const TIPOS_IMAGEM_ACEITOS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
const MAX_IMAGEM_BYTES = 12_000_000 // mesmo teto do backend — falha rápido, sem gastar banda à toa

/** Confere tipo e tamanho de uma imagem antes de subir — o servidor também valida, isto é só feedback cedo. */
export function validarArquivoImagem(file: File): void {
  if (!TIPOS_IMAGEM_ACEITOS.includes(file.type)) {
    throw new ValidacaoError('Envie uma imagem em PNG, JPG, WEBP, GIF ou AVIF.')
  }
  if (file.size > MAX_IMAGEM_BYTES) {
    throw new ValidacaoError(`Imagem muito grande (máx ${Math.floor(MAX_IMAGEM_BYTES / 1_000_000)}MB).`)
  }
}

/** Lista de tags digitada separada por vírgula → array limpo, sem vazios/duplicadas, limitado. */
export function parsearTags(v: string, max = 8): string[] {
  const vistos = new Set<string>()
  const tags: string[] = []
  for (const parte of v.split(',')) {
    const t = limparTexto(parte).slice(0, 30)
    if (!t) continue
    const chave = t.toLowerCase()
    if (vistos.has(chave)) continue
    vistos.add(chave)
    tags.push(t)
    if (tags.length >= max) break
  }
  return tags
}
