/**
 * CS50 — o que o certificado exige, encaixado na sua semana.
 *
 * O curso já vem ordenado de fábrica, e o site dele ensina melhor do que
 * qualquer resumo aqui — então esta árvore NÃO repete o sumário das aulas.
 * Segue a mesma regra do roadmap.sh: a árvore guarda o que o site precisa
 * para agendar e cobrar, não o que a fonte já ensina.
 *
 * O que sobra, e é o que a fonte não faz:
 *
 *   Os ENTREGÁVEIS. Labs, psets e projeto final são binários e decidem o
 *   certificado (marco `cs50c`, alvo mar/2027). Vêm quebrados no tamanho dos
 *   SEUS blocos — Speller e Finance não cabem em 90min, então são dois cada.
 *
 *   O RECORTE. Você é dev full-stack: sintaxe de Python, SELECT com JOIN e
 *   manipulação de DOM não são estudo, são revisão. Ficaram só os conceitos
 *   que o CS50 dá e o seu trabalho não: memória e ponteiros, estruturas em C,
 *   índices e transações, como a web funciona por baixo.
 *
 * O que era busca, ordenação e recursão saiu daqui: vive na trilha de
 * algoritmos, com mais profundidade e sem duplicata.
 */
import type { Trilha } from './types';

export const CS50: Trilha = {
  id: 'cs50', t: 'CS50', tipos: ['cs50', 'cs50_light'], cor: '--chart-2', marco: 'cs50c',
  nota: 'Sprint de certificado. Acelere a aula, concentre esforço no pset — é o pset que o certificado exige.',
  filhos: [

  { id:'cs50.w0', t:'Week 0 — Scratch', nota:'Nada a estudar: é entregar o projeto e seguir.', filhos:[
    { id:'cs50.w0.pset', t:'Pset 0 — projeto em Scratch', min:90, tipos:['cs50'],
      saber:['projeto com laço, condicional, variável e evento','submetido'] },
  ]},

  { id:'cs50.w1', t:'Week 1 — C', nota:'A sintaxe é trivial para você. O que é novo: compilação e tipagem estática de verdade.', filhos:[
    { id:'cs50.w1.comp', t:'O pipeline de compilação', min:20, tipos:['cs50_light'],
      nota:'Pré-processamento, compilação, montagem, ligação. Você nunca precisou disso em JS.',
      saber:['as 4 etapas','o que o linker faz e que erro ele dá'] },
    { id:'cs50.w1.lab', t:'Lab 1 — Population', min:60, tipos:['cs50'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w1.pset', t:'Pset 1 — Hello, Mario, Cash/Credit', min:90, tipos:['cs50'], pre:['cs50.w1.lab'],
      saber:['todos submetidos com nota ≥70%'] },
  ]},

  { id:'cs50.w2', t:'Week 2 — Arrays', nota:'Onde C começa a cobrar: string é array de char terminado em nulo.', filhos:[
    { id:'cs50.w2.arr', t:'Arrays e passagem para função', min:20, tipos:['cs50_light'],
      saber:['por que o array "vira ponteiro" ao ser passado','por que sizeof não dá o tamanho dentro da função'] },
    { id:'cs50.w2.str', t:'Strings em C e terminador nulo', min:20, tipos:['cs50_light'], pre:['cs50.w2.arr'],
      saber:['contar caracteres sem strlen','o erro clássico de esquecer o \\0'] },
    { id:'cs50.w2.lab', t:'Lab 2 — Scrabble', min:60, tipos:['cs50'], pre:['cs50.w2.str'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w2.pset1', t:'Pset 2 — Readability', min:90, tipos:['cs50'], pre:['cs50.w2.lab'],
      saber:['submetido com nota ≥70%'] },
    { id:'cs50.w2.pset2', t:'Pset 2 — Caesar ou Substitution', min:90, tipos:['cs50'], pre:['cs50.w2.pset1'],
      saber:['submetido com nota ≥70%'] },
  ]},

  { id:'cs50.w3', t:'Week 3 — Algorithms', nota:'O conteúdo desta semana vive na trilha de algoritmos, com mais profundidade. Aqui fica só o que o certificado exige.', filhos:[
    { id:'cs50.w3.lab', t:'Lab 3 — Sort', min:60, tipos:['cs50'],
      saber:['identificou qual algoritmo é cada binário, com justificativa'] },
    { id:'cs50.w3.plur', t:'Pset 3 — Plurality', min:90, tipos:['cs50'], pre:['cs50.w3.lab'],
      saber:['submetido com nota ≥70%'] },
    { id:'cs50.w3.run', t:'Pset 3 — Runoff', min:90, tipos:['cs50'], pre:['cs50.w3.plur'],
      saber:['submetido com nota ≥70%'] },
    { id:'cs50.w3.tide', t:'Pset 3 — Tideman (opcional)', min:90, tipos:['cs50'], pre:['cs50.w3.run'],
      nota:'Não é exigido para o certificado. Vale se sobrar tempo — é o melhor exercício de grafo do curso.',
      saber:['locked pairs com detecção de ciclo'] },
  ]},

  { id:'cs50.w4', t:'Week 4 — Memory', nota:'O núcleo do valor do CS50 para quem só programou em linguagem gerenciada.', filhos:[
    { id:'cs50.w4.hex', t:'Hexadecimal e endereços', min:20, tipos:['cs50_light'],
      saber:['ler um endereço e um dump hexadecimal'] },
    { id:'cs50.w4.ptr', t:'Ponteiros', min:20, tipos:['cs50_light'], pre:['cs50.w4.hex'],
      saber:['declarar, desreferenciar e passar por referência','aritmética de ponteiro'] },
    { id:'cs50.w4.heap', t:'malloc, free, pilha vs heap', min:20, tipos:['cs50_light'], pre:['cs50.w4.ptr'],
      nota:'Entender isto muda como você lê performance em qualquer linguagem depois.',
      saber:['onde vive cada coisa','o que é vazamento e o que é dangling pointer'] },
    { id:'cs50.w4.io', t:'Arquivos, fread/fwrite e valgrind', min:20, tipos:['cs50_light'], pre:['cs50.w4.heap'],
      saber:['ler e escrever binário','interpretar a saída do valgrind'] },
    { id:'cs50.w4.lab', t:'Lab 4 — Volume', min:60, tipos:['cs50'], pre:['cs50.w4.io'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w4.filter', t:'Pset 4 — Filter', min:90, tipos:['cs50'], pre:['cs50.w4.lab'],
      saber:['submetido com nota ≥70%'] },
    { id:'cs50.w4.rec', t:'Pset 4 — Recover', min:90, tipos:['cs50'], pre:['cs50.w4.filter'],
      saber:['submetido com nota ≥70%','sem vazamento no valgrind'] },
  ]},

  { id:'cs50.w5', t:'Week 5 — Data Structures', nota:'Cruza forte com a trilha de algoritmos — faça as duas juntas se puder.', filhos:[
    { id:'cs50.w5.ll', t:'Listas ligadas em C', min:20, tipos:['cs50_light'], pre:['cs50.w4.heap'],
      saber:['inserir e liberar a lista inteira sem vazar'] },
    { id:'cs50.w5.tree', t:'Árvores e tries', min:20, tipos:['cs50_light'], pre:['cs50.w5.ll'],
      saber:['por que uma trie troca memória por tempo'] },
    { id:'cs50.w5.hash', t:'Tabelas hash e colisão', min:20, tipos:['cs50_light'], pre:['cs50.w5.tree'],
      saber:['encadeamento e fator de carga'] },
    { id:'cs50.w5.lab', t:'Lab 5 — Inheritance', min:60, tipos:['cs50'], pre:['cs50.w5.ll'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w5.sp1', t:'Pset 5 — Speller: carregar e verificar', min:90, tipos:['cs50'], pre:['cs50.w5.hash'],
      saber:['dicionário carregado em hash, verificação funcionando'] },
    { id:'cs50.w5.sp2', t:'Pset 5 — Speller: liberar e otimizar', min:90, tipos:['cs50'], pre:['cs50.w5.sp1'],
      saber:['submetido com nota ≥70%','zero vazamento no valgrind'] },
  ]},

  { id:'cs50.w6', t:'Week 6 — Python', nota:'Você já programa. Aqui é tradução de sintaxe e o contraste com C.', filhos:[
    { id:'cs50.w6.contr', t:'O que o Python esconde que o C mostrava', min:20, tipos:['cs50_light'],
      nota:'A lição real da semana: gerência de memória, tipos e tamanho automáticos.',
      saber:['nomear 4 coisas que o Python faz por você'] },
    { id:'cs50.w6.lab', t:'Lab 6 — World Cup', min:60, tipos:['cs50'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w6.sent', t:'Pset 6 — Sentimental (reescrita em Python)', min:90, tipos:['cs50'], pre:['cs50.w6.lab'],
      saber:['submetidos com nota ≥70%'] },
    { id:'cs50.w6.dna', t:'Pset 6 — DNA', min:90, tipos:['cs50'], pre:['cs50.w6.sent'],
      saber:['submetido com nota ≥70%'] },
  ]},

  { id:'cs50.w7', t:'Week 7 — SQL', nota:'Se você já escreve SQL, a aula é revisão. Fiftyville vale por si.', filhos:[
    { id:'cs50.w7.idx', t:'Índices, transações e condição de corrida', min:20, tipos:['cs50_light'],
      nota:'É o pedaço que o CS50 dá e que aparece em entrevista de backend.',
      saber:['por que índice acelera leitura e custa escrita','o que ACID garante','como injeção de SQL acontece'] },
    { id:'cs50.w7.lab', t:'Lab 7 — Songs', min:60, tipos:['cs50'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w7.mov', t:'Pset 7 — Movies', min:90, tipos:['cs50'], pre:['cs50.w7.lab'],
      saber:['as 13 consultas submetidas com nota ≥70%'] },
    { id:'cs50.w7.fifty', t:'Pset 7 — Fiftyville', min:90, tipos:['cs50'], pre:['cs50.w7.mov'],
      saber:['ladrão, cidade e cúmplice identificados','submetido'] },
  ]},

  { id:'cs50.w8', t:'Week 8 — HTML, CSS, JavaScript', nota:'Seu terreno. Passe rápido e entregue o pset.', filhos:[
    { id:'cs50.w8.web', t:'Como a web funciona: TCP/IP, HTTP, DNS', min:20, tipos:['cs50_light'],
      nota:'Isto sim vale a atenção — é pergunta de entrevista e você provavelmente nunca formalizou.',
      saber:['descrever o caminho de uma requisição do navegador ao servidor','citar 5 códigos de status e o que significam'] },
    { id:'cs50.w8.pset', t:'Pset 8 — Homepage', min:90, tipos:['cs50'], pre:['cs50.w8.web'],
      saber:['site com 4+ páginas, responsivo, submetido'] },
  ]},

  { id:'cs50.w9', t:'Week 9 — Flask', nota:'Padrão MVC e sessão. Finance é o pset mais longo do curso.', filhos:[
    { id:'cs50.w9.sess', t:'Sessão, cookies e autenticação', min:20, tipos:['cs50_light'],
      saber:['como a sessão é mantida','onde a senha deve ser guardada e como'] },
    { id:'cs50.w9.lab', t:'Lab 9 — Birthdays', min:60, tipos:['cs50'],
      saber:['submetido e aprovado'] },
    { id:'cs50.w9.fin1', t:'Pset 9 — Finance: cadastro, cotação e compra', min:90, tipos:['cs50'], pre:['cs50.w9.sess'],
      saber:['registro, login e compra funcionando'] },
    { id:'cs50.w9.fin2', t:'Pset 9 — Finance: venda, histórico e portfólio', min:90, tipos:['cs50'], pre:['cs50.w9.fin1'],
      saber:['submetido com nota ≥70%'] },
  ]},

  { id:'cs50.fp', t:'Projeto final', nota:'O último requisito do certificado. Escolha algo que também sirva ao portfólio.', filhos:[
    { id:'cs50.fp.ideia', t:'Definir escopo e proposta', min:60, tipos:['cs50'], pre:['cs50.w9.fin2'],
      saber:['problema real, escopo que cabe em ~3 semanas','proposta submetida se o curso exigir'] },
    { id:'cs50.fp.b1', t:'Construção — núcleo funcional', min:90, tipos:['cs50'], pre:['cs50.fp.ideia'],
      saber:['o caminho principal funciona ponta a ponta'] },
    { id:'cs50.fp.b2', t:'Construção — completar e tratar erro', min:90, tipos:['cs50'], pre:['cs50.fp.b1'],
      saber:['casos de erro tratados, sem tela quebrada'] },
    { id:'cs50.fp.b3', t:'Construção — polimento e README', min:90, tipos:['cs50'], pre:['cs50.fp.b2'],
      saber:['README com o que é, como rodar e por que as escolhas'] },
    { id:'cs50.fp.video', t:'Vídeo de demonstração', min:60, tipos:['cs50'], pre:['cs50.fp.b3'],
      nota:'Em inglês. Cruza com a trilha de fala — é uma gravação real com propósito.',
      saber:['até 3min, em inglês, mostrando o projeto funcionando'] },
    { id:'cs50.fp.sub', t:'Submissão e certificado', min:60, tipos:['cs50'], pre:['cs50.fp.video'],
      saber:['tudo submetido','certificado gratuito emitido com link verificável'] },
  ]},
]};
