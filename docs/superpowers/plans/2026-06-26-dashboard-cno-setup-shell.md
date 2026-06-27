# Dashboard Radar de Obras (CNO) — Fases 1-2 (Setup + Shell/Tema) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar o esqueleto do dashboard CNO em Next.js 14 + Tailwind + shadcn/ui, com tipografia Geist, a paleta graphite da seção 3 aplicada aos tokens do shadcn, tema dark por padrão e toggle claro/escuro funcionando.

**Architecture:** App Router do Next 14, tudo client-side. shadcn/ui como base de componentes com variáveis HSL sobrescritas no `globals.css` pela paleta graphite. `next-themes` controla o tema (dark default, persistido). O comportamento do toggle é coberto por teste unitário (Vitest + Testing Library); o scaffolding é verificado rodando o dev server.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v3 · shadcn/ui · geist (Sans + Mono) · next-themes · lucide-react · Vitest + @testing-library/react

---

## Escopo e decisões registradas

- **Escopo deste plano:** somente Fases 1 e 2 do `PLANO.md`. As Fases 3-10 (dados mock, filtros, KPIs, mapa, donut, tabelas, cross-filter, polish, dados reais do CNO) entram em planos posteriores.
- **Decisão para a Fase 5 (futura, fora deste plano):** adotar desde o mock os **KPIs com lastro real** sugeridos na seção 12 do `PLANO.md` — Obras, Metragem total, Responsáveis PJ, Responsáveis PF, Obras ativas, Obras novas no período — e cortar filtros sem lastro (Profissionais, Previsão início/término, Serviços) já no mock, para evitar retrabalho na migração para o CNO real. **Não implementar agora**, apenas registrado aqui para o plano da Fase 5.
- **Critério de pronto deste plano:** `npm run dev` mostra um shell com header e área principal, fundo graphite quase-preto por padrão, e um botão de toggle que alterna entre dark e light com persistência. `npm test` passa.

## File Structure

Arquivos gerados pelo `create-next-app` (não listados individualmente) mais:

- `PLANO.md` — o spec original, renomeado para a raiz (Task 1).
- `app/layout.tsx` — **Modify**: aplica fontes Geist e envolve a árvore no `ThemeProvider`.
- `app/page.tsx` — **Modify**: vira o shell mínimo (header + main placeholder).
- `app/globals.css` — **Modify**: sobrescreve as variáveis HSL do shadcn com a paleta graphite.
- `components/theme-provider.tsx` — **Create**: wrapper client do `next-themes`.
- `components/theme-toggle.tsx` — **Create**: botão de alternância de tema.
- `components/ui/button.tsx` — **Create** (via shadcn CLI): base do botão.
- `components/__tests__/theme-toggle.test.tsx` — **Create**: teste de comportamento do toggle.
- `vitest.config.ts` / `vitest.setup.ts` — **Create**: ambiente de teste.

---

### Task 1: Inicializar git e o projeto Next 14

**Files:**
- Create: projeto Next inteiro (gerado pelo CLI)
- Rename: `PLANO-dashboard-obras (1).md` → `PLANO.md`

- [ ] **Step 1: Inicializar git e preservar o spec**

Run (a partir da raiz `/Users/gustavocampeol/Documents/Projetos/cno`):
```bash
git init
git mv "PLANO-dashboard-obras (1).md" PLANO.md 2>/dev/null || mv "PLANO-dashboard-obras (1).md" PLANO.md
```
Expected: repositório git criado; o spec passa a se chamar `PLANO.md` na raiz.

- [ ] **Step 2: Gerar o app Next 14 na pasta atual**

Run:
```bash
npx create-next-app@14 . \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --use-npm
```
Expected: scaffolding criado (`app/`, `package.json`, `tailwind.config.ts`, `next.config.mjs`, `tsconfig.json`). Se o CLI reclamar de arquivo conflitante por causa de `PLANO.md` ou `docs/`, confirmar que esses não são arquivos que ele gera (não são) e prosseguir; `PLANO.md` e `docs/` convivem com o scaffolding.

- [ ] **Step 3: Verificar que o dev server sobe**

Run:
```bash
npm run dev
```
Expected: servidor em `http://localhost:3000` servindo a landing padrão do Next. Encerrar com Ctrl+C depois de confirmar.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold next 14 app with tailwind"
```

---

### Task 2: Inicializar shadcn/ui e instalar o Button

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`
- Modify: `app/globals.css` (o init do shadcn injeta as variáveis de tema base)

- [ ] **Step 1: Rodar o init do shadcn**

Run:
```bash
npx shadcn@latest init -d
```
Expected: cria `components.json` e `lib/utils.ts`, e injeta as variáveis CSS base (`:root` e `.dark`) em `app/globals.css`. A flag `-d` aceita os defaults (base color neutral, CSS variables = yes).

- [ ] **Step 2: Instalar o componente Button**

Run:
```bash
npx shadcn@latest add button
```
Expected: cria `components/ui/button.tsx`.

- [ ] **Step 3: Verificar build**

Run:
```bash
npm run build
```
Expected: build conclui sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: init shadcn/ui and add button"
```

---

### Task 3: Instalar fontes Geist e ícones, e ligar no layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Instalar as dependências**

Run:
```bash
npm install geist next-themes lucide-react
```
Expected: `geist`, `next-themes` e `lucide-react` adicionados ao `package.json`.

- [ ] **Step 2: Aplicar as fontes Geist no layout**

Substituir o conteúdo de `app/layout.tsx` por (mantém o `ThemeProvider` em branco por enquanto — ele entra na Task 5):

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar de Obras — CNO",
  description: "Inteligência de mercado da construção civil a partir do Cadastro Nacional de Obras.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Expor as variáveis de fonte no Tailwind**

Em `tailwind.config.ts`, dentro de `theme.extend`, adicionar a chave `fontFamily` (mesclar com o que já existir em `extend`):

```ts
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
```

- [ ] **Step 4: Verificar que aplica a fonte**

Run:
```bash
npm run dev
```
Expected: a página padrão renderiza com a Geist Sans (texto visivelmente diferente da fonte default do sistema). Encerrar com Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire geist sans/mono fonts into layout"
```

---

### Task 4: Aplicar a paleta graphite nos tokens do shadcn

**Files:**
- Modify: `app/globals.css`

A paleta da seção 3 do `PLANO.md` convertida de hex para HSL (formato que o shadcn espera, sem vírgula e sem `hsl()`):

| Token | Hex de origem | HSL |
|---|---|---|
| Fundo base | `#0A0A0B` | `240 5% 4%` |
| Superfície 1 (cards/popover) | `#141416` | `240 5% 8%` |
| Superfície 2 (elevado) | `#1C1C1F` | `240 5% 12%` |
| Borda / input | `#27272A` | `240 4% 16%` |
| Texto primário | `#FAFAFA` | `0 0% 98%` |
| Texto secundário (muted-fg) | `#A1A1AA` | `240 5% 65%` |
| Accent / marca (cobalto) | `#3B6CF6` | `224 91% 60%` |

- [ ] **Step 1: Sobrescrever o bloco `.dark` no globals.css**

Em `app/globals.css`, substituir o bloco `.dark { ... }` (gerado pelo shadcn init) por:

```css
.dark {
  --background: 240 5% 4%;
  --foreground: 0 0% 98%;

  --card: 240 5% 8%;
  --card-foreground: 0 0% 98%;

  --popover: 240 5% 12%;
  --popover-foreground: 0 0% 98%;

  --primary: 224 91% 60%;
  --primary-foreground: 0 0% 98%;

  --secondary: 240 5% 12%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 5% 8%;
  --muted-foreground: 240 5% 65%;

  --accent: 224 91% 60%;
  --accent-foreground: 0 0% 98%;

  --destructive: 0 62% 50%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 4% 16%;
  --input: 240 4% 16%;
  --ring: 224 91% 60%;

  --radius: 0.5rem;
}
```

> Nota de design (seção 3 do `PLANO.md`): `--primary`/`--accent`/`--ring` usam o cobalto **só** porque o shadcn mapeia interação/foco/seleção nesses tokens. A cor de marca não deve ser usada decorativamente em superfícies — isso é uma regra a respeitar nas fases seguintes, não algo a impor aqui.

- [ ] **Step 2: Verificar o tema dark visualmente**

Run:
```bash
npm run dev
```
Expected: depois que a Task 5 forçar o tema dark, o fundo fica no graphite quase-preto. Por ora, abrir o devtools e confirmar que `:root` da classe `.dark` carrega `--background: 240 5% 4%`. Encerrar com Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: apply graphite palette to shadcn theme tokens"
```

---

### Task 5: Theme provider com dark por padrão

**Files:**
- Create: `components/theme-provider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Criar o provider**

Criar `components/theme-provider.tsx`:

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: Envolver a árvore no layout com dark default**

Em `app/layout.tsx`, importar o provider e envolver `{children}`:

```tsx
import { ThemeProvider } from "@/components/theme-provider";
```

E o `<body>` passa a ser:

```tsx
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
```

- [ ] **Step 3: Verificar que o dark é o padrão**

Run:
```bash
npm run dev
```
Expected: ao abrir `http://localhost:3000` num navegador sem preferência salva, o `<html>` recebe a classe `dark` e o fundo aparece graphite quase-preto. Encerrar com Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add theme provider with dark default"
```

---

### Task 6: Toggle de tema (TDD)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `components/__tests__/theme-toggle.test.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `package.json` (script `test`)

- [ ] **Step 1: Instalar o ambiente de teste**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```
Expected: dependências de teste adicionadas.

- [ ] **Step 2: Configurar o Vitest**

Criar `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

Criar `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Adicionar em `package.json`, no bloco `scripts`:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Escrever o teste que falha**

Criar `components/__tests__/theme-toggle.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setTheme = vi.fn();
let currentTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme }),
}));

import { ThemeToggle } from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    currentTheme = "dark";
  });

  it("renderiza um botão acessível", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /alternar tema/i })).toBeInTheDocument();
  });

  it("vai para light quando o tema atual é dark", async () => {
    currentTheme = "dark";
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /alternar tema/i }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("vai para dark quando o tema atual é light", async () => {
    currentTheme = "light";
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /alternar tema/i }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
```

- [ ] **Step 4: Rodar o teste e confirmar que falha**

Run:
```bash
npm test
```
Expected: FAIL — `Cannot find module '@/components/theme-toggle'` (ou equivalente), porque o componente ainda não existe.

- [ ] **Step 5: Implementar o toggle**

Criar `components/theme-toggle.tsx`:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run:
```bash
npm test
```
Expected: PASS — os três testes verdes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add theme toggle with tests"
```

---

### Task 7: Shell mínimo da página

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Substituir a landing pela casca do dashboard**

Substituir o conteúdo de `app/page.tsx` por:

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Radar de Obras · CNO</span>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard em construção</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shell e tema prontos. Próximas fases: dados mock, filtros, KPIs, mapa, donut e tabelas.
        </p>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verificar o shell rodando com toggle**

Run:
```bash
npm run dev
```
Expected: header sticky com glass blur (`backdrop-blur`) sobre fundo graphite, título à esquerda e botão de toggle à direita. Clicar no toggle alterna dark/light e o fundo muda. Recarregar a página mantém o tema escolhido (persistência do `next-themes`). Encerrar com Ctrl+C.

- [ ] **Step 3: Build e teste finais**

Run:
```bash
npm run build && npm test
```
Expected: build sem erros e testes verdes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: minimal dashboard shell with sticky glass header"
```

---

## Self-Review (cobertura vs. spec, escopo Fases 1-2)

- **Fase 1 — Setup:** Next 14 + Tailwind (Task 1) ·· shadcn init (Task 2) ·· Geist/Geist Mono (Task 3) ·· tokens graphite no globals.css sobrescrevendo HSL do shadcn (Task 4). ✅
- **Fase 2 — Shell + tema:** layout (Tasks 3, 7) ·· provider de tema dark default (Task 5) ·· toggle claro/escuro (Task 6). ✅
- **Barra de qualidade aplicável já aqui:** Geist Mono disponível para números (config Tailwind, Task 3); foco/acessibilidade do toggle com `aria-label` e teste por role. Responsividade plena, pt-BR de números, `prefers-reduced-motion` e empty states entram nas fases que introduzem dados/visualizações — fora do escopo deste plano.
- **Fora de escopo (registrado, não implementado):** KPIs com lastro real, filtros, mapa, donut, tabelas, cross-filter, polish e dados reais do CNO — Fases 3-10.

## Próximos passos após executar este plano

Validar o shell rodando com o toggle (critério de pronto). Em seguida, pedir o plano da **Fase 3 (camada de dados: `types.ts`, `mock-data.ts`, `aggregations.ts`)**, já incorporando a decisão dos KPIs com lastro real registrada no topo deste documento.
