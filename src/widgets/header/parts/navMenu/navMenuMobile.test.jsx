import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavMenuMobile from "./navMenuMobile";
import NavItemsMobile from "@content/navigation/navItemsMobile.json";
import { HEADER_LAYOUT_EVENT, MOBILE_QUERY } from "@widgets/header/hook/headerLayout.js";
import { installMatchMedia } from "../../../../../tests/setup/browserMocks";

// Layout mobile: abaixo do breakpoint (o menu só é usado nesse layout)
let media;
beforeEach(() => {
  media = installMatchMedia({ [MOBILE_QUERY]: true });
});

// Estrutura real: <header> com o menu + irmãos cobertos pelo overlay
function setup() {
  const utils = render(
    <>
      <header>
        <NavMenuMobile />
      </header>
      <main id="main" tabIndex={-1}>
        <a href="#conteudo">Conteúdo</a>
      </main>
      <footer>
        <a href="#rodape">Rodapé</a>
      </footer>
    </>
  );
  const button = screen.getByRole("button", { name: "Menu de navegação" });
  const menu = () => document.getElementById(button.getAttribute("aria-controls"));
  return { ...utils, button, menu, user: userEvent.setup() };
}

describe("NavMenuMobile", () => {
  test("fechado: aria-expanded=false e menu oculto", () => {
    const { button, menu } = setup();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(menu()).not.toBeVisible();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  test("abrir: aria-expanded=true, menu visível e foco no 1.º link", async () => {
    const { button, menu, user } = setup();
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(menu()).toBeVisible();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(NavItemsMobile.map((i) => i.label));
    expect(links[0]).toHaveFocus();
  });

  test("Escape fecha e devolve o foco ao botão", async () => {
    const { button, menu, user } = setup();
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(menu()).not.toBeVisible();
    expect(button).toHaveFocus();
  });

  test("o botão volta a fechar o menu", async () => {
    const { button, user } = setup();
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  test("escolher um link fecha o menu", async () => {
    const { button, user } = setup();
    await user.click(button);
    const link = screen.getByRole("link", { name: "PORTFÓLIO" });
    expect(link).toHaveAttribute("href", "#Works");
    await user.click(link);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  // O jsdom não implementa a semântica de `inert` (só a propriedade): aqui
  // verifica-se que é aplicado; o efeito real no foco é verificado em E2E.
  test("conteúdo coberto fica inert enquanto aberto; o header não", async () => {
    const { button, user } = setup();
    const main = document.getElementById("main");
    const footer = document.querySelector("footer");
    await user.click(button);
    expect(main.inert).toBe(true);
    expect(footer.inert).toBe(true);
    expect(document.querySelector("header").inert).not.toBe(true);

    await user.keyboard("{Escape}");
    expect(main.inert).toBe(false);
    expect(footer.inert).toBe(false);
  });

  test("bloqueia o scroll da página (<html>) enquanto aberto e repõe ao fechar", async () => {
    const { button, user } = setup();
    document.documentElement.style.overflow = "auto";
    await user.click(button);
    expect(document.documentElement.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.documentElement.style.overflow).toBe("auto");
  });

  test("passar a desktop (acima de 64rem) fecha o menu e move o foco para o <main>", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const { button, menu } = setup();
    act(() => button.click());
    expect(menu()).toBeVisible();
    expect(document.activeElement).toHaveTextContent(NavItemsMobile[0].label);

    media.set(MOBILE_QUERY, false);
    act(() => window.dispatchEvent(new Event("resize")));
    act(() => vi.advanceTimersToNextFrame());
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("main")).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  // Regressão (CI, Chromium em Linux): o link focado fica oculto pela media
  // query e o browser retira-lhe o foco (para o <body>) antes do resize; o
  // foco perdido com o menu aberto também tem de ir para o <main>.
  test("passar a desktop com o foco já perdido para o <body> move-o para o <main>", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const { button, menu } = setup();
    act(() => button.click());
    expect(menu()).toBeVisible();

    media.set(MOBILE_QUERY, false);
    act(() => document.activeElement.blur());
    expect(document.activeElement).toBe(document.body);
    act(() => window.dispatchEvent(new Event("resize")));
    act(() => vi.advanceTimersToNextFrame());
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("main")).toHaveFocus();
  });

  test("redimensionar dentro do intervalo mobile não fecha", async () => {
    const { button, user } = setup();
    await user.click(button);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  // Fase 10: acima do breakpoint, o header usa o layout mobile quando o
  // desktop não cabe (header[data-compact], texto ampliado)
  test("modo compacto: acima do breakpoint o menu continua aberto; ao sair dele fecha", async () => {
    const { button, user } = setup();
    const header = button.closest("header");
    header.setAttribute("data-compact", "");
    await user.click(button);
    media.set(MOBILE_QUERY, false);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(button).toHaveAttribute("aria-expanded", "true");

    header.removeAttribute("data-compact");
    act(() => window.dispatchEvent(new Event(HEADER_LAYOUT_EVENT)));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("redes sociais abrem em novo separador com rel seguro", () => {
    setup();
    const social = screen.getAllByRole("link").filter((l) => l.target === "_blank");
    expect(social.length).toBeGreaterThan(0);
    for (const l of social) {
      expect(l).toHaveAttribute("rel", "noopener noreferrer");
      expect(l).toHaveAccessibleName();
    }
  });
});
