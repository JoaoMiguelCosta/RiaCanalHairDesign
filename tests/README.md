# Testes automatizados

Duas camadas, com ferramentas e ambientes separados:

| Camada | Ferramenta | Ambiente | Onde |
| --- | --- | --- | --- |
| Unitários, hooks, componentes e integração | Vitest + React Testing Library | jsdom | `src/**/*.test.{js,jsx}` e `scripts/**/*.test.js` (ao lado do código) |
| End-to-end, acessibilidade (axe) e visuais | Playwright (+ `@axe-core/playwright`) | Chromium, Firefox e WebKit reais, build de produção | `tests/e2e/*.spec.js` |

## Instalação (projeto novo)

```bash
npm ci                      # dependências (lockfile)
npm run test:e2e:install    # descarrega o Chromium do Playwright (uma vez)
npm run test:e2e:install:all  # Chromium, Firefox e WebKit
```

> Node.js 24.x (`engines.node`). As dependências de teste foram escolhidas na
> Fase 7 compatíveis com Node 20 (ex.: Vitest 4, jsdom 26) e mantêm-se; a
> suite completa foi executada com Node 24.15 + npm 11.

## Comandos

| Script | O que faz |
| --- | --- |
| `npm test` | Vitest em modo interativo (watch) |
| `npm run test:run` | Vitest uma vez (sem watch) |
| `npm run test:coverage` | Vitest uma vez com cobertura (`coverage/index.html`) |
| `npm run test:e2e` | Playwright em Chromium (+ visuais): faz o build, arranca `vite preview` na porta 4318 e corre os E2E |
| `npm run test:e2e:cross` | Os mesmos E2E em Firefox e WebKit (sem visuais nem `buildOutput`) |
| `npm run test:e2e:all` | Todos os projetos Playwright |
| `npm run test:all` | Validação local completa: lint → unitários → E2E (sem watch) |

Úteis:

```bash
npx vitest run src/widgets/testimonials        # um diretório
npx vitest run --sequence.shuffle              # ordem aleatória (deteta dependências entre testes)
npx playwright test tests/e2e/beforeAfter.spec.js
npx playwright test --project=chromium-visual --update-snapshots  # regenerar baselines (ver README)
npx playwright test --project=webkit tests/e2e/navigation.spec.js # um motor
npx playwright show-report                     # relatório HTML da última execução
npx playwright show-trace test-results/<teste>/trace.zip           # trace de uma falha
```

## Estrutura

```
vitest.config.js          # reutiliza vite.config.js (plugins e aliases) + jsdom
playwright.config.js      # projetos chromium / chromium-visual / firefox / webkit, webServer, relatórios
tests/
  setup/
    vitest.setup.js       # jest-dom, cleanup, interoperabilidade fake timers ↔ Testing Library
    routePages.js         # testes de routing: pré-carrega as páginas lazy e ajusta os limites de espera
    browserMocks.js       # mocks controláveis, instalados teste a teste
  e2e/
    fixtures.js           # bloqueio de rede externa, erros JS = falha, helpers
    *.spec.js             # um ficheiro por área (rotas, menus, slider, …)
    visual.spec.js-snapshots/   # baselines visuais (versionar)
```

## Convenções

- **Imports explícitos** de `describe`, `test`, `expect`, `vi` (sem globais).
- **Mocks por teste, não globais.** O jsdom não implementa `IntersectionObserver`,
  `matchMedia`, `PointerEvent`, media nem layout; `browserMocks.js` oferece
  substitutos controláveis (`installIntersectionObserver`, `installMatchMedia`,
  `mockVisibility`, `installPointerEvent`) que o teste instala quando precisa.
  O Vitest repõe-nos automaticamente (`restoreMocks`, `unstubGlobals`).
- **Tempo controlado.** Use `vi.useFakeTimers()`; para animações rAF use
  `FAKE_TIMERS_WITH_RAF`. Com `user-event`, use `userEvent.setup(userEventWithFakeTimers)`.
  Nos E2E, `page.clock` controla `setTimeout`/rAF (as animações CSS não).
- **O que só um browser real verifica fica nos E2E:** `:focus-visible` (o jsdom
  trata-o como `:focus`), `inert`, animações CSS (`animationend`, pausa e
  progresso via `document.getAnimations()`), Pointer Events/toque reais,
  pointer capture, scroll, downloads de media e `IntersectionObserver`.
- **E2E sem rede externa:** pedidos fora de `127.0.0.1` são abortados (Google
  Fonts e Google Maps incluídos); as fontes caem nas de recurso do sistema.
- **E2E falham com erros JS não tratados** na página (`pageerror`).

## Limitações conhecidas

- **Três motores.** Firefox e WebKit correm a suite funcional; ficam de fora
  `buildOutput.spec.js` (lê o `dist/`, não usa browser), `visual.spec.js`
  (baselines só Chromium) e os 2 gestos de toque via CDP (`test.skip` com
  motivo, API exclusiva do Chromium; o toque simples via `touchscreen.tap`
  corre nos três). O Firefox não suporta `isMobile`: `touchDevice()` só o
  ativa em Chromium/WebKit. WebKit do Playwright em Windows/Linux não é o
  Safari de iOS/macOS.
- **Diferenças de motor tratadas nos testes** (Fase 10, todas confirmadas):
  - *WebKit, teclado:* `Tab` não foca links (como o Safari por omissão). Os 2
    testes de ordem de Tab entre links saltam no WebKit; os do skip link e do
    submenu colocam o foco com `focus()` e verificam o resto.
  - *WebKit, media:* o backend de media do port Windows faz os pedidos
    MP4/MP3 fora da instrumentação do Playwright (`page.on("request")` e
    `page.route` não os veem). Também ignorava `preload="none"` e
    descarregava-os logo no carregamento (confirmado no servidor): o
    componente passou a atribuir o `src` só na interação, e os testes
    verificam a ausência de `src` nos três motores. As asserções de pedidos
    ficam para Chromium/Firefox; o teste que retém o MP3 com `page.route`
    salta no WebKit. O Safari real verifica-se no Preview Deploy.
  - *WebKit, AVIF:* sem suporte neste build — o preload AVIF é ignorado e o
    `image-set()` escolhe o WebP (um único pedido, como pretendido).
  - *Firefox:* o ponteiro do rato tem `pointerId` 0 (1 no Chromium).
  - *Back/Forward entre fragmentos da mesma página:* o Chromium resolve o
    fragmento; Firefox e WebKit repõem a posição guardada no histórico. Os
    testes aceitam os dois destinos, desde que estáveis.
- **Texto ampliado** (`responsive.spec.js`, "Header com texto ampliado"):
  as preferências reais de letra (tamanho e tamanho mínimo) só são
  configuráveis no Firefox (`firefoxUserPrefs`), pelo que esses 4 testes
  saltam nos outros motores. A emulação CSS (`html { font-size: 200% }`)
  reproduz o pior caso — texto maior sem o breakpoint acompanhar — nos três
  motores, mas não substitui a funcionalidade do browser (Chrome "Tamanho do
  tipo de letra", zoom só de texto do Safari/Firefox).
- **Sob carga** (suites em paralelo, um único `vite preview` a servir todos
  os workers), o chunk da Home e os MP4 chegaram a demorar >5 s: o
  `gotoHome` espera até 15 s pela página montada e o arranque do vídeo até
  20 s. A medição dos testemunhos é feita dentro da página, frame a frame,
  para não depender da latência entre comandos.
- **Baselines visuais** são específicas do SO (`-chromium-win32.png`) e só
  correm no projeto `chromium-visual` (localmente em Windows e no job `visual`
  da CI, em `windows-latest`).
- **Routing em jsdom** (`src/app/routes*.test.jsx`). A 1.ª importação da Home
  custa 4–10 s no Vitest (transformação + packs do react-icons) e o render da
  Home completa ~0,4–2 s: `tests/setup/routePages.js` pré-carrega as páginas
  e aumenta só nesses ficheiros os limites de espera. A suspensão do
  `React.lazy()` está num ficheiro próprio (`routes.lazy.test.jsx`), porque um
  lazy() já resolvido não volta a suspender — sem `vi.resetModules()`.
- **Separador oculto** é simulado (redefinição de `document.visibilityState` +
  `visibilitychange`); o Chromium headless não oculta páginas de forma fiável.
- **Vercel vs. local.** `routing.spec.js` verifica os códigos HTTP (404,
  308) contra o `vite preview` com a emulação das regras estáticas do
  `vercel.json` (plugin `scripts/routeDocuments.js`). Isto prova a lógica
  pretendida e o HTML gerado, não a resposta da Vercel: HTTP 404 real,
  redirects, cabeçalhos de cache, domínio apex → www, indexação e
  pré-visualizações sociais exigem um Preview Deploy / produção.
- O sistema de ficheiros do Windows não distingue maiúsculas; a emulação
  compara os nomes de forma exata para reproduzir o comportamento em Linux.
- O `axe` deteta parte das falhas WCAG; não substitui testes manuais com
  teclado e leitor de ecrã.
- **Fragmentos e histórico** (`anchors.spec.js`). Localmente o chunk lazy da
  Home chega antes de o browser desistir do fragmento, o que escondia o
  defeito de `/#Location`: os testes de links diretos atrasam esse chunk.
  Em Back/Forward entre rotas o Chromium decide o destino (repõe a posição
  guardada ou resolve o fragmento); o teste aceita os dois, desde que estável.
- **Zoom** (`responsive.spec.js`) é aproximado pela largura CSS equivalente
  (ex.: 1280×1024 a 400 % ≈ 320×256); não reproduz o zoom do browser nem o
  aumento só do tamanho do texto.
- **Capturas por elemento** de blocos mais altos do que o viewport eram
  instáveis enquanto o `<body>` fazia scroll (até à Fase 9); com o documento
  como scroll container ficam completas.
