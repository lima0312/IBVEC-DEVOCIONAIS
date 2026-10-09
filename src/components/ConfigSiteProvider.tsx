import { useEffect } from 'react'
import { useConfigSite } from '../hooks/useConfigSite'

// Aplica as cores configuradas pelo admin nas variáveis CSS do :root — assim todo
// o site (que já usa os tokens --accent, --gold etc.) reage automaticamente, sem
// precisar passar a config por props em cada componente.
export default function ConfigSiteProvider({ children }: { children: React.ReactNode }) {
  const { config, loading } = useConfigSite()

  useEffect(() => {
    if (loading) return
    const root = document.documentElement
    if (config.corAccent) {
      root.style.setProperty('--accent', config.corAccent)
      root.style.setProperty('--accent-soft', hexParaSoft(config.corAccent))
    }
    if (config.corDourado) {
      root.style.setProperty('--gold', config.corDourado)
    }
  }, [config, loading])

  return <>{children}</>
}

// Gera uma versão bem clara da cor (pra usar como fundo suave) a partir do hex escolhido.
function hexParaSoft(hex: string): string {
  try {
    const v = hex.replace('#', '')
    const r = parseInt(v.slice(0, 2), 16)
    const g = parseInt(v.slice(2, 4), 16)
    const b = parseInt(v.slice(4, 6), 16)
    const misturar = (c: number) => Math.round(c + (255 - c) * 0.88)
    return `rgb(${misturar(r)}, ${misturar(g)}, ${misturar(b)})`
  } catch {
    return '#F7E3E0'
  }
}
