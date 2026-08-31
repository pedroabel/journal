/**
 * Testes da árvore de temas.
 *
 * Não testam conteúdo — nenhum teste sabe se "merge sort" está no lugar certo.
 * Testam as INVARIANTES que fazem a árvore ser navegável por código: id único,
 * folha com critério, e pré-requisito que aponta para trás.
 *
 * A última é a que mais importa. Se uma folha depende de outra que vem DEPOIS
 * na ordem da árvore, ela nunca destrava: `proximas()` percorre em ordem e
 * pula o que está travado, então a trilha inteira para naquele ponto sem
 * nenhum erro visível. É o tipo de defeito que só apareceria em 2027.
 *
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRILHAS, contar, ehFolha, folhas, nos, porId, progresso, proxima, proximas, trilhaParaBloco,
} from './curriculum/index';

const TODOS = TRILHAS.flatMap(nos);
const FOLHAS = TRILHAS.flatMap(folhas);

describe('estrutura', () => {
  it('todo id é único em todo o percurso', () => {
    const vistos = new Set<string>();
    for (const n of TODOS) {
      assert.equal(vistos.has(n.id), false, `id duplicado: ${n.id}`);
      vistos.add(n.id);
    }
  });

  it('toda folha tem duração e critério binário', () => {
    for (const f of FOLHAS) {
      assert.ok(f.min && f.min > 0, `folha sem min: ${f.id}`);
      assert.ok(f.saber && f.saber.length > 0, `folha sem saber: ${f.id}`);
    }
  });

  it('nenhuma folha estoura o maior bloco da rotina', () => {
    // O bloco mais longo da semana é o deep work de sábado: 2h.
    for (const f of FOLHAS) {
      assert.ok(f.min! <= 120, `folha longa demais (${f.min}min): ${f.id}`);
    }
  });

  it('nó interno não carrega min nem saber — só folha executa', () => {
    for (const n of TODOS) {
      if (ehFolha(n)) continue;
      assert.equal(n.min, undefined, `nó interno com min: ${n.id}`);
      assert.equal(n.saber, undefined, `nó interno com saber: ${n.id}`);
    }
  });
});

describe('pré-requisitos', () => {
  it('todo pre aponta para um id que existe', () => {
    for (const n of TODOS) {
      for (const p of n.pre ?? []) {
        assert.ok(porId(p), `pre inexistente em ${n.id}: ${p}`);
      }
    }
  });

  it('todo pre aponta para trás na ordem da árvore', () => {
    const ordem = new Map(FOLHAS.map((f, i) => [f.id, i]));
    for (const f of FOLHAS) {
      for (const p of f.pre ?? []) {
        const i = ordem.get(p);
        assert.notEqual(i, undefined, `pre não é folha: ${f.id} → ${p}`);
        assert.ok(i! < ordem.get(f.id)!, `pre aponta para frente: ${f.id} → ${p}`);
      }
    }
  });

  it('cada trilha destrava até o fim, uma folha por vez', () => {
    // A prova de que a ordem da árvore é executável: partindo do zero e
    // marcando sempre a próxima liberada, chega-se em todas as folhas.
    for (const t of TRILHAS) {
      const feito: Record<string, true> = {};
      const total = folhas(t).length;
      for (let i = 0; i < total; i++) {
        const p = proxima(t, feito);
        assert.ok(p, `${t.id} travou depois de ${i}/${total} folhas`);
        feito[p!.id] = true;
      }
      assert.equal(proxima(t, feito), null, `${t.id} sobrou folha`);
    }
  });
});

describe('navegação', () => {
  it('proximas preenche o orçamento do bloco sem estourar', () => {
    const nx = proximas(TRILHAS[0], {}, 60);
    assert.ok(nx.length >= 1);
    const soma = nx.reduce((s, f) => s + f.min!, 0);
    assert.ok(soma <= 60 || nx.length === 1, 'estourou com mais de uma folha');
  });

  it('proximas devolve ao menos uma folha mesmo em bloco curto', () => {
    // Bloco de 20min contra uma folha de 45: a folha entra assim mesmo.
    // Bloco curto demais é problema da rotina, não motivo para pular tema.
    const nx = proximas(TRILHAS[2], {}, 5);
    assert.equal(nx.length, 1);
  });

  it('progresso conta folhas, não nós', () => {
    const t = TRILHAS[1];
    const f = folhas(t);
    const feito = Object.fromEntries(f.slice(0, 3).map((x) => [x.id, true as const]));
    assert.deepEqual(progresso(t, feito), {
      feitas: 3, total: f.length, pct: Math.round((3 / f.length) * 100),
    });
  });
});

describe('ligação com a rotina', () => {
  it('todo tipo declarado por uma trilha é resolvido de volta para ela', () => {
    for (const t of TRILHAS) {
      for (const tipo of t.tipos) {
        assert.equal(trilhaParaBloco(tipo)?.id, t.id, `tipo ${tipo} não resolve`);
      }
    }
  });

  it('nenhum tipo de bloco pertence a duas trilhas', () => {
    const vistos = new Set<string>();
    for (const t of TRILHAS) {
      for (const tipo of t.tipos) {
        assert.equal(vistos.has(tipo), false, `tipo em duas trilhas: ${tipo}`);
        vistos.add(tipo);
      }
    }
  });
});

describe('tamanho do percurso', () => {
  it('reporta o volume de cada trilha', () => {
    for (const t of TRILHAS) {
      const c = contar(t);
      assert.ok(c.folhas > 0, `${t.id} vazia`);
      console.log(
        `  ${t.t.padEnd(26)} ${String(c.folhas).padStart(4)} folhas · ` +
        `${String(Math.round(c.minutos / 60)).padStart(4)}h`
      );
    }
    const tot = TRILHAS.reduce((s, t) => s + contar(t).folhas, 0);
    const hrs = TRILHAS.reduce((s, t) => s + contar(t).minutos, 0) / 60;
    console.log(`  ${'TOTAL'.padEnd(26)} ${String(tot).padStart(4)} folhas · ${String(Math.round(hrs)).padStart(4)}h`);
  });
});
