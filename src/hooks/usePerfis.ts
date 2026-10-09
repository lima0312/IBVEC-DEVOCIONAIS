import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'

export interface PerfilRecord {
  id: string
  data: { userId: string; email: string; name?: string }
  created_at: number
}

export function usePerfis() {
  const [perfis, setPerfis] = useState<PerfilRecord[]>([])
  const [admins, setAdmins] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ records: perfisData }, { records: adminsData }] = await Promise.all([
        api<{ records: PerfilRecord[] }>('db/list', { collection: 'perfis', limit: 500, order: 'desc' }),
        api<{ records: any[] }>('db/list', { collection: 'admin_users', limit: 500 }),
      ])
      const sorted = [...perfisData].sort((a, b) => b.created_at - a.created_at)
      setPerfis(sorted)
      const emails = new Set<string>()
      adminsData.forEach((a) => {
        if (a.data?.email) emails.add(String(a.data.email).toLowerCase())
      })
      setAdmins(emails)
    } catch (e: any) {
      setError(e.message || 'Não foi possível carregar as contas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const ehAdmin = useCallback((email: string) => admins.has((email || '').toLowerCase()), [admins])

  return { perfis, loading, error, ehAdmin, reload: carregar }
}
