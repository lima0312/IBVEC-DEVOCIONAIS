import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'
import type { VideoPalavra, VideoPalavraRecord } from '../lib/types'

const COLLECTION = 'videos_palavra'

export function useVideos() {
  const [records, setRecords] = useState<VideoPalavraRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { records } = await api<{ records: VideoPalavraRecord[] }>('db/list', {
        collection: COLLECTION,
        limit: 200,
        order: 'desc',
      })
      const sorted = [...records].sort((a, b) => (b.data?.data || '').localeCompare(a.data?.data || ''))
      setRecords(sorted)
    } catch (e: any) {
      setError(e.message || 'Não foi possível carregar os vídeos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(async (data: VideoPalavra) => {
    await api('db/create', { collection: COLLECTION, data })
    await load()
  }, [load])

  const update = useCallback(async (id: string, data: VideoPalavra) => {
    await api('db/update', { collection: COLLECTION, id, data })
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await api('db/delete', { collection: COLLECTION, id })
    await load()
  }, [load])

  return { records, loading, error, reload: load, create, update, remove }
}
