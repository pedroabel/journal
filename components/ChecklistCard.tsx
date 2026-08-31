'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { tone } from './tone';

export interface ChecklistEntry {
  key: string;
  label: string;
  hint?: string;
  done: boolean;
  current?: boolean;
}

/**
 * Cartão de lista marcável. Trilhas e checklists têm a mesma finalidade —
 * avançar item a item — então usam exatamente o mesmo desenho: título,
 * progresso, contagem e as linhas. Nada de variação por seção.
 */
export default function ChecklistCard({
  title, colorToken, entries, onToggle, countLabel,
}: {
  title: string;
  colorToken: string;
  entries: ChecklistEntry[];
  onToggle: (key: string) => void;
  countLabel?: (done: number, total: number, pct: number) => string;
}) {
  const doneCount = entries.filter((e) => e.done).length;
  const pct = entries.length ? Math.round((doneCount / entries.length) * 100) : 0;

  return (
    <Card style={tone(colorToken)} className="gap-4">
      <CardHeader className="gap-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="space-y-1.5">
          <Progress value={pct} indicatorClassName="bg-[var(--tone)]" />
          <p className="text-muted-foreground font-mono text-xs">
            {countLabel
              ? countLabel(doneCount, entries.length, pct)
              : `${doneCount} de ${entries.length}`}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="divide-border divide-y">
          {entries.map((e) => (
            <li key={e.key} className="flex items-start gap-3 py-2.5">
              <Checkbox
                className="mt-0.5"
                checked={e.done}
                aria-label={e.label}
                onCheckedChange={() => onToggle(e.key)}
              />
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'text-sm leading-snug',
                    e.done && 'text-muted-foreground line-through decoration-1',
                    e.current && !e.done && 'font-medium'
                  )}
                >
                  {e.label}
                </span>
                {e.current && !e.done && (
                  <Badge
                    variant="outline"
                    className="border-[var(--tone)]/40 text-[var(--tone)] ml-2 rounded-full align-middle text-[0.625rem] tracking-wider uppercase"
                  >
                    atual
                  </Badge>
                )}
                {e.hint && (
                  <span className="text-muted-foreground mt-0.5 block text-xs">{e.hint}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
