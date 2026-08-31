/**
 * Base — sono, leitura, revisão e dinheiro do dia a dia.
 *
 * A camada que não aparece em nenhum currículo e derruba todos eles. O plano
 * já diz que o sono é o maior retorno do sistema; aqui ele vira estudo, uma
 * vez, para parar de ser palpite.
 */
import type { Trilha } from './types';

export const BASE: Trilha = {
  id: 'base', t: 'Base', tipos: ['sono', 'leitura', 'review'], cor: '--chart-5',
  nota: 'Poucas folhas, feitas uma vez. Depois é hábito, não estudo.',
  filhos: [

  { id:'base.sono', t:'Sono', nota:'A raiz da cadeia de dependências do plano.', filhos:[
    { id:'base.sono.ciclo', t:'Ritmo circadiano e por que o horário fixo importa', min:20,
      saber:['por que acordar sempre no mesmo horário regula mais que dormir cedo','o efeito da luz da manhã'] },
    { id:'base.sono.hig', t:'Higiene de sono aplicada à sua noite', min:20, pre:['base.sono.ciclo'],
      nota:'Bloco de estudo até 22:40 é luz e ativação. A regra das telas existe por isso.',
      saber:['regra de telas às 22:40 e celular fora do quarto','temperatura, escuro e ruído resolvidos'] },
    { id:'base.sono.coch', t:'Cochilo: o limite que não quebra a noite', min:20, pre:['base.sono.ciclo'],
      nota:'Seu ciclo hoje: irregular → cansaço → cochilo longo → dormir tarde. O cochilo é o ponto de corte.',
      saber:['máximo 15–20min, sempre antes das 15h','comparar por 2 semanas os dias com e sem cochilo'] },
    { id:'base.sono.caf', t:'Cafeína, álcool e exercício perto de dormir', min:20, pre:['base.sono.hig'],
      saber:['última cafeína 8h antes de deitar','por que treino tarde atrapalha adormecer'] },
    { id:'base.sono.deb', t:'Dívida de sono e recuperação', min:20, pre:['base.sono.caf'],
      saber:['por que dormir 12h no sábado não zera a semana'] },
  ]},

  { id:'base.foco', t:'Foco e antiprocrastinação', nota:'O plano já lista as táticas. Aqui elas viram prática, uma vez cada.', filhos:[
    { id:'base.foco.impl', t:'Intenção de implementação', min:20,
      saber:['escrever "depois de X, eu faço Y no lugar Z" para os 3 blocos que você mais pula'] },
    { id:'base.foco.pilha', t:'Empilhamento de hábitos', min:20, pre:['base.foco.impl'],
      saber:['cada bloco novo ancorado num que já existe'] },
    { id:'base.foco.fric', t:'Design de fricção', min:20, pre:['base.foco.pilha'],
      saber:['celular em outro cômodo durante os blocos','material do dia deixado pronto na véspera'] },
    { id:'base.foco.2min', t:'Regra dos 2 minutos', min:20, pre:['base.foco.fric'],
      saber:['comprometer-se só a começar, 5 vezes numa semana ruim'] },
    { id:'base.foco.min', t:'Definir o dia mínimo viável de cada bloco', min:20, pre:['base.foco.2min'],
      nota:'A versão curta que ainda conta. Sem ela, dia ruim vira zero e a corrente quebra à toa.',
      saber:['versão de 5min escrita para cada tipo de bloco'] },
  ]},

  { id:'base.rev', t:'Revisão', nota:'Sistema sem revisão vira documento esquecido.', filhos:[
    { id:'base.rev.sem', t:'A revisão semanal de domingo', min:20,
      saber:['20min: feito, travado, por quê','trilhas e marcos conferidos','semana seguinte ajustada e 1 vitória reconhecida'] },
    { id:'base.rev.mes', t:'O fechamento do mês', min:20, pre:['base.rev.sem'],
      saber:['três toques, sem texto livre','olhar a taxa antes de responder'] },
    { id:'base.rev.tri', t:'A revisão de trimestre', min:20, pre:['base.rev.mes'],
      nota:'Onde o plano se corrige: marco adiado, bloco redesenhado, carga ajustada.',
      saber:['datas de marco revistas contra a realidade','um marco de experiência do trimestre cumprido'] },
  ]},

  { id:'base.din', t:'Dinheiro do dia a dia', filhos:[
    { id:'base.din.orc', t:'Orçamento que sobrevive ao mês', min:20,
      saber:['gasto fixo, variável e a poupança automática separados'] },
    { id:'base.din.res', t:'Reserva de emergência separada da poupança da Irlanda', min:20, pre:['base.din.orc'],
      nota:'Sem isso, um imprevisto come o dinheiro do visto.',
      saber:['3–6 meses de custo, em conta separada e líquida'] },
    { id:'base.din.inv', t:'Investimentos: 30min no 1º domingo do mês', min:20, pre:['base.din.res'],
      saber:['aporte feito e conferido','nada de renda variável para dinheiro com data marcada'] },
  ]},

  { id:'base.ler', t:'Leitura', nota:'Camada de prazer, sem cobrança. Existe para desligar e proteger o sono.', filhos:[
    { id:'base.ler.hab', t:'Leitura sem meta de páginas', min:20,
      saber:['15–20min antes de dormir, longe de tela brilhante','abandonar livro chato sem culpa'] },
    { id:'base.ler.en', t:'Migrar a leitura para o inglês', min:20, pre:['base.ler.hab'],
      nota:'Você é C2 na compreensão: ler em inglês não custa nada e alimenta o léxico da produção.',
      saber:['1 livro em inglês por vez, sem dicionário a cada palavra'] },
  ]},
]};
