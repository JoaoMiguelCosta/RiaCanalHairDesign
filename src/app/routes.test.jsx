// Integração do routing (jsdom): páginas lazy, títulos, metadados por rota e
// gestão do foco. O comportamento no browser real (histórico, scroll, HTML
// servido) é verificado em tests/e2e/routes.spec.js.
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppRoutes from "./routes";
import { installIntersectionObserver } from "../../tests/setup/browserMocks";

const SITE = "https://www.riacanalhairdesign.pt";
const canonical = () => document.head.querySelector('link[rel="canonical"]');
const robots = () => document.head.querySelector('meta[name="robots"]');

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );

// A 1.ª importação do chunk lazy da Home obriga o Vitest a transformar
// dezenas de módulos a frio (>1 s); pré-carregá-lo mantém os testes
// determinísticos sem aumentar timeouts. O lazy() continua a ser exercitado.
// Em beforeEach (não só beforeAll): os testes que usam vi.resetModules()
// esvaziam o registo de módulos e o lazy() do AppRoutes voltaria a avaliar a
// Home a frio no teste seguinte (falha intermitente por timeout, já presente
// na Fase 8). Fora disso, a importação é um acerto de cache.
beforeEach(() => import("@pages/home/home.jsx"));

beforeEach(() => {
  // Os widgets da Home ficam "fora do viewport" (sem animações a correr)
  installIntersectionObserver();
  // O jsdom não implementa media (o cartão de vídeo pausa-o ao montar)
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

describe("Rotas — carregamento direto", () => {
  test("mostra o indicador de carregamento enquanto a página lazy chega", async () => {
    // Um lazy() já resolvido noutro teste não volta a suspender: um módulo de
    // rotas novo garante o estado inicial, independentemente da ordem.
    vi.resetModules();
    const { default: FreshRoutes } = await import("./routes");
    render(
      <MemoryRouter initialEntries={["/termos"]}>
        <FreshRoutes />
      </MemoryRouter>
    );
    expect(screen.getByRole("status")).toHaveTextContent("A carregar…");
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test.each([
    ["/termos", "Termos & Condições", "Termos & Condições | Ria Canal Hair Design"],
    ["/privacidade", "Política de Privacidade", "Política de Privacidade | Ria Canal Hair Design"],
  ])("%s: título, h1, canonical e sem noindex", async (path, h1, title) => {
    renderAt(path);
    await screen.findByRole("heading", { level: 1, name: h1 });
    await waitFor(() => expect(document.title).toBe(title));
    expect(canonical()).toHaveAttribute("href", `${SITE}${path}`);
    expect(robots()).toBeNull();
  });

  test("rota desconhecida: 404 com noindex e sem canonical", async () => {
    renderAt("/nao-existe");
    await screen.findByRole("heading", { level: 1, name: /Página não encontrada/ });
    await waitFor(() => expect(document.title).toBe("Página não encontrada | Ria Canal Hair Design"));
    expect(robots()).toHaveAttribute("content", "noindex");
    expect(canonical()).toBeNull();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  // Fase 8: a barra final continua tolerada pelo router (no servidor,
  // trailingSlash:false redireciona 308 antes de a SPA carregar), mas as
  // maiúsculas deixaram de o ser: as rotas são caseSensitive para coincidir
  // com os ficheiros estáticos (/Termos → 404.html com HTTP 404).
  test("barra final: mesma rota e canonical sem barra", async () => {
    renderAt("/termos/");
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    await waitFor(() => expect(canonical()).toHaveAttribute("href", `${SITE}/termos`));
  });

  test("maiúsculas: rota inexistente (404, noindex, sem canonical)", async () => {
    renderAt("/Termos");
    await screen.findByRole("heading", { level: 1, name: /Página não encontrada/ });
    await waitFor(() => expect(robots()).toHaveAttribute("content", "noindex"));
    expect(canonical()).toBeNull();
  });

  test("Home: título do site, canonical na raiz e um único <h1>", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(document.title).toBe("Ria Canal Hair Design"));
    expect(canonical()).toHaveAttribute("href", `${SITE}/`);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  test("no carregamento inicial o foco não é movido", async () => {
    renderAt("/privacidade");
    await screen.findByRole("heading", { level: 1 });
    expect(document.body).toHaveFocus();
  });

  test("skip link é o primeiro elemento focável", async () => {
    renderAt("/privacidade");
    await screen.findByRole("heading", { level: 1 });
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Saltar para o conteúdo" })).toHaveFocus();
  });
});

// O título e o foco são atualizados num useEffect (RouteAnnouncer), que pode
// correr depois de o novo <h1> já estar no DOM: as asserções esperam por ele.
describe("Rotas — navegação SPA", () => {
  test("404 → Home: atualiza título/metadados e move o foco para <main>", async () => {
    const user = userEvent.setup();
    renderAt("/nao-existe");
    await user.click(await screen.findByRole("link", { name: "Voltar à página inicial" }));
    await screen.findByRole("heading", { level: 1, name: /Ria Canal/ });
    await waitFor(() => expect(document.title).toBe("Ria Canal Hair Design"));
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(robots()).toBeNull();
    expect(canonical()).toHaveAttribute("href", `${SITE}/`);
  });

  test("Home → Termos → Home pelos links legais e pelo Voltar", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await screen.findByRole("heading", { level: 1 });

    await user.click(screen.getByRole("link", { name: "Termos & Condições" }));
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    await waitFor(() => expect(document.title).toBe("Termos & Condições | Ria Canal Hair Design"));
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());

    await user.click(screen.getByRole("link", { name: "Voltar à página inicial" }));
    await screen.findByRole("heading", { level: 1, name: /Ria Canal/ });
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());

    await user.click(screen.getByRole("link", { name: "Política de Privacidade" }));
    await screen.findByRole("heading", { level: 1, name: "Política de Privacidade" });
    await waitFor(() => expect(canonical()).toHaveAttribute("href", `${SITE}/privacidade`));
  });
});

// Fragmentos (#Location, …): o browser tenta resolvê-los antes de a página
// lazy existir; o RouteAnnouncer alinha o alvo depois do commit. O jsdom não
// tem layout: verifica-se em que elemento e com que opções é pedido o scroll
// (posição real, header e Back/Forward em tests/e2e/anchors.spec.js).
describe("Rotas — fragmentos da Home", () => {
  let scrolled;
  beforeEach(() => {
    scrolled = [];
    Element.prototype.scrollIntoView = vi.fn(function (opts) {
      scrolled.push({ id: this.id, opts });
    });
    return () => delete Element.prototype.scrollIntoView;
  });

  test.each(["Location", "AboutUs", "Works", "Transformations"])(
    "carregamento direto de /#%s alinha a secção, sem animação",
    async (id) => {
      renderAt(`/#${id}`);
      await screen.findByRole("heading", { level: 1 });
      await waitFor(() => expect(scrolled.map((s) => s.id)).toContain(id));
      expect(scrolled.filter((s) => s.id === id)).toHaveLength(1); // sem duplicados
      expect(scrolled[0].opts).toEqual({ block: "start", behavior: "instant" });
      expect(document.body).toHaveFocus(); // o foco não é movido
    }
  );

  test("espera pela página lazy: o scroll só acontece depois de a secção existir", async () => {
    vi.resetModules();
    const { default: FreshRoutes } = await import("./routes");
    // módulo da Home já avaliado no registo novo (evita a importação a frio,
    // >1 s sob carga); o lazy() novo suspende na mesma no 1.º render
    await import("@pages/home/home.jsx");
    const existedOnScroll = [];
    Element.prototype.scrollIntoView = vi.fn(function () {
      existedOnScroll.push(document.contains(this));
    });
    render(
      <MemoryRouter initialEntries={["/#Location"]}>
        <FreshRoutes />
      </MemoryRouter>
    );
    expect(document.getElementById("Location")).toBeNull(); // ainda a carregar
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(existedOnScroll).toEqual([true]));
  });

  test("fragmento inexistente: nenhum scroll", async () => {
    renderAt("/#NaoExiste");
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(document.title).toBe("Ria Canal Hair Design"));
    expect(scrolled).toEqual([]);
  });

  test("navegação SPA de /termos para /#Location alinha a secção e foca o <main>", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/termos", "/#Location"]} initialIndex={0}>
        <AppRoutes />
        <NavigateOnClick to="/#Location" />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    expect(scrolled).toEqual([]);
    await userEvent.click(container.querySelector("[data-go]"));
    await screen.findByRole("heading", { level: 1, name: /Ria Canal/ });
    await waitFor(() => expect(scrolled.map((s) => s.id)).toEqual(["Location"]));
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
  });
});

describe("Rotas — fragmentos em Back/Forward", () => {
  test("POP de /termos para /#Location: não força scroll (o browser repõe a posição)", async () => {
    const scrolled = [];
    Element.prototype.scrollIntoView = vi.fn(function () {
      scrolled.push(this.id);
    });
    const { container } = render(
      <MemoryRouter initialEntries={["/#Location", "/termos"]} initialIndex={1}>
        <AppRoutes />
        <NavigateOnClick to={-1} />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { level: 1, name: "Termos & Condições" });
    await userEvent.click(container.querySelector("[data-go]"));
    await screen.findByRole("heading", { level: 1, name: /Ria Canal/ });
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
    expect(scrolled).toEqual([]);
    delete Element.prototype.scrollIntoView;
  });
});

function NavigateOnClick({ to }) {
  const navigate = useNavigate();
  return <button type="button" data-go onClick={() => navigate(to)}>ir</button>;
}
