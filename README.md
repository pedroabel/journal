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
npm run hash        # digite a senha; copie as duas linhas para .env.local
npm run dev         # http://localhost:3000
```

O `.env.local` precisa de:

```
AUTH_PASSWORD_HASH=scrypt:...
AUTH_SECRET=...
```

Está no `.gitignore` — nenhum dos dois pode ir para o repositório.

## Autenticação

Não há cadastro nem banco de usuários: existe uma senha, e ela nunca é
guardada — só o hash `scrypt`, em variável de ambiente.

| Camada | O que faz |
|---|---|
| `POST /api/login` | compara a senha com `scrypt`, em tempo constante |
| Sessão | JWT assinado (`jose`), cookie `httpOnly` + `secure` + `sameSite=lax`, 30 dias |
| `proxy.ts` | valida o cookie na borda: sem sessão, o HTML não é gerado |
| Limite | 10 tentativas erradas por IP a cada 15 minutos |

A diferença para uma tela de senha em JavaScript: aqui o conteúdo **não é
entregue** sem sessão. Numa página estática, esconder com JS é teatro — o
arquivo já foi baixado.

Trocar a senha: `npm run hash` de novo e atualizar as variáveis. Trocar o
`AUTH_SECRET` desconecta todos os aparelhos de uma vez.

## Publicar (Vercel)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) — o Next é
   detectado sozinho, sem configuração.
2. Em **Settings → Environment Variables**, adicione `AUTH_PASSWORD_HASH` e
   `AUTH_SECRET` (gerados por `npm run hash`) para Production.
3. Deploy. Todo push na `main` republica.

> **Depois que o Vercel estiver no ar, desligue o GitHub Pages**
> (*Settings → Pages → Source: None*). Enquanto ele servir a versão antiga, o
> plano continua público — que é exatamente o que a autenticação veio resolver.

## Onde ficam os dados marcados

No `localStorage` do navegador: por aparelho. O conteúdo do plano vem do
servidor; o que você marcou fica no dispositivo.

Os botões no rodapé (**baixar backup** / **restaurar backup**) movem o
progresso entre aparelhos e servem como cópia de segurança.

Sincronizar automaticamente entre aparelhos é o próximo passo natural: com a
sessão já validada no servidor, basta uma rota de API e um banco — sem senha
extra e sem a criptografia ponta a ponta que a versão anterior exigia.

## Atualizar com o Claude Code

Exemplos que caem em um arquivo só:

- "adicione um marco de X em `lib/plan.ts`, com data-alvo e critério"
- "mude os blocos de terça-feira em `WEEK`, em `lib/plan.ts`"
- "acrescente um item na checklist de documentos"
