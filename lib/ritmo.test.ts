/**
 * Testes de `ritmo.ts`.
 *
 * O que se testa aqui é a honestidade do número. Um ritmo errado não quebra
 * nada na tela — ele diz "folga" com confiança e você descobre a verdade em
 * cima da data do marco. Por isso os casos são os das bordas: sem amostra,
 * prazo vencido, capacidade zero, e a diferença entre terminar o conteúdo e
 * cumprir o marco.
 *
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MS, WEEK } from './plan';
import { blockMinutes } from './derive';
import { STATE_SEP, emptyState, type JournalState } from './state';
import { capacidadeSemanal, emRisco, hm, ritmo, ritmoReal, ritmos } from './ritmo';
import type { Node, Trilha } from './curriculum/index';

const AGORA = new Date(2026, 7, 31); // 31/ago/2026, o começo do plano

/** Trilha de mentira, para controlar restante e prazo sem depender do conteúdo. */
function trilha(over: Partial<Trilha> = {}, folhas = 10, min = 60): Trilha {
  return {
    id: 'x', t: 'Teste', tipos: [], cor: '--chart-1',
    filhos: Array.from({ length: folhas }, (_, i) => ({
      id: `x.${i}`, t: `Tema ${i}`, min, saber: ['sei'],
    })),
    ...over,
  };
}

function comFeitas(t: Trilha, n: number, quando?: number): JournalState {
  const st = emptyState();
  for (let i = 0; i < n; i++) {
    st.units[`x.${i}`] = true;
    if (quando !== undefined) st.t[`units${STATE_SEP}x.${i}`] = quando;
  }
  return st;
}

describe('capacidade vem da rotina, não de palpite', () => {
  it('soma os blocos da semana daquele tipo', () => {
    // Conferido à mão contra WEEK: ter 90 + qui 90 + dom 60 + almoço de sexta 20.
    assert.equal(capacidadeSemanal(['cs50', 'cs50_light']), 260);
    assert.equal(capacidadeSemanal(['dsa']), 60);
  });

  it('confere com a soma direta de WEEK, para qualquer tipo', () => {
    for (const tipo of ['roadmap', 'en_write', 'calistenia', 'carreira']) {
      let esperado = 0;
      for (const d of Object.values(WEEK)) {
        for (const b of d.night) if (b.t === tipo) esperado += blockMinutes(b.d);
        if (d.lunch?.t === tipo) esperado += blockMinutes(d.lunch.d);
      }
      assert.equal(capacidadeSemanal([tipo]), esperado, tipo);
    }
  });

  it('tipo nenhum é capacidade zero — a Irlanda não tem bloco', () => {
    assert.equal(capacidadeSemanal([]), 0);
  });
});

describe('ritmo real sai dos carimbos', () => {
  it('sem amostra suficiente devolve null em vez de um número confiante', () => {
    const t = trilha();
    assert.equal(ritmoReal(t, emptyState(), AGORA.getTime()), null);
    assert.equal(ritmoReal(t, comFeitas(t, 1, AGORA.getTime()), AGORA.getTime()), null);
  });

  it('ignora o que foi marcado fora da janela', () => {
    const t = trilha();
    const velho = AGORA.getTime() - 60 * 864e5;
    assert.equal(ritmoReal(t, comFeitas(t, 5, velho), AGORA.getTime()), null);
  });

  it('converte a janela em minutos por semana', () => {
    const t = trilha();
    // 4 folhas de 60min marcadas na janela de 28 dias = 240min / 4 semanas.
    const st = comFeitas(t, 4, AGORA.getTime() - 864e5);
    assert.equal(ritmoReal(t, st, AGORA.getTime()), 60);
  });

  it('marcação sem carimbo não conta — veio de backup antigo', () => {
    const t = trilha();
    assert.equal(ritmoReal(t, comFeitas(t, 5), AGORA.getTime()), null);
  });
});

describe('veredito', () => {
  it('nada restando é concluída, mesmo sem alvo', () => {
    const t = trilha();
    assert.equal(ritmo(t, t, comFeitas(t, 10), AGORA).veredito, 'concluida');
  });

  it('sem marco não há veredito a dar', () => {
    const t = trilha();
    assert.equal(ritmo(t, t, emptyState(), AGORA).veredito, 'sem-alvo');
  });

  it('com alvo e sem nenhum ritmo com que projetar', () => {
    const t = trilha({ marco: 'cs50c' }); // tipos: [] → capacidade 0
    const r = ritmo(t, t, emptyState(), AGORA);
    assert.equal(r.veredito, 'sem-ritmo');
    assert.equal(r.capacidade, 0);
    assert.ok(r.precisa! > 0, 'ainda assim diz quanto seria preciso por semana');
  });

  it('capacidade folgada termina antes do alvo', () => {
    // 10h restantes, 260min/semana, alvo em ~31 semanas.
    const t = trilha({ marco: 'cs50c', tipos: ['cs50', 'cs50_light'] });
    const r = ritmo(t, t, emptyState(), AGORA);
    assert.equal(r.veredito, 'folga');
    assert.ok(r.margem! > 4);
    assert.ok(r.fimNaCapacidade! < r.alvo!);
  });

  it('capacidade insuficiente atrasa, e a margem diz por quanto', () => {
    // 200 folhas de 60min = 200h contra 1h/semana e ~83 semanas até o alvo.
    const t = trilha({ marco: 'job', tipos: ['dsa'] }, 200);
    const r = ritmo(t, t, emptyState(), AGORA);
    assert.equal(r.veredito, 'atrasa');
    assert.ok(r.margem! < 0);
    assert.ok(r.fimNaCapacidade! > r.alvo!);
  });

  it('o ritmo real manda sobre a capacidade quando existe', () => {
    const t = trilha({ marco: 'cs50c', tipos: ['cs50', 'cs50_light'] }, 60);
    const semDados = ritmo(t, t, emptyState(), AGORA);
    assert.equal(semDados.veredito, 'folga', 'na capacidade, caberia');

    // Duas folhas em 28 dias: 30min/semana de verdade, contra 260 de capacidade.
    const st = comFeitas(t, 2, AGORA.getTime() - 5 * 864e5);
    const comDados = ritmo(t, t, st, AGORA);
    assert.equal(comDados.real, 30);
    assert.equal(comDados.veredito, 'atrasa', 'no ritmo real, não cabe');
  });

  it('prazo vencido não vira divisão por zero', () => {
    const t = trilha({ marco: 'passport', tipos: ['cs50'] }); // alvo 31/08/2026
    const r = ritmo(t, t, emptyState(), new Date(2027, 0, 1));
    assert.ok(r.semanas! < 0);
    assert.equal(r.precisa, null);
    assert.equal(r.veredito, 'atrasa');
  });
});

describe('conteúdo pronto não é marco cumprido', () => {
  it('trilha que fecha o marco declara suficiente', () => {
    const t = trilha({ marco: 'cs50c', tipos: ['cs50'] });
    assert.equal(ritmo(t, t, emptyState(), AGORA).suficiente, true);
  });

  it('trilha de prática não — a folga é do conteúdo, não da banda', () => {
    const t = trilha({ marco: 'ielts', tipos: ['en_write'], fecha: false });
    const r = ritmo(t, t, emptyState(), AGORA);
    assert.equal(r.suficiente, false);
    assert.equal(r.veredito, 'folga', 'o conteúdo cabe — e ainda assim não basta');
  });
});

describe('varredura do percurso', () => {
  it('todo marco citado pela árvore existe em MS', () => {
    for (const { no } of ritmos(emptyState(), AGORA)) {
      assert.ok(MS.some((m) => m.id === no.marco), `marco inexistente: ${no.marco}`);
    }
  });

  it('todo ramo com marco recebe alvo e data', () => {
    for (const { no, r } of ritmos(emptyState(), AGORA)) {
      assert.equal(r.marco, no.marco);
      assert.ok(r.alvo, `sem alvo: ${no.id}`);
    }
  });

  it('em risco vem do pior para o menos pior', () => {
    const rs = emRisco(emptyState(), AGORA);
    for (let i = 1; i < rs.length; i++) {
      assert.ok(rs[i - 1].r.margem! <= rs[i].r.margem!);
    }
  });
});

describe('formatação', () => {
  it('minutos viram horas legíveis', () => {
    assert.equal(hm(260), '4h20');
    assert.equal(hm(120), '2h');
    assert.equal(hm(45), '45min');
    assert.equal(hm(0), '0min');
  });
});
