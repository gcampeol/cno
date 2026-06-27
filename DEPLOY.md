# Deploy na Vercel

O build roda **na nuvem da Vercel**, então não depende da memória da sua máquina.
Escolha um dos dois caminhos.

## Opção A — Vercel CLI (mais rápido, sem precisar de GitHub)

A CLI envia o código e **builda nos servidores da Vercel** (não usa a RAM local).

```bash
cd /Users/gustavocampeol/Documents/Projetos/cno

# 1. Login (abre o navegador na primeira vez)
npx vercel login

# 2. Deploy de preview — gera uma URL temporária
npx vercel

# 3. Quando estiver feliz, publica em produção
npx vercel --prod
```

Na primeira execução a CLI faz algumas perguntas:
- "Set up and deploy?" → **Y**
- "Which scope?" → sua conta
- "Link to existing project?" → **N**
- "Project name?" → `cno` (ou o que quiser)
- "In which directory is your code?" → **`./`** (Enter)
- Detecta **Next.js** automaticamente — aceite os defaults de build.

Ao final ela imprime a URL (algo como `https://cno-xxxx.vercel.app`). Abra no navegador.

## Opção B — GitHub + dashboard da Vercel (deploy automático a cada push)

```bash
# 1. Crie um repositório vazio no GitHub (sem README), depois:
cd /Users/gustavocampeol/Documents/Projetos/cno
git remote add origin git@github.com:SEU_USUARIO/cno.git
git push -u origin main   # se o branch chamar "master", troque por master
```

Depois, em **vercel.com → Add New → Project → Import** o repositório `cno`.
A Vercel detecta Next.js, builda na nuvem e te dá a URL. Cada `git push` futuro
gera um novo deploy automático.

## O que conferir na URL (critério das Fases 1-2)

- Fundo **graphite quase-preto**, header **sticky com glass blur** ("Radar de Obras · CNO")
- **Botão sol/lua** no canto direito → alterna dark/light e persiste ao recarregar
- Título "Dashboard em construção"

## Se o build falhar

A Vercel mostra o log do build. Como não foi possível rodar `npm run build`/`tsc`
localmente (limite de RAM desta máquina), um erro de tipo pode aparecer só lá.
Me mande o trecho do erro e eu corrijo.
