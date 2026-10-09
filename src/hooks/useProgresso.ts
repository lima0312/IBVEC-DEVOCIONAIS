import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'
import type { AppUser } from './useAuth'

const COLLECTION = 'progresso_leitura'

export interface ProgressoRecord {
  id: string
  data: { userId: string; devocionalId: string; lido: boolean; favorito: boolean; anotacao?: string }
}

export function useProgresso(user: AppUser | null) {
  const [registros, setRegistros] = useState<ProgressoRecord[]>([])
  const [loading, setLoading] = useState(false)

  const carregar = useCallback(async () => {
    if (!user) {
      setRegistros([])
      return
    }
    setLoading(true)
    try {
      const { records } = await api<{ records: ProgressoRecord[] }>('db/list', {
        collection: COLLECTION,
        limit: 500,
        filter: { userId: String(user.id) },
      })
      setRegistros(records)
    } catch {
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    carregar()
  }, [carregar])

  const encontrar = useCallback(
    (devocionalId: string) => registros.find((r) => r.data.devocionalId === devocionalId),
    [registros]
  )

  const alternar = useCallback(
    async (devocionalId: string, campo: 'lido' | 'favorito') => {
      if (!user) return
      const existente = encontrar(devocionalId)
      if (existente) {
        const novoValor = !existente.data[campo]
        await api('db/update', {
          collection: COLLECTION,
          id: existente.id,
          data: { ...existente.data, [campo]: novoValor },
        })
      } else {
        await api('db/create', {
          collection: COLLECTION,
          data: {
            userId: String(user.id),
            devocionalId,
            lido: campo === 'lido',
            favorito: campo === 'favorito',
          },
        })
      }
      await carregar()
    },
    [user, encontrar, carregar]
  )

  const salvarAnotacao = useCallback(
    async (devocionalId: string, anotacao: string) => {
      if (!user) return
      const existente = encontrar(devocionalId)
      if (existente) {
        await api('db/update', {
          collection: COLLECTION,
          id: existente.id,
          data: { ...existente.data, anotacao },
        })
      } else {
        await api('db/create', {
          collection: COLLECTION,
          data: {
            userId: String(user.id),
            devocionalId,
            lido: false,
            favorito: false,
            anotacao,
          },
        })
      }
      await carregar()
    },
    [user, encontrar, carregar]
  )

  return { registros, loading, encontrar, alternar, salvarAnotacao, reload: carregar }
}
