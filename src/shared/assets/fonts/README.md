# Fontes do site

Servidas pelo próprio domínio (`@font-face` em `src/app/styles/global.css`).
O Vite copia-as para `/assets/` com hash no nome (cache imutável).

| Ficheiro | Família | Peso / estilo | Subconjunto | Licença |
| --- | --- | --- | --- | --- |
| `montserrat-latin-600-normal.woff2` | Montserrat | 600, normal | latin | [OFL-Montserrat.txt](OFL-Montserrat.txt) |
| `playfair-display-latin-700-normal.woff2` | Playfair Display | 700, normal | latin | [OFL-PlayfairDisplay.txt](OFL-PlayfairDisplay.txt) |

- **Origem:** os ficheiros WOFF2 que a API da Google Fonts servia ao site
  (`Montserrat:wght@600` v31 e `Playfair Display:wght@700` v40, subconjunto
  latin), sem modificações. Cada ficheiro mantém nos metadados o copyright e
  o URL da licença.
- **Licenças:** SIL Open Font License 1.1, copiadas de
  [github.com/google/fonts](https://github.com/google/fonts) (`ofl/montserrat`,
  `ofl/playfairdisplay`).
- **Subconjunto:** só o latin (U+0000-00FF e pontuação), que cobre todo o
  texto do site. Era também o único que o browser descarregava do serviço
  remoto. As setas (←, ↗, ⬅) não pertencem ao latin nem ao latin-ext e usam
  a fonte do sistema, como antes.
- **Lato** não é carregada (já não era antes): os menus que a referem usam o
  `sans-serif` do sistema, que é o aspeto aprovado.

SHA-256:

```
d857325c360f7128b347ca924c1974967aaa886ba47dad22e4042d6c38b26a83  montserrat-latin-600-normal.woff2
28453852ea165c47b5a941be00e418402e1407002ed87507f062a1e316328fe6  playfair-display-latin-700-normal.woff2
```
