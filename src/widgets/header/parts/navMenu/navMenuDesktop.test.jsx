import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavMenuDesktop from "./navMenuDesktop";
import NavItems from "@content/navigation/navItemsDesktop.json";
import submenu from "@content/navigation/submenu.json";

const setup = () => {
  const utils = render(
    <>
      <NavMenuDesktop />
      <a href="#depois">Depois do menu</a>
    </>
  );
  const nav = screen.getByRole("navigation", { name: "Navegação principal" });
  return { ...utils, nav, user: userEvent.setup() };
};

const dropdowns = NavItems.filter((i) => i.hasDropdown).map((i) => i.label);
const links = NavItems.filter((i) => i.href);

describe("NavMenuDesktop (disclosure navigation)", () => {
  test("links diretos e botões de submenu com estado fechado", () => {
    const { nav } = setup();
    for (const { label, href } of links) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    for (const label of dropdowns) {
      const btn = within(nav).getByRole("button", { name: label });
      expect(btn).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById(btn.getAttribute("aria-controls"))).toBeInTheDocument();
    }
    expect(within(nav).queryByRole("menu")).not.toBeInTheDocument();
    expect(within(nav).queryByRole("menubar")).not.toBeInTheDocument();
  });

  test("Tab percorre todos os itens de topo pela ordem", async () => {
    const { user } = setup();
    for (const { label } of NavItems) {
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName(label);
      // submenus fechados não interferem na ordem (os seus links são saltados
      // no jsdom porque estão no DOM; no browser o CSS esconde-os — ver E2E)
      if (submenu[label]) {
        for (let i = 0; i < submenu[label].length; i++) await user.tab();
      }
    }
  });

  test("Enter e Espaço abrem/fecham o submenu", async () => {
    const { user, nav } = setup();
    const btn = within(nav).getByRole("button", { name: "PORTFÓLIO" });
    btn.focus();
    await user.keyboard("{Enter}");
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape fecha o submenu e devolve o foco ao botão", async () => {
    const { user, nav } = setup();
    const btn = within(nav).getByRole("button", { name: "PORTFÓLIO" });
    btn.focus();
    await user.keyboard("{Enter}");
    await user.tab(); // 1.º link do submenu
    expect(document.activeElement).toHaveAccessibleName("TRABALHOS");
    await user.keyboard("{Escape}");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveFocus();
  });

  test("sair do item com Tab fecha o submenu", async () => {
    const { user, nav } = setup();
    const btn = within(nav).getByRole("button", { name: "CLIENTES" });
    btn.focus();
    await user.keyboard("{Enter}");
    await user.tab(); // TESTEMUNHOS (único link)
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await user.tab(); // próximo item de topo
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("abrir outro submenu fecha o anterior (só um aberto)", async () => {
    const { user, nav } = setup();
    const a = within(nav).getByRole("button", { name: "SOBRE NÓS" });
    const b = within(nav).getByRole("button", { name: "PORTFÓLIO" });
    await user.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    await user.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  test("clique fora fecha o submenu", async () => {
    const { user, nav } = setup();
    const btn = within(nav).getByRole("button", { name: "CONTACTOS" });
    await user.click(btn);
    await user.click(document.body);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("escolher um link do submenu fecha-o", async () => {
    const { user, nav } = setup();
    const btn = within(nav).getByRole("button", { name: "SOBRE NÓS" });
    await user.click(btn);
    const link = within(nav).getByRole("link", { name: "QUEM SOMOS" });
    expect(link).toHaveAttribute("href", "#AboutUs");
    await user.click(link);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("aria-current marca o item cujo href coincide com o hash", () => {
    window.history.replaceState(null, "", "/#Space");
    const { nav } = setup();
    expect(within(nav).getByRole("link", { name: "ESPAÇO" })).toHaveAttribute("aria-current", "true");
    expect(within(nav).getByRole("link", { name: "INÍCIO" })).not.toHaveAttribute("aria-current");
  });
});
