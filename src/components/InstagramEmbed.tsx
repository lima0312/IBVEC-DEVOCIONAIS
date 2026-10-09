import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

let scriptCarregado: Promise<void> | null = null

function carregarScriptInstagram(): Promise<void> {
  if (window.instgrm) return Promise.resolve()
  if (scriptCarregado) return scriptCarregado
  scriptCarregado = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
  return scriptCarregado
}

export default function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelado = false
    carregarScriptInstagram().then(() => {
      if (!cancelado) window.instgrm?.Embeds.process()
    })
    return () => {
      cancelado = true
    }
  }, [url])

  return (
    <div ref={ref} className="flex w-full justify-center overflow-hidden">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  )
}
