'use client';

import { CHECKS } from '@/lib/plan';
import { Section } from '../Section';
import type { Journal } from '../useJournal';
import ChecklistCard from '../ChecklistCard';

export default function Checklists({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;

  return (
    <Section id="checklists" index="◆" eyebrow="Acompanhamento" title="Checklists">
      {CHECKS.map((cl) => (
        <ChecklistCard
          key={cl.id}
          title={cl.name}
          colorToken={cl.color}
          onToggle={(key) => toggleFlag('checks', key)}
          entries={cl.items.map((it, i) => ({
            key: `${cl.id}#${i}`,
            label: it[0],
            hint: it[1],
            done: !!state.checks[`${cl.id}#${i}`],
          }))}
        />
      ))}
    </Section>
  );
}
