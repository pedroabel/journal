/* ---------------------------------------------------------------------------
   derive.mjs — gera o AUTH_HASH a partir da senha, para configurar o Worker.

   Uso:   node worker/derive.mjs
          (a senha é lida do terminal, sem eco, e não fica no histórico)

   Faz exatamente a mesma derivação de assets/js/sync.js:
     senha -> PBKDF2-SHA256 (600k) -> HKDF "auth" -> token -> sha256 -> AUTH_HASH

   O que sai daqui é só o hash do token: ele não permite voltar à senha nem
   descriptografar nada. É o valor que vai em `wrangler secret put AUTH_HASH`.
   --------------------------------------------------------------------------- */

import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline';

const KDF_SALT = 'sistema-unificado/kdf/v1';
const KDF_ITER = 600000;

async function deriveToken(pass) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(KDF_SALT), iterations: KDF_ITER, hash: 'SHA-256' },
    base, 256
  );
  const master = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveBits']);
  const tokenBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode('sistema-unificado/auth/v1') },
    master, 256
  );
  return hex(tokenBits);
}

async function sha256Hex(s) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = process.stdout;
    rl.query = question;
    // Silencia o eco enquanto a senha é digitada.
    rl._writeToOutput = function (s) { if (s.includes(rl.query)) out.write(s); };
    rl.question(question, (answer) => { rl.close(); out.write('\n'); resolve(answer); });
  });
}

const pass = process.env.JOURNAL_PASS || (await askHidden('senha: '));
if (!pass) { console.error('senha vazia'); process.exit(1); }
if (pass.length < 12) {
  console.error('\n⚠  Senha curta. Use 5–6 palavras aleatórias — é ela que protege tudo.\n');
}

const token = await deriveToken(pass);
const authHash = await sha256Hex(token);

console.log('\nAUTH_HASH (cole quando `wrangler secret put AUTH_HASH` pedir o valor):\n');
console.log(authHash + '\n');
