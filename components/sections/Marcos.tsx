'use client';

import { JPHASES, MS, MSTYPE, type MsType } from '@/lib/plan';
import { msDone, quarterOf } from '@/lib/derive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import Milestone from '../Milestone';
import { tone } from '../tone';

const KINDS: [MsType, string, string][] = [
  ['cap', 'Capacidade', 'Algo que você passa a saber fazer. Prova interna: mudou o que você é capaz de executar.'],
  ['cred', 'Credencial / entregável', 'Algo que existe fora de você e serve de prova para terceiros: certificado, URL, contrato, carta.'],
  ['exp', 'Experiência', 'Algo que você vive e comemora, sem utilidade para currículo. Um por trimestre, obrigatório.'],
];

export default function Marcos({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;
  const doneCount = MS.filter((m) => msDone(state, m.id)).length;

  return (
    <Section
      id="marcos"
      index="◆"
      eyebrow="Sistema de marcos"
      title="Marcos"
      description={
        <>
          Todo marco tem{' '}
          <b className="text-foreground font-medium">critério binário e verificável</b> e depende só
          de você. &quot;Ser fluente&quot; não é marco; &quot;gravar 10 min falando sem travar&quot;
          é.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {KINDS.map(([k, title, desc]) => (
          <Card key={k} style={tone(MSTYPE[k].c)} className="relative gap-2 overflow-hidden py-4">
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">{desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <SectionTitle hint={`${doneCount}/${MS.length}`}>Todos os marcos</SectionTitle>

        {JPHASES.map((ph) => (
          <div key={ph.n} style={tone(ph.c)} className="space-y-3">
            <h4 className="text-[var(--tone)] font-mono text-xs font-medium tracking-wider uppercase">
              {ph.n}
            </h4>
            {MS.filter((m) => ph.qs.includes(quarterOf(m.d)))
              .slice()
              .sort((a, b) => (a.d < b.d ? -1 : 1))
              .map((m) => (
                <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
              ))}
          </div>
        ))}
      </div>
    </Section>
  );
}
