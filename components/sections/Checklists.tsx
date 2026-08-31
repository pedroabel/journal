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
          entries={cl.items.map(([k, label, when]) => ({
            key: `${cl.id}#${k}`,
            label,
            hint: when,
            done: !!state.checks[`${cl.id}#${k}`],
          }))}
        />
      ))}
    </Section>
  );
}
