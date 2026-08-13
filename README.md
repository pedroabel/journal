# Sistema Unificado · 2026–2029

Site pessoal estático com o plano de rotina, marcos e acompanhamento até 2029.
Sem framework, sem build, sem dependências: são arquivos HTML, CSS e JS abertos
direto pelo navegador.

## Estrutura

```
index.html              casca da página (nav, cabeçalho, containers)
assets/css/styles.css   todo o estilo
assets/js/data.js       CONTEÚDO do plano — rotina, marcos, trilhas, checklists
assets/js/app.js        lógica: estado, progresso e render das views
assets/icon.svg         ícone (aba do navegador e tela de início do celular)
site.webmanifest        permite "adicionar à tela de início" no celular
```

A separação importante é `data.js` (o que o plano diz) x `app.js` (como o site
funciona). Quase toda atualização futura é só em `data.js`.

## Rodar localmente

Abrir `index.html` com dois cliques já funciona. Para ficar igual ao servidor de
produção (inclusive o manifest):

```bash
python3 -m http.server 8000
# depois: http://localhost:8000
```

## Publicar (GitHub Pages)

1. Faça o merge deste branch na `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `main`, pasta `/ (root)`. Salve.
3. Em ~1 minuto o site fica em `https://<usuário>.github.io/journal/`.

A partir daí, todo push na `main` republica sozinho — não há workflow para
manter. Netlify e Vercel funcionam do mesmo jeito (apontar para o repositório,
sem comando de build, diretório de publicação = raiz), caso queira domínio
próprio depois.

## Onde ficam os dados marcados

O progresso (dias feitos, marcos, checklists) fica no `localStorage` do
navegador — ou seja, **por aparelho**. O site é público; os dados marcados não
saem do seu dispositivo e não vão para o repositório.

Para levar o progresso de um aparelho para outro, use os botões no rodapé:
**baixar backup** (gera um `.json`) e **restaurar backup** no outro aparelho.

## Análise pelo Claude

O botão **Preparar análise** monta o prompt (contexto do plano + relatório do
período) e copia para a área de transferência. Basta colar no
[claude.ai](https://claude.ai/new). O site não chama nenhuma API e não guarda
chave nenhuma — um site estático público não tem onde esconder uma chave.

## Atualizar com o Claude Code

Exemplos de pedido que caem em um arquivo só:

- "adicione um marco de X em `assets/js/data.js`, com data-alvo e critério"
- "mude os blocos de terça-feira em `WEEK`, em `assets/js/data.js`"
- "acrescente um item na checklist de documentos"

Depois é só commitar e dar push na `main`.
