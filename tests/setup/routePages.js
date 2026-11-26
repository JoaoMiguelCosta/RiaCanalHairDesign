// tests/setup/routePages.js
// Preparação dos testes de routing (jsdom) que renderizam páginas completas.
//
// 1) Pré-carregamento das páginas lazy. A 1.ª importação de uma página obriga
//    o Vitest a transformar o seu grafo de módulos e a carregar os packs do
//    react-icons. Medido (Fase 10): Home a frio 4–6 s isolada e ~10,5 s com a
//    suite completa em paralelo; depois de carregada, ~0,1 ms. Esse custo é
//    do ambiente de testes, não do comportamento verificado (Suspense,
//    metadados, foco), e fazia falhar findBy* (1 s), testes (5 s) e hooks
//    (10 s) de forma intermitente. Carregar os módulos não resolve os
//    React.lazy(): cada lazy() continua a suspender no seu 1.º render,
//    porque import() devolve sempre uma promise.
//
// 2) Tempo de espera das queries assíncronas. Com os módulos já carregados,
//    renderizar a Home inteira (~850 nós, 10 widgets) custa ~0,4 s em jsdom e
//    a 1.ª query *ByRole ~0,25 s; com a suite em paralelo, os testes da Home
//    chegaram a ~1–2,4 s. O limite por defeito (1 s) do findBy*/waitFor não
//    tem margem para isso. Só estes ficheiros usam os valores abaixo; os
//    limites globais do Vitest e da Testing Library não mudam.
import { afterAll, beforeAll, vi } from "vitest";
import { configure, getConfig } from "@testing-library/react";

const PRELOAD_TIMEOUT_MS = 60_000; // pior caso medido ~10,5 s, margem p/ CI
const ASYNC_UTIL_TIMEOUT_MS = 5_000; // render da Home: ~0,65 s isolado, ≤2,4 s sob carga
const TEST_TIMEOUT_MS = 15_000; // testes com várias navegações (≤2,4 s medidos)

export function setupRoutePageTests() {
  // Na recolha (não num hook): o limite de cada teste é fixado quando o teste
  // é registado. vi.setConfig aplica-se só ao ficheiro atual.
  vi.setConfig({ testTimeout: TEST_TIMEOUT_MS });
  let previousAsyncUtilTimeout;

  beforeAll(async () => {
    previousAsyncUtilTimeout = getConfig().asyncUtilTimeout;
    configure({ asyncUtilTimeout: ASYNC_UTIL_TIMEOUT_MS });
    await Promise.all([
      import("@pages/home/home.jsx"),
      import("@pages/terms/terms.jsx"),
      import("@pages/privacy/privacy.jsx"),
      import("@pages/notFound/notFound.jsx"),
    ]);
  }, PRELOAD_TIMEOUT_MS);

  afterAll(() => {
    configure({ asyncUtilTimeout: previousAsyncUtilTimeout });
    vi.resetConfig();
  });
}
