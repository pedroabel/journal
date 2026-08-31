'use client';

import { TRACKS } from '@/lib/plan';
import { curTrack } from '@/lib/derive';
import { Section } from '../Section';
import type { Journal } from '../useJournal';
import ChecklistCard from '../ChecklistCard';

export default function Trilhas({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;

  return (
    <Section
      id="trilhas"
      index="◆"
      eyebrow="Progressão"
      title="Trilhas"
      description={'Marque conforme avança — o "foco de hoje" na visão diária segue daqui.'}
    >
      {TRACKS.map((tr) => {
        const cur = curTrack(state, tr);
        return (
          <ChecklistCard
            key={tr.id}
            title={tr.name}
            colorToken={tr.color}
            countLabel={(d, t, pct) => `${d} de ${t} · ${pct}%`}
            onToggle={(key) => toggleFlag('tracks', key)}
            entries={tr.items.map(([k, label], i) => ({
              key: `${tr.id}#${k}`,
              label,
              done: !!state.tracks[`${tr.id}#${k}`],
              current: cur?.i === i,
            }))}
          />
        );
      })}
    </Section>
  );
}
