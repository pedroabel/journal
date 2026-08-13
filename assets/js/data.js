/* ---------------------------------------------------------------------------
   data.js — CONTEÚDO DO PLANO (é aqui que você edita o que o site mostra)

   Blocos principais:
     AREAS / TYPE_LABEL  áreas e nomes dos tipos de bloco
     TRACKS              trilhas de estudo (itens sequenciais)
     MS                  marcos, com data-alvo, critério e dependências
     PROTO               protocolo de cada tipo de bloco (passos, foco, sucesso)
     WEEK                a semana padrão: blocos de cada dia
     CHECKS              checklists (documentos, financeiro, ...)
     PLANO/DEPS/METHODS/ANTIPROC/DECISOES   textos das seções fixas

   Não há build: salvou o arquivo, recarregou a página, está no ar.
   --------------------------------------------------------------------------- */

var AREAS={
ingles:{n:'Inglês',c:'--flag',t:['en_write','en_speak','en_tutor']},
codigo:{n:'Programação',c:'--blue',t:['roadmap','cs50','cs50_light','dsa']},
corpo:{n:'Corpo',c:'--sage',t:['calistenia','caminhada']},
carreira:{n:'Carreira',c:'--accent',t:['carreira']},
base:{n:'Base',c:'--ink-dim',t:['sono','leitura','review']}
};
function areaOf(t){for(var k in AREAS){if(AREAS[k].t.indexOf(t)>=0)return k;}return 'base';}
var TYPE_LABEL={sono:'Sono',calistenia:'Calistenia',caminhada:'Caminhada',en_speak:'Inglês fala',en_write:'Inglês escrita',en_tutor:'Tutor inglês',roadmap:'Programação',cs50:'CS50',cs50_light:'CS50 leve',dsa:'DSA',carreira:'Carreira',leitura:'Leitura',review:'Revisão'};
var TRACKS=[
{id:'ingles',name:'Inglês — do C2 passivo ao ativo',color:'--flag',items:[
'Rotina diária de output rodando (fala + escrita)','Gravação e auto-avaliação viraram hábito',
'Tutor 1:1 semanal contratado e constante','Escrita com correção → cards de erro no Anki',
'Simulados IELTS — foco Speaking e Writing','IELTS feito — banda exigida atingida']},
{id:'cs50',name:'CS50 — sprint do certificado',color:'--blue',items:[
'Week 0 — Scratch','Week 1 — C','Week 2 — Arrays','Week 3 — Algorithms','Week 4 — Memory',
'Week 5 — Data Structures','Week 6 — Python','Week 7 — SQL','Week 8 — HTML/CSS/JS','Week 9 — Flask',
'Projeto Final → Certificado emitido']},
{id:'dsa',name:'DSA — preparação de entrevista',color:'--sage',items:[
'Arrays & Hashing','Two Pointers','Sliding Window','Stack','Binary Search','Linked List',
'Trees','Heap / Priority Queue','Backtracking','Graphs','Dynamic Programming (intro)']},
{id:'portfolio',name:'Portfólio & Presença profissional',color:'--accent',items:[
'LinkedIn reformulado em inglês','GitHub organizado com README de perfil',
'Projeto 1 — pequeno, resolve um problema real','Projeto 2 — médio, com testes e documentação',
'Projeto 3 — com deploy online funcionando','CV em inglês, formato internacional',
'Rotina de aplicações ativa (BR + remoto internacional)']}
];
var MS=[
{id:'passport',t:'Passaporte conferido (renovado se vence antes de 2030)',ty:'cred',d:'2026-08-31',crit:'Validade confirmada além de 2030 — ou protocolo de renovação aberto.',dep:[]},
{id:'costs',t:'Custos reais do PgDip e do visto planilhados',ty:'cred',d:'2026-09-30',crit:'Planilha com mensalidade de 3 escolas, exigência de fundos do visto e custo de vida mensal em euros.',dep:[]},
{id:'dogtrail',t:'Trilha longa nova com os cachorros',ty:'exp',d:'2026-09-30',crit:'Você foi, num lugar onde nunca esteve antes.',dep:[]},
{id:'write30',t:'30 sessões de escrita em inglês concluídas',ty:'cap',d:'2026-10-31',crit:'30 marcações de escrita registradas no sistema.',dep:[]},
{id:'talk15',t:'Primeira conversa falada de 15 min em inglês',ty:'exp',d:'2026-11-30',crit:'15 minutos contínuos com outra pessoa, sem trocar para o português.',dep:['write30']},
{id:'speak10',t:'Gravar 10 min falando inglês sem travar',ty:'cap',d:'2027-01-31',crit:'Uma gravação de 10 min contínuos, sem pausa longa nem troca de idioma.',dep:['talk15']},
{id:'weekend',t:'Um fim de semana fora da cidade, sem laptop',ty:'exp',d:'2027-03-31',crit:'Você viajou e não levou o laptop.',dep:[]},
{id:'cs50c',t:'Certificado do CS50 emitido',ty:'cred',d:'2027-03-31',crit:'Certificado emitido no seu nome, com link verificável.',dep:[]},
{id:'proj1',t:'1º projeto de portfólio publicado e no ar',ty:'cred',d:'2027-04-30',crit:'URL pública funcionando + repositório com README.',dep:[]},
{id:'linkedin',t:'LinkedIn reescrito em inglês + 5 candidaturas enviadas',ty:'cred',d:'2027-05-31',crit:'Perfil em inglês publicado e 5 candidaturas comprovadamente enviadas.',dep:['proj1']},
{id:'interview1',t:'Primeira entrevista técnica feita (mesmo que dê ruim)',ty:'exp',d:'2027-06-30',crit:'Uma entrevista técnica realizada. O resultado é irrelevante.',dep:['linkedin']},
{id:'pullup',t:'Primeira barra fixa completa',ty:'cap',d:'2027-07-31',crit:'Uma repetição completa, queixo acima da barra, sem impulso.',dep:[]},
{id:'meetup',t:'Conversa em inglês com um estrangeiro fora de aula',ty:'exp',d:'2027-09-30',crit:'Uma conversa real (meetup, evento ou online) que não seja com tutor.',dep:['speak10']},
{id:'draw',t:'Um desenho começado e finalizado',ty:'exp',d:'2027-12-31',crit:'Um desenho terminado, fora do caderno de rascunho.',dep:[]},
{id:'ielts',t:'IELTS Academic feito com a banda exigida',ty:'cred',d:'2028-02-28',crit:'Relatório oficial (TRF) com a banda mínima da escola escolhida.',dep:['speak10','costs']},
{id:'trip',t:'Uma viagem ou coisa que você queria e nunca fez',ty:'exp',d:'2028-03-31',crit:'Feito. Você sabe qual é.',dep:[]},
{id:'apps3',t:'3 escolas escolhidas e aplicações enviadas',ty:'cred',d:'2028-03-31',crit:'3 aplicações submetidas, com número de protocolo de cada uma.',dep:['ielts','costs']},
{id:'job',t:'Emprego novo assinado (nacional ou remoto internacional)',ty:'cred',d:'2028-03-31',crit:'Contrato assinado.',dep:['interview1','proj1']},
{id:'proj23',t:'2º e 3º projeto de portfólio no ar',ty:'cred',d:'2028-06-30',crit:'Duas URLs públicas funcionando.',dep:['proj1']},
{id:'accept',t:'Carta de aceite na mão',ty:'cred',d:'2028-06-30',crit:'Offer letter da escola, no seu nome.',dep:['apps3']},
{id:'favplace',t:'Visitar um lugar do Brasil que você quer ver antes de sair',ty:'exp',d:'2028-06-30',crit:'Você foi.',dep:[]},
{id:'funds',t:'Fundos comprovados',ty:'cred',d:'2028-07-15',crit:'Extrato com o valor exigido pelo visto, no seu nome.',dep:['accept']},
{id:'visa',t:'Visto aprovado',ty:'cred',d:'2028-08-10',crit:'Visto emitido.',dep:['accept','funds']},
{id:'ticket',t:'Passagem comprada',ty:'cred',d:'2028-08-20',crit:'Bilhete emitido.',dep:['visa']},
{id:'dogs',t:'Casa e cachorros resolvidos',ty:'cred',d:'2028-08-25',crit:'Moradia inicial reservada + documentação dos cães completa.',dep:['visa']},
{id:'firstday',t:'Primeiro dia de aula na Irlanda',ty:'exp',d:'2028-09-30',crit:'Você entrou na sala.',dep:['visa','ticket']},
{id:'explore',t:'Primeiro fim de semana explorando a Irlanda',ty:'exp',d:'2028-12-31',crit:'Você saiu da cidade onde mora.',dep:['firstday']},
{id:'local',t:'Conversa longa com um local, fora do ambiente acadêmico',ty:'exp',d:'2029-03-31',crit:'30+ minutos, em inglês, com alguém de lá.',dep:['firstday']},
{id:'europe',t:'Primeira viagem dentro da Europa',ty:'exp',d:'2029-06-30',crit:'Você foi a outro país.',dep:['firstday']}
];
var MSTYPE={cap:{n:'Capacidade',c:'--sage'},cred:{n:'Credencial',c:'--blue'},exp:{n:'Experiência',c:'--accent'}};
var QUARTERS=['2026Q3','2026Q4','2027Q1','2027Q2','2027Q3','2027Q4','2028Q1','2028Q2','2028Q3','2028Q4','2029Q1','2029Q2'];
var QLABEL={'2026Q3':'ago–set 26','2026Q4':'out–dez 26','2027Q1':'jan–mar 27','2027Q2':'abr–jun 27','2027Q3':'jul–set 27','2027Q4':'out–dez 27','2028Q1':'jan–mar 28','2028Q2':'abr–jun 28','2028Q3':'jul–set 28','2028Q4':'out–dez 28','2029Q1':'jan–mar 29','2029Q2':'abr–jun 29'};
var JPHASES=[
{n:'Fase 1 — Fundação e credencial',d:'ago/2026 → jul/2027',c:'--sage',qs:['2026Q3','2026Q4','2027Q1','2027Q2']},
{n:'Fase 2 — Prova e aplicação',d:'ago/2027 → jul/2028',c:'--blue',qs:['2027Q3','2027Q4','2028Q1','2028Q2']},
{n:'Fase 3 — Saída e chegada',d:'ago/2028 → jun/2029',c:'--accent',qs:['2028Q3','2028Q4','2029Q1','2029Q2']}
];
var PROTO={
calistenia:{title:'Calistenia',color:'--sage',
steps:[['5min','<b>Aquecimento</b> — mobilidade articular + 2min de polichinelos.'],['18min','<b>Treino do dia</b> do programa de 12 semanas. Forma acima de repetições.'],['2min','<b>Registre</b> séries e reps.']],
metodo:'Sobrecarga progressiva, 3x/semana.',porque:'Base de energia do sistema. Sem corpo funcionando, os blocos da noite não se sustentam.',
recursos:['Programa de 12 semanas','Caderno de registro'],sucesso:'Treino completo com boa forma + progressão anotada.',revisao:'A cada semana, aumente reps ou dificuldade.'},
caminhada:{title:'Caminhada (descanso ativo)',color:'--sage',
steps:[['15–20min','<b>Ande</b> depois de comer, sem pressa e sem fone de estudo. É pausa, não treino.']],
metodo:'Descanso ativo + luz natural.',porque:'Cai bem justamente na quinta, dia sem calistenia: movimenta o corpo, ajuda a digestão e melhora a energia da tarde sem gastar disciplina.',
recursos:['Nada além de sapato confortável'],sucesso:'Você andou 15min.',revisao:'—'},
en_write:{title:'Inglês — Escrita',color:'--flag',
steps:[['2min','<b>Anki</b> — revise os cards de erro anteriores.'],['13min','<b>Escreva ~150 palavras</b> direto em inglês, sem traduzir do português.'],['5min','<b>Revise</b> no Grammarly/LanguageTool. Cada correção vira um card.']],
metodo:'Output ativo + recuperação espaçada dos próprios erros.',porque:'Você é C2 na compreensão — gramática e listening seriam desperdício. O gargalo é produção, e escrever força construção ativa de frases.',
recursos:['Grammarly ou LanguageTool','Anki'],sucesso:'~150 palavras sem traduzir + 3 correções viradas em cards.',revisao:'Os cards voltam sozinhos no Anki.'},
en_speak:{title:'Inglês — Fala',color:'--flag',
steps:[['2min','<b>Anki em voz alta</b> — responda falando.'],['8min','<b>Shadowing</b>: 1–2min de áudio nativo, repetido por cima 3–4x.'],['10min','<b>Monólogo gravado</b>: ~5min falando sozinho. Ouça e anote 2 pontos.']],
metodo:'Shadowing + fala privada + auto-avaliação por gravação.',porque:'Sua barreira é vergonha, não conhecimento. Falar sozinho e gravar remove a plateia: constrói fluência sem julgamento.',
recursos:['Podcasts / YouTube / séries','Gravador do celular','Anki'],sucesso:'Shadowing 3–4x + 5min gravados + 2 pontos anotados.',revisao:'Os 2 pontos viram foco do shadowing seguinte.'},
en_tutor:{title:'Inglês — Tutor 1:1',color:'--flag',
steps:[['5min','<b>Prepare</b> 3 temas.'],['40min','<b>Sessão</b> só em inglês. Peça correções anotadas ao final.'],['5min','<b>Transforme</b> as correções em cards.']],
metodo:'Prática deliberada com feedback + exposição real.',porque:'Falar com pessoa real é o que mata a vergonha de vez, e feedback direcionado acelera muito mais que praticar sozinho.',
recursos:['italki ou Cambly','Lista de temas','Anki'],sucesso:'40min inteiros em inglês + correções viradas em cards.',revisao:'As correções direcionam a semana.'},
roadmap:{title:'Programação — Estudo + Build',color:'--accent',
steps:[['5min','<b>Recuperação</b>: sem olhar, explique em voz alta a última sessão.'],['40min','<b>Estude o tópico atual da sua trilha no roadmap.sh sempre construindo</b> — código para cada conceito.'],['5min','micro-pausa.'],['35min','<b>Aplique no projeto</b>: uma feature usando o que aprendeu.'],['5min','<b>Feche</b> anotando o que dominou e o que ficou confuso.']],
metodo:'Aprender construindo + active recall + espaçamento. IA como copiloto, nunca gerador.',porque:'Roadmap vira maratona de tutorial se você só assiste. Construir a cada conceito é retenção ativa e gera portfólio pelo mesmo tempo.',
recursos:['roadmap.sh — sua trilha atual','Documentação oficial','Seu GitHub'],sucesso:'Código funcionando + 1 feature + commit.',revisao:'Conceitos difíceis viram cards.'},
cs50:{title:'CS50',color:'--blue',
steps:[['5min','<b>Recall</b> do último pset em voz alta.'],['35min','<b>Aula da semana</b> — em velocidade maior, pulando o que já domina.'],['5min','pausa.'],['40min','<b>Problem set</b> — é aqui que está o valor.'],['5min','Anote onde parou.']],
metodo:'Prática ativa via psets + espaçamento.',porque:'Para você o CS50 vale pelo certificado, não pelo conteúdo. É sprint: acelere as aulas, concentre esforço nos psets.',
recursos:['cs50.harvard.edu','CS50.dev'],sucesso:'Aula vista + progresso concreto no pset.',revisao:'Cada pset revisita o anterior.'},
cs50_light:{title:'CS50 — vídeo ou leitura leve',color:'--blue',
steps:[['20min','<b>Assista a aula ou leia o material</b> da semana atual do CS50. Só consumo — o pset fica para a noite.']],
metodo:'Fragmentação: consumo agora, prática depois.',porque:'Almoço não dá para pset (exige foco longo e ambiente), mas dá perfeitamente para a aula. Assim a sexta à noite fica livre para carreira sem o CS50 travar.',
recursos:['cs50.harvard.edu','YouTube'],sucesso:'Você avançou na aula da semana.',revisao:'O pset correspondente entra no domingo.'},
dsa:{title:'DSA — Preparação de entrevista',color:'--sage',
steps:[['10min','<b>Revise 1 padrão</b> e recite a ideia central sem olhar.'],['35min','<b>Resolva 1–2 problemas</b>. Tente 20min sozinho antes de ver a solução.'],['10min','Se olhou, feche e <b>reimplemente do zero</b>.'],['5min','Registre na <b>planilha de revisão</b> (3, 7 e 21 dias).']],
metodo:'Padrões + dificuldade desejável + repetição espaçada.',porque:'Entrevista técnica é reconhecimento de padrões. Tentar antes de ver a resposta é o que fixa o aprendizado.',
recursos:['NeetCode 150','LeetCode','Blind 75'],sucesso:'1–2 problemas resolvidos E reimplementáveis sem olhar.',revisao:'Planilha espaçada 3/7/21.'},
carreira:{title:'Carreira — Aplicações & Presença',color:'--accent',
steps:[['15min','<b>Aplique para 2–3 vagas</b> — BR e remoto internacional. Personalize 1 linha.'],['15min','<b>Melhore 1 seção</b> do LinkedIn/CV ou publique 1 post do que construiu.'],['15min','<b>1 pergunta comportamental em inglês</b>, gravada no método STAR.'],['15min','<b>Acompanhe</b> o funil de candidaturas.']],
metodo:'Ação constante + prova social + integração entrevista/inglês.',porque:'Emprego remoto internacional é o maior atalho do plano: adianta dinheiro e imigração juntos. Entrevista se aprende entrevistando.',
recursos:['LinkedIn, Landing.jobs, RemoteOK, Wellfound, Otta','Método STAR'],sucesso:'2–3 aplicações + 1 melhoria + 1 resposta STAR gravada.',revisao:'Ajuste CV pelo feedback.'},
leitura:{title:'Leitura (descompressão)',color:'--ink-dim',
steps:[['15–20min','<b>Leia</b> longe de telas brilhantes. Sem meta de páginas.']],
metodo:'Hábito de baixo atrito + higiene de sono.',porque:'Camada de prazer, sem cobrança. Ajuda a desligar e protege o sono.',
recursos:['Livro físico ou e-reader'],sucesso:'Leu ~15min.',revisao:'—'},
sono:{title:'Desligar e dormir',color:'--sage',
steps:[['22:40','<b>Desligue as telas</b>, celular fora do quarto.'],['23:00','<b>Dormir.</b> ~7h30 até as 06:30.'],['—','<b>Cochilo</b>: no máximo 15–20min. Longo quebra a noite.']],
metodo:'Horário regular + higiene de sono.',porque:'Maior retorno do sistema. Seu ciclo hoje (irregular → cansaço → cochilo → dormir tarde) é o que drena as noites.',
recursos:['Alarme fixo 06:30'],sucesso:'Telas off 22:40, cama ~23:00.',revisao:'Compare dias com e sem cochilo.'},
review:{title:'Revisão Semanal',color:'--accent',
steps:[['7min','<b>Revise a semana</b>: feito, travado, por quê.'],['7min','<b>Cheque trilhas e marcos</b> + poupança.'],['6min','<b>Ajuste a semana seguinte</b> e reconheça 1 vitória.']],
metodo:'Ciclo de revisão estruturada.',porque:'Sistema sem revisão vira documento esquecido.',
recursos:['Este documento'],sucesso:'Semana revisada e próxima ajustada.',revisao:'—'}
};
var WEEK={
1:{note:'',lunch:null,night:[{t:'calistenia',s:'20:00',d:'25min'},{t:'en_write',s:'20:30',d:'20min'},{t:'roadmap',s:'20:55',d:'60min'},{t:'leitura',s:'22:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]},
2:{note:'',lunch:{t:'en_write',s:'12:30',d:'20min',label:'Inglês — escrita (almoço)'},night:[{t:'en_speak',s:'20:00',d:'20min'},{t:'cs50',s:'20:25',d:'90min',track:'cs50'},{t:'leitura',s:'22:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]},
3:{note:'',lunch:null,night:[{t:'calistenia',s:'20:00',d:'25min'},{t:'en_write',s:'20:30',d:'20min'},{t:'roadmap',s:'20:55',d:'60min'},{t:'leitura',s:'22:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]},
4:{note:'',lunch:{t:'caminhada',s:'12:30',d:'15–20min'},night:[{t:'en_speak',s:'20:00',d:'20min'},{t:'cs50',s:'20:25',d:'90min',track:'cs50'},{t:'leitura',s:'22:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]},
5:{note:'Fecha a semana. Depois do bloco de carreira, a noite é sua — sem culpa.',lunch:{t:'cs50_light',s:'12:30',d:'20min'},night:[{t:'calistenia',s:'20:00',d:'25min'},{t:'en_speak',s:'20:30',d:'20min',label:'Inglês — fala (tema leve)'},{t:'carreira',s:'20:55',d:'60min',track:'portfolio'},{t:'leitura',s:'22:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]},
6:{note:'Manhã é o bloco pesado. Tarde: marmita + faxina (~3h), passeio com os cães, desenho ou leitura.',lunch:null,night:[{t:'roadmap',s:'09:00',d:'2h',label:'Deep work — projeto de portfólio',track:'portfolio'},{t:'dsa',s:'11:15',d:'60min',track:'dsa'},{t:'leitura',s:'livre',d:'—'},{t:'sono',s:'23:00',d:'—'}]},
0:{note:'Manhã de inglês + CS50. Tarde livre. No 1º domingo do mês, +30min para investimentos.',lunch:null,night:[{t:'en_tutor',s:'09:00',d:'50min',track:'ingles'},{t:'en_write',s:'10:05',d:'30min',label:'Inglês — escrita longa'},{t:'cs50',s:'10:45',d:'60min',track:'cs50',label:'CS50 — pset'},{t:'review',s:'20:00',d:'20min'},{t:'sono',s:'22:40',d:'—'}]}
};
var REDUCED_BLOCKS=[{t:'sono',s:'22:40',d:'—'},{t:'en_speak',s:'20:00',d:'10min',label:'Inglês — 10min mínimo'},{t:'leitura',s:'flex',d:'15min'}];
var DAYS=[{n:1,ab:'Seg',f:'segunda-feira'},{n:2,ab:'Ter',f:'terça-feira'},{n:3,ab:'Qua',f:'quarta-feira'},{n:4,ab:'Qui',f:'quinta-feira'},{n:5,ab:'Sex',f:'sexta-feira'},{n:6,ab:'Sáb',f:'sábado'},{n:0,ab:'Dom',f:'domingo'}];
var MONTH_NAMES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var MONTH_AB=['J','F','M','A','M','J','J','A','S','O','N','D'];
var MCQ=[
{id:'energia',q:'Como foi sua energia neste mês?',o:['Alta','Oscilou','Baixa','Esgotado']},
{id:'travou',q:'O que mais travou?',o:['Cansaço físico','Fuga para o celular','Falta de tempo','Nada travou muito']},
{id:'ajuste',q:'O que ajustar no mês que vem?',o:['Manter como está','Reduzir a carga','Trocar o horário dos blocos','Mudar o foco de área']}
];
var VIEWS=[{id:'hoje',n:'Hoje',q:'o que eu faço agora?'},{id:'semana',n:'Semana',q:'estou mantendo o ritmo?'},{id:'mes',n:'Mês',q:'o mês foi bom?'},{id:'ano',n:'Ano',q:'estou saindo do lugar?'},{id:'jornada',n:'Jornada',q:'onde estou na jornada?'}];
var PLANO=[
{area:'Inglês',color:'--flag',freq:'diário + 50min domingo',acoes:['Escrita de ~150 palavras com revisão e cards (seg/qua/ter-almoço)','Shadowing + monólogo gravado (ter/qui/sex)','Tutor 1:1 semanal no domingo','Anki todo dia com os próprios erros','Simulados IELTS a partir de 2027','Lazer em inglês com legenda em inglês']},
{area:'Programação',color:'--accent',freq:'~5h/semana',acoes:['Trilha do roadmap.sh construindo código a cada conceito','CS50 como sprint de certificado','DSA por padrões com revisão espaçada','Deep work no projeto no sábado','Commit em toda sessão']},
{area:'Carreira',color:'--accent',freq:'1h/semana (sexta)',acoes:['2–3 candidaturas por semana (BR + remoto internacional)','LinkedIn em inglês e posts de progresso','Respostas STAR gravadas em inglês','Funil de candidaturas atualizado']},
{area:'Saúde & Energia',color:'--sage',freq:'diário / 3x semana',acoes:['Dormir ~23:00, acordar 06:30','Cochilo no máximo 15–20min','Calistenia 3x/semana + caminhada no almoço de quinta','Marmitas no fim de semana']},
{area:'Finanças',color:'--blue',freq:'mensal',acoes:['R$2.500/mês automático no dia do salário','Investimentos 30min no 1º domingo do mês','SinPro virando receita recorrente com os primos']},
{area:'Intercâmbio',color:'--flag',freq:'por fase',acoes:['Agora: passaporte + planilha de custos reais','2027: escolher escolas e levantar exigências','2028: aplicações, aceite, fundos, visto','Cães: iniciar documentação 6+ meses antes']},
{area:'Vida & Prazer',color:'--ink-dim',freq:'livre',acoes:['Leitura antes de dormir','Desenho no fim de semana','Passeio com os cães','Um marco de experiência por trimestre — obrigatório']}
];
var DEPS=[
{chain:['Sono regular','Energia','Todos os hábitos'],note:'A raiz. Se o sono não estabilizar, os blocos da noite não se sustentam.',b:true},
{chain:['Output diário','Tutor','Gravar 10min sem travar','IELTS','Aplicações','Aceite','Visto'],note:'A cadeia mais longa do plano — começa hoje. Sendo C2 na compreensão, reading e listening puxam sua média; o trabalho real é speaking e writing.',b:true},
{chain:['Carta de aceite','Fundos','Visto','Passagem'],note:'Bloqueante absoluto: fundos e seguro só fazem sentido depois do aceite. Não antecipe.',b:true},
{chain:['Passaporte válido','Visto'],note:'Maior tempo de espera e o único item urgente hoje.',b:true},
{chain:['CS50 + Portfólio + DSA','Entrevistas','Emprego novo'],note:'Três frentes convergindo. Aplicar cedo acelera, porque entrevista se aprende entrevistando.',b:false},
{chain:['SinPro','Renda recorrente','Fundos comprovados'],note:'Roda no expediente, não compete com o tempo pessoal — mas é o que torna a conta viável.',b:false}
];
var METHODS=[
['Prática espaçada','Doses pequenas ao longo do tempo batem sessões longas concentradas. Por isso inglês e código aparecem quase todo dia, em blocos curtos.'],
['Recuperação ativa','Recuperar da memória retém cerca do dobro de reler. Todo bloco começa com "explique sem olhar".'],
['Interleaving','Alternar focos na semana gera aprendizado mais durável que repetir o mesmo bloco todos os dias.'],
['Aprender construindo','Código a cada conceito, em vez de tutorial: retenção ativa e portfólio pelo mesmo tempo.'],
['Output de baixo risco','Como você já entende tudo, o ganho está em produzir. Falar sozinho e gravar remove a plateia.'],
['Dificuldade desejável','Tentar antes de ver a resposta parece pior e é melhor: o esforço de recuperação é o que fixa.'],
['Fragmentação','O almoço recebe o que cabe em 20min de baixo foco (consumo, escrita curta, caminhada); a noite recebe o que exige foco longo.']
];
var ANTIPROC=[
['Intenção de implementação','"Depois de [jantar], eu faço [inglês] na [mesa]." Hora e lugar decididos de antemão eliminam a negociação interna.'],
['Empilhamento de hábitos','Ancore o novo no que já existe: depois do jantar → inglês; depois do café de sábado → deep work.'],
['Design de fricção','Celular em outro cômodo. A tarefa do dia já está decidida aqui.'],
['Regra dos 2 minutos','Comprometa-se só a começar por 2 minutos.'],
['Modo reduzido','Semana atípica declarada com antecedência não é falha, é planejamento. Ative e a estatística não te pune.'],
['Marco de experiência trimestral','Recompensa a cada 3 meses, não só em 2029. Você faz isso sozinho — a jornada precisa valer a pena no caminho.'],
['Progresso público','Postar avanços cobra você publicamente e constrói o perfil ao mesmo tempo.']
];
var DECISOES=[
['Streak só até a visão semanal','Diária e semanal mostram corrente e sequência. <b>Mensal mostra percentual, anual mostra marcos.</b> Streak em escala de ano só destaca as quebras — mede o que te desmotiva em vez do que você construiu.'],
['Cada visão responde uma pergunta diferente','Sem isso as cinco viram a mesma tabela em zooms diferentes. Diária: o que faço agora. Semanal: mantive o ritmo. Mensal: o mês foi bom. Anual: saí do lugar. Jornada: onde estou.'],
['Contagem regressiva só para o próximo marco','Nunca para a data da Irlanda. Faltar 34 meses desmotiva; faltar 5 semanas move.'],
['Fechamento de mês em múltipla escolha','Sem campo de texto livre: você não tem hábito de escrever, e bloco que depende disso morre. Três toques e o mês está fechado.'],
['Modo reduzido é parte do sistema, não exceção','Semanas atípicas existem. Declarada com antecedência, a semana sai do denominador das estatísticas e aparece marcada — em vez de virar uma falha que quebra a motivação.'],
['Almoço: uma atividade, no máximo 3 dias','O almoço é sua única pausa real. Cada atividade tapa o buraco da noite daquele dia: escrita na terça (noite sem escrita), caminhada na quinta (dia sem calistenia), CS50 leve na sexta (noite de carreira). Seg e qua ficam livres — são as noites mais cheias.'],
['Marcos precisam de critério binário','"Ser fluente" não é marco. "Gravar 10 min falando sem travar" é: ou você tem a gravação ou não tem. Todo marco aqui depende só de você.'],
['Datas derivam do intake de set/2028','Aceite até jun/2028, visto e passagem no meio do ano, aula em setembro. O plano B de jan/2029 usa a mesma cadeia deslocada — e a Fase 3 cobre as duas.']
];
var PLAN_CTX='Abel, dev full-stack (eng. computação), Brasil. Objetivo: emigrar para a Irlanda via curso nível 9 (PgDip/mestrado), intake alvo setembro/2028 com plano B janeiro/2029, usando o Stamp 1G de 24 meses. Rotina: janela do almoço (~20min, máx 3 dias/semana) e janela da noite 20:00-22:40 (chega 19h, dorme ~23h). Inglês: C2 na compreensão, gargalo é produção e vergonha de falar. CS50 pelo certificado. DSA para entrevistas. Poupança R$2.500/mês. SinPro roda no expediente. Mora sozinho, tem cachorros, nunca sustentou hábitos antes — consistência é o maior risco. Tem modo reduzido para semanas atípicas e um marco de experiência obrigatório por trimestre.';
var CHECKS=[
{id:'docs',name:'Documentos — por fase',color:'--flag',items:[
['Conferir validade do passaporte','AGORA — renove se vence antes de 2030'],['Planilha de custos reais (curso, visto, vida)','set/2026'],
['Pesquisar programas nível 9 e exigências','2027'],['Histórico escolar e diploma em mãos','2027–2028'],
['Traduções juramentadas para o inglês','2027–2028'],['Personal statement / carta de motivação','2027–2028'],
['Cartas de recomendação','2027–2028'],['Aplicações submetidas (3 escolas)','até mar/2028'],
['Carta de aceite recebida','até jun/2028'],['Comprovação de fundos','jul/2028'],
['Seguro-saúde privado','jul/2028'],['Pedido de visto submetido','jul–ago/2028'],
['Documentação dos cães (microchip, antirrábica, exames)','iniciar 6+ meses antes']]},
{id:'fin',name:'Financeiro — marcos de poupança',color:'--blue',items:[
['R$2.500/mês automatizado','configurar uma vez'],['R$12.500 acumulados','~dez/2026'],
['R$25.000 acumulados','~jun/2027'],['R$42.000 acumulados','~dez/2027'],
['R$60.000 acumulados','~ago/2028'],['SinPro gerando receita recorrente','a alavanca que fecha a conta'],
['Pesquisar bolsas (Government of Ireland Scholarship)','2027']]}
];
