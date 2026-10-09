import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/brixly'

export interface AppUser {
  id: string
  email: string
  name?: string
}

const ADMIN_COLLECTION = 'admin_users'
const PERFIS_COLLECTION = 'perfis'

// E-mails que sempre têm acesso de administrador, independente de estarem
// cadastrados no banco — garante que a liderança da igreja nunca fique
// trancada para fora do painel.
const SUPER_ADMINS = ['guilhermesdlima.0312@gmail.com']

async function garantirRegistroAdmin(userId: string, email: string) {
  try {
    const { records } = await api<{ records: any[] }>('db/list', {
      collection: ADMIN_COLLECTION,
      limit: 1,
      filter: { userId },
    })
    if (records.length === 0) {
      await api('db/create', { collection: ADMIN_COLLECTION, data: { userId, email } })
    }
  } catch {
    // best-effort — o acesso do super admin já é garantido pela lista fixa acima
  }
}

async function registrarPerfil(user: AppUser) {
  try {
    const { records } = await api<{ records: any[] }>('db/list', {
      collection: PERFIS_COLLECTION,
      limit: 1,
      filter: { userId: String(user.id) },
    })
    const dados = { userId: String(user.id), email: user.email, name: user.name || '' }
    if (records.length === 0) {
      await api('db/create', { collection: PERFIS_COLLECTION, data: dados })
    } else if (records[0].data.name !== dados.name || records[0].data.email !== dados.email) {
      await api('db/update', { collection: PERFIS_COLLECTION, id: records[0].id, data: dados })
    }
  } catch {
    // best-effort — não bloqueia o login se o registro do perfil falhar
  }
}

async function checarAdmin(userId: string, email: string): Promise<boolean> {
  const emailNormalizado = (email || '').trim().toLowerCase()
  if (SUPER_ADMINS.includes(emailNormalizado)) {
    garantirRegistroAdmin(userId, emailNormalizado)
    return true
  }
  try {
    const { records } = await api<{ records: any[] }>('db/list', {
      collection: ADMIN_COLLECTION,
      limit: 1,
      filter: { userId },
    })
    if (records.length > 0) return true
  } catch {
    // segue para a checagem por e-mail
  }
  // permite que a equipe adicione um novo admin só pelo e-mail, antes mesmo
  // de essa pessoa ter feito login (e portanto sem saber o userId dela ainda)
  try {
    const { records } = await api<{ records: any[] }>('db/list', {
      collection: ADMIN_COLLECTION,
      limit: 1,
      filter: { email: emailNormalizado },
    })
    return records.length > 0
  } catch {
    return false
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const tok = localStorage.getItem('app_token')
    if (!tok) {
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
      return
    }
    try {
      const { user } = await api<{ user: AppUser }>('auth/me')
      setUser(user)
      setIsAdmin(await checarAdmin(String(user.id), user.email))
      registrarPerfil(user)
    } catch {
      localStorage.removeItem('app_token')
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api<{ token: string; user: AppUser }>('auth/login', { email, password })
    localStorage.setItem('app_token', token)
    setUser(user)
    setIsAdmin(await checarAdmin(String(user.id), user.email))
    registrarPerfil(user)
    return user
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { token, user } = await api<{ token: string; user: AppUser }>('auth/register', { email, password, name })
    localStorage.setItem('app_token', token)
    setUser(user)
    setIsAdmin(await checarAdmin(String(user.id), user.email))
    registrarPerfil(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('app_token')
    setUser(null)
    setIsAdmin(false)
  }, [])

  return { user, isAdmin, loading, login, register, logout, refresh }
}
