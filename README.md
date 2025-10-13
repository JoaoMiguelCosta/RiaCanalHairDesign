## 1) Repositório e Deploy

### Badges
[![Site online](https://img.shields.io/badge/Live-ria--canal--hair--design.vercel.app-success)](https://ria-canal-hair-design.vercel.app/)
[![Powered by Vercel](https://img.shields.io/badge/Powered_by-Vercel-black)](https://vercel.com)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https://github.com/JoaoMiguelCosta/RiaCanalHairDesign)

### Live e Repositório
- **Live:** https://ria-canal-hair-design.vercel.app/
- **Repo:** https://github.com/JoaoMiguelCosta/RiaCanalHairDesign

### Configuração na Vercel (confirmar)
- **Git ligado ao projeto** (repo acima).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Previews automáticos** em cada PR/push.
- **Produção** na branch principal (ex.: `main`).

## 2) Stack e Configuração

- **Node:** 20.x (definido em `"engines"`)
- **Vite + React**
- **ESLint** configurado
- **Scripts npm:**
  ```json
  {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
