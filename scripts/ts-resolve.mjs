/**
 * Hook de resolução para rodar os testes em TypeScript sem instalar nada.
 *
 * O Node executa `.ts` sozinho (--experimental-strip-types), mas não inventa
 * extensão: `import './state'` falha. O app usa import sem extensão porque é o
 * que o Next espera, então a diferença se resolve aqui, e só nos testes.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const EXTS = ['.ts', '.tsx', '.mjs', '.js'];

function firstExisting(base) {
  for (const ext of EXTS) if (existsSync(base + ext)) return base + ext;
  return null;
}

export function resolve(specifier, context, next) {
  const relative = specifier.startsWith('.');
  const aliased = specifier.startsWith('@/');

  if ((relative || aliased) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const base = relative
      ? resolvePath(dirname(fileURLToPath(context.parentURL ?? import.meta.url)), specifier)
      : resolvePath(ROOT, specifier.slice(2));
    const hit = firstExisting(base);
    if (hit) return next(pathToFileURL(hit).href, context);
  }

  return next(specifier, context);
}
