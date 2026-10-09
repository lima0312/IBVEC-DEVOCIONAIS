// estilo: editorial (adaptado) — tom sóbrio e caloroso de igreja, com vermelho/dourado da marca, tipografia Inter em todo o site
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ConfigSiteProvider from './components/ConfigSiteProvider'
import Home from './pages/Home'
import Devocionais from './pages/Devocionais'
import DevocionalDetalhe from './pages/DevocionalDetalhe'
import Palavras from './pages/Palavras'
import Sobre from './pages/Sobre'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Entrar from './pages/conta/Entrar'
import CriarConta from './pages/conta/CriarConta'
import MinhaConta from './pages/conta/MinhaConta'

function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

function App() {
  return (
    <ConfigSiteProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
          <Route path="/devocionais" element={<SiteLayout><Devocionais /></SiteLayout>} />
          <Route path="/devocionais/:id" element={<SiteLayout><DevocionalDetalhe /></SiteLayout>} />
          <Route path="/palavras" element={<SiteLayout><Palavras /></SiteLayout>} />
          <Route path="/sobre" element={<SiteLayout><Sobre /></SiteLayout>} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/criar-conta" element={<CriarConta />} />
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/admin/entrar" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ConfigSiteProvider>
  )
}

export default App
