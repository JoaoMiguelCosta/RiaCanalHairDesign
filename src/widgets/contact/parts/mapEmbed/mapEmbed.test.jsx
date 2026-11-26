// Mapa por clique: nenhum <iframe> (logo, nenhum pedido à Google) até à ação
// explícita; depois do clique, o iframe com título acessível e sem referrer
// recebe o foco. Os pedidos de rede reais são verificados em E2E.
import { afterEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MapEmbed from "./mapEmbed";
import data from "@content/contact/contact.json";

const renderMap = () =>
  render(
    <MemoryRouter>
      <MapEmbed src={data.mapEmbedSrc} {...data.map} />
    </MemoryRouter>
  );

afterEach(() => {
  localStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = `${c.split("=")[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
});

describe("MapEmbed", () => {
  test("inicialmente: sem iframe, com aviso, ligação à política e botão", () => {
    const { container } = renderMap();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("group", { name: data.map.heading })).toBeInTheDocument();

    const button = screen.getByRole("button", { name: data.map.button });
    // o aviso sobre a Google é a descrição acessível do botão
    expect(button).toHaveAccessibleDescription(/Google Maps.*endereço IP/);
    expect(screen.getByRole("link", { name: data.map.privacyLabel })).toHaveAttribute(
      "href",
      "/privacidade"
    );
  });

  test("depois do clique: iframe com título, referrer restrito e foco", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: data.map.button }));

    const frame = screen.getByTitle(data.map.title);
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", data.mapEmbedSrc);
    expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(frame).not.toHaveAttribute("loading"); // pedido pelo visitante: sem adiamento
    expect(frame).toHaveFocus();
    expect(screen.queryByRole("button", { name: data.map.button })).toBeNull();
  });

  test("teclado: Enter no botão mostra o mapa", async () => {
    const user = userEvent.setup();
    renderMap();
    screen.getByRole("button", { name: data.map.button }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTitle(data.map.title)).toHaveFocus();
  });

  test("a escolha não é guardada (sem cookies nem localStorage)", async () => {
    const user = userEvent.setup();
    const { unmount } = renderMap();
    await user.click(screen.getByRole("button", { name: data.map.button }));
    expect(localStorage.length).toBe(0);
    expect(document.cookie).toBe("");

    unmount();
    const { container } = renderMap();
    expect(container.querySelector("iframe")).toBeNull(); // nova vista: placeholder de novo
  });
});
