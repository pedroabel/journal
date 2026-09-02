/**
 * prompt.ts — O PROMPT DA SESSÃO.
 *
 * Irmão de `report.ts`, e não a mesma coisa. Lá o prompt é sobre o SISTEMA:
 * trinta dias de números, uma vez por mês, para o mentor olhar o desenho da
 * rotina. Aqui é sobre a SESSÃO: este bloco, este tema, agora, hoje à noite.
 *
 * Como o relatório, monta texto e para por aí — o site não chama IA sozinho.
 * Sem servidor de IA no meio não há chave para vazar nem custo surpresa, e o
 * prompt fica legível antes de ser usado, que é o que permite corrigi-lo.
 *
 * ELE SÓ EXISTE PARA INGLÊS, e isso é escolha, não falta:
 *
 * - Em inglês o gargalo é produção e correção — dar exercício, corrigir e
 *   virar erro em card é exatamente o que um modelo faz bem, e é o trabalho
 *   inteiro da trilha.
 * - Em calistenia, caminhada, leitura e sono não há o que pedir: o bloco já
 *   é a instrução.
 * - Em roadmap, CS50 e DSA o próprio `PROTO` manda usar IA como copiloto e
 *   nunca como gerador, e o CS50 ainda tem regra de honestidade acadêmica.
 *   Um botão que entrega o prompt pronto empurra para o lado errado. Se um
 *   dia existir lá, o prompt terá que ser o que se RECUSA a dar código — é
 *   outro texto, não este com outro tema dentro.
 *
 * O contexto daqui também é só o de inglês, não o `PLAN_CTX`: poupança,
 * dívida e cachorras não melhoram uma correção de artigo, e não há motivo
 * para colá-las numa conversa toda noite.
 */
import { PROTO } from './plan';
import { caminho, trilhaParaBloco, type Node } from './curriculum/index';

/** Os blocos que têm prompt. Ver o cabeçalho: a ausência dos outros é decisão. */
export const TIPOS_COM_PROMPT = ['en_write', 'en_speak', 'en_tutor'];

export function temPrompt(tipo: string): boolean {
  return TIPOS_COM_PROMPT.includes(tipo);
}

/** Os passos do `PROTO` guardam `<b>` para a tela. Em texto puro, atrapalham. */
function semTags(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

const QUEM =
  'Sou brasileiro, dev full-stack. Inglês C2 na COMPREENSÃO: leio e escuto tudo sem esforço. ' +
  'O gargalo é produção — e, na fala, vergonha, não conhecimento. ' +
  'Alvo: IELTS 7.0 Academic, e depois estudar e trabalhar em inglês. ' +
  'Não elogie por elogiar, não amacie erro: eu já entendo a explicação, o que me falta é a correção.';

/**
 * Como conduzir, por tipo de bloco.
 *
 * São três textos e não um com variações porque as três sessões pedem coisas
 * incompatíveis: escrita o modelo corrige, fala ele não ouve, e tutor ele nem
 * conduz. Um texto só teria que mentir em duas delas.
 */
const CONDUZIR: Record<string, string> = {
  en_write:
`Uma etapa por vez, esperando minha resposta antes de seguir. Fale inglês comigo o tempo todo; use português só para explicar por que um brasileiro erra determinado ponto — é o contraste que fixa.

1. Aquecimento: 5 a 8 itens curtos sobre o tema de hoje, com lacuna ou escolha. Só os itens, sem gabarito. Eu respondo.
2. Corrija em uma linha cada e então me dê UM enunciado de escrita de ~150 palavras que force o tema de hoje a aparecer várias vezes — estilo IELTS Task 2 quando o tema couber nele. Não escreva por mim, não me dê resposta de exemplo, não sugira frases.
3. Quando eu colar o texto, corrija em duas passadas SEPARADAS:
   - primeiro só o tema de hoje, nomeando a regra violada em cada caso;
   - depois o resto, no máximo 5 itens, os mais graves primeiro.
4. Feche com 3 cards de Anki em formato cloze: a frase inteira com contexto suficiente e a lacuna no ponto do erro. Nada de "errado / certo lado a lado" — card assim se acerta pelo formato e não ensina nada.
5. Termine dizendo, em uma linha por critério, se eu cumpri o "sei isso quando" acima. Se não cumpri, diga o que faltou — não arredonde para cima.`,

  en_speak:
`Você NÃO me ouve. Não finja que ouviu, não avalie pronúncia que você não escutou. Seu trabalho é preparar o material, dar o critério, e depois trabalhar em cima do que EU relatar da minha gravação.

1. Entregue o material desta sessão para o tema acima: o texto para ler em voz alta (~350 palavras, nível C1–C2, assunto que dê vontade de ler), ou o trecho para shadowing, ou o cue card — o que o tema pedir. Marque no material onde o ponto de hoje aparece.
2. Antes de eu gravar, me dê 3 coisas específicas para observar. Específicas: um som, uma ligação, uma sílaba tônica — nunca "fale com clareza".
3. Eu gravo, escuto e volto com o que percebi. Aí você pergunta o que eu provavelmente deixei passar, propõe um exercício de correção para cada ponto, e define o foco do shadowing da próxima vez.
4. Feche com 3 cards de Anki para responder EM VOZ ALTA: o card é uma frase para pronunciar, não para reconhecer.
5. Diga se o "sei isso quando" acima foi cumprido pelo que eu relatei. Se não dá para saber sem ouvir, diga isso em vez de chutar.`,

  en_tutor:
`A sessão é com uma pessoa, não com você. Você prepara antes e recolhe depois — não substitua o tutor e não ensaie a conversa comigo.

ANTES (5min)
1. Três temas de conversa ligados ao ponto acima, cada um com uma pergunta de abertura e duas de aprofundamento, para eu não depender de improviso quando travar.
2. Cinco estruturas em inglês que eu devo tentar USAR na sessão, ligadas ao tema e curtas o bastante para eu lembrar sob pressão.
3. Me lembre de pedir as correções anotadas ao final.

DEPOIS (5min)
4. Quando eu colar as correções do tutor, agrupe por tipo (gramática, léxico, pronúncia) e transforme cada uma em card cloze com contexto.
5. Diga qual desses erros é o mais caro para a banda 7, e por quê.`,
};

/**
 * Os dois casos que quebrariam o texto acima, e que valem para os três tipos.
 *
 * O primeiro: nem toda folha é exercício. `en.diag.base` manda gravar uma
 * linha de base e `en.diag.erros` manda inventariar erros — pedir "5 itens de
 * aquecimento" ali produziria uma aula sobre a tarefa em vez da tarefa.
 *
 * O segundo: a folha pode ser maior que o bloco, e de propósito — `proximas()`
 * deixa a primeira entrar mesmo estourando o orçamento, porque bloco curto
 * demais é problema da rotina, não motivo para pular tema. Sem esta linha o
 * modelo comprime 30min em 20 e entrega o tema pela metade sem avisar.
 */
const AJUSTES =
`DOIS AJUSTES QUE VALEM SEMPRE
- Se o tema acima for diagnóstico ou tarefa de arquivo (gravar uma linha de base, inventariar os próprios erros, ler os descritores de banda), não invente exercício: conduza a tarefa que o critério descreve, e me cobre o resultado dela.
- Se o tema pedir mais minutos do que o bloco tem, faça a parte que cabe e diga exatamente onde eu retomo amanhã. Não acelere para caber.`;

/**
 * O prompt pronto para colar — ou `null` quando o bloco não tem um.
 *
 * As folhas vêm de quem chama e não são recalculadas aqui: são as MESMAS que
 * a tela está mostrando naquele momento. Se o prompt escolhesse o tema por
 * conta própria, ele poderia divergir do que o bloco diz para estudar, e o
 * botão passaria a mandar fazer outra coisa.
 */
export function estudoPrompt(tipo: string, dur: string, folhas: Node[]): string | null {
  if (!temPrompt(tipo)) return null;
  const p = PROTO[tipo];
  const trilha = trilhaParaBloco(tipo);
  if (!p || !trilha || !folhas.length) return null;

  const out: string[] = [];

  out.push(`Você é meu treinador de inglês. Conduza comigo a sessão de hoje: ${p.title}, ${dur}.`);
  out.push('');
  out.push('QUEM SOU');
  out.push(QUEM);
  out.push('');

  out.push('O TEMA DE HOJE');
  for (const f of folhas) {
    const trilhaDeMigalhas = caminho(trilha, f.id).slice(1, -1).map((n) => n.t).join(' > ');
    out.push(`${trilhaDeMigalhas ? trilhaDeMigalhas + ' > ' : ''}${f.t} (${f.min}min)`);
    if (f.nota) out.push(f.nota);
    if (f.saber?.length) {
      out.push('Sei isso quando:');
      for (const s of f.saber) out.push(`- ${s}`);
    }
    out.push('');
  }

  out.push('O BLOCO');
  for (const [tempo, texto] of p.steps) out.push(`${tempo} — ${semTags(texto)}`);
  out.push(`Sessão bem feita: ${p.sucesso}`);
  out.push('');

  out.push('COMO CONDUZIR');
  out.push(CONDUZIR[tipo]);
  out.push('');
  out.push(AJUSTES);
  out.push('');
  out.push('Sem preâmbulo e sem plano de aula: comece pela etapa 1 agora. O cronômetro já está correndo.');

  return out.join('\n');
}
