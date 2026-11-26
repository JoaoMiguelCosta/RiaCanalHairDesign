# Publicação: Preview Deploy, produção e rollback

Procedimento para publicar alterações do site com validação prévia. Nada
aqui é automático: cada passo externo (push, merge, definições da Vercel)
exige uma decisão explícita do proprietário do projeto.

## 0. Antes de começar: o que o proprietário deve confirmar na Vercel

A configuração real não está no repositório. Confirmar no dashboard
(sem alterar nada nesta fase):

| Onde | O quê | Porquê |
| --- | --- | --- |
| Settings → Git | *Production Branch* (esperado: `main`) | um push para essa branch publica em produção |
| Settings → Git | *Ignored Build Step* / deploys automáticos ativos | se ativos, qualquer push gera um deployment |
| Settings → Build & Deployment | Node.js Version | `engines.node: "24.x"` sobrepõe-se a esta definição; confirmar que o build usa 24.x |
| Settings → Deployment Protection | proteção dos Preview Deploys | quem consegue abrir o URL de preview |
| Settings → Domains | `riacanalhairdesign.pt` → `www` | hoje responde **307** (temporário); o recomendado é **308** |
| Deployments | deployment de produção atual | anotar o ID/URL: é o alvo de um eventual rollback |

> ⚠️ **Push para `main` = produção.** Com a integração Git ativa, um push
> para a branch de produção cria um deployment de produção sem passar por
> preview. Um push para outra branch cria um Preview Deploy (também é uma
> publicação: fica acessível por URL).

## 1. Sequência segura

1. **Consolidar localmente** (sem publicar):
   ```bash
   npm ci
   npm run test:all          # lint, unitários, E2E Chromium + visuais
   npm run test:e2e:cross    # Firefox e WebKit
   npm audit --omit=dev
   ```
2. **Rever** o diff e os resultados; decidir publicar.
3. **Publicar numa branch de trabalho** (não `main`), com autorização:
   `git push -u origin <branch>` e abrir um pull request. Corre a CI e a
   Vercel cria um Preview Deploy.
4. **CI:** confirmar os jobs `quality`, `e2e (chromium|firefox|webkit)` e
   `visual`. O job `visual` corre pela 1.ª vez num runner Windows do GitHub:
   se falhar só por diferenças de renderização, ver
   [Testes visuais](../README.md#testes-visuais) antes de mexer em baselines.
5. **Validar o Preview Deploy** (secção 2).
6. **Corrigir** o que falhar na mesma branch e repetir 4–5.
7. **Autorização para produção** → merge do PR para `main`.
8. **Verificar a produção** (secção 3). Se houver regressão → secção 4.

## 2. Checklist do Preview Deploy

Verificação automática (HTTP, metadados, cache, cabeçalhos, indexação):

```bash
npm run verify:deploy -- https://<preview>.vercel.app
```

> Se a *Deployment Protection* estiver ativa, os pedidos anónimos recebem
> 401/redirect para login: usar um *Protection Bypass* criado pelo
> proprietário, ou validar com sessão no browser.

| Teste | Resultado esperado | Comando / procedimento | Critério de aceitação | Estado |
| --- | --- | --- | --- | --- |
| Home | 200 HTML | `verify:deploy` | title, canonical `…/`, OG, Twitter, JSON-LD `HairSalon` únicos | por validar |
| Termos | 200 HTML | `verify:deploy` | canonical `…/termos`, sem `noindex` | por validar |
| Privacidade | 200 HTML | `verify:deploy` | canonical `…/privacidade` | por validar |
| `/termos/` | 308 → `/termos` | `curl -sI <base>/termos/` | um salto, `location: /termos` | por validar |
| `/termos/?ref=abc` | 308 → `/termos?ref=abc` | `verify:deploy` | query preservada | por validar |
| `/termos.html` | 308 → `/termos` | `curl -sI <base>/termos.html` | um salto | por validar |
| URL inexistente | 404 | `curl -s -o /dev/null -w '%{http_code}' <base>/xyz` | `404.html` com `noindex` | por validar |
| `/Termos` | 404 | idem | idem | por validar |
| `/404` | 404.html (`noindex`) | `curl -sI <base>/404` | localmente responde 200 com o documento de erro; confirmar o código na Vercel (sem impacto SEO: `noindex`) | por validar |
| Asset inexistente | 404 | `curl -sI <base>/assets/nao-existe.js` | nunca o HTML da Home com 200 | por validar |
| `robots.txt` | 200 `text/plain` | `curl -sI <base>/robots.txt` | contém `Sitemap: https://www.riacanalhairdesign.pt/sitemap.xml` | por validar |
| `sitemap.xml` | 200 XML | `curl -sI <base>/sitemap.xml` | `content-type` XML, contém `<urlset` | por validar |
| Assets com hash | cache imutável | `verify:deploy` | `public, max-age=31536000, immutable` | por validar |
| HTML | sem cache imutável | `curl -sI <base>/` | sem `immutable` | por validar |
| Cabeçalhos de segurança | presentes em todas as respostas | `verify:deploy` | `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `frame-ancestors` | por validar |
| Indexação do preview | não indexável | `curl -sI <base>/ \| grep -i x-robots-tag` | `X-Robots-Tag: noindex` (a Vercel acrescenta-o aos domínios de preview) | por validar |
| Pré-visualização social | cartão correto | depurador de partilha (Facebook/LinkedIn) com o URL de **produção**, após publicar | imagem `og.jpg`, título e descrição | após produção |
| Navegação e menus | sem regressões | browser desktop e telemóvel | menus, submenus, Escape, foco visível | por validar |
| Âncoras | secção abaixo do header | abrir `<base>/#Location`, `#AboutUs`, `#Works` | secção visível, sem saltos | por validar |
| Portefólio, slider, testemunhos, Quem Somos | sem regressões | interação manual | filtros, arrasto/toque, pausa | por validar |
| Vídeo e áudio | só descarregam após interação | DevTools → Network (filtro `mp4`/`mp3`) | 0 pedidos antes do hover/toque | por validar |
| Telemóvel real | sem regressões | iPhone (Safari) e Android (Chrome) | menu, scroll, toque, vídeo | por validar |

## 3. Produção

Depois do merge (e de o deployment de produção terminar):

```bash
npm run verify:deploy -- https://www.riacanalhairdesign.pt --domain
```

`--domain` acrescenta: `http://` → `https://`, apex → `www`, query
preservada e ausência de ciclos. O redirect apex → `www` é hoje **307**
(aviso, não falha); passar a **308** é uma alteração no dashboard
(Settings → Domains) que exige autorização.

Repetir a validação manual de UX da secção 2 no domínio público.

## 3.1 Riscos conhecidos a verificar ou decidir

| Risco | Evidência | O que fazer |
| --- | --- | --- |
| Downloads antecipados de vídeo/MP3 no Safari | O WebKit do Playwright (Windows) ignorava `preload="none"`. **Corrigido:** os `<video>`/`<audio>` só recebem `src` na interação; verificado no servidor em Chromium, Firefox e WebKit (0 pedidos antes da interação) | Confirmar em Safari macOS e iPhone reais → Web Inspector → Network, sem tocar no cartão: 0 pedidos `.mp4`/`.mp3`; hover/toque → só os MP4; botão de som → MP3 |
| Header com texto ampliado | **Corrigido:** espaços do header em `rem` (escala com a preferência de letra) e modo compacto (menu mobile) quando o desktop não cabe (texto ampliado só no conteúdo). Verificado no Firefox real até 200 % e por emulação CSS nos 3 motores; sem diferença visual com a letra por omissão | Verificar no Preview com Chrome (Definições → Aspeto → Tamanho do tipo de letra) e Safari (zoom só de texto) a ~1300–1440 px |
| Separadores abertos durante um deploy | Os chunks lazy de um deployment anterior deixam de existir (404) | Aceitável (recarregar resolve); a Vercel oferece *Skew Protection* em alguns planos |
| Cache imutável em 404 de `/assets/*` | **Confirmado no Preview:** `GET /assets/nao-existe.js` → 404 `text/html` com `Cache-Control: public, max-age=31536000, immutable`; os assets válidos com hash recebem a cache imutável pretendida. **Causa:** a regra `"/assets/(.*)"` do `vercel.json` aplica-se pelo caminho do pedido; as condições `has`/`missing` só avaliam o pedido (header, cookie, host, query) e a documentação da Vercel não prevê filtro por código de estado. Restringir o padrão a nomes com hash não resolve (um nome com hash inexistente também é 404); listar ficheiros um a um seria frágil; remover a regra deixaria os assets sem cache imutável documentada. **Documentado pela Vercel:** respostas 404 também podem ser guardadas em cache na CDN. **Não medido:** a duração efetiva dessa cache na CDN para esta resposta | **Risco aceite, sem alteração ao `vercel.json`.** O cabeçalho `Cache-Control: public, max-age=31536000, immutable` pode prolongar a reutilização da resposta 404 pelo browser. A Vercel também suporta cache de respostas 404 na CDN, mas a duração efetiva dessa cache não foi medida neste caso. O impacto prático é considerado baixo, mas não nulo, devido ao versionamento dos assets (nomes com hash do conteúdo, referenciados apenas pelo HTML revalidado do próprio deployment) e à imutabilidade dos deployments. Cenário mais provável de efeito visível: um separador antigo pede um chunk lazy após um deploy e depois é feito rollback para o deployment que o continha (ver secção 4). Reavaliar se se ativar *Skew Protection* ou se mudar a forma de servir os assets |

## 4. Rollback

**Quando:** página em branco ou erro JavaScript, rotas legais/404 erradas,
`robots.txt`/`sitemap.xml` a devolver HTML, metadados/canonical errados,
regressão grave de layout ou acessibilidade, assets partidos.

**Como (sem reescrever o histórico Git):**

1. Vercel → Deployments → filtrar *Production*; identificar o último
   deployment correto (anotado no passo 0).
2. Menu do deployment → **Instant Rollback** (ou *Promote to Production*).
   Equivalente CLI: `vercel rollback <deployment-url>` / `vercel promote`.
3. Corrigir numa branch e seguir de novo a secção 1. Um rollback
   instantâneo pode suspender a atribuição automática do domínio aos novos
   deploys de `main` até ser desfeito (ver a documentação da Vercel para o
   plano em uso).

**Verificação depois do rollback:** `npm run verify:deploy -- https://www.riacanalhairdesign.pt --domain`
(espera-se o resultado do deployment reposto) e teste manual.

**Cache:** o HTML é servido com revalidação (`max-age=0`), por isso o
rollback é visível de imediato. Os assets têm nomes com hash e cache
imutável: o deployment reposto referencia os seus próprios ficheiros, sem
conflito. Separadores abertos com a versão anterior podem pedir chunks lazy
que já não existem até serem recarregados. Esse 404 recebe a mesma cache
imutável (ver 3.1): se um browser o tiver recebido antes do rollback, pode
continuar a reutilizá-lo após o rollback (limpar a cache do browser
resolve). O efeito de uma eventual cache do 404 na CDN neste cenário não foi
medido.
