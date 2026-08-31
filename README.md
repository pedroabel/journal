# Sistema Unificado · 2026–2029

Diário privado de rotina, marcos e acompanhamento até 2029. Next.js com login
pelo Google: o conteúdo só sai do servidor para quem tem sessão válida.

## Estrutura

```
app/
  layout.tsx            casca HTML, fontes, metadados
  globals.css           tokens do tema (cor, raio, tipografia)
  page.tsx              a aplicação (protegida)
  login/                tela de entrada
  api/auth/             ida e volta do login com o Google
  api/logout/           encerra a sessão
  api/state/            leitura e gravação do progresso
proxy.ts                barreira: valida a sessão antes de qualquer rota
lib/
  plan.ts               CONTEÚDO do plano — rotina, marcos, trilhas, checklists
  derive.ts             cálculos: sequências, taxas, situação dos marcos
  state.ts              estado local e a migração das chaves antigas
  merge.ts              fusão entre aparelhos, chave a chave
  db.ts / sql.ts        o progresso no Postgres (Neon)
  auth.ts / oauth.ts    sessão JWT e o handshake com o Google
  report.ts             relatório em texto e prompt de análise
  utils.ts              `cn()` — junção de classes do shadcn/ui
components/
  ui/                   componentes do shadcn/ui (não editar à mão)
  layout/               barra lateral e navegação
  views/                hoje, semana, mês, ano, jornada
  sections/             seções de referência
  Section.tsx           casca única de seção: rótulo, título, apoio
```

A separação que importa: **`lib/plan.ts` é o conteúdo** (o que o plano diz),
o resto é maquinaria. Quase toda atualização futura é só nesse arquivo.

## Interface

**shadcn/ui sobre Tailwind CSS v4.** Os componentes vivem em `components/ui/` e
saem do registro do shadcn — para acrescentar outro, `npx shadcn@latest add
<nome>` (a configuração está em `components.json`). Não edite esses arquivos
para resolver um caso específico: a variação certa vira `variant` ou vem por
`className` no ponto de uso, senão o sistema se desfaz componente a componente.

Nenhum componente escolhe cor própria. Tudo consome os tokens de
`app/globals.css`, que é onde o tema inteiro cabe numa tela — inclusive o
escuro, que segue a preferência do sistema com os **mesmos nomes de token**.

As cores das áreas do plano (inglês, programação, corpo, carreira, base) são
`--chart-1` a `--chart-5`. `lib/plan.ts` guarda só o **nome** do token, nunca um
valor: `components/tone.ts` transforma esse nome na variável local `--tone`, que
os componentes leem. É por isso que trocar a paleta em `globals.css` repinta
marcos, trilhas, blocos e legendas de uma vez — e por que conteúdo e tema não se
misturam.

Três peças evitam que telas de mesma finalidade divirjam:

| Peça | O que padroniza |
|---|---|
| `components/Section.tsx` | espaçamento e hierarquia de toda seção e visão |
| `components/ChecklistCard.tsx` | trilhas e checklists — mesma lista marcável |
| `components/ui/empty.tsx` | todo estado vazio, com a mesma forma |

## Rodar localmente

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # fusão entre aparelhos e migração de chaves
```

O `.env.local` precisa de:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ALLOWED_EMAILS=voce@gmail.com
AUTH_SECRET=...            # 32+ caracteres aleatórios; assina a sessão
DATABASE_URL=postgresql://...
```

Está no `.gitignore` — nada disso pode ir para o repositório. Para rodar
localmente, cadastre também `http://localhost:3000/api/auth/callback` como
URI de redirecionamento no mesmo cliente OAuth.

## Autenticação

Não há senha. Quem confirma a identidade é o Google; o site só decide se
aquela identidade é a do dono, comparando com `ALLOWED_EMAILS`.

| Camada | O que faz |
|---|---|
| `/api/auth/start` | manda para o Google com `state` (anti-CSRF) e PKCE |
| `/api/auth/callback` | troca o código, verifica o `id_token` contra as chaves públicas do Google e confere o e-mail |
| Sessão | JWT assinado (`jose`), cookie `httpOnly` + `secure` + `sameSite=lax`, 30 dias |
| `proxy.ts` | valida o cookie na borda: sem sessão, o HTML não é gerado |

A diferença para uma tela de senha em JavaScript: aqui o conteúdo **não é
entregue** sem sessão. Numa página estática, esconder com JS é teatro — o
arquivo já foi baixado.

Tirar a senha não foi só conveniência. Some o hash para guardar, some o que
memorizar e digitar no celular, e some o que adivinhar — por isso não existe
limite de tentativas nem como ficar trancado do lado de fora. O Google
participa do login e de mais nada: não guarda a sessão nem enxerga o diário,
e o escopo pedido é só `openid email`.

Trocar quem tem acesso: edite `ALLOWED_EMAILS` na Vercel. Trocar o
`AUTH_SECRET` desconecta todos os aparelhos de uma vez.

## Publicar (Vercel)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) — o Next é
   detectado sozinho, sem configuração.
2. Em **Settings → Environment Variables**, adicione `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS` e `AUTH_SECRET` para Production.
3. Deploy. Todo push na `main` republica.

> Confira em *Settings → Pages* que a fonte está em **None**. O site estático
> que o Pages servia saiu do repositório, mas uma publicação antiga segue no ar
> até ser desligada na mão — e aquela versão não tem login nenhum.

## Onde ficam os dados marcados

No `localStorage` do navegador **e** no Postgres, e os dois convergem sozinhos.
Marcar algo grava local na hora — instantâneo e sem depender de rede — e sobe
em segundo plano.

A fusão é chave a chave, pelo carimbo em `state.t`: marcar um hábito no celular
e fechar uma checklist no notebook não são alterações concorrentes, e as duas
sobrevivem. Sem essa regra, "o último que salvou manda" apagaria trabalho toda
vez que os dois aparelhos mexessem em coisas diferentes. Ver `lib/merge.ts`,
cujas propriedades (comutativa, idempotente, associativa) têm teste em
`lib/merge.test.ts` — são elas que permitem sincronizar com uma chamada só,
sem versão, sem conflito e sem fila de pendências offline.

Não há backup manual nem botão de reiniciar. O backup existia porque o diário
só vivia no navegador: era a única ponte entre aparelhos e a única rede de
segurança. Com o Postgres replicando para todos eles, ele resolvia um caso que
deixou de existir — e o reset foi junto, porque dependia do backup como
desfazer e propagava a limpeza para todo aparelho.

Cada item de trilha e de checklist carrega uma **chave própria** (`fin#k42`), e
é ela que fica gravada. Já foi a posição na lista, e aí inserir uma linha no
meio de `lib/plan.ts` movia as marcações para o item errado, em silêncio.
`state.ts` guarda a tabela congelada que traduz o que foi marcado antes disso.

## Atualizar com o Claude Code

Exemplos que caem em um arquivo só:

- "adicione um marco de X em `lib/plan.ts`, com data-alvo e critério"
- "mude os blocos de terça-feira em `WEEK`, em `lib/plan.ts`"
- "acrescente um item na checklist de documentos"

Uma regra só, ao mexer em `TRACKS` e `CHECKS`: **chave existente não muda.** É
ela que liga o texto ao que já foi marcado. Reescrever o texto de um item é
livre; trocar a chave dele zera aquele item. Item novo entra com chave nova, em
qualquer posição da lista.
