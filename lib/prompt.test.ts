/**
 * Testes do prompt da sessão.
 *
 * Não testam o texto — nenhum teste sabe se "corrija em duas passadas" é uma
 * boa instrução. Testam as INVARIANTES que fazem o botão não mentir:
 *
 * 1. Ele só aparece onde foi decidido que aparece. Um tipo novo em
 *    `TIPOS_COM_PROMPT` sem instrução correspondente geraria um prompt sem
 *    "COMO CONDUZIR" — o modelo receberia o tema e nenhuma tarefa.
 * 2. O prompt carrega o tema e o critério que a tela está mostrando. Se ele
 *    perdesse o `saber`, a sessão terminaria sem forma de saber se acabou.
 * 3. O `<b>` que o PROTO usa na tela não vaza para o texto colado.
 *
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PROTO } from './plan';
import { INGLES, proximas } from './curriculum/index';
import { TIPOS_COM_PROMPT, estudoPrompt, temPrompt } from './prompt';

/** As folhas que a tela mostraria num bloco de 20min deste tipo, do zero. */
function folhasDe(tipo: string, min = 20) {
  return proximas(INGLES, {}, min, tipo);
}

describe('onde o botão existe', () => {
  it('todo tipo com prompt tem protocolo e instrução de condução', () => {
    for (const tipo of TIPOS_COM_PROMPT) {
      assert.ok(PROTO[tipo], `tipo sem PROTO: ${tipo}`);
      const p = estudoPrompt(tipo, '20min', folhasDe(tipo));
      assert.ok(p, `tipo sem prompt: ${tipo}`);
      assert.match(p!, /COMO CONDUZIR\n.+/, `prompt sem instrução: ${tipo}`);
      // O tema pode ser diagnóstico, e pode ser maior que o bloco. Os dois
      // casos existem na árvore de inglês e valem para os três tipos.
      assert.match(p!, /DOIS AJUSTES QUE VALEM SEMPRE/, `prompt sem ajustes: ${tipo}`);
    }
  });

  it('não existe fora do inglês — a ausência é decisão, não esquecimento', () => {
    for (const tipo of ['calistenia', 'cs50', 'roadmap', 'dsa', 'leitura', 'sono']) {
      assert.equal(temPrompt(tipo), false, `tipo não deveria ter prompt: ${tipo}`);
      assert.equal(estudoPrompt(tipo, '20min', folhasDe('en_write')), null);
    }
  });

  it('sem folha pendente não há prompt', () => {
    assert.equal(estudoPrompt('en_write', '20min', []), null);
  });
});

describe('o que o prompt carrega', () => {
  it('leva o tema, a nota e cada critério de conclusão', () => {
    const folhas = folhasDe('en_write');
    assert.ok(folhas.length, 'a árvore de inglês deveria ter folha de escrita');
    const p = estudoPrompt('en_write', '20min', folhas)!;

    for (const f of folhas) {
      assert.ok(p.includes(f.t), `tema ausente: ${f.t}`);
      if (f.nota) assert.ok(p.includes(f.nota), `nota ausente: ${f.id}`);
      for (const s of f.saber ?? []) assert.ok(p.includes(s), `critério ausente: ${s}`);
    }
  });

  it('leva os passos do bloco, sem o HTML que eles usam na tela', () => {
    const p = estudoPrompt('en_write', '20min', folhasDe('en_write'))!;
    assert.ok(p.includes(PROTO.en_write.sucesso), 'critério de sessão ausente');
    assert.equal(/<[^>]+>/.test(p), false, 'tag HTML vazou para o texto colado');
  });

  it('a duração do bloco é a do bloco, não a da folha', () => {
    const p = estudoPrompt('en_write', '30min', folhasDe('en_write', 30))!;
    assert.ok(p.includes('30min'), 'duração do bloco ausente');
  });

  it('cada tipo de bloco recebe a sua instrução, não a do vizinho', () => {
    const fala = estudoPrompt('en_speak', '20min', folhasDe('en_speak'))!;
    const tutor = estudoPrompt('en_tutor', '50min', folhasDe('en_tutor', 50))!;
    assert.match(fala, /NÃO me ouve/, 'fala precisa dizer que o modelo não escuta');
    assert.match(tutor, /não substitua o tutor/, 'tutor precisa preservar a pessoa');
  });
});
