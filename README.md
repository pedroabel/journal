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
assets/js/sync.js       sincronização entre aparelhos (cifra, fusão, transporte)
assets/icon.svg         ícone (aba do navegador e tela de início do celular)
site.webmanifest        permite "adicionar à tela de início" no celular
worker/                 endpoint de sincronização (Cloudflare Worker + D1)
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
navegador. O site é público; os dados marcados nunca vão para o repositório.

Com a sincronização ligada, esse mesmo progresso também sobe **cifrado** para o
Worker, e os aparelhos convergem sozinhos. Sem ela, cada aparelho é uma ilha e a
ponte são os botões **baixar backup** / **restaurar backup** no rodapé — que
continuam valendo como cópia de segurança em qualquer caso.

## Sincronizar entre aparelhos

Desligada por padrão. Para ligar, publique o Worker seguindo
[`worker/README.md`](worker/README.md) — leva uns 10 minutos, é gratuito, e
depois é só clicar em **ativar sincronização** no rodapé de cada aparelho e
digitar a senha.

Como funciona, resumido:

- **Senha** → PBKDF2 (600 mil iterações) → duas chaves: uma autentica no
  servidor, a outra cifra os dados. A senha em si não é guardada em lugar
  nenhum, e a chave de cifragem fica no aparelho como `CryptoKey` não-extraível.
- **O servidor não lê nada.** Recebe e devolve um blob AES-GCM. Sem o token,
  responde 401 — conhecer a URL não dá acesso a coisa alguma.
- **Conflitos** são resolvidos chave a chave, pela alteração mais recente:
  marcar um hábito no celular e fechar uma checklist no notebook ao mesmo tempo
  preserva as duas coisas. O mapa `state.t` guarda quando cada chave mudou.
- **Offline** continua funcionando: grava local e sobe quando a conexão volta.

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
