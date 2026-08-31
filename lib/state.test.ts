/**
 * Testes de `adopt` — em especial da migração das chaves por índice.
 *
 * Trilhas e checklists eram gravadas por posição (`fin#4`). Quando um item
 * passou a ter chave própria, tudo que já estava marcado precisou ser
 * traduzido: sem isso a escada financeira inteira aparece deslocada, com o
 * item errado riscado, e não há como perceber olhando a tela.
 *
 * A migração é convergente de propósito — roda igual no navegador e no
 * servidor, e sobrevive a um aparelho que abre semanas depois com o pacote
 * antigo em cache. É isso que estes testes protegem.
 *
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CHECKS, TRACKS } from './plan';
import { adopt, emptyState, STATE_SEP, type JournalState } from './state';

const SEP = STATE_SEP;
const T0 = 1_755_000_000_000;

/** Estado cru, como sairia do localStorage ou do corpo de uma requisição. */
function raw(part: Partial<JournalState>): Partial<JournalState> {
  return { ...emptyState(), ...part };
}

describe('adopt — chaves de trilha e checklist', () => {
  it('traduz a posição antiga para a chave do mesmo item', () => {
    // fin#3 era "R$42.000 acumulados", hoje fin#k42.
    const st = adopt(raw({ checks: { 'fin#3': true }, t: { [`checks${SEP}fin#3`]: T0 } }));

    assert.equal(st.checks['fin#k42'], true);
    assert.equal(st.checks['fin#3'], undefined, 'a chave por índice não fica para trás');
    assert.equal(st.t[`checks${SEP}fin#k42`], T0, 'o carimbo viaja junto');
    assert.equal(st.t[`checks${SEP}fin#3`], undefined);
  });

  it('não desloca a escada ao inserir um item no começo da lista', () => {
    // O caso real: `reserva` entrou como primeiro item de `fin`. Quem tinha
    // fin#0 (R$2.500/mês automatizado) não pode virar "reserva quitada".
    const st = adopt(raw({ checks: { 'fin#0': true } }));

    assert.equal(st.checks['fin#auto'], true);
    assert.equal(st.checks['fin#reserva'], undefined, 'a reserva não vem marcada de graça');
  });

  it('preserva o que foi desmarcado antes da troca', () => {
    // Valor ausente com carimbo presente é "desmarcado às T0". Se o carimbo
    // se perdesse, um aparelho atrasado ressuscitaria a marcação.
    const st = adopt(raw({ t: { [`tracks${SEP}cs50#2`]: T0 } }));

    assert.equal(st.tracks['cs50#w2'], undefined);
    assert.equal(st.t[`tracks${SEP}cs50#w2`], T0);
  });

  it('deixa a decisão tomada com a chave nova mandar', () => {
    // Desmarcado depois da troca (só carimbo), e ainda marcado no índice
    // antigo por um aparelho que não tinha atualizado. Vence o novo.
    const st = adopt(raw({
      checks: { 'fin#1': true },
      t: { [`checks${SEP}fin#1`]: T0, [`checks${SEP}fin#k12`]: T0 + 1000 },
    }));

    assert.equal(st.checks['fin#k12'], undefined, 'não ressuscita o que foi desmarcado');
    assert.equal(st.t[`checks${SEP}fin#k12`], T0 + 1000);
  });

  it('é idempotente — a segunda passada não muda nada', () => {
    const once = adopt(raw({
      tracks: { 'ingles#0': true, 'dsa#10': true },
      checks: { 'docs#12': true },
      t: { [`tracks${SEP}ingles#0`]: T0 },
    }));
    const twice = adopt(once);

    assert.equal(JSON.stringify(twice), JSON.stringify(once));
    assert.equal(once.tracks['ingles#out'], true);
    assert.equal(once.tracks['dsa#dp'], true);
    assert.equal(once.checks['docs#dogs'], true);
  });

  it('ignora posição que não existe mais, sem derrubar o resto', () => {
    const st = adopt(raw({ checks: { 'fin#99': true, 'fin#2': true, 'inexistente#0': true } }));

    assert.equal(st.checks['fin#k25'], true);
    assert.equal(st.checks['inexistente#0'], true, 'lista desconhecida fica como está');
  });

  it('não altera o objeto recebido', () => {
    const entrada = raw({ checks: { 'fin#3': true } });
    adopt(entrada);

    assert.equal(entrada.checks!['fin#3'], true, 'quem chamou continua com o que passou');
  });
});

describe('plan.ts — as chaves em si', () => {
  it('não repete chave dentro de uma mesma lista', () => {
    for (const l of [...TRACKS, ...CHECKS]) {
      const keys = l.items.map((it) => it[0]);
      assert.equal(new Set(keys).size, keys.length, `chave repetida em ${l.id}`);
    }
  });

  it('usa chaves que a migração não confunde com índice', () => {
    // Uma chave só de dígitos seria lida como posição antiga e traduzida de
    // novo a cada leitura — o item nunca mais ficaria marcado.
    for (const l of [...TRACKS, ...CHECKS]) {
      for (const [k] of l.items) {
        assert.ok(k.length > 0, `chave vazia em ${l.id}`);
        assert.ok(!/^\d+$/.test(k), `chave numérica em ${l.id}: ${k}`);
      }
    }
  });
});
