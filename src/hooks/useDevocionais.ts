import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'
import type { Devocional, DevocionalRecord } from '../lib/types'

const COLLECTION = 'devocionais'

export function useDevocionais() {
  const [records, setRecords] = useState<DevocionalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { records } = await api<{ records: DevocionalRecord[] }>('db/list', {
        collection: COLLECTION,
        limit: 200,
        order: 'desc',
      })
      const sorted = [...records].sort((a, b) => (b.data?.data || '').localeCompare(a.data?.data || ''))
      setRecords(sorted)
    } catch (e: any) {
      setError(e.message || 'Não foi possível carregar os devocionais.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(async (data: Devocional) => {
    await api('db/create', { collection: COLLECTION, data })
    await load()
  }, [load])

  const update = useCallback(async (id: string, data: Devocional) => {
    await api('db/update', { collection: COLLECTION, id, data })
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await api('db/delete', { collection: COLLECTION, id })
    await load()
  }, [load])

  // Variantes "cruas" (sem recarregar sozinhas) pra usar em lote — evita
  // que vários load() simultâneos entrem em disputa e um resultado antigo
  // sobrescreva a lista já atualizada.
  const createRaw = useCallback((data: Devocional) => api('db/create', { collection: COLLECTION, data }), [])
  const removeRaw = useCallback((id: string) => api('db/delete', { collection: COLLECTION, id }), [])

  return { records, loading, error, reload: load, create, update, remove, createRaw, removeRaw }
}
