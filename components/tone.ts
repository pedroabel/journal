import type { CSSProperties } from 'react';

/**
 * Ponte entre o conteúdo e o tema.
 *
 * `lib/plan.ts` guarda o NOME de um token (`--chart-1`), nunca uma cor. Aqui
 * ele vira a variável local `--tone`, que os componentes consomem via
 * `[var(--tone)]`. Assim a paleta mora só no tema, e trocar o tema repinta
 * tudo de uma vez.
 */
export function tone(token: string): CSSProperties {
  return { '--tone': `var(${token})` } as CSSProperties;
}
