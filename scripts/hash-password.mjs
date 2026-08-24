/**
 * Gera AUTH_PASSWORD_HASH e AUTH_SECRET. Rode localmente:
 *
 *   npm run hash
 *
 * A senha é lida sem eco e não fica no histórico do terminal. O que sai daqui
 * é um hash scrypt: não dá para voltar à senha a partir dele.
 */
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline';

const scryptAsync = promisify(scrypt);

// Custo: ~100ms por tentativa numa máquina moderna. Sobe o preço de quem
// tenta adivinhar sem atrapalhar o login legítimo.
const N = 1 << 15, r = 8, p = 1, KEYLEN = 32;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.query = question;
    rl._writeToOutput = function (s) { if (s.includes(rl.query)) process.stdout.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

const password = process.env.JOURNAL_PASSWORD || (await askHidden('senha: '));
if (!password) { console.error('senha vazia'); process.exit(1); }
if (password.length < 12) {
  console.error('\n⚠  Senha curta. Use 5–6 palavras aleatórias — é a única barreira do site.\n');
}

const salt = randomBytes(16);
const derived = await scryptAsync(password.normalize('NFKC'), salt, KEYLEN, {
  N, r, p, maxmem: 256 * 1024 * 1024,
});

const hash = `scrypt:${N}:${r}:${p}:${salt.toString('base64')}:${derived.toString('base64')}`;
const secret = randomBytes(48).toString('base64url');

console.log('\nAUTH_PASSWORD_HASH=' + hash);
console.log('\nAUTH_SECRET=' + secret);
console.log(`
Guarde os dois como variáveis de ambiente (Vercel: Settings > Environment
Variables; local: arquivo .env.local, que está no .gitignore).

O segredo assina os cookies de sessão: trocá-lo desconecta todos os
aparelhos. Nunca commite nenhum dos dois valores.
`);
