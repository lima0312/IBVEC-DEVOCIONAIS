import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BotaoVoltar({ className = '' }: { className?: string }) {
  const navigate = useNavigate()

  const voltar = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button
      type="button"
      onClick={voltar}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent ${className}`}
    >
      <ArrowLeft className="size-4" strokeWidth={2} /> Voltar
    </button>
  )
}
