import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'
import { CONFIG_PADRAO, type ConfigSite } from '../lib/configSite'

const COLLECTION = 'config_site'

export function useConfigSite() {
  const [config, setConfig] = useState<ConfigSite>(CONFIG_PADRAO)
  const [recordId, setRecordId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { records } = await api<{ records: { id: string; data: ConfigSite }[] }>('db/list', {
        collection: COLLECTION,
        limit: 1,
      })
      if (records.length > 0) {
        setConfig({ ...CONFIG_PADRAO, ...records[0].data })
        setRecordId(records[0].id)
      } else {
        setConfig(CONFIG_PADRAO)
        setRecordId(null)
      }
    } catch {
      setConfig(CONFIG_PADRAO)
      setRecordId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const salvar = useCallback(
    async (novaConfig: ConfigSite) => {
      if (recordId) {
        await api('db/update', { collection: COLLECTION, id: recordId, data: novaConfig })
      } else {
        const { id } = await api<{ id: string }>('db/create', { collection: COLLECTION, data: novaConfig })
        setRecordId(id)
      }
      setConfig(novaConfig)
    },
    [recordId]
  )

  return { config, loading, salvar, reload: load }
}
