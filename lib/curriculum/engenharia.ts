/**
 * Engenharia e portfólio — o que transforma "sei programar" em "dá para contratar".
 *
 * O bloco `roadmap` da rotina tem duas metades: estudar o tópico atual e
 * aplicá-lo no projeto. A primeira metade NÃO está aqui de propósito — o
 * roadmap.sh já traz o conteúdo detalhado e na ordem, e duplicá-lo aqui só
 * criaria uma segunda versão para manter, pior e desatualizada. Você segue o
 * roadmap escolhido lá, um por vez, do começo ao fim.
 *
 * O que esta trilha cobre é a outra metade — a que nenhum roadmap ensina e a
 * entrevista cobra: qualidade, teste, deploy, operação, e a prova pública
 * disso em três projetos no ar.
 */
import type { Trilha } from './types';

export const ENGENHARIA: Trilha = {
  id: 'eng', t: 'Engenharia e portfólio', tipos: ['roadmap'], cor: '--chart-4', marco: 'proj23',
  nota: 'Um projeto sem teste, sem README e sem deploy não é portfólio — é rascunho público.',
  filhos: [

  { id:'eng.base', t:'Fundamentos de ofício', nota:'O que todo roadmap pressupõe e nenhum ensina direito.', filhos:[

    { id:'eng.base.git', t:'Git além do commit', filhos:[
      { id:'eng.base.git.mod', t:'O modelo de dados do git', min:45,
        nota:'Objetos, árvores, commits, refs. Entender isto acaba com o medo de mexer no histórico.',
        saber:['explicar o que é um commit por dentro','dizer o que uma branch realmente é'] },
      { id:'eng.base.git.hist', t:'Rebase, merge e histórico legível', min:45, pre:['eng.base.git.mod'],
        saber:['quando rebase e quando merge','resolver um conflito sem chutar'] },
      { id:'eng.base.git.rec', t:'Desfazer: reset, revert, reflog, bisect', min:45, pre:['eng.base.git.hist'],
        saber:['recuperar commit perdido com reflog','achar o commit que quebrou com bisect'] },
      { id:'eng.base.git.msg', t:'Mensagem de commit e PR que se lê', min:20, pre:['eng.base.git.hist'],
        nota:'Cruza com inglês técnico. É o que o revisor internacional vê primeiro de você.',
        saber:['commit no imperativo, assunto curto, corpo com o porquê','PR com contexto, mudança e risco'] },
    ]},

    { id:'eng.base.cli', t:'Linha de comando e ambiente', filhos:[
      { id:'eng.base.cli.sh', t:'Shell: pipe, redirecionamento, permissões', min:45,
        saber:['encadear grep/sed/awk numa tarefa real','ler e corrigir permissão de arquivo'] },
      { id:'eng.base.cli.proc', t:'Processos, sinais, portas e variáveis de ambiente', min:45, pre:['eng.base.cli.sh'],
        saber:['achar o processo que segura uma porta','saber por que segredo em variável de ambiente e não no código'] },
      { id:'eng.base.cli.net', t:'Rede pela linha de comando', min:45, pre:['eng.base.cli.proc'],
        saber:['diagnosticar com curl, dig, ss','ler cabeçalhos HTTP de uma requisição real'] },
    ]},

    { id:'eng.base.qual', t:'Qualidade de código', filhos:[
      { id:'eng.base.qual.nome', t:'Nomes, funções pequenas e nível de abstração', min:45,
        saber:['refatorar uma função sua de 60 linhas em 4 de 15','manter cada função num nível só de abstração'] },
      { id:'eng.base.qual.erro', t:'Tratamento de erro', min:45, pre:['eng.base.qual.nome'],
        nota:'O que separa código de tutorial de código de produção.',
        saber:['distinguir erro esperado de bug','nunca engolir exceção em silêncio'] },
      { id:'eng.base.qual.lint', t:'Lint, formatador e tipagem estrita', min:20,
        saber:['configurar ESLint + Prettier + TS strict num projeto do zero'] },
      { id:'eng.base.qual.rev', t:'Revisar código (e ser revisado)', min:45, pre:['eng.base.git.msg'],
        saber:['dar 5 comentários úteis num PR alheio','receber crítica sem defender o código'] },
    ]},

    { id:'eng.base.test', t:'Testes', filhos:[
      { id:'eng.base.test.pir', t:'Unidade, integração e ponta a ponta', min:45,
        saber:['dizer o que cada nível cobre e o que custa','saber por que 100% de cobertura não é meta'] },
      { id:'eng.base.test.esc', t:'Escrever um teste que presta', min:45, pre:['eng.base.test.pir'],
        nota:'Arranjar, agir, afirmar. Um teste por comportamento, não por método.',
        saber:['testar comportamento e não implementação','nomear o teste pela regra que ele protege'] },
      { id:'eng.base.test.dub', t:'Dublês: mock, stub, fake, spy', min:45, pre:['eng.base.test.esc'],
        saber:['escolher o dublê certo','saber quando mock demais torna o teste inútil'] },
      { id:'eng.base.test.tdd', t:'TDD e teste de regressão', min:45, pre:['eng.base.test.dub'],
        saber:['escrever o teste que falha antes da correção de um bug real'] },
    ]},
  ]},

  { id:'eng.sis', t:'Sistemas e arquitetura', nota:'O vocabulário que a entrevista de nível médio/sênior cobra.', filhos:[
    { id:'eng.sis.http', t:'HTTP a fundo: métodos, status, cabeçalhos, cache', min:45,
      saber:['idempotência e segurança dos métodos','como o cache HTTP realmente decide'] },
    { id:'eng.sis.api', t:'Projeto de API: REST, versionamento, paginação, erro', min:60, pre:['eng.sis.http'],
      saber:['modelar recursos sem virar RPC disfarçado','padronizar formato de erro e paginação'] },
    { id:'eng.sis.auth', t:'Autenticação e autorização', min:60, pre:['eng.sis.api'],
      nota:'Sessão vs token, OAuth, JWT, hashing de senha. Você já implementou no próprio diário — formalize.',
      saber:['diferença entre autenticação e autorização','por que JWT não é sessão','por que hash de senha precisa ser lento'] },
    { id:'eng.sis.db', t:'Modelagem de dados e consultas', min:60,
      saber:['normalizar e saber quando desnormalizar','ler um plano de execução e criar o índice certo'] },
    { id:'eng.sis.tx', t:'Transações, concorrência e níveis de isolamento', min:60, pre:['eng.sis.db'],
      saber:['os anomalias que cada nível permite','o que é condição de corrida em escrita concorrente'] },
    { id:'eng.sis.cache', t:'Cache: onde, por quanto tempo, e invalidação', min:45, pre:['eng.sis.db'],
      saber:['3 lugares onde cache cabe','a estratégia de invalidação de cada um'] },
    { id:'eng.sis.async', t:'Filas, jobs e processamento assíncrono', min:45, pre:['eng.sis.api'],
      saber:['quando tirar trabalho do caminho da requisição','idempotência de consumidor e nova tentativa'] },
    { id:'eng.sis.esc', t:'Escala: horizontal, estado, balanceamento', min:60, pre:['eng.sis.cache'],
      saber:['por que serviço sem estado escala e com estado não','o que é um ponto único de falha'] },
    { id:'eng.sis.sd', t:'Entrevista de system design', min:60, pre:['eng.sis.esc','eng.sis.async'],
      nota:'Aparece a partir de pleno. Formato fixo: requisitos → estimativa → API → dados → escala → gargalo.',
      saber:['conduzir um design de 45min sozinho','sempre começar perguntando requisito e escala'] },
  ]},

  { id:'eng.ops', t:'Entregar e operar', nota:'O que faz um projeto estar "no ar" de verdade — critério dos seus marcos de portfólio.', filhos:[
    { id:'eng.ops.cont', t:'Containers e reprodutibilidade', min:60,
      saber:['escrever um Dockerfile enxuto','explicar a diferença entre imagem e contêiner'] },
    { id:'eng.ops.ci', t:'CI: lint, teste e build a cada push', min:45, pre:['eng.base.test.esc'],
      saber:['pipeline que barra merge com teste vermelho'] },
    { id:'eng.ops.cd', t:'Deploy, variáveis de ambiente e rollback', min:45, pre:['eng.ops.ci'],
      saber:['deploy automático a partir da branch principal','saber como voltar atrás em 1 comando'] },
    { id:'eng.ops.obs', t:'Log, métrica e erro em produção', min:45, pre:['eng.ops.cd'],
      saber:['log estruturado com nível','saber em quanto tempo você descobre que quebrou'] },
    { id:'eng.ops.sec', t:'Segurança do básico ao suficiente', min:60, pre:['eng.sis.auth'],
      nota:'Injeção, XSS, CSRF, segredo vazado, dependência vulnerável.',
      saber:['citar o top 5 do OWASP e a defesa de cada','nunca ter segredo no repositório'] },
    { id:'eng.ops.perf', t:'Medir antes de otimizar', min:45, pre:['eng.ops.obs'],
      saber:['achar o gargalo com medição, não com palpite'] },
  ]},

  { id:'eng.proj', t:'Os três projetos', nota:'O portfólio é o argumento. Cada projeto tem um papel diferente — não faça três vezes o mesmo.', filhos:[

    { id:'eng.proj.p1', t:'Projeto 1 — pequeno, resolve um problema real', marco:'proj1', nota:'Alvo: abr/2027. Pequeno de propósito: o valor é estar no ar e ser seu.', filhos:[
      { id:'eng.proj.p1.esc', t:'Escopo e problema', min:60,
        saber:['problema que VOCÊ tem','escopo entregável em 3 semanas de sábado'] },
      { id:'eng.proj.p1.b', t:'Construir o núcleo', min:120, pre:['eng.proj.p1.esc'],
        saber:['caminho principal funcionando'] },
      { id:'eng.proj.p1.t', t:'Testes do caminho crítico', min:120, pre:['eng.proj.p1.b','eng.base.test.esc'],
        saber:['os 5 comportamentos essenciais cobertos'] },
      { id:'eng.proj.p1.d', t:'Deploy público', min:120, pre:['eng.proj.p1.t','eng.ops.cd'],
        saber:['URL pública funcionando para um estranho'] },
      { id:'eng.proj.p1.r', t:'README e captura de tela', min:60, pre:['eng.proj.p1.d'],
        nota:'Em inglês. Cruza com a trilha de escrita técnica.',
        saber:['o que é, como rodar, por que as escolhas','imagem ou GIF na primeira dobra'] },
    ]},

    { id:'eng.proj.p2', t:'Projeto 2 — médio, com testes e documentação', nota:'Alvo: jun/2028. Aqui a engenharia é o produto: o revisor vem olhar o código.', filhos:[
      { id:'eng.proj.p2.esc', t:'Escopo e decisões de arquitetura', min:60, pre:['eng.proj.p1.r','eng.sis.api'],
        saber:['3 decisões registradas por escrito, com alternativa descartada'] },
      { id:'eng.proj.p2.b1', t:'Construir — domínio e API', min:120, pre:['eng.proj.p2.esc'],
        saber:['API modelada antes do código'] },
      { id:'eng.proj.p2.b2', t:'Construir — persistência e migração', min:120, pre:['eng.proj.p2.b1','eng.sis.db'],
        saber:['migração versionada, não schema na mão'] },
      { id:'eng.proj.p2.t', t:'Suíte de testes em dois níveis', min:120, pre:['eng.proj.p2.b2','eng.base.test.dub'],
        saber:['unidade + integração rodando no CI'] },
      { id:'eng.proj.p2.ci', t:'CI e deploy', min:120, pre:['eng.proj.p2.t','eng.ops.ci'],
        saber:['pipeline verde obrigatório para merge'] },
      { id:'eng.proj.p2.doc', t:'Documentação de verdade', min:60, pre:['eng.proj.p2.ci'],
        saber:['README + doc de API + registro de decisões'] },
    ]},

    { id:'eng.proj.p3', t:'Projeto 3 — com deploy, operação e público', nota:'Alvo: jun/2028. O que prova que você opera, não só constrói.', filhos:[
      { id:'eng.proj.p3.esc', t:'Escopo e requisitos não-funcionais', min:60, pre:['eng.proj.p2.doc'],
        saber:['definiu alvo de disponibilidade e de tempo de resposta'] },
      { id:'eng.proj.p3.b', t:'Construir', min:120, pre:['eng.proj.p3.esc'],
        saber:['funcional ponta a ponta'] },
      { id:'eng.proj.p3.obs', t:'Observabilidade e alerta', min:120, pre:['eng.proj.p3.b','eng.ops.obs'],
        saber:['você descobre que caiu sem um usuário avisar'] },
      { id:'eng.proj.p3.sec', t:'Revisão de segurança', min:120, pre:['eng.proj.p3.obs','eng.ops.sec'],
        saber:['top 5 OWASP verificado item a item'] },
      { id:'eng.proj.p3.pub', t:'Publicar e pedir feedback real', min:60, pre:['eng.proj.p3.sec'],
        nota:'Cruza com carreira: progresso público cobra você e constrói o perfil.',
        saber:['publicado com post em inglês','pelo menos 1 retorno de estranho'] },
    ]},
  ]},
]};

