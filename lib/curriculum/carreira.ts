/**
 * Carreira — o funil que leva ao emprego novo (nacional ou remoto internacional).
 *
 * É o bloco de 1h da sexta. O plano trata este como o maior atalho do sistema:
 * emprego remoto internacional adianta dinheiro e imigração ao mesmo tempo.
 */
import type { Trilha } from './types';

export const CARREIRA: Trilha = {
  id: 'car', t: 'Carreira', tipos: ['carreira'], cor: '--chart-4',
  nota: 'Entrevista se aprende entrevistando. O funil precisa estar rodando antes de você se sentir pronto.',
  filhos: [

  { id:'car.mat', t:'Material de candidatura', nota:'Feito uma vez, ajustado sempre. Enquanto não existe, cada candidatura custa uma hora.', filhos:[
    { id:'car.mat.cv', t:'CV em formato internacional', min:60,
      nota:'Uma página, sem foto, sem data de nascimento, sem estado civil — o padrão BR reprova lá.',
      saber:['1 página, em inglês, sem dado pessoal desnecessário','cada bullet no formato ação + tecnologia + resultado mensurável'] },
    { id:'car.mat.cvats', t:'Passar pelo filtro automático (ATS)', min:60, pre:['car.mat.cv'],
      saber:['formato simples, sem coluna nem tabela','palavras-chave da vaga presentes sem enchimento'] },
    { id:'car.mat.li', t:'LinkedIn em inglês', min:60, pre:['car.mat.cv'],
      saber:['headline que diz o que você faz e para quem','About em 5 linhas, na primeira pessoa','experiências com o mesmo padrão de bullet do CV'] },
    { id:'car.mat.gh', t:'GitHub como vitrine', min:60, pre:['car.mat.li'],
      saber:['README de perfil','projetos fixados com descrição e link do deploy','nenhum repositório abandonado em destaque'] },
    { id:'car.mat.cl', t:'Cover letter reaproveitável', min:60, pre:['car.mat.cv'],
      saber:['um template com 1 parágrafo variável por vaga'] },
  ]},

  { id:'car.fun', t:'O funil', nota:'2–3 candidaturas por semana. O número é pequeno de propósito: personalizada bate em massa.', filhos:[
    { id:'car.fun.alvo', t:'Definir o alvo: cargo, nível, mercado', min:60,
      saber:['3 títulos de vaga que você persegue','faixa salarial pesquisada para BR e para remoto internacional'] },
    { id:'car.fun.onde', t:'Onde as vagas remotas realmente estão', min:60, pre:['car.fun.alvo'],
      nota:'Fuso é filtro: empresa europeia contrata BR com muito mais facilidade que americana.',
      saber:['5 fontes checadas semanalmente','saber quais aceitam contratação PJ do Brasil'] },
    { id:'car.fun.ler', t:'Ler uma vaga e decidir em 2 minutos', min:45, pre:['car.fun.onde'],
      saber:['separar requisito real de lista de desejos','descartar rápido sem culpa'] },
    { id:'car.fun.pers', t:'Personalizar sem gastar uma hora', min:45, pre:['car.mat.cl','car.fun.ler'],
      saber:['1 linha específica da empresa em cada candidatura','15min por candidatura, no máximo'] },
    { id:'car.fun.track', t:'Rastrear o funil', min:45, pre:['car.fun.pers'],
      nota:'Sem registro você não sabe se o problema é o CV, a triagem ou a entrevista.',
      saber:['planilha com data, empresa, estágio e resposta','taxa de resposta calculada mensalmente'] },
    { id:'car.fun.diag', t:'Diagnosticar onde o funil vaza', min:45, pre:['car.fun.track'],
      saber:['saber se você é barrado no CV, na triagem ou na técnica','ter uma ação diferente para cada caso'] },
    { id:'car.fun.fup', t:'Follow-up e recusa', min:20, pre:['car.fun.track'],
      saber:['mensagem de follow-up depois de 7 dias','pedir feedback numa recusa sem soar ressentido'] },
  ]},

  { id:'car.ent', t:'Entrevista', nota:'Quatro etapas, cada uma com preparo próprio. Cruza com a trilha de inglês em todas.', filhos:[
    { id:'car.ent.rh', t:'Triagem com RH', min:45, pre:['car.mat.cv'],
      saber:['pitch de 90 segundos em inglês','resposta pronta para pretensão e disponibilidade'] },
    { id:'car.ent.hist', t:'Banco de histórias STAR', min:60, pre:['car.ent.rh'],
      nota:'8 histórias cobrem quase toda pergunta comportamental. Escreva uma vez, use sempre.',
      saber:['8 histórias escritas: conflito, falha, prazo, liderança, aprendizado, iniciativa, feedback, ambiguidade','cada uma com Resultado mensurável'] },
    { id:'car.ent.comp', t:'Entrevista comportamental em inglês', min:60, pre:['car.ent.hist'],
      saber:['responder 10 perguntas gravadas, 2min cada','sem ler, sem trocar para português'] },
    { id:'car.ent.tec', t:'Entrevista técnica ao vivo', min:60, pre:['car.ent.comp'],
      nota:'Depende da trilha de algoritmos. Pensar falando é a habilidade avaliada, não só acertar.',
      saber:['esclarecer requisito antes de codar','narrar a abordagem e anunciar a complexidade','testar à mão antes de dizer que terminou'] },
    { id:'car.ent.tak', t:'Desafio para casa (take-home)', min:60, pre:['car.ent.tec'],
      saber:['entregar com README, testes e limite de escopo declarado','não gastar 3x o tempo sugerido'] },
    { id:'car.ent.sd', t:'System design em entrevista', min:60, pre:['car.ent.tec'],
      saber:['conduzir 45min sozinho, do requisito ao gargalo'] },
    { id:'car.ent.perg', t:'Perguntar ao entrevistador', min:20, pre:['car.ent.rh'],
      saber:['6 perguntas sobre time, processo, expectativa e crescimento'] },
    { id:'car.ent.pos', t:'Pós-entrevista: retrospectiva', min:20, pre:['car.ent.comp'],
      nota:'A entrevista que dá ruim só vale se virar correção.',
      saber:['anotar as 3 perguntas que travaram, no mesmo dia','cada trava vira item de estudo'] },
  ]},

  { id:'car.neg', t:'Proposta e negociação', filhos:[
    { id:'car.neg.pesq', t:'Pesquisar faixa antes de falar número', min:45, pre:['car.fun.alvo'],
      saber:['faixa de mercado para o cargo em BR, Europa e remoto'] },
    { id:'car.neg.conv', t:'A conversa de salário', min:45, pre:['car.neg.pesq','car.ent.rh'],
      saber:['adiar o número sem parecer evasivo','dar faixa ancorada em pesquisa'] },
    { id:'car.neg.pac', t:'Ler a proposta inteira', min:45, pre:['car.neg.conv'],
      nota:'Regime de contratação, moeda, férias, equipamento, política de fuso. Vale tanto quanto o salário.',
      saber:['calcular o líquido real para PJ no Brasil','identificar cláusula problemática de exclusividade ou fuso'] },
    { id:'car.neg.saida', t:'Sair bem do emprego atual', min:45, pre:['car.neg.pac'],
      saber:['aviso, transição e referência preservada'] },
  ]},

  { id:'car.pres', t:'Presença e rede', nota:'Progresso público cobra você e constrói o perfil ao mesmo tempo.', filhos:[
    { id:'car.pres.post', t:'Publicar progresso', min:45, pre:['car.mat.li'],
      saber:['1 post por mês em inglês sobre o que construiu','sem pedir emprego no texto'] },
    { id:'car.pres.rede', t:'Rede sem constrangimento', min:45, pre:['car.pres.post'],
      saber:['abordagem fria em 4 linhas, com motivo real','manter contato sem pedir nada na primeira mensagem'] },
    { id:'car.pres.ref', t:'Referências e recomendações', min:45, pre:['car.pres.rede'],
      nota:'Cruza com a checklist de documentos: as cartas de recomendação da aplicação saem daqui.',
      saber:['3 pessoas mapeadas que recomendariam você','pedido feito com contexto e prazo'] },
  ]},
]};
