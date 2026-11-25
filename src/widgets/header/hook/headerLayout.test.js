// Regras do layout do header (o layout real é verificado em
// tests/e2e/responsive.spec.js; aqui as caixas são simuladas).
import { describe, expect, test, vi } from "vitest";
import { MOBILE_QUERY, headerControlsOverflow, isMobileHeaderLayout } from "./headerLayout.js";
import { installMatchMedia } from "../../../../tests/setup/browserMocks";

/** Simula a caixa de um elemento (o jsdom não calcula layout). */
function place(el, left, right) {
  el.getClientRects = () => (right > left ? [{}] : []);
  el.getBoundingClientRect = () => ({ left, right, width: right - left });
}

function header(html) {
  document.body.innerHTML = `<header>${html}</header>`;
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1300);
  return document.querySelector("header");
}

describe("isMobileHeaderLayout", () => {
  test("abaixo do breakpoint", () => {
    installMatchMedia({ [MOBILE_QUERY]: true });
    expect(isMobileHeaderLayout(document.body)).toBe(true);
  });

  test("acima do breakpoint: só em modo compacto", () => {
    installMatchMedia({ [MOBILE_QUERY]: false });
    const h = header(`<button id="b">menu</button>`);
    const btn = h.querySelector("#b");
    expect(isMobileHeaderLayout(btn)).toBe(false);
    h.setAttribute("data-compact", "");
    expect(isMobileHeaderLayout(btn)).toBe(true);
  });
});

describe("headerControlsOverflow", () => {
  test("todos os controlos dentro do viewport", () => {
    const h = header(`<a href="/">a</a><button>b</button>`);
    const [a, b] = h.querySelectorAll("a, button");
    place(a, 10, 200);
    place(b, 1200, 1299);
    expect(headerControlsOverflow(h)).toBe(false);
  });

  test("um controlo apresentado fora do viewport", () => {
    const h = header(`<a href="/">a</a><a href="https://x" aria-label="WhatsApp">w</a>`);
    const [a, w] = h.querySelectorAll("a");
    place(a, 10, 200);
    place(w, 1290, 1320);
    expect(headerControlsOverflow(h)).toBe(true);
  });

  test("ignora controlos não apresentados e itens de submenu", () => {
    const h = header(`
      <ul><li><button>SOBRE NÓS</button><ul><li><a href="#x">QUEM SOMOS</a></li></ul></li></ul>
      <a href="https://x">oculto</a>`);
    const [btn, sub, hidden] = h.querySelectorAll("button, a");
    place(btn, 10, 120);
    place(sub, 1250, 1400); // submenu aberto junto à margem
    place(hidden, 0, 0); // display:none
    expect(headerControlsOverflow(h)).toBe(false);
  });
});
