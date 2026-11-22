# Testes automatizados

Duas camadas, com ferramentas e ambientes separados:

| Camada | Ferramenta | Ambiente | Onde |
| --- | --- | --- | --- |
| Unitários, hooks, componentes e integração | Vitest + React Testing Library | jsdom | `src/**/*.test.{js,jsx}` e `scripts/**/*.test.js` (ao lado do código) |
| End-to-end, acessibilidade (axe) e visuais | Playwright (+ `@axe-core/playwright`) | Chromium real, build de produção | `tests/e2e/*.spec.js` |

## Instalação (projeto novo)

```bash
npm ci                      # dependências (lockfile)
npm run test:e2e:install    # descarrega o Chromium do Playwright (uma vez)
```

> Node.js ≥ 20.19 (mínimo do Vite 7). As dependências de teste foram escolhidas
> compatíveis com o `engines: 20.x` do projeto; a suite completa foi executada
> com Node 20.20.2 + npm 10.9.11 e com Node 24.15.

## Comandos

| Script | O que faz |
| --- | --- |
| `npm test` | Vitest em modo interativo (watch) |
| `npm run test:run` | Vitest uma vez (sem watch) |
| `npm run test:coverage` | Vitest uma vez com cobertura (`coverage/index.html`) |
| `npm run test:e2e` | Playwright: faz o build, arranca `vite preview` na porta 4318 e corre os E2E |
| `npm run test:all` | Validação local completa: lint → unitários → E2E (sem watch) |

Úteis:

```bash
npx vitest run src/widgets/testimonials        # um diretório
npx vitest run --sequence.shuffle              # ordem aleatória (deteta dependências entre testes)
npx playwright test tests/e2e/beforeAfter.spec.js
npx playwright test --update-snapshots tests/e2e/visual.spec.js   # regenerar baselines visuais
npx playwright show-report                     # relatório HTML da última execução
npx playwright show-trace test-results/<teste>/trace.zip           # trace de uma falha
```

## Estrutura

```
vitest.config.js          # reutiliza vite.config.js (plugins e aliases) + jsdom
playwright.config.js      # Chromium, webServer (build + preview), relatórios
tests/
  setup/
    vitest.setup.js       # jest-dom, cleanup, interoperabilidade fake timers ↔ Testing Library
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

- Só **Chromium** está configurado: Firefox e WebKit não estão instalados neste
  ambiente. Para os acrescentar: `npx playwright install firefox webkit` e novos
  `projects` em `playwright.config.js` (os gestos de toque via CDP são exclusivos
  do Chromium).
- **Baselines visuais** são específicas do SO (`-chromium-win32.png`). Noutro
  sistema (ex.: CI em Linux) têm de ser geradas lá.
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
