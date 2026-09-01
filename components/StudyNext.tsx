'use client';

import { blockMinutes } from '@/lib/derive';
import { caminho, folhasDoTipo, proximas, trilhaParaBloco } from '@/lib/curriculum';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * O tema que este bloco estuda agora.
 *
 * É a peça que tira a decisão diária do caminho: o bloco diz "Programação,
 * 60min" e isto diz QUAL assunto, quanto dele cabe na sessão, e o que você
 * tem que conseguir fazer para marcar. O material você procura — a árvore em
 * `lib/curriculum` guarda o assunto, nunca o link.
 *
 * Preenche o orçamento do bloco: 60min podem receber uma folha de 60 ou duas
 * de 30. Se nem a primeira couber, ela aparece assim mesmo — bloco curto
 * demais é problema da rotina, não motivo para pular tema.
 */
export default function StudyNext({
  tipo, dur, state, podeMarcar, onToggle,
}: {
  tipo: string;
  dur: string;
  state: JournalState;
  podeMarcar: boolean;
  onToggle: (group: 'units', key: string) => void;
}) {
  const trilha = trilhaParaBloco(tipo);
  if (!trilha) return null;

  // Filtrado pelo tipo do bloco: a trilha de inglês atende escrita, fala e
  // tutor, e a próxima folha de escrita não é o que fazer num bloco de fala.
  const orcamento = blockMinutes(dur) || 20;
  const proxs = proximas(trilha, state.units, orcamento, tipo);
  const doTipo = folhasDoTipo(trilha, tipo);
  const feitas = doTipo.filter((f) => state.units[f.id]).length;
  const pr = { feitas, total: doTipo.length, pct: doTipo.length ? Math.round((feitas / doTipo.length) * 100) : 0 };
  if (!doTipo.length) return null;

  return (
    <div className="bg-muted/60 mt-2 space-y-2.5 rounded-md px-3 py-2.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-muted-foreground font-mono text-[0.625rem] tracking-wider uppercase">
          {proxs.length ? 'Estuda agora' : 'Trilha concluída'}
        </span>
        <span className="text-muted-foreground ml-auto font-mono text-[0.625rem] tabular-nums">
          {pr.feitas}/{pr.total} · {pr.pct}%
        </span>
      </div>

      {proxs.length === 0 ? (
        <p className="text-sm">Nada pendente em {trilha.t} ✓</p>
      ) : (
        <ul className="space-y-2.5">
          {proxs.map((f) => {
            // O caminho sem a raiz (a trilha, já dita pelo bloco) e sem a
            // própria folha: sobra a trilha de migalhas até o tema.
            const trilhaDeMigalhas = caminho(trilha, f.id).slice(1, -1).map((n) => n.t);
            return (
              <li key={f.id} className="flex items-start gap-2.5">
                <Checkbox
                  className="mt-0.5 size-4 rounded"
                  checked={!!state.units[f.id]}
                  disabled={!podeMarcar}
                  aria-label={`${f.t} — concluir tema`}
                  onCheckedChange={() => onToggle('units', f.id)}
                />
                <div className="min-w-0 flex-1">
                  {trilhaDeMigalhas.length > 0 && (
                    <p className="text-muted-foreground truncate font-mono text-[0.625rem]">
                      {trilhaDeMigalhas.join(' › ')}
                    </p>
                  )}
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <b className="text-[var(--tone)] font-medium">{f.t}</b>
                    <Badge variant="outline" className="text-muted-foreground rounded-full font-mono">
                      {f.min}min
                    </Badge>
                  </p>
                  {f.nota && (
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{f.nota}</p>
                  )}
                  {f.saber && (
                    <>
                      <p className="text-muted-foreground mt-1.5 font-mono text-[0.625rem] tracking-wider uppercase">
                        Sei isso quando
                      </p>
                      <ul className="text-muted-foreground mt-0.5 space-y-0.5 text-xs">
                        {f.saber.map((s, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span aria-hidden className="text-[var(--tone)]">·</span>
                            <span className="min-w-0 flex-1">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {proxs.length > 0 && (
        <p className={cn('text-muted-foreground border-t pt-2 text-[0.6875rem] leading-relaxed')}>
          O assunto é este. O material você escolhe — a árvore guarda o tema e a ordem, não o link.
        </p>
      )}
    </div>
  );
}
