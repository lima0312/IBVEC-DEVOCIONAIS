export const CATEGORIAS = [
  'Café Expresso',
  'Pão Diário',
  'Águas Profundas',
  'Bálsamo e Ânimo',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const CATEGORIA_INFO: Record<Categoria, { legenda: string }> = {
  'Café Expresso': { legenda: 'Devocional curto e rápido' },
  'Pão Diário': { legenda: 'Devocional do dia a dia' },
  'Águas Profundas': { legenda: 'Devocional profundo e longo' },
  'Bálsamo e Ânimo': { legenda: 'Devocional motivacional' },
}

export const TIPOS_FECHAMENTO = [
  'Nenhum',
  'Desafio do café',
  'Oração',
  'Declaração de fé',
  'Perguntas para autoexame',
] as const

export type TipoFechamento = (typeof TIPOS_FECHAMENTO)[number]

export interface Devocional {
  titulo: string
  categoria: Categoria
  versiculo: string
  referencia: string
  texto: string
  data: string // YYYY-MM-DD
  autor?: string
  imagemUrl?: string
  videoUrl?: string
  audioUrl?: string
  tempoLeitura?: string // ex.: "45 segundos", "2 minutos e meio"
  tags?: string[]
  tipoFechamento?: TipoFechamento
  textoFechamento?: string
}

export interface DevocionalRecord {
  id: string
  data: Devocional
  created_at: string
  updated_at?: string
}

export interface VideoPalavra {
  titulo: string
  ministrante: string // quem está levando a palavra
  descricao: string
  videoUrl: string
  imagemUrl?: string
  data: string // YYYY-MM-DD
}

export interface VideoPalavraRecord {
  id: string
  data: VideoPalavra
  created_at: string
  updated_at?: string
}
