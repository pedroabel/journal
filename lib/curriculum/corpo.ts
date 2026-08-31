/**
 * Corpo — calistenia 3x/semana e caminhada, com a barra fixa como marco.
 *
 * O plano trata o corpo como base de energia, não como objetivo estético: sem
 * corpo funcionando, os blocos da noite não se sustentam. A árvore é uma
 * progressão — cada folha é um nível, e você só sobe quando o critério bate.
 */
import type { Trilha } from './types';

export const CORPO: Trilha = {
  id: 'corpo', t: 'Corpo', tipos: ['calistenia', 'caminhada'], cor: '--chart-3', marco: 'pullup',
  nota: 'Progressão, não repetição. Se a semana não ficou mais difícil que a anterior, não houve treino.',
  filhos: [

  { id:'corpo.fund', t:'Fundamentos', nota:'Feitos uma vez, evitam a lesão que para o plano por 6 semanas.', filhos:[
    { id:'corpo.fund.mob', t:'Mobilidade de ombro, quadril e punho', min:25,
      nota:'Punho é o que mais para iniciante de calistenia. Ombro é o que permite a barra.',
      saber:['rotina de 5min decorada','fazer antes de todo treino, sem consultar'] },
    { id:'corpo.fund.tens', t:'Tensão corporal e respiração', min:25, pre:['corpo.fund.mob'],
      saber:['manter hollow body 30s','respirar sob carga sem prender'] },
    { id:'corpo.fund.esc', t:'Escápulas: retração, depressão, protração', min:25, pre:['corpo.fund.tens'],
      nota:'A barra fixa começa aqui. Sem controle escapular, você puxa com o braço e trava.',
      saber:['fazer scapular pull-up com controle','sentir a diferença entre pendurado passivo e ativo'] },
    { id:'corpo.fund.forma', t:'Amplitude e forma acima de repetição', min:25, pre:['corpo.fund.tens'],
      saber:['gravar uma série e avaliar a própria forma','preferir 5 boas a 12 ruins'] },
  ]},

  { id:'corpo.push', t:'Empurrar — progressão', nota:'Sobe de nível quando fizer 3x8 com forma boa.', filhos:[
    { id:'corpo.push.1', t:'Flexão na parede e inclinada', min:25, pre:['corpo.fund.forma'],
      saber:['3x12 inclinada, corpo em linha'] },
    { id:'corpo.push.2', t:'Flexão com joelhos e negativa', min:25, pre:['corpo.push.1'],
      saber:['3x8 negativa de 4 segundos'] },
    { id:'corpo.push.3', t:'Flexão completa', min:25, pre:['corpo.push.2'],
      saber:['3x8 com peito próximo ao chão, quadril alinhado'] },
    { id:'corpo.push.4', t:'Flexão diamante e declinada', min:25, pre:['corpo.push.3'],
      saber:['3x8 de cada'] },
    { id:'corpo.push.5', t:'Flexão arqueira e pseudo-planche', min:25, pre:['corpo.push.4'],
      saber:['3x5 arqueira por lado'] },
    { id:'corpo.push.6', t:'Paralelas (dips)', min:25, pre:['corpo.push.4'],
      saber:['3x8 com ombro estável e amplitude completa'] },
  ]},

  { id:'corpo.pull', t:'Puxar — a rota até a barra fixa', marco:'pullup', nota:'Marco `pullup`, alvo jul/2027. Esta é a coluna vertebral do treino.', filhos:[
    { id:'corpo.pull.1', t:'Pendurar (dead hang)', min:25, pre:['corpo.fund.esc'],
      saber:['30s pendurado, ombros ativos'] },
    { id:'corpo.pull.2', t:'Remada australiana (barra baixa)', min:25, pre:['corpo.pull.1'],
      saber:['3x10 com corpo em linha'] },
    { id:'corpo.pull.3', t:'Remada australiana com pés elevados', min:25, pre:['corpo.pull.2'],
      saber:['3x8'] },
    { id:'corpo.pull.4', t:'Negativa de barra', min:25, pre:['corpo.pull.3'],
      nota:'A ponte mais eficiente para a primeira barra: descida controlada de 5 segundos.',
      saber:['3x3 negativas de 5s, sem despencar'] },
    { id:'corpo.pull.5', t:'Barra assistida (elástico ou pé apoiado)', min:25, pre:['corpo.pull.4'],
      saber:['3x5 com a menor assistência que ainda permite forma boa'] },
    { id:'corpo.pull.6', t:'Primeira barra fixa completa', min:25, pre:['corpo.pull.5'],
      nota:'Marco do plano: uma repetição, queixo acima da barra, sem impulso.',
      saber:['1 repetição limpa, gravada'] },
    { id:'corpo.pull.7', t:'Volume: 3x5 barras', min:25, pre:['corpo.pull.6'],
      saber:['3x5 com pausa completa entre séries'] },
  ]},

  { id:'corpo.leg', t:'Pernas', filhos:[
    { id:'corpo.leg.1', t:'Agachamento livre e amplitude', min:25, pre:['corpo.fund.mob'],
      saber:['3x15 com calcanhar no chão e profundidade completa'] },
    { id:'corpo.leg.2', t:'Afundo e agachamento búlgaro', min:25, pre:['corpo.leg.1'],
      saber:['3x10 por perna'] },
    { id:'corpo.leg.3', t:'Progressão para o pistol', min:25, pre:['corpo.leg.2'],
      saber:['3x5 pistol assistido por perna'] },
    { id:'corpo.leg.4', t:'Posterior: ponte e nórdico assistido', min:25, pre:['corpo.leg.1'],
      nota:'Compensa o dia inteiro sentado — que é o seu caso.',
      saber:['3x12 ponte unilateral'] },
  ]},

  { id:'corpo.core', t:'Core', filhos:[
    { id:'corpo.core.1', t:'Prancha e prancha lateral', min:25, pre:['corpo.fund.tens'],
      saber:['60s frontal e 30s de cada lado, sem quadril caído'] },
    { id:'corpo.core.2', t:'Hollow hold e arco', min:25, pre:['corpo.core.1'],
      saber:['3x30s hollow com lombar colada'] },
    { id:'corpo.core.3', t:'Elevação de pernas na barra', min:25, pre:['corpo.core.2','corpo.pull.1'],
      saber:['3x8 joelhos acima da cintura, sem balanço'] },
    { id:'corpo.core.4', t:'L-sit', min:25, pre:['corpo.core.3'],
      saber:['3x10s com pernas estendidas'] },
  ]},

  { id:'corpo.per', t:'Método e recuperação', nota:'O que faz a progressão continuar em vez de estagnar no mês 4.', filhos:[
    { id:'corpo.per.sob', t:'Sobrecarga progressiva na calistenia', min:25,
      nota:'Sem aumentar peso, você aumenta: repetição, tempo sob tensão, amplitude, alavanca.',
      saber:['as 4 variáveis de progressão','saber qual usar quando a repetição travar'] },
    { id:'corpo.per.reg', t:'Registro de treino', min:25, pre:['corpo.per.sob'],
      saber:['séries, repetições e sensação anotadas em toda sessão','comparar com a semana anterior antes de começar'] },
    { id:'corpo.per.desl', t:'Deload e platô', min:25, pre:['corpo.per.reg'],
      saber:['reconhecer platô real vs semana ruim','reduzir volume por 1 semana sem culpa'] },
    { id:'corpo.per.dor', t:'Dor: normal, alerta e parada', min:25, pre:['corpo.fund.forma'],
      saber:['distinguir dor muscular tardia de dor articular','regra clara de quando não treinar'] },
    { id:'corpo.per.cam', t:'Caminhada como descanso ativo', min:20,
      nota:'Almoço de quinta, dia sem calistenia. É pausa, não treino — sem fone de estudo.',
      saber:['15–20min depois de comer','sem transformar em mais um bloco de produtividade'] },
    { id:'corpo.per.nut', t:'Proteína e refeição em torno do treino', min:25, pre:['corpo.per.reg'],
      nota:'Sem marmita fixa na rotina agora, o alvo passa a depender do que se come de fato.',
      saber:['alvo diário de proteína calculado','saber de onde ele sai num dia comum, sem preparo prévio'] },
  ]},
]};
