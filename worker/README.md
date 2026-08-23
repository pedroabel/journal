# Sincronização — publicar o Worker

Passo a passo, uma vez só. Tudo roda a partir desta pasta (`cd worker`).
Os comandos usam `npx wrangler`, então não é preciso instalar nada global.

## 1. Criar o banco

```bash
npx wrangler login
npx wrangler d1 create journal
```

O segundo comando imprime um `database_id`. Cole-o em `wrangler.toml`, no lugar
de `COLE_AQUI_O_DATABASE_ID`. Depois crie as tabelas:

```bash
npx wrangler d1 execute journal --remote --file=schema.sql
```

## 2. Escolher a senha e gerar o hash

Escolha **5 ou 6 palavras aleatórias** (ex.: `cavalo bateria grampo correto lua`).
É essa senha que protege tudo: ela autentica no servidor *e* deriva a chave que
cifra os dados. Senha curta ou óbvia derruba as duas proteções de uma vez.

```bash
node derive.mjs
```

Digite a senha (não aparece na tela nem fica no histórico). Saem 64 caracteres
hexadecimais — é o `AUTH_HASH`. Ele não permite voltar à senha nem decifrar nada.

## 3. Configurar os segredos e publicar

```bash
npx wrangler secret put AUTH_HASH        # cole o hash do passo anterior
npx wrangler secret put ALLOWED_ORIGIN   # https://SEU-USUARIO.github.io
npx wrangler deploy
```

O deploy imprime a URL, algo como
`https://journal-sync.SEU-SUBDOMINIO.workers.dev`.

## 4. Ligar o site na URL

Em `assets/js/sync.js`, primeira linha de configuração:

```js
var SYNC_URL = 'https://journal-sync.SEU-SUBDOMINIO.workers.dev';
```

Commit e push. Enquanto `SYNC_URL` estiver vazio, o site funciona normalmente,
só sem sincronizar.

## 5. Ativar cada aparelho

Abra o site, vá até o rodapé, clique em **ativar sincronização** e digite a
senha. A derivação leva ~1 segundo. A partir daí o aparelho sincroniza sozinho:
ao abrir, ao voltar o foco para a aba, e a cada alteração.

Repita em cada aparelho. Nenhum deles guarda a senha — só as chaves derivadas,
no IndexedDB, e a de cifragem de forma que o próprio JavaScript não consegue
exportá-la.

---

## Custo

Plano gratuito da Cloudflare: 100.000 requisições/dia no Worker e 5 GB no D1.
Este site faz algumas dezenas de requisições por dia e guarda alguns KB.

## O que o servidor vê

Uma linha com `version`, `iv` e `ct`. O `ct` é AES-GCM: sem a chave derivada da
sua senha, é ruído. Nem quem tiver acesso ao painel da Cloudflare lê o conteúdo.

## Trocar a senha

1. Em um aparelho que já tem os dados, clique em **baixar backup** (guarde o `.json`).
2. `node derive.mjs` com a senha nova → `npx wrangler secret put AUTH_HASH`.
3. Em cada aparelho: **sair deste aparelho** → **ativar sincronização** com a senha nova.
4. No primeiro aparelho, o site vai avisar que os dados do servidor foram
   cifrados com outra senha — é esperado. Clique em **restaurar backup** com o
   arquivo do passo 1: isso regrava o servidor com a senha nova. Os demais
   aparelhos recebem a partir daí.

## Se esquecer a senha

Não há recuperação — é o preço de o servidor não conseguir ler nada. O caminho é
o backup `.json`: apague a linha do banco
(`npx wrangler d1 execute journal --remote --command "DELETE FROM state"`),
defina um novo `AUTH_HASH` e restaure o backup em um aparelho.

Por isso vale baixar um backup de vez em quando.

## Limite de tentativas

10 senhas erradas vindas do mesmo IP bloqueiam novas tentativas por 15 minutos
(inclusive as suas — espere e tente de novo). Para ajustar, mude
`FAIL_LIMIT`/`FAIL_WINDOW_DEFAULT` em `worker.js` ou defina a variável
`FAIL_WINDOW`.

## Rodar localmente

```bash
npx wrangler dev --local
```

Sobe o Worker em `http://localhost:8787` com um D1 local. Para testar o site
contra ele, aponte `SYNC_URL` para essa URL e acrescente-a ao `connect-src` da
CSP em `index.html` (a CSP de produção só permite `https:`).
