# Sistema Unificado · 2026–2029

Diário privado de rotina, marcos e acompanhamento até 2029. Next.js com
autenticação por senha: o conteúdo só sai do servidor para quem tem sessão
válida.

## Estrutura

```
app/
  layout.tsx            casca HTML, fontes, metadados
  page.tsx              a aplicação (protegida)
  login/                tela de entrada
  api/login|logout/     sessão
proxy.ts                barreira: valida a sessão antes de qualquer rota
lib/
  plan.ts               CONTEÚDO do plano — rotina, marcos, trilhas, checklists
  prose.ts              seções de texto, preservadas da versão anterior
  derive.ts             cálculos: sequências, taxas, situação dos marcos
  state.ts              estado e persistência local
  report.ts             relatório em texto e prompt de análise
  auth.ts / password.ts sessão JWT e verificação da senha
components/             views (hoje, semana, mês, ano, jornada) e seções
scripts/hash-password.mjs   gera as variáveis de ambiente
```

A separação que importa: **`lib/plan.ts` é o conteúdo** (o que o plano diz),
o resto é maquinaria. Quase toda atualização futura é só nesse arquivo.

## Rodar localmente

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # testes da fusão entre aparelhos
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

> **Depois que o Vercel estiver no ar, desligue o GitHub Pages**
> (*Settings → Pages → Source: None*). Enquanto ele servir a versão antiga, o
> plano continua público — que é exatamente o que a autenticação veio resolver.

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

Os botões no rodapé (**baixar backup** / **restaurar backup**) deixam de ser a
ponte entre aparelhos e passam a ser o que sempre deveriam ter sido: cópia de
segurança, e a saída caso você queira levar os dados para outro lugar.

## Atualizar com o Claude Code

Exemplos que caem em um arquivo só:

- "adicione um marco de X em `lib/plan.ts`, com data-alvo e critério"
- "mude os blocos de terça-feira em `WEEK`, em `lib/plan.ts`"
- "acrescente um item na checklist de documentos"
