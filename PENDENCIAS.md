# Pendências

O que ficou aberto, com o arquivo e a razão. Lista de trabalho, não
documentação — quando um item sair, tire daqui.

Ordem: primeiro o que está errado hoje, depois o que ficou pela metade, depois
o que foi decidido e não construído.

## Defeitos

**1. A corrente mede o oposto do esforço.** `typeStreak` (`lib/derive.ts`)
conta dias de calendário seguidos. Calistenia só existe seg/qua/sex e CS50
ter/qui/dom, então cumprir o plano à risca por dois meses mostra "1 seguido".
Deveria contar **dias agendados** seguidos, pulando os dias em que o bloco não
existe na `WEEK`.

**2. A corrente de 21 dias pinta dia não-agendado como falha.**
`components/views/Semana.tsx`. Para calistenia, o cenário perfeito acende 9 de
21 quadrados. Precisa de três estados: feito · agendado-e-perdido ·
não-agendado.

**3. Não dá para marcar ontem.** `components/Task.tsx` desabilita a caixa fora
do dia de hoje, e o `DayDetail` do mês é só leitura. Esqueceu de marcar à
noite e o dado some para sempre — a taxa mensal mente e a corrente quebra sem
motivo. Marcação retroativa de ~3 dias resolve sem virar autoengano.

**4. A semana pode passar de 100%.** `components/views/Semana.tsx`: `did`
conta as chaves do log do dia contra o `exp` da rotina de hoje. Se a rotina
mudou desde então, a conta estoura.

**5. O manifesto ainda está na paleta antiga.** `public/site.webmanifest` usa
`#0D1B2A` em `background_color` e `theme_color`, enquanto `app/layout.tsx` já
usa `#ffffff` / `#111318`. Instalado no celular, abre com a cor errada.

**6. Não abre offline.** Não há service worker. O `localStorage` guarda o
progresso, mas a página é servida sob sessão a cada visita: sem rede, não
abre. O README não promete mais isso — mas a promessa continua fazendo
sentido, e é o caso de uso do celular no trajeto.

**7. `lib/derive.ts` não tem teste.** `state`, `merge`, `curriculum` e `ritmo`
têm. É `derive` que produz todo número que aparece na tela.

**8. Nada foi verificado visualmente.** A visão Estudar e a caixa de tema
dentro do bloco passaram por tipos, build e teste, nunca por um olho. A árvore
aninhada no celular é onde eu apostaria num ajuste de espaçamento.

## Pela metade

**9. O bloco `roadmap` não sabe onde você está.** O roadmap.sh ficou fora da
árvore de propósito (ele já traz conteúdo e ordem). Mas o bloco continua sem
registrar **qual** roadmap está em curso nem **onde parou** — que é a metade
que o site poderia guardar sem duplicar nada.

**10. O ritmo do DSA é otimista.** A árvore de algoritmos ensina os ~18
padrões (65h). Não contém os ~150 problemas de treino em cima deles (~100h),
que é o que a entrevista cobra de fato. `Trilha.fecha: false` avisa que
concluir não basta, mas o número projetado ignora esse volume.

**11. Trilha de prática não tem medida.** Inglês e corpo melhoram por
repetição, não por horas de conteúdo. Hoje `fecha: false` sinaliza isso em
texto; nada mede o volume (minutos falados, palavras escritas, séries feitas).

**12. `TRACKS` e a árvore convivem.** A caixa de foco dentro do bloco já vem
da árvore, mas a seção Trilhas e o relatório ainda leem `TRACKS`
(`lib/plan.ts`). Duas fontes para a mesma pergunta — decidir qual fica.

## Decidido e não construído

**13. Modo sessão.** Os protocolos em `PROTO` já têm os passos cronometrados
(5min recall, 40min estudo, 5min fecha) e ninguém os executa: é texto parado.
Vira tela cheia com cronômetro, marca o bloco sozinho no fim e passa a medir
**quanto tempo você estuda de verdade** — não quantas vezes clicou numa caixa.

**14. Fila de revisão 3/7/21.** O protocolo do DSA manda registrar numa
planilha que não existe e não vai ser mantida. O "o que ficou confuso" do fim
da sessão (que depende do item 13) vira item com data de retorno, e o primeiro
passo de todo bloco deixa de ser genérico.

**15. A revisão de domingo que contrata a semana.** O bloco `review` existe na
rotina e não tem tela nenhuma. Deveria mostrar o ritmo, fazer as três
perguntas e fechar definindo os temas da semana seguinte — que a visão Hoje
então cobra.

**16. Datas de marco fixas no código.** Adiar um marco exige editar
`lib/plan.ts` e publicar. Em três anos isso vai acontecer dezenas de vezes. Um
`msDate` no estado, sobrepondo o plano, manteria `plan.ts` como a intenção
original e deixaria o site registrar a realidade — inclusive quantas vezes um
marco foi adiado, que é sinal melhor que "atrasado".
