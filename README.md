Ria Canal Hair Design

SPA em React + Vite para a presença online do salão Ria Canal — Hair Design.
Foco em performance, acessibilidade e conteúdo separado da UI (JSON/JS).

Live (local): npm run dev · Build: npm run build · Preview do build: npm run preview

✨ Principais características

React 19 + Vite 7 (build rápido, HMR).

React Router 7: /, /termos, /privacidade (+ lazy load via React.lazy).

CSS Modules com layout fluido (clamp, container responsivo).

Aliases para imports limpos (@app, @widgets, @shared, @content, @media, …).

Conteúdo em src/content (JSON/JS) + media em src/content/media.

A11y: alt, aria-label, aria-current, landmarks, skip link, :focus-visible.

Performance: imagens loading="lazy", decoding="async", vídeos de fundo silenciosos/sem controle.

🧰 Requisitos

Node.js 18+ (recomendado LTS)

npm (ou pnpm/yarn se preferires — scripts abaixo consideram npm)

🚀 Como correr
# 1) Instalar dependências
npm install

# 2) Ambiente de desenvolvimento
npm run dev

# 3) Lint (hooks/imports/casing)
npm run lint

# 4) Build de produção (gera /dist)
npm run build

# 5) Pré-visualizar o build
npm run preview

🗂️ Estrutura
RiaCanalHairDesign/
├─ public/                    # ficheiros estáticos (servem direto, sem bundling)
├─ src/
│  ├─ app/                    # bootstrap (main.jsx), rotas, estilos globais
│  ├─ pages/                  # páginas de topo (Home, Terms, Privacy)
│  ├─ widgets/                # secções (Header, Hero, Portfolio, Space, …)
│  │  └─ parts/               # subcomponentes das secções
│  ├─ shared/                 # UI atómica, icons, hooks/utilitários
│  ├─ content/                # JSON/JS (texto/dados) + media/
│  │  └─ media/               # imagens/vídeos organizados por área
│  └─ services/               # (reservado a integrações futuras)
├─ index.html
├─ vite.config.js
├─ eslint.config.js
├─ package.json
└─ README.md

Aliases (Vite + ESLint)
@app       → src/app
@pages     → src/pages
@widgets   → src/widgets
@shared    → src/shared
@content   → src/content
@media     → src/content/media
@services  → src/services

🧭 Arquitetura (FSD-inspirado)

pages: rotas de topo.

widgets: blocos/sectores reutilizáveis de página (Header, Portfolio, Space…).

shared: componentes atómicos (botão, tipografia, ícones), hooks e utilitários.

content: fonte de verdade para textos/links/listas/imagens (JSON/JS).

estado: local por secção (hooks dedicados):

usePortfolioTabs — tabs + agrupamento dos trabalhos em linhas balanceadas.

usePagedSets — paginação por “conjuntos” (Antes/Depois).

useHoverVideo — play/pause em hover para vídeo de fundo.

useGoToPortfolio — ativa tab e faz scroll respeitando #Works.

♿ Acessibilidade

Imagens: alt curto e descritivo; decorativas com alt="" + aria-hidden.

Navegação: aria-current no item ativo (rotas e âncoras), landmarks com aria-labelledby.

Foco visível: :focus-visible consistente (ver global.css).

Skip link: .skipLink para saltar direto ao conteúdo principal (#main).

Vídeo de fundo: muted, playsInline, preload="metadata", aria-hidden.

Checklist antes do deploy

[ ] Nenhuma <img> sem alt apropriado.

[ ] Botões só-ícone têm aria-label.

[ ] aria-current aplicado ao item de navegação ativo.

[ ] Console sem erros.

🖼️ Gestão de media (imagens/vídeos)

Importados via Vite (ex.: import moment from "@media/videos/moments.mp4"):

empacotados com hashing → trocar ficheiro requer novo npm run build.

Sem rebuild: mete em public/ e referencia por caminho absoluto (/videos/moments.mp4) ou usa um URL externo/CDN.

Se houver cache, força com query (/videos/moments.mp4?v=2).

Boas práticas

loading="lazy" + decoding="async" em listas.

Passar width/height nas imagens quando souberes (reduz CLS).

Se a imagem for informativa, usa <img alt="…"> em vez de background-image.

🔧 Scripts (package.json)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}

☁️ Deploy
Vercel (recomendado)

Importa o repositório.

Framework: Vite (auto).

Build: npm run build · Output: dist/.

SPA funciona sem configuração extra (rotas internas OK).

Netlify

Build: npm run build · Publish: dist/.

SPA fallback: cria public/_redirects com:

/*    /index.html   200

GitHub Pages

Se o site ficar num subpath (username.github.io/repo), ajusta base no vite.config.js:

export default defineConfig({ base: '/RiaCanalHairDesign/' })


Publica dist/ em gh-pages.
Nota: SPA precisa workaround (spa-github-pages) para evitar 404 em rotas.

🧪 Teste rápido pós-deploy

/, /termos, /privacidade OK.

Âncoras do header (#Start, #Works, …) a rolar certo.

Slider de Antes/Depois e paginação a funcionar.

Vídeo/imagens sem 404.

Console limpo (se vires “A listener indicated an asynchronous response…” no Chrome, é de extensão, não do site).

🛠️ Convenções de código

Casing estrito de ficheiros e imports (Linux é sensível).

Hooks sempre no topo do componente (sem returns antes).

Aliases consistentes (Vite + ESLint já configurados).

JSON de conteúdo: texto plano/URLs; evita HTML embutido.

🗺️ Roadmap (próximos passos)

SEO: <title> dinâmico por página, meta tags description, og:*, twitter:*.

robots.txt + sitemap.xml.

Placeholder/blur para imagens (LQIP).

Testes unitários dos hooks principais.

Modo claro/escuro (respeitar prefers-color-scheme).

📄 Licença

Definir conforme combinado com o cliente (ex.: All Rights Reserved — Ria Canal Hair Design).

🤝 Contribuição

Cria branch: feat/sua-melhoria.

npm run lint antes do commit.

Abre PR com descrição do que foi alterado.