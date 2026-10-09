// src/lib/brixly.ts — API de servidor do Brixly (preview e publicado)
export async function api<T = any>(action: string, body: unknown = {}): Promise<T> {
  const base = import.meta.env.BASE_URL || '/'
  const tok = localStorage.getItem('app_token') || ''
  const r = await fetch(`${base}_api/${action}`.replace(/\/{2,}/g, '/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(tok ? { 'X-App-Token': tok } : {}) },
    body: JSON.stringify(body),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Falha na integração')
  return data as T
}

export async function uploadFile(file: File): Promise<string> {
  const base = import.meta.env.BASE_URL || '/'
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${base}_api/upload`, { method: 'POST', body: fd })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || 'Falha no upload')
  return `${base}_api/file/${d.name}`
}
