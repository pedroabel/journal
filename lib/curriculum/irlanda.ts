/**
 * Irlanda — o percurso de imigração via curso de nível 9.
 *
 * Não é estudo: é execução com prazo. Mas tem a mesma forma de árvore, porque
 * cada item é uma coisa que você precisa SABER antes de fazer — e a maior
 * parte dos atrasos de imigração vem de descobrir uma exigência tarde demais.
 *
 * A cadeia dura do plano: aceite → fundos → visto → passagem. Nada de
 * antecipar fundos e seguro antes do aceite.
 */
import type { Trilha } from './types';

export const IRLANDA: Trilha = {
  id: 'irl', t: 'Irlanda', tipos: [], cor: '--chart-1', marco: 'firstday',
  nota: 'Intake alvo set/2028, plano B jan/2029. O que tem prazo longo começa cedo: passaporte e cães.',
  filhos: [

  { id:'irl.map', t:'Mapear o terreno', marco:'costs', nota:'2026–2027. Barato, e evita descobrir em 2028 que a rota estava errada.', filhos:[
    { id:'irl.map.pass', t:'Passaporte válido além de 2030', min:60,
      nota:'O item mais urgente do plano hoje: é o de maior tempo de espera e trava tudo depois.',
      saber:['validade conferida','se vence antes de 2030, renovação protocolada'] },
    { id:'irl.map.niv', t:'O que é nível 9 no quadro irlandês (NFQ)', min:60,
      saber:['diferença entre PgDip e mestrado no NFQ 9','por que o nível importa para o Stamp 1G'] },
    { id:'irl.map.1g', t:'Stamp 1G: o que dá e o que exige', min:60, pre:['irl.map.niv'],
      nota:'É a razão de o curso ser nível 9 e não outro. 24 meses de permissão para procurar e trabalhar.',
      saber:['duração e direitos do 1G para nível 9','o que você precisa ter concluído para pedir'] },
    { id:'irl.map.esc', t:'Levantar escolas e programas', min:60, pre:['irl.map.niv'],
      saber:['lista de 8+ programas com instituição, cidade e duração','todos confirmados como nível 9'] },
    { id:'irl.map.req', t:'Exigências de admissão de cada programa', min:60, pre:['irl.map.esc'],
      saber:['nota mínima, banda de IELTS, exigência de experiência','quais aceitam seu diploma brasileiro sem equivalência extra'] },
    { id:'irl.map.cust', t:'Custos reais planilhados', min:60, pre:['irl.map.req'],
      nota:'Marco `costs`, alvo set/2026. Mensalidade de 3 escolas + exigência de fundos do visto + custo de vida mensal em euros.',
      saber:['planilha com as 3 mensalidades','valor de fundos exigido pelo visto','custo de vida mensal por cidade'] },
    { id:'irl.map.cid', t:'Escolher cidade: custo, moradia, mercado', min:60, pre:['irl.map.cust'],
      nota:'Dublin tem o mercado e o aluguel; Cork, Galway e Limerick mudam a conta inteira.',
      saber:['comparação de aluguel e vaga de emprego em 3 cidades','a cidade que sobra depois de aplicar a sua conta'] },
    { id:'irl.map.bolsa', t:'Bolsas e financiamento', min:60, pre:['irl.map.cust'],
      saber:['prazos e critérios das bolsas aplicáveis','decisão de tentar ou não, com data'] },
    { id:'irl.map.short', t:'Fechar a lista final de 3 escolas', min:60, pre:['irl.map.cid','irl.map.bolsa'],
      saber:['3 programas escolhidos, com prazo de aplicação de cada anotado'] },
  ]},

  { id:'irl.fin', t:'Financeiro', nota:'A conta que torna tudo viável. R$2.500/mês automático + SinPro como alavanca.', filhos:[
    { id:'irl.fin.auto', t:'Automatizar a poupança', min:60,
      saber:['transferência automática no dia do salário, configurada uma vez'] },
    { id:'irl.fin.onde', t:'Onde guardar dinheiro com data marcada', min:60, pre:['irl.fin.auto'],
      nota:'Dinheiro com uso definido em 2028 não vai para renda variável.',
      saber:['produto escolhido com liquidez na data certa','entender o imposto na saída'] },
    { id:'irl.fin.cam', t:'Câmbio e exposição em euro', min:60, pre:['irl.fin.onde'],
      nota:'Três anos de real contra euro é um risco real do plano, e ninguém planeja isso.',
      saber:['decisão de quando e como começar a comprar euro','custo real de cada forma de remeter'] },
    { id:'irl.fin.fund', t:'Comprovação de fundos para o visto', min:60, pre:['irl.map.cust'],
      nota:'Só faz sentido depois do aceite. Exige extrato no SEU nome, com tempo mínimo de conta.',
      saber:['valor exigido e por quanto tempo precisa estar parado','em que conta e em que nome'] },
    { id:'irl.fin.sin', t:'SinPro como receita recorrente', min:60,
      saber:['modelo de cobrança definido','primeira receita recorrente entrando'] },
  ]},

  { id:'irl.app', t:'Aplicação', marco:'apps3', nota:'Alvo: submeter até mar/2028, aceite até jun/2028.', filhos:[
    { id:'irl.app.doc', t:'Histórico escolar e diploma', min:60, pre:['irl.map.short'],
      saber:['originais em mãos','confirmado se a escola exige avaliação de equivalência'] },
    { id:'irl.app.trad', t:'Tradução juramentada', min:60, pre:['irl.app.doc'],
      saber:['tradutor contratado','prazo e custo conhecidos com folga'] },
    { id:'irl.app.ps', t:'Personal statement', min:60, pre:['irl.app.doc'],
      nota:'Cruza com a trilha de inglês: o texto sai de lá, revisado.',
      saber:['versão final revisada por outra pessoa'] },
    { id:'irl.app.rec', t:'Cartas de recomendação', min:60, pre:['irl.app.ps'],
      saber:['2 cartas pedidas com 2 meses de antecedência','cada recomendador com contexto e prazo'] },
    { id:'irl.app.ielts', t:'Resultado de IELTS dentro da validade', min:60, pre:['irl.map.req'],
      nota:'IELTS vale 2 anos. Fazer cedo demais é tão ruim quanto tarde demais.',
      saber:['data da prova compatível com o prazo das 3 aplicações'] },
    { id:'irl.app.sub', t:'Submeter as 3 aplicações', min:60, pre:['irl.app.trad','irl.app.rec','irl.app.ielts'],
      saber:['3 protocolos guardados','prazo de resposta de cada anotado'] },
    { id:'irl.app.dep', t:'Aceite, depósito e matrícula', min:60, pre:['irl.app.sub'],
      saber:['offer letter no seu nome','depósito pago e comprovante guardado'] },
  ]},

  { id:'irl.visa', t:'Visto', marco:'visa', nota:'Só depois do aceite. Bloqueante absoluto — não antecipe.', filhos:[
    { id:'irl.visa.tipo', t:'Qual visto e qual formulário', min:60, pre:['irl.app.dep'],
      saber:['tipo correto para estudo de longa duração','checklist oficial impresso e conferido item a item'] },
    { id:'irl.visa.seg', t:'Seguro-saúde privado', min:60, pre:['irl.visa.tipo'],
      saber:['apólice que atende a exigência do visto','cobertura e período conferidos'] },
    { id:'irl.visa.doc', t:'Montar o dossiê', min:60, pre:['irl.visa.seg','irl.fin.fund'],
      saber:['todos os documentos do checklist reunidos','carta de intenção escrita'] },
    { id:'irl.visa.sub', t:'Submeter e acompanhar', min:60, pre:['irl.visa.doc'],
      saber:['pedido submetido dentro da janela','prazo médio de decisão conhecido'] },
    { id:'irl.visa.dec', t:'Decisão e plano B', min:60, pre:['irl.visa.sub'],
      nota:'Recusa tem prazo de recurso. Saber disso antes evita perder o intake.',
      saber:['visto emitido — ou recurso protocolado dentro do prazo'] },
  ]},

  { id:'irl.dog', t:'Os cachorros', marco:'dogs', nota:'Começa 6+ meses antes. É a parte mais fácil de subestimar e a mais impossível de acelerar.', filhos:[
    { id:'irl.dog.reg', t:'Regras de entrada de animais na Irlanda', min:60,
      saber:['a sequência exigida e a ordem obrigatória entre as etapas','se há exigência de titulação de anticorpos para o Brasil'] },
    { id:'irl.dog.chip', t:'Microchip antes da vacina', min:60, pre:['irl.dog.reg'],
      nota:'A ordem importa: vacina antes do chip invalida a vacina.',
      saber:['chip implantado e número registrado'] },
    { id:'irl.dog.vac', t:'Antirrábica e carência', min:60, pre:['irl.dog.chip'],
      saber:['vacina aplicada depois do chip','carência mínima conhecida e contada no calendário'] },
    { id:'irl.dog.exam', t:'Exames, tratamentos e certificado veterinário', min:60, pre:['irl.dog.vac'],
      saber:['tudo dentro das janelas de prazo exigidas'] },
    { id:'irl.dog.voo', t:'Voo, transportadora e rota autorizada', min:60, pre:['irl.dog.exam'],
      nota:'Nem toda companhia leva; nem todo aeroporto é ponto de entrada autorizado.',
      saber:['companhia e rota confirmadas','caixa de transporte no padrão exigido'] },
    { id:'irl.dog.chega', t:'Chegada e primeiros dias com eles', min:60, pre:['irl.dog.voo'],
      saber:['moradia que aceita animais confirmada ANTES do voo','veterinário local mapeado'] },
  ]},

  { id:'irl.sai', t:'Saída do Brasil', marco:'ticket', filhos:[
    { id:'irl.sai.mor', t:'Moradia inicial reservada', min:60, pre:['irl.visa.dec'],
      nota:'Aluguel na Irlanda é o gargalo real. Moradia inicial garantida antes de embarcar, mesmo que temporária.',
      saber:['acomodação das primeiras semanas paga e confirmada'] },
    { id:'irl.sai.pass', t:'Passagem comprada', min:60, pre:['irl.visa.dec'],
      saber:['bilhete emitido, compatível com a data dos cães'] },
    { id:'irl.sai.vinc', t:'Encerrar vínculos no Brasil', min:60, pre:['irl.sai.pass'],
      saber:['contratos, assinaturas e conta bancária resolvidos','situação fiscal de saída entendida'] },
    { id:'irl.sai.bag', t:'Bagagem e o que não vai', min:60, pre:['irl.sai.vinc'],
      saber:['o que vende, o que doa, o que guarda e com quem'] },
  ]},

  { id:'irl.che', t:'Chegada', marco:'firstday', nota:'As primeiras seis semanas têm uma ordem própria — cada item destrava o próximo.', filhos:[
    { id:'irl.che.imig', t:'Passar pela imigração', min:60, pre:['irl.sai.pass'],
      saber:['documentos que o oficial pede, na mão e não na mala'] },
    { id:'irl.che.ppsn', t:'PPSN', min:60, pre:['irl.che.imig'],
      nota:'É o número que destrava trabalho, banco e serviço público. Primeiro da fila.',
      saber:['solicitado na primeira semana','o que exige comprovar'] },
    { id:'irl.che.irp', t:'Registro de imigração (IRP)', min:60, pre:['irl.che.imig'],
      saber:['agendamento feito assim que possível','taxa e documentos conhecidos'] },
    { id:'irl.che.banco', t:'Conta bancária', min:60, pre:['irl.che.ppsn'],
      saber:['conta aberta','comprovante de endereço resolvido'] },
    { id:'irl.che.casa', t:'Moradia definitiva', min:60, pre:['irl.che.banco'],
      saber:['contrato assinado, com os cães declarados'] },
    { id:'irl.che.rot', t:'Reconstruir a rotina', min:60, pre:['irl.che.casa'],
      nota:'O sistema inteiro existe para chegar aqui. Ele continua depois — com blocos novos.',
      saber:['blocos da semana remontados no fuso novo'] },
  ]},

  { id:'irl.dep', t:'Depois do curso', filhos:[
    { id:'irl.dep.1g', t:'Solicitar o Stamp 1G', min:60, pre:['irl.che.rot'],
      saber:['exigências e prazo a partir da conclusão'] },
    { id:'irl.dep.job', t:'Buscar emprego com 1G', min:60, pre:['irl.dep.1g'],
      nota:'Cruza com toda a trilha de carreira — que a essa altura já rodou por dois anos.',
      saber:['CV e LinkedIn atualizados para o mercado local'] },
    { id:'irl.dep.perm', t:'Rotas de permanência depois dos 24 meses', min:60, pre:['irl.dep.job'],
      saber:['as rotas possíveis e o que cada uma exige','decisão tomada com 6 meses de antecedência'] },
  ]},
]};
