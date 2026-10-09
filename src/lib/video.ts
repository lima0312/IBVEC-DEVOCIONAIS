// Converte uma URL comum de YouTube/Vimeo em URL de embed pra usar num <iframe>.
export function getEmbedUrl(url: string): string | null {
  const v = (url || '').trim()
  if (!v) return null

  const yt =
    v.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) ||
    v.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    v.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/) ||
    v.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`

  const vimeo = v.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return null
}

export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(reel|p|tv)\//i.test((url || '').trim())
}

// Link de post/reel do Instagram, normalizado (sem query string) — exigido pelo embed oficial.
export function getInstagramEmbedUrl(url: string): string | null {
  const v = (url || '').trim()
  const m = v.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/i)
  if (!m) return null
  return `https://www.instagram.com/${m[1]}/${m[2]}/`
}

export function isArquivoVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test((url || '').trim())
}
