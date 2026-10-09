# IBVEC · Devocionais Diários

Site de devocionais diários da **Igreja Batista Viver em Cristo (IBVEC)**. Além dos devocionais em
texto, reúne palavras em vídeo da igreja, área de conta para os membros acompanharem seu progresso
de leitura e anotações pessoais, e um painel administrativo completo para a equipe gerenciar todo o
conteúdo e a aparência do site sem precisar mexer em código.

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS** para toda a estilização (tokens de design em `src/index.css`)
- **React Router** para navegação (SPA)
- **lucide-react** para ícones
- Backend embutido do Brixly (`/_api/*`) para banco de dados, upload de arquivos e autenticação —
  sem necessidade de servidor próprio

## Identidade visual

- Cores: vermelho (`--accent`) como cor principal da marca, dourado (`--gold`) como destaque, sobre
  fundo claro e neutro
- Fontes: **Anton** nos títulos, **Poppins** no corpo do texto
- Cores e as imagens de destaque das páginas Início e Sobre podem ser personalizadas pela própria
  equipe, pelo painel administrativo, sem precisar editar código

## Funcionalidades

### Site público

- **Início** — devocional do dia em destaque, devocionais recentes e apresentação da igreja
- **Devocionais** — listagem com busca e filtro por série (Café Expresso, Pão Diário, Águas
  Profundas, Bálsamo e Ânimo) e por Palavras em vídeo
- **Devocional individual** — texto completo, versículo em destaque, tempo de leitura, tags, mídia
  (imagem, vídeo embutido do YouTube/Vimeo/Instagram, áudio), fechamento (oração, desafio,
  declaração de fé ou perguntas para autoexame), e anotação pessoal para quem estiver logado
- **Sobre a IBVEC** — apresentação da igreja, horários de culto e mapa de localização
- **Conta do usuário** — qualquer visitante pode criar conta para marcar devocionais como lidos,
  favoritar e escrever anotações pessoais (salvas automaticamente)

### Painel da equipe (`/admin`)

- Login separado da conta pública, com controle de quem é administrador
- Cadastro de **devocionais em texto** (série, versículo, texto, mídia, fechamento, tags) e de
  **palavras em vídeo** (vídeo por link do YouTube/Vimeo/Instagram ou upload de capa)
- Gerenciamento de equipe (adicionar outros e-mails com acesso ao painel)
- Lista de pessoas cadastradas no site
- Aba de **Aparência**: troca de cores e das imagens de destaque das páginas Início e Sobre

## Estrutura do projeto

```
src/
  App.tsx              # ponto de entrada e definição das rotas
  index.css            # tokens de design (cores, fontes, raio, sombra) e classes utilitárias
  components/          # componentes reutilizáveis (Header, Footer, cards, etc.)
  pages/                # páginas públicas
    admin/              # painel da equipe (login, dashboard, formulários)
    conta/              # login, cadastro e área da conta do usuário
  hooks/                # hooks de dados (devocionais, vídeos, autenticação, config do site etc.)
  lib/                  # helpers (API do Brixly, validação, segurança, tipos)
```

## Segurança

- Validação e sanitização de todos os campos de formulário antes de enviar ao servidor
  (`src/lib/validacao.ts`)
- Proteções contra abuso e envios automatizados — honeypot, limite de tentativas por janela de
  tempo e checagem de tempo mínimo de preenchimento (`src/lib/antiAbuso.ts`)
- Content-Security-Policy própria do app, complementando os headers de segurança já aplicados pelo
  servidor (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Nenhuma credencial, chave de API ou segredo no código — toda autenticação é feita por token de
  sessão individual do usuário, validado pelo backend

## Desenvolvimento

Este projeto é construído e publicado pela plataforma **Brixly**. O preview e o build são
gerenciados automaticamente pela plataforma; não é necessário rodar servidor local.

```bash
npm install      # instalar dependências
npm run build    # gerar o build de produção (tsc + vite build)
```
