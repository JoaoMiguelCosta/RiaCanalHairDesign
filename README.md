Ria Canal — Hair Design (Frontend)

Site institucional single-page para o salão Ria Canal Hair Design, construído em React + Vite com CSS Modules, navegação por anchors e páginas legais via React Router.

Foco: performance, acessibilidade, copy profissional em PT-PT e um visual “premium” consistente.

Destaques

React 19 + Vite 7 (rápido, DX moderna).

CSS Modules + design tokens (cores, raios, sombras, tipografia) para estilo consistente.

Arquitetura por secções (Header, Hero, AboutUs, Team & Services, Portfólio, Before & After, Space, Instagram, Testimonials, Contact, Footer).

Conteúdo data-driven em /src/data (serviços, trabalhos, equipa, redes, navegação, etc.).

Assets otimizados: ProfessionalPhoto (lazy, decoding="async", fetchPriority opcional), VideoBG (muted/loop/inline).

Acessibilidade: aria-labels, focus states, roles em componentes interativos (sliders, menus, modais).

SEO básico: títulos claros por secção e copy coerente.

Páginas legais: /termos e /privacidade com navegação “Voltar”.

Stack

App: React 19, React Router DOM 7, React Icons

Build: Vite 7

Estilos: CSS Modules

Utilitários: clsx

Lint: ESLint 9 (plugins React Hooks & Refresh)

Como correr localmente
# 1) instalar
npm install

# 2) ambiente de desenvolvimento
npm run dev
# abre em http://localhost:5173 (por padrão do Vite)

# 3) análise estática
npm run lint

# 4) build de produção
npm run build

# 5) pré-visualização do build
npm run preview


Navegação

Home é uma SPA segmentada por anchors:

#Start, #AboutUs, #TeamAndServices, #Works (Portfólio),
#Transformations, #Space, #Instagram, #Testimonials, #Location.

Páginas dedicadas:

/termos → Termos & Condições

/privacidade → Política de Privacidade

Menu Desktop/Mobile lê itens de /src/data/NavItems*.js.

Conteúdo dinâmico

Team & Services usa TeamMembers.js + ServicesData.js.

Portfólio (/sections/05-Portfolio):

Tabs por Cabeleireiro, Estética, Unhas → povoadas via worksHair, worksEstetica, worksUnhas.

Deep-link opcional: ?service=Estética ativa tab à entrada.

Integração com “VER PORTFÓLIO” (dispara evento activate-portfolio-service e faz scroll para #Works).

Before & After:

Slider com autoplay (pausa em hover/fora de viewport), arrastável e com teclas de setas.

Space:

FacilityCard aceita imageSrc ou videoSrc (via Media.js).

Testimonials:

Carousel automático com barra de progresso em cada card, “quote” sincronizada abaixo


🔧 Como editar conteúdo

Navegação (desktop/mobile)
src/data/NavItems.js / NavItemsMobile.js

Serviços + Portfólio
src/data/ServicesData.js

services: lista de tabs.

worksHair/worksEstetica/worksUnhas: cards com {titulo, descricao, foto}.

Team
src/data/TeamMembers.js (fotos e títulos). Se não houver foto, o sistema usa assets/Hero.png.

Before & After
src/data/BeforeAndAfter.js (pares {before, after, title, caption}).

Redes/Links/Ficheiros legais
src/data/SocialLinks.js, FooterSocials.js, FooterLinks.js, LegalLinks.js.

Media (imagens/vídeos de espaço)
src/data/Media.js (trocar fontes em Images/Videos).

Contactos & Mapa
sections/09-Contact/Contact.jsx (iframe do Google Maps + cards de contacto).

♿ Acessibilidade

Ícones e botões com aria-label.

Slider “Antes/Depois” com tecla ←/→ e aria-label.

Menus com aria-current e data-active.

Evita scroll de fundo em overlay mobile.

Texto semântico em headings e landmarks.

Convenções de estilo

CSS Modules apenas (sem estilos inline, exceto parâmetros dinâmicos úteis como aspect-ratio).

Tokens e classes com nomes autoexplicativos.

Componentes “puros” e reusáveis (ex.: Button não impõe estilos globais).

🐞 Troubleshooting

Imagem não aparece → verifique caminho/maiúsculas e se o import aponta para assets/....

Vídeo não inicia → iOS exige muted/playsInline (já aplicado).

Anchors não rolam → certifique-se de que os id das secções batem com os href do menu.

404 em rotas no deploy estático → configurar fallback para index.html (ver “Deploy”).

📄 Licença & Créditos

Código: MIT (ou ajuste segundo a sua preferência).

Imagens/Vídeos: uso interno do Ria Canal Hair Design. Não redistribuir sem autorização.

Ícones via react-icons.

📬 Contacto

Instagram: @ria_canal_hairdesign

WhatsApp: +351 916 887 537

Telefone: +351 234 420 471

Morada: Praceta Dr. Alberto Souto 9, 3800-147 Aveiro
