/* ---------------------------------------------------------------------------
   app.js — LÓGICA (estado, cálculo de progresso, render das views)
   Lê os dados globais definidos em data.js. Sem dependências, sem build.
   --------------------------------------------------------------------------- */
(function(){
/* `t` guarda quando cada chave mudou (caminho -> timestamp). É o que permite
   fundir alterações de dois aparelhos sem perder nada — inclusive desmarcar,
   que apaga a chave mas deixa o carimbo. Ver sync.js. */
var state={day:{},tracks:{},checks:{},ms:{},reduced:{},monthly:{},t:{},view:'hoje'};
var selDay=new Date().getDay(),selMonth=new Date().getMonth(),selYear=new Date().getFullYear(),saveTimer=null,selDetail=null;
function ds(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function today(){return ds(new Date());}
function addDays(d,n){var x=new Date(d.getTime());x.setDate(x.getDate()+n);return x;}
function parseD(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function weekKey(d){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());var dow=(x.getDay()+6)%7;x.setDate(x.getDate()-dow);return ds(x);}
function isReduced(d){return !!state.reduced[weekKey(d)];}
function quarterOf(s){var d=parseD(s);return d.getFullYear()+'Q'+Math.ceil((d.getMonth()+1)/3);}
function curQuarter(){var d=new Date();return d.getFullYear()+'Q'+Math.ceil((d.getMonth()+1)/3);}
function monthKey(y,m){return y+'-'+String(m+1).padStart(2,'0');}
function done(dstr,k){return !!(state.day[dstr]&&state.day[dstr][k]);}
function typeDone(dstr,t){var l=state.day[dstr];if(!l)return false;for(var k in l){if(k.slice(2)===t)return true;}return false;}
function setStatus(t){var el=document.getElementById('status');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show');},1600);}
/* Persistência local: localStorage, sempre — é o que faz o site abrir na hora e
   funcionar offline. Se a sincronização estiver ativa, sync.js leva o mesmo
   estado cifrado para os outros aparelhos; se não, Baixar/Restaurar backup é a
   ponte manual. */
var STORE_KEY='sistema-unificado-v2';
function save(){lsSave(JSON.stringify(state));Sync.push();}
/* Carimba a alteração de uma chave. Os caminhos são os mesmos que sync.js usa
   para fundir: grupo, e depois a chave (ou data + chave). */
function stamp(){state.t[[].slice.call(arguments).join(STATE_SEP)]=Date.now();}
function stampAll(){
var n=Date.now(),g,a,b,i;
for(i=0;i<4;i++){g=['tracks','checks','ms','reduced'][i];for(a in state[g])state.t[g+STATE_SEP+a]=n;}
for(i=0;i<2;i++){g=['day','monthly'][i];for(a in state[g])for(b in state[g][a])state.t[g+STATE_SEP+a+STATE_SEP+b]=n;}
}
function lsSave(j){try{window.localStorage.setItem(STORE_KEY,j);setStatus('salvo ✓');}catch(e){setStatus('não foi possível salvar');}}
function debSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,500);}
function lsLoad(){try{var v=window.localStorage.getItem(STORE_KEY);return v?JSON.parse(v):null;}catch(e){return null;}}
function load(){return Promise.resolve(lsLoad());}
function adopt(d){state={day:d.day||{},tracks:d.tracks||{},checks:d.checks||{},ms:d.ms||{},reduced:d.reduced||{},monthly:d.monthly||{},t:d.t||{},view:d.view||state.view};}
/* Estado que chegou do servidor, já fundido: grava e redesenha, sem reenviar. */
function applyRemote(s){adopt(s);lsSave(JSON.stringify(state));renderAll();}
function exportData(){
var url=URL.createObjectURL(new Blob([JSON.stringify(state)],{type:'application/json'}));
var a=document.createElement('a');a.href=url;a.download='sistema-unificado-'+today()+'.json';
document.body.appendChild(a);a.click();document.body.removeChild(a);
setTimeout(function(){URL.revokeObjectURL(url);},1000);setStatus('backup baixado ✓');
}
function importData(){
var inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';
inp.addEventListener('change',function(){
var f=inp.files&&inp.files[0];if(!f)return;
var rd=new FileReader();
rd.onload=function(){
try{adopt(JSON.parse(rd.result));}catch(e){setStatus('arquivo inválido');return;}
stampAll();save();renderAll();setStatus('backup restaurado ✓');
};
rd.readAsText(f);
});
inp.click();
}
function expectedPerWeek(t){var c=0;for(var d in WEEK){var w=WEEK[d];w.night.forEach(function(b){if(b.t===t)c++;});if(w.lunch&&w.lunch.t===t)c++;}return c;}
function monthStats(y,m){
var last=new Date(y,m+1,0),tdy=new Date();
var count={},countable=0,redDays=0,total=last.getDate();
for(var i=1;i<=total;i++){
var d=new Date(y,m,i);if(d>tdy)continue;
if(isReduced(d)){redDays++;continue;}
countable++;
var log=state.day[ds(d)];if(!log)continue;
for(var k in log){var t=k.slice(2);count[t]=(count[t]||0)+1;}
}
return {count:count,countable:countable,redDays:redDays,total:total};
}
function rateFor(t,st){var per=expectedPerWeek(t);if(!per)return null;var exp=Math.round(per*(st.countable/7));if(exp<1)exp=st.countable>0?1:0;var did=st.count[t]||0;return {did:did,exp:exp,pct:exp?Math.min(100,Math.round(did/exp*100)):0};}
function typeStreak(t){var d=new Date(),s=0;if(!typeDone(ds(d),t))d=addDays(d,-1);while(typeDone(ds(d),t)){s++;d=addDays(d,-1);}return s;}
function msDone(id){return !!state.ms[id];}
function msState(m){
if(msDone(m.id))return {k:'ok',n:'feito'};
var t=parseD(m.d),n=new Date();
if(t<n)return {k:'late',n:'atrasado'};
if(quarterOf(m.d)===curQuarter())return {k:'now',n:'em andamento'};
return {k:'soon',n:'a caminho'};
}
function nextMS(){var p=MS.filter(function(m){return !msDone(m.id);}).sort(function(a,b){return a.d<b.d?-1:1;});return p.length?p[0]:null;}
function blockedBy(m){return (m.dep||[]).filter(function(d){return !msDone(d);});}
function msTitle(id){for(var i=0;i<MS.length;i++)if(MS[i].id===id)return MS[i].t;return id;}
function curTrack(tr){for(var i=0;i<tr.items.length;i++){if(!state.tracks[tr.id+'#'+i])return {i:i,txt:tr.items[i]};}return null;}
function trackById(id){for(var i=0;i<TRACKS.length;i++)if(TRACKS[i].id===id)return TRACKS[i];return null;}
function protoHTML(p){
var h='<ol class="steps">';
p.steps.forEach(function(s){h+='<li><span class="st">'+s[0]+'</span>'+s[1]+'</li>';});
h+='</ol><div class="prow"><span class="k">Método</span>'+p.metodo+'</div>';
h+='<div class="prow why"><span class="k">Por que assim</span>'+p.porque+'</div>';
h+='<div class="prow"><span class="k">Recursos</span><div class="chips">'+p.recursos.map(function(r){return '<span>'+esc(r)+'</span>';}).join('')+'</div></div>';
h+='<div class="success"><b>Concluí quando:</b> '+p.sucesso+'</div>';
if(p.revisao&&p.revisao!=='—')h+='<div class="prow"><span class="k">Revisão</span>'+p.revisao+'</div>';
return h;
}
function taskHTML(b,win,isToday,dstr){
var p=PROTO[b.t],key=win+':'+b.t,dn=isToday&&done(dstr,key);
var h='<div class="task'+(dn?' done':'')+'" style="--tc:var('+p.color+')"><div class="task-top">';
h+=isToday?'<button class="check'+(dn?' done':'')+'" data-a="task" data-k="'+key+'" aria-pressed="'+dn+'">'+(dn?'✓':'')+'</button>':'<button class="check preview" tabindex="-1" aria-hidden="true"></button>';
h+='<div class="tmeta"><div class="tline"><span class="ttime">'+b.s+'</span><span class="tdur">'+b.d+'</span></div><div class="ttitle">'+(b.label||p.title)+'</div>';
if(b.track){var tr=trackById(b.track),c=curTrack(tr);h+='<div class="tfocus"><span class="fl">Foco de hoje</span>'+(c?'<b>'+esc(c.txt)+'</b>':'Trilha concluída ✓')+'</div>';}
h+='</div></div><details class="proto"><summary>Ver protocolo — como executar</summary>'+protoHTML(p)+'</details></div>';
return h;
}
function redBar(){
var wk=weekKey(new Date()),on=!!state.reduced[wk];
var h='<div class="redbar'+(on?' on':'')+'"><div class="rt"><b>'+(on?'Semana reduzida ativa':'Semana normal')+'</b>';
h+=on?'Meta no mínimo viável. Esta semana não conta como falha nas estatísticas.':'Ative para semanas atípicas (viagem, visita, doença). Declarar antes é planejamento, não falha.';
h+='</div><button class="tog'+(on?' on':'')+'" data-a="red" data-k="'+wk+'">'+(on?'ativa ✓':'ativar')+'</button></div>';
return h;
}
function viewHoje(){
var isToday=(selDay===new Date().getDay()),dstr=today(),red=isReduced(new Date())&&isToday;
var day=WEEK[selDay],dn=DAYS.filter(function(x){return x.n===selDay;})[0].f;
var h='<section><div class="eyebrow-row"><span class="idx">01</span><span class="tag">Diária · o que eu faço agora</span></div><h2 class="sec">Hoje</h2>';
h+=redBar();
h+='<div class="daytabs">';
DAYS.forEach(function(d){h+='<button class="daytab'+(d.n===selDay?' sel':'')+(d.n===new Date().getDay()?' istoday':'')+'" data-a="day" data-k="'+d.n+'">'+d.ab+(d.n===new Date().getDay()?'<span class="dd">hoje</span>':'<span class="dd">&nbsp;</span>')+'</button>';});
h+='</div>';
var blocks=red?REDUCED_BLOCKS:day.night, lunch=red?null:day.lunch;
var tot=blocks.length+(lunch?1:0),dcount=0;
if(isToday){blocks.forEach(function(b){if(done(dstr,'n:'+b.t))dcount++;});if(lunch&&done(dstr,'l:'+lunch.t))dcount++;}
h+='<div class="dayhead"><span class="dname">'+(isToday?'Hoje · ':'')+dn+(red?'<span class="redbadge">reduzida</span>':'')+'</span>'+(isToday?'<span class="prog">'+dcount+'/'+tot+' feitos</span>':'<span class="prog" style="color:var(--ink-faint)">pré-visualização</span>')+'</div>';
if(day.note&&!red)h+='<div class="daynote">'+day.note+'</div>';
if(lunch){
h+='<div class="winlabel">Janela do almoço · uma atividade só<span class="ln"></span></div>';
h+=taskHTML(lunch,'l',isToday,dstr);
}else if(!red&&selDay>=1&&selDay<=5){
h+='<div class="winlabel">Janela do almoço<span class="ln"></span></div>';
h+='<div class="card" style="padding:13px 16px;font-size:13px;color:var(--ink-faint)">Livre hoje. O almoço só é usado 3 dias por semana (ter, qui, sex) — é sua única pausa real do dia.</div>';
}
h+='<div class="winlabel">'+(selDay===6||selDay===0?'Janela principal':'Janela da noite · 20:00 → 23:00')+'<span class="ln"></span></div>';
blocks.forEach(function(b){h+=taskHTML(b,'n',isToday,dstr);});
h+='</section>';
return h;
}
function viewSemana(){
var h='<section><div class="eyebrow-row"><span class="idx">02</span><span class="tag">Semanal · estou mantendo o ritmo</span></div><h2 class="sec">Semana</h2>';
h+='<p class="lead">Aqui o streak faz sentido: em escala de dias, a corrente é o que sustenta o hábito.</p>';
h+=redBar();
var wk=weekKey(new Date()),mon=parseD(wk);
h+='<div class="wkgrid">';
for(var i=0;i<7;i++){
var d=addDays(mon,i),dstr=ds(d),isT=dstr===today();
var dd=WEEK[d.getDay()],exp=dd.night.length+(dd.lunch?1:0);
var log=state.day[dstr],did=log?Object.keys(log).length:0;
var pct=exp?Math.round(did/exp*100):0;
h+='<div class="wkcell'+(isT?' today':'')+'"><div class="wd">'+DAYS.filter(function(x){return x.n===d.getDay();})[0].ab+'</div><div class="wn" style="color:'+(did?'var(--sage)':'var(--ink-faint)')+'">'+did+'</div><div class="wpc">'+(d>new Date()?'—':pct+'%')+'</div></div>';
}
h+='</div>';
if(state.reduced[wk])h+='<div class="alerta" style="border-color:var(--violet);background:rgba(224,225,221,.08)"><b style="color:var(--violet)">Semana reduzida.</b> Ela não entra no cálculo mensal — nada aqui conta contra você.</div>';
h+='<h3>Corrente por hábito</h3>';
['sono','en_write','en_speak','calistenia','roadmap','cs50','leitura'].forEach(function(t){
var p=PROTO[t],st=typeStreak(t),per=expectedPerWeek(t),wdid=0;
for(var i=0;i<7;i++){var d=addDays(mon,i);if(d<=new Date()&&typeDone(ds(d),t))wdid++;}
var s='<div class="habrow" style="--tc:var('+p.color+')"><div class="hn"><div class="hname">'+TYPE_LABEL[t]+'</div><div class="hsub">'+wdid+'/'+per+' nesta semana</div><div class="chain">';
for(var j=20;j>=0;j--){var dd=ds(addDays(new Date(),-j));s+='<span class="dot'+(typeDone(dd,t)?' f':'')+'"></span>';}
s+='</div></div><div class="hstk">'+st+'<small>seguidos</small></div></div>';
h+=s;
});
h+='<p class="body" style="font-size:12.5px;color:var(--ink-faint);margin-top:12px">A corrente mostra os últimos 21 dias. Um dia mínimo viável conta como dia cumprido — a corrente não quebra por você ter feito a versão curta.</p>';
h+='</section>';
return h;
}
function dayDetail(){
if(!selDetail)return '<p class="body" style="font-size:12px;color:var(--ink-faint);margin:10px 0 0">Toque em um dia para ver o que foi feito.</p>';
var d=parseD(selDetail),red=isReduced(d),log=state.day[selDetail]||{};
var day=WEEK[d.getDay()],blocks=red?REDUCED_BLOCKS:day.night,lunch=red?null:day.lunch;
var rows=[];
if(lunch)rows.push({w:'l',b:lunch,lab:'almoço'});
blocks.forEach(function(b){rows.push({w:'n',b:b,lab:(d.getDay()===0||d.getDay()===6)?'':'noite'});});
var dn=rows.filter(function(r){return log[r.w+':'+r.b.t];}).length;
var h='<div class="ddet"><div class="dh"><span class="dt">'+d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+(red?'<span class="redbadge">reduzida</span>':'')+'</span>';
h+='<span class="dc">'+dn+'/'+rows.length+' feitos</span><button class="closex" data-a="dayd" data-k="'+selDetail+'">fechar ✕</button></div>';
if(d>new Date()){h+='<p class="empty-note">Dia futuro — nada registrado ainda.</p></div>';return h;}
rows.forEach(function(r){
var ok=!!log[r.w+':'+r.b.t],p=PROTO[r.b.t];
h+='<div class="di '+(ok?'ok':'no')+'"><span class="mk">'+(ok?'✓':'○')+'</span><span>'+(r.b.label||p.title)+'</span>'+(r.lab?'<span class="wtag">'+r.lab+'</span>':'')+'</div>';
});
var extra=Object.keys(log).filter(function(k){return !rows.some(function(r){return r.w+':'+r.b.t===k;});});
extra.forEach(function(k){h+='<div class="di ok"><span class="mk">✓</span><span>'+(TYPE_LABEL[k.slice(2)]||k.slice(2))+'</span><span class="wtag">extra</span></div>';});
h+='</div>';
return h;
}
function msHTML(m){
var s=msState(m),ty=MSTYPE[m.ty],dn=msDone(m.id),bl=blockedBy(m);
var h='<div class="ms'+(dn?' done':'')+'" style="--mc:var('+ty.c+')"><div class="ms-top">';
h+='<button class="msbox'+(dn?' done':'')+'" data-a="ms" data-k="'+m.id+'" aria-pressed="'+dn+'">'+(dn?'✓':'')+'</button>';
h+='<div style="flex:1;min-width:0"><div class="mtitle">'+esc(m.t)+'</div><div class="mrow">';
h+='<span class="mtype">'+ty.n+'</span><span class="mstate '+s.k+'">'+s.n+'</span><span class="mdate">alvo '+parseD(m.d).toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})+'</span></div>';
h+='<div class="mcrit"><span class="k">Critério (binário)</span>'+esc(m.crit)+'</div>';
if(bl.length)h+='<div class="mdep">depende de: <b>'+bl.map(function(x){return esc(msTitle(x));}).join(' · ')+'</b></div>';
h+='</div></div></div>';
return h;
}
function viewMes(){
var st=monthStats(selYear,selMonth),mk=monthKey(selYear,selMonth);
var h='<section><div class="eyebrow-row"><span class="idx">03</span><span class="tag">Mensal · o mês foi bom</span></div><h2 class="sec">Mês</h2>';
h+='<div class="mnav"><button class="arrow" data-a="mprev">←</button><span class="mlabel">'+MONTH_NAMES[selMonth]+' '+selYear+'</span><button class="arrow" data-a="mnext">→</button></div>';
h+='<div class="card"><div class="hmgrid">';
['S','T','Q','Q','S','S','D'].forEach(function(x){h+='<div class="hmhead">'+x+'</div>';});
var first=new Date(selYear,selMonth,1),lead=(first.getDay()+6)%7;
for(var i=0;i<lead;i++)h+='<div class="hmcell empty"></div>';
var lastD=new Date(selYear,selMonth+1,0).getDate();
for(var dnum=1;dnum<=lastD;dnum++){
var d=new Date(selYear,selMonth,dnum),dstr=ds(d),log=state.day[dstr]||{};
var areas={};for(var k in log){areas[areaOf(k.slice(2))]=true;}
var cls='hmcell'+(dstr===today()?' today':'')+(isReduced(d)?' red':'')+(selDetail===dstr?' sel':'');
h+='<button class="'+cls+'" data-a="dayd" data-k="'+dstr+'" aria-pressed="'+(selDetail===dstr)+'"><span class="dn">'+dnum+'</span><span class="hmdots">';
Object.keys(AREAS).forEach(function(a){if(areas[a])h+='<i style="background:var('+AREAS[a].c+')"></i>';});
h+='</span></button>';
}
h+='</div><div class="legend">';
Object.keys(AREAS).forEach(function(a){h+='<span><i style="background:var('+AREAS[a].c+')"></i>'+AREAS[a].n+'</span>';});
h+='<span><i style="background:none;border:1px dashed var(--violet)"></i>reduzida</span></div>';
h+=dayDetail();
h+='</div>';
h+='<h3>Taxa de consistência</h3><div class="card">';
var order=['sono','en_write','en_speak','calistenia','roadmap','cs50','dsa','carreira','leitura','caminhada','en_tutor'],any=false;
order.forEach(function(t){
var r=rateFor(t,st);if(!r||r.exp===0)return;any=true;
var c=r.pct>=80?'--accent':(r.pct>=50?'--ink':'--ink-faint');
h+='<div class="rate" style="--rc:var('+c+')"><span class="rn">'+TYPE_LABEL[t]+'</span><span class="rbar"><i style="width:'+r.pct+'%"></i></span><span class="rv">'+r.did+'/'+r.exp+' · '+r.pct+'%</span></div>';
});
if(!any)h+='<p class="body" style="margin:0;font-size:13px">Sem dados ainda neste mês.</p>';
if(st.redDays)h+='<p class="body" style="margin:10px 0 0;font-size:12px;color:var(--violet)">'+st.redDays+' dia(s) em semana reduzida — fora do cálculo, sem penalidade.</p>';
h+='</div>';
var mim=MS.filter(function(m){return m.d.slice(0,7)===mk;});
h+='<h3>Marcos deste mês</h3>';
if(!mim.length)h+='<div class="card"><p class="body" style="margin:0;font-size:13px">Nenhum marco com alvo neste mês.</p></div>';
else mim.forEach(function(m){h+=msHTML(m);});
h+='<h3>Fechamento do mês</h3><div class="card"><p class="body" style="font-size:13px;margin-bottom:14px">Três toques e o mês está fechado.</p>';
MCQ.forEach(function(q){
var cur=(state.monthly[mk]||{})[q.id];
h+='<div class="mcq"><div class="qq">'+q.q+'</div><div class="mcqopts">';
q.o.forEach(function(o){h+='<button class="opt'+(cur===o?' on':'')+'" data-a="mcq" data-k="'+mk+'|'+q.id+'|'+esc(o)+'">'+o+'</button>';});
h+='</div></div>';
});
h+='</div></section>';
return h;
}
function viewAno(){
var h='<section><div class="eyebrow-row"><span class="idx">04</span><span class="tag">Anual · estou saindo do lugar</span></div><h2 class="sec">Ano</h2>';
h+='<div class="mnav"><button class="arrow" data-a="yprev">←</button><span class="mlabel">'+selYear+'</span><button class="arrow" data-a="ynext">→</button></div>';
h+='<p class="lead">Sem streak aqui. No ano, o que importa é <b>o que ficou pronto</b>.</p>';
h+='<div class="card"><div class="ygrid"><div class="yinner"><div class="yrow head"><div class="ylab"></div>';
MONTH_AB.forEach(function(m){h+='<div class="ycell">'+m+'</div>';});
h+='</div>';
var curM=new Date().getMonth(),curY=new Date().getFullYear();
Object.keys(AREAS).forEach(function(a){
h+='<div class="yrow"><div class="ylab">'+AREAS[a].n+'</div>';
for(var m=0;m<12;m++){
var st=monthStats(selYear,m),tot=0,did=0;
AREAS[a].t.forEach(function(t){var r=rateFor(t,st);if(r&&r.exp){tot+=r.exp;did+=r.did;}});
var pct=tot?Math.min(100,did/tot):0,op=pct===0?0.12:(0.2+pct*0.8);
h+='<div class="ycell'+((selYear===curY&&m===curM)?' cur':'')+'" style="background:var('+AREAS[a].c+');opacity:'+op.toFixed(2)+'" title="'+MONTH_NAMES[m]+': '+Math.round(pct*100)+'%"></div>';
}
h+='</div>';
});
h+='</div></div><p class="body" style="font-size:12px;color:var(--ink-faint);margin:10px 0 0">Intensidade = consistência do mês. Colunas apagadas são meses sem dados ainda.</p></div>';
var cq=curQuarter(),inq=MS.filter(function(m){return quarterOf(m.d)===cq;});
h+='<h3>Metas do trimestre atual · '+(QLABEL[cq]||cq)+'</h3>';
if(!inq.length)h+='<div class="card"><p class="body" style="margin:0;font-size:13px">Nenhum marco com alvo neste trimestre.</p></div>';
else inq.forEach(function(m){h+=msHTML(m);});
var yms=MS.filter(function(m){return m.d.slice(0,4)===String(selYear);});
var dnc=yms.filter(function(m){return msDone(m.id);}).length;
h+='<h3>Marcos de '+selYear+' <span style="font-family:var(--mono);font-size:12px;color:var(--ink-faint);font-weight:400">— '+dnc+'/'+yms.length+' conquistados</span></h3>';
if(!yms.length)h+='<div class="card"><p class="body" style="margin:0;font-size:13px">Sem marcos definidos para este ano.</p></div>';
else yms.sort(function(a,b){return a.d<b.d?-1:1;}).forEach(function(m){h+=msHTML(m);});
h+='</section>';
return h;
}
function viewJornada(){
var h='<section><div class="eyebrow-row"><span class="idx">05</span><span class="tag">3 anos · onde estou na jornada</span></div><h2 class="sec">Jornada</h2>';
var nx=nextMS();
if(nx){
var diff=Math.ceil((parseD(nx.d)-new Date())/864e5),num,unit;
if(diff<0){num=Math.abs(diff);unit=num===1?'dia atrasado':'dias atrasado';}
else if(diff<=14){num=diff;unit=diff===1?'dia':'dias';}
else {num=Math.ceil(diff/7);unit='semanas';}
h+='<div class="cdown"><div class="cl">Próximo marco</div><span class="cnum">'+num+'</span><span class="cunit">'+unit+'</span>';
h+='<div class="cwhat">'+esc(nx.t)+'</div><div class="cwhen">'+MSTYPE[nx.ty].n.toLowerCase()+' · alvo '+parseD(nx.d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})+'</div></div>';
var bl=blockedBy(nx);
if(bl.length)h+='<div class="alerta"><b>Trava:</b> este marco depende de '+bl.map(function(x){return esc(msTitle(x));}).join(' e ')+'. Resolva isso antes.</div>';
}
var cq=curQuarter(),cqi=QUARTERS.indexOf(cq);
h+='<p class="lead">Doze trimestres, de ago/2026 a jun/2029. '+(cqi>=0?'Você está no trimestre <b>'+(cqi+1)+' de 12</b>.':'')+'</p>';
JPHASES.forEach(function(ph){
h+='<div class="jphase"><div class="jphead" style="--pc:var('+ph.c+')"><span class="jpn">'+ph.n+'</span><span class="jpd">'+ph.d+'</span></div>';
ph.qs.forEach(function(q){
var here=(q===cq),qms=MS.filter(function(m){return quarterOf(m.d)===q;}).sort(function(a,b){return a.d<b.d?-1:1;});
h+='<div class="jq'+(here?' here':'')+'"><div class="jqlab">'+QLABEL[q]+(here?'<br><span class="herebadge">aqui</span>':'')+'</div><div class="jqms">';
if(!qms.length)h+='<div class="jqi" style="color:var(--ink-faint)">—</div>';
qms.forEach(function(m){
var ty=MSTYPE[m.ty],dn=msDone(m.id);
h+='<div class="jqi'+(dn?' dn':'')+'"><i style="color:var('+ty.c+')">'+ty.n.slice(0,3).toLowerCase()+'</i>'+esc(m.t)+'</div>';
});
h+='</div></div>';
});
h+='</div>';
});
h+='<h3>Dependências entre marcos</h3><p class="body" style="font-size:13px">O que trava o quê. Marcos sem dependência podem ser atacados a qualquer momento.</p>';
MS.filter(function(m){return (m.dep||[]).length;}).forEach(function(m){
var bl=blockedBy(m);
h+='<div class="dep"><div class="chain-line">'+m.dep.map(function(d){return esc(msTitle(d));}).join('<span class="arw">+</span>')+'<span class="arw">→</span><b>'+esc(m.t)+'</b>'+(bl.length?'<span class="blocker-tag">travado</span>':'<span class="blocker-tag" style="color:var(--sage);border-color:rgba(224,225,221,.45)">liberado</span>')+'</div></div>';
});
h+='<div class="good" style="margin-top:14px"><b>Um marco de experiência por trimestre, sempre.</b> Você faz essa jornada sozinho — se a única recompensa estivesse em 2029, três anos seria tempo demais para aguentar. Os marcos de experiência não servem para o currículo. Servem para a viagem valer a pena enquanto ela acontece.</div>';
h+='</section>';
return h;
}
function buildReport(nDays){
nDays=nDays||30;
var out=[],count={},activeDays=0,redDays=0;
for(var i=0;i<nDays;i++){
var d=addDays(new Date(),-i),dstr=ds(d);
if(isReduced(d))redDays++;
var log=state.day[dstr];if(!log)continue;activeDays++;
for(var k in log){var t=k.slice(2);count[t]=(count[t]||0)+1;}
}
var weeks=nDays/7;
out.push('=== RELATÓRIO · '+new Date().toLocaleDateString('pt-BR')+' · últimos '+nDays+' dias ===');
out.push('');
out.push('CONSISTÊNCIA (feitos / previstos)');
var line=[];
Object.keys(TYPE_LABEL).forEach(function(t){var per=expectedPerWeek(t);if(!per)return;line.push(TYPE_LABEL[t]+' '+(count[t]||0)+'/'+Math.round(per*weeks));});
out.push(line.join(' · '));
out.push('Dias com registro: '+activeDays+'/'+nDays+(redDays?' · dias em semana reduzida: '+redDays:''));
var sq=[];['sono','en_write','en_speak','calistenia','roadmap','cs50'].forEach(function(t){var s=typeStreak(t);if(s>1)sq.push(TYPE_LABEL[t]+' '+s+'d');});
out.push('Sequências ativas: '+(sq.length?sq.join(' · '):'nenhuma'));
out.push('');
out.push('MARCOS');
var dnc=MS.filter(function(m){return msDone(m.id);});
out.push('Conquistados: '+dnc.length+'/'+MS.length+(dnc.length?' → '+dnc.map(function(m){return m.t;}).join(' | '):''));
var late=MS.filter(function(m){return msState(m).k==='late';});
if(late.length)out.push('ATRASADOS: '+late.map(function(m){return m.t+' (alvo '+m.d+')';}).join(' | '));
var nx=nextMS();
if(nx)out.push('Próximo: '+nx.t+' — alvo '+nx.d+(blockedBy(nx).length?' (travado por: '+blockedBy(nx).map(msTitle).join(', ')+')':''));
out.push('Trimestre atual: '+curQuarter());
out.push('');
out.push('TRILHAS');
TRACKS.forEach(function(tr){var dc=0;tr.items.forEach(function(_,i){if(state.tracks[tr.id+'#'+i])dc++;});var c=curTrack(tr);out.push('- '+tr.name+': '+dc+'/'+tr.items.length+(c?' · atual: '+c.txt:' · CONCLUÍDA'));});
out.push('');
out.push('CHECKLISTS');
CHECKS.forEach(function(cl){var dc=0,n2=null;cl.items.forEach(function(_,i){if(state.checks[cl.id+'#'+i])dc++;});for(var i=0;i<cl.items.length;i++){if(!state.checks[cl.id+'#'+i]){n2=cl.items[i][0];break;}}out.push('- '+cl.name+': '+dc+'/'+cl.items.length+(n2?' · próximo: '+n2:' · COMPLETO'));});
var mk=monthKey(new Date().getFullYear(),new Date().getMonth()),mm=state.monthly[mk];
if(mm){out.push('');out.push('FECHAMENTO DO MÊS');MCQ.forEach(function(q){if(mm[q.id])out.push('- '+q.q+' '+mm[q.id]);});}
return out.join('\n');
}
function copyReport(btn){
var txt=buildReport(parseInt(document.getElementById('repRange').value,10));
var ok=function(){var p=btn.textContent;btn.textContent='Copiado ✓';setTimeout(function(){btn.textContent=p;},2000);};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok).catch(function(){fb(txt,ok);});
else fb(txt,ok);
}
function fb(txt,cb){var ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cb();}catch(e){}document.body.removeChild(ta);}
/* Monta o prompt de análise (contexto do plano + relatório) e copia.
   O site é estático: não chama IA sozinho — você cola o prompt no Claude.
   Assim não existe chave de API dentro do navegador. */
function analysisPrompt(txt){
return 'Você é o mentor estratégico do Abel. Contexto:\n'+PLAN_CTX+'\n\nRelatório gerado pelo sistema dele:\n\n'+txt+
'\n\nAnalise em português do Brasil, direto e crítico (não elogie por elogiar). Máximo 250 palavras: (1) o que está funcionando, (2) o que está em risco e por quê, (3) 2-3 ajustes concretos. Se um bloco é pulado repetidamente, diga que o problema é o desenho da rotina e sugira a mudança. Se houver marco atrasado, priorize falar dele. Se não houver dados suficientes, diga isso em vez de inventar. Parágrafos curtos, sem markdown.';
}
function analyze(btn){
var out=document.getElementById('aiOut');
var prompt=analysisPrompt(buildReport(parseInt(document.getElementById('repRange').value,10)));
var ok=function(){
var p=btn.textContent;btn.textContent='Copiado ✓';setTimeout(function(){btn.textContent=p;},2000);
out.style.display='block';
out.innerHTML='Prompt copiado. Abra <a href="https://claude.ai/new" target="_blank" rel="noopener" style="color:var(--accent)">claude.ai</a> e cole (Ctrl+V / ⌘V) para receber a análise.';
};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(ok).catch(function(){fb(prompt,ok);});
else fb(prompt,ok);
}
function renderDoc(){
var h='';
h+='<section id="marcos"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Sistema de marcos</span></div><h2 class="sec">Marcos</h2>';
h+='<p class="lead">Todo marco tem <b>critério binário e verificável</b> e depende só de você. "Ser fluente" não é marco; "gravar 10 min falando sem travar" é.</p><div class="grid2">';
[['cap','Capacidade','Algo que você passa a saber fazer. Prova interna: mudou o que você é capaz de executar.'],
['cred','Credencial / entregável','Algo que existe fora de você e serve de prova para terceiros: certificado, URL, contrato, carta.'],
['exp','Experiência','Algo que você vive e comemora, sem utilidade para currículo. Um por trimestre, obrigatório.']].forEach(function(x){
h+='<div class="card" style="border-left:3px solid var('+MSTYPE[x[0]].c+')"><h3 style="margin:0 0 4px">'+x[1]+'</h3><p class="body" style="font-size:13px;margin:0">'+x[2]+'</p></div>';
});
h+='</div>';
var dnc=MS.filter(function(m){return msDone(m.id);}).length;
h+='<h3>Todos os marcos <span style="font-family:var(--mono);font-size:12px;color:var(--ink-faint);font-weight:400">— '+dnc+'/'+MS.length+'</span></h3>';
JPHASES.forEach(function(ph){
h+='<h3 style="font-size:14px;color:var('+ph.c+')">'+ph.n+'</h3>';
MS.filter(function(m){return ph.qs.indexOf(quarterOf(m.d))>=0;}).sort(function(a,b){return a.d<b.d?-1:1;}).forEach(function(m){h+=msHTML(m);});
});
h+='</section>';
h+='<section id="norte"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Estratégia</span></div><h2 class="sec">O Norte</h2>';
h+='<p class="lead">Todo objetivo serve a um só: <span class="hl">emigrar e construir carreira fora</span>. O que não te aproxima da Irlanda ou não te sustenta no caminho desce de prioridade.</p>';
h+='<h3>A rota</h3><p class="body">Um curso <b>nível 9 na Irlanda</b> — mestrado ou <b>Postgraduate Diploma</b> (mais curto e barato, mesmo direito). Ao concluir: <b>Stamp 1G</b>, até <span class="hl">24 meses</span> trabalhando em tempo integral sem patrocínio. Com emprego nessa janela, migra para autorização de longo prazo e, com o tempo, residência. <b>Intake alvo: setembro/2028. Plano B: janeiro/2029.</b></p>';
h+='<div class="alerta"><b>Armadilha de nome:</b> especialização ou MBA lato sensu no Brasil não serve — não dá visto nem permanência. O que destrava os 24 meses é nível 9 <b>feito na Irlanda</b>. Fora de Dublin (Cork, Galway) o custo cai bastante.</div>';
h+='<h3>As três alavancas</h3><ul class="msl" style="--pc:var(--accent)">';
h+='<li><span class="d">01</span><div><b>Inglês — o portão.</b> IELTS com a banda da escola. Compreensão já é C2; falta produção.</div></li>';
h+='<li><span class="d">02</span><div><b>Dinheiro — o combustível.</b> R$2.500/mês + renda do SinPro (roda no expediente).</div></li>';
h+='<li><span class="d">03</span><div><b>Currículo — a tração.</b> CS50, roadmap, DSA, portfólio. Aplicar desde já, inclusive remoto internacional.</div></li></ul>';
h+='<h3>A conta honesta</h3><p class="body">O visto exige a mensalidade do 1º ano <b>+ ~€10.000</b> de custo de vida; o gasto real do ano fica entre <b>€27.000 e €38.000</b>. Sua poupança sozinha não cobre. Por isso <b>PgDip + cidade fora de Dublin + meio período durante o curso + SinPro + eventual bolsa</b> não são extras: são o que fecha a conta.</p>';
h+='<div class="good"><b>A seu favor:</b> sendo C2 na compreensão, reading e listening puxam sua média no IELTS — o trabalho concentra-se em speaking e writing. Isso põe a prova em 2027/início de 2028 e torna o intake de set/2028 realista.</div></section>';
h+='<section id="fases"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Prioridade por período</span></div><h2 class="sec">Fases</h2>';
[['Fase 1 — Fundação e credencial','ago/2026 → jul/2027','--sage','Consistência e destravar a fala. Nada mais importa se a rotina não pegar.',['Rotina (almoço + noite) rodando de forma estável','Sono regular: ~23:00 / 06:30, cochilo curto','Inglês: output diário + tutor até o 3º mês','CS50 em sprint · 1º projeto no ar · LinkedIn em inglês','Poupança iniciada · planilha de custos reais','Passaporte conferido']],
['Fase 2 — Prova e aplicação','ago/2027 → jul/2028','--blue','Gerar as provas: uma nota, um certificado, aplicações enviadas, emprego novo.',['IELTS feito com a banda exigida','3 escolas escolhidas e aplicações submetidas','Carta de aceite até jun/2028','2º e 3º projeto no ar · DSA coberto','Emprego novo assinado (ideal: remoto internacional)','SinPro faturando']],
['Fase 3 — Saída e chegada','ago/2028 → jun/2029','--accent','Logística, não aprendizado. Executar a mudança sem sustos.',['Fundos comprovados · visto aprovado','Passagem comprada · casa e cães resolvidos','Primeiro dia de aula','Explorar o país e viver a experiência','Iniciar a janela de 24 meses do Stamp 1G']]].forEach(function(p){
h+='<div class="phase" style="--pc:var('+p[2]+')"><div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px"><span style="font-family:var(--display);font-weight:600;font-size:17px">'+p[0]+'</span><span style="font-family:var(--mono);font-size:11px;color:var('+p[2]+')">'+p[1]+'</span></div>';
h+='<div style="font-size:13px;color:var(--ink);background:var(--surface-2);border-radius:8px;padding:8px 11px;margin:10px 0"><span style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint);display:block">Prioridade</span>'+p[3]+'</div><ul class="msl">';
p[4].forEach(function(i){h+='<li><span class="d">◆</span><div>'+i+'</div></li>';});
h+='</ul></div>';
});
h+='</section>';
h+='<section id="deps"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Ordem ideal</span></div><h2 class="sec">Dependências</h2>';
h+='<p class="lead">Cadeias de atividade. As marcadas como <b>bloqueante</b> não têm atalho.</p>';
DEPS.forEach(function(d){h+='<div class="dep"><div class="chain-line">'+d.chain.map(function(c,i){return (i?'<span class="arw">→</span>':'')+esc(c);}).join('')+(d.b?'<span class="blocker-tag">bloqueante</span>':'')+'</div><div class="note">'+d.note+'</div></div>';});
h+='<h3>Em uma frase</h3><p class="body">Estabilize o <b>sono</b> → destrave o <b>inglês falado</b> (cadeia mais longa, começa hoje) → acumule <b>credenciais e portfólio</b> em paralelo → <b>IELTS</b> → <b>emprego</b> → <b>candidatura</b> → com o aceite, <b>visto e logística</b> → parta. O dinheiro corre por baixo, todo mês, sem depender de nada.</p></section>';
h+='<section id="plano"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Todas as atividades</span></div><h2 class="sec">Plano de Ação</h2>';
PLANO.forEach(function(a){
h+='<div class="card" style="border-left:3px solid var('+a.color+')"><div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px"><h3 style="margin:0">'+a.area+'</h3><span style="font-family:var(--mono);font-size:10.5px;color:var('+a.color+')">'+a.freq+'</span></div><ul class="msl" style="--pc:var('+a.color+');margin-top:9px">';
a.acoes.forEach(function(x){h+='<li><span class="d">›</span><div>'+x+'</div></li>';});
h+='</ul></div>';
});
h+='</section>';
h+='<section id="trilhas"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Progressão</span></div><h2 class="sec">Trilhas</h2>';
h+='<p class="lead">Marque conforme avança — o "foco de hoje" na visão diária segue daqui.</p>';
TRACKS.forEach(function(tr){
var dc=0;tr.items.forEach(function(_,i){if(state.tracks[tr.id+'#'+i])dc++;});
var pct=Math.round(dc/tr.items.length*100),c=curTrack(tr);
h+='<div class="card" style="--cc:var('+tr.color+')"><h3 style="margin:0">'+tr.name+'</h3><div class="barw"><div class="fill" style="width:'+pct+'%"></div></div><div class="pcount">'+dc+' de '+tr.items.length+' · '+pct+'%</div>';
tr.items.forEach(function(it,i){var d=!!state.tracks[tr.id+'#'+i],cur=(c&&c.i===i);
h+='<div class="clitem'+(d?' done':'')+'"><button class="box'+(d?' done':'')+'" data-a="track" data-k="'+tr.id+'#'+i+'" aria-pressed="'+d+'">'+(d?'✓':'')+'</button><span class="cltxt"'+(cur?' style="color:var(--ink);font-weight:600"':'')+'>'+esc(it)+(cur?'<span class="cur-badge">atual</span>':'')+'</span></div>';});
h+='</div>';
});
h+='</section>';
h+='<section id="checklists"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Acompanhamento</span></div><h2 class="sec">Checklists</h2>';
CHECKS.forEach(function(cl){
var dc=0;cl.items.forEach(function(_,i){if(state.checks[cl.id+'#'+i])dc++;});
var pct=Math.round(dc/cl.items.length*100);
h+='<div class="card" style="--cc:var('+cl.color+')"><h3 style="margin:0">'+cl.name+'</h3><div class="barw"><div class="fill" style="width:'+pct+'%"></div></div><div class="pcount">'+dc+' de '+cl.items.length+'</div>';
cl.items.forEach(function(it,i){var d=!!state.checks[cl.id+'#'+i];
h+='<div class="clitem'+(d?' done':'')+'"><button class="box'+(d?' done':'')+'" data-a="check" data-k="'+cl.id+'#'+i+'" aria-pressed="'+d+'">'+(d?'✓':'')+'</button><span class="cltxt">'+esc(it[0])+'<small>'+esc(it[1])+'</small></span></div>';});
h+='</div>';
});
h+='<h3>Indicadores</h3><div class="msplit"><div class="card metric leading"><div class="tp">Leading · semanal · você controla</div><ul><li>Blocos cumpridos</li><li>Treinos de calistenia</li><li>Noites no horário</li><li>Minutos de inglês falado</li><li>Vagas aplicadas</li><li>R$ guardados</li></ul></div>';
h+='<div class="card metric lagging"><div class="tp">Lagging · mensal · o resultado</div><ul><li>Simulado IELTS</li><li>% do CS50</li><li>Projetos publicados</li><li>Entrevistas conseguidas</li><li>Poupança vs. meta</li><li>Marcos conquistados</li></ul></div></div>';
h+='<h3>Ciclos de revisão</h3><ul class="cadence">';
h+='<li><span class="freq">Semanal · 20min</span><span class="dsc"><b>Domingo à noite</b>Visão Semana: o que foi feito, o que travou. Ajuste a próxima.</span></li>';
h+='<li><span class="freq">Mensal · 30min</span><span class="dsc"><b>Fim do mês</b>Visão Mês: taxa de consistência + fechamento em 3 toques.</span></li>';
h+='<li><span class="freq">Trimestral · 90min</span><span class="dsc"><b>Marcos</b>Visão Jornada e Ano: marcos do trimestre e o marco de experiência do próximo.</span></li>';
h+='<li><span class="freq">Anual</span><span class="dsc"><b>Replanejar</b>Visão Ano: o que ficou pronto e ajuste das fases seguintes.</span></li></ul></section>';
h+='<section id="relatorio"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Acompanhamento externo</span></div><h2 class="sec">Relatório</h2>';
h+='<p class="lead">O sistema compila sozinho. <b>Preparar análise</b> copia o prompt pronto (contexto + relatório) para colar no Claude; <b>Copiar relatório</b> gera só o texto dos números.</p>';
h+='<div class="card"><div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:12px">';
h+='<span style="font-family:var(--mono);font-size:10.5px;color:var(--ink-faint)">período</span>';
h+='<select id="repRange" style="background:var(--bg-2);border:1px solid var(--line-soft);color:var(--ink);border-radius:8px;padding:6px 10px;font-family:var(--mono);font-size:12px"><option value="7">7 dias</option><option value="30" selected>30 dias</option><option value="90">90 dias</option></select>';
h+='<button data-a="analyze" style="font-family:var(--body);font-weight:600;font-size:13px;color:var(--bg);background:var(--accent);border:none;padding:9px 15px;border-radius:8px;cursor:pointer">Preparar análise (copiar prompt)</button>';
h+='<button data-a="copyrep" style="font-family:var(--body);font-weight:600;font-size:13px;color:var(--ink);background:var(--surface-2);border:1px solid var(--line);padding:9px 15px;border-radius:8px;cursor:pointer">Copiar relatório</button></div>';
h+='<div id="aiOut" style="display:none;background:var(--bg-2);border:1px solid var(--line-soft);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--ink-dim);line-height:1.6;margin-bottom:12px"></div>';
h+='<pre id="repOut" style="background:var(--bg-2);border:1px solid var(--line-soft);border-radius:10px;padding:14px 16px;font-family:var(--mono);font-size:11px;color:var(--ink-dim);line-height:1.65;white-space:pre-wrap;overflow-x:auto;margin:0">'+esc(buildReport(30))+'</pre></div>';
h+='<div class="card"><h3 style="margin-top:0">Quando trazer</h3><ul class="msl" style="--pc:var(--accent)">';
h+='<li><span class="d">◆</span><div><b>Uma vez por mês</b> — o ritmo padrão.</div></li>';
h+='<li><span class="d">◆</span><div><b>Ao bater um marco</b> — ou quando um passar do alvo.</div></li>';
h+='<li><span class="d">◆</span><div><b>Se algo travar 2 semanas</b> — o problema é o desenho da rotina.</div></li>';
h+='<li><span class="d">◆</span><div><b>Diante de uma decisão real</b> — escolher escola, aceitar vaga, mexer no prazo.</div></li></ul></div></section>';
h+='<section id="metodos"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Por que assim</span></div><h2 class="sec">Métodos &amp; Energia</h2><h3>Aprendizagem</h3>';
METHODS.forEach(function(m){h+='<div class="card" style="padding:13px 16px;margin-bottom:8px"><div style="font-family:var(--display);font-weight:600;font-size:14px">'+m[0]+'</div><div style="font-size:12.5px;color:var(--ink-dim);margin-top:3px">'+m[1]+'</div></div>';});
h+='<h3>Gestão de energia</h3><p class="body">Seu cansaço não é preguiça: é <b>ciclo de sono mal administrado</b>. Irregular → acorda cansado → chega exausto → cochila → o cochilo tira o sono → dorme tarde → repete. O cochilo longo é o elo que quebra tudo.</p>';
h+='<div class="grid2"><div class="card" style="border-top:3px solid var(--sage)"><h3 style="margin-top:0">Freio físico</h3><p class="body" style="font-size:13px;margin:0">Não lute com força de vontade. Rotina de pouso fixa ao chegar (janta, cães, banho), e só então comece pequeno. Em dia esgotado, <b>dia mínimo viável</b>.</p></div>';
h+='<div class="card" style="border-top:3px solid var(--flag)"><h3 style="margin-top:0">Freio mental</h3><p class="body" style="font-size:13px;margin:0">Descansado mas fugindo pro celular: <b>design de fricção</b> (celular em outro cômodo), tarefa já decidida e a <b>regra dos 2 minutos</b>.</p></div></div>';
h+='<h3>Anti-procrastinação</h3>';
ANTIPROC.forEach(function(a){h+='<div class="card" style="padding:13px 16px;margin-bottom:8px"><div style="font-family:var(--display);font-weight:600;font-size:14px">'+a[0]+'</div><div style="font-size:12.5px;color:var(--ink-dim);margin-top:3px">'+a[1]+'</div></div>';});
h+='<div class="good"><b>Nos dias difíceis:</b> o objetivo nunca foi um dia perfeito — foi não quebrar a corrente. Um dia mínimo ainda é vitória.</div></section>';
h+='<section id="decisoes"><div class="eyebrow-row"><span class="idx">◆</span><span class="tag">Consolidação</span></div><h2 class="sec">Decisões</h2>';
h+='<p class="lead">As escolhas de projeto deste sistema, e o porquê de cada uma.</p>';
DECISOES.forEach(function(d){h+='<div class="decision"><div class="dq">'+d[0]+'</div><div class="da">'+d[1]+'</div></div>';});
h+='<div class="footer"><span>Fonte única de referência · revisar a cada trimestre · '+(Sync.active()?'sincronizado entre aparelhos':'salvo neste navegador')+'</span><span style="display:flex;gap:7px;flex-wrap:wrap">'+Sync.footerButton()+'<button class="reset" data-a="export">baixar backup</button><button class="reset" data-a="import">restaurar backup</button><button class="reset" data-a="reset">reiniciar progresso</button></span></div></section>';
document.getElementById('doc').innerHTML=h;
}
function renderView(){
var f={hoje:viewHoje,semana:viewSemana,mes:viewMes,ano:viewAno,jornada:viewJornada}[state.view]||viewHoje;
document.getElementById('view').innerHTML=f();
var tabs='',nav='';
VIEWS.forEach(function(v,i){
tabs+='<button class="vtab'+(state.view===v.id?' sel':'')+'" data-a="view" data-k="'+v.id+'">'+v.n+'<span class="q">'+v.q+'</span></button>';
nav+='<li><button class="'+(state.view===v.id?'active':'')+'" data-a="view" data-k="'+v.id+'"><span class="n">'+(i+1)+'</span> '+v.n+'</button></li>';
});
document.getElementById('viewTabs').innerHTML=tabs;
document.getElementById('viewNav').innerHTML=nav;
}
function renderAll(){renderView();renderDoc();}
document.addEventListener('click',function(e){
var t=e.target.closest('[data-a]');if(!t)return;
var a=t.dataset.a,k=t.dataset.k;
if(a==='view'){state.view=k;debSave();renderView();window.scrollTo({top:0,behavior:'smooth'});}
else if(a==='day'){selDay=parseInt(k,10);renderView();}
else if(a==='task'){var d=today();if(!state.day[d])state.day[d]={};if(state.day[d][k]){delete state.day[d][k];if(!Object.keys(state.day[d]).length)delete state.day[d];}else state.day[d][k]=true;stamp('day',d,k);save();renderAll();}
else if(a==='dayd'){selDetail=(selDetail===k)?null:k;renderView();}
else if(a==='red'){if(state.reduced[k])delete state.reduced[k];else state.reduced[k]=true;stamp('reduced',k);save();renderAll();}
else if(a==='ms'){if(state.ms[k])delete state.ms[k];else state.ms[k]=true;stamp('ms',k);save();renderAll();}
else if(a==='track'){if(state.tracks[k])delete state.tracks[k];else state.tracks[k]=true;stamp('tracks',k);save();renderAll();}
else if(a==='check'){if(state.checks[k])delete state.checks[k];else state.checks[k]=true;stamp('checks',k);save();renderAll();}
else if(a==='mcq'){var p=k.split('|');if(!state.monthly[p[0]])state.monthly[p[0]]={};state.monthly[p[0]][p[1]]=p[2];stamp('monthly',p[0],p[1]);save();renderView();}
else if(a==='mprev'){selDetail=null;selMonth--;if(selMonth<0){selMonth=11;selYear--;}renderView();}
else if(a==='mnext'){selDetail=null;selMonth++;if(selMonth>11){selMonth=0;selYear++;}renderView();}
else if(a==='yprev'){selYear--;renderView();}
else if(a==='ynext'){selYear++;renderView();}
else if(a==='copyrep')copyReport(t);
else if(a==='analyze')analyze(t);
else if(a==='export')exportData();
else if(a==='sync')Sync.toggle(t);
else if(a==='import')importData();
else if(a==='reset'){if(t.dataset.armed==='1'){stampAll();state={day:{},tracks:{},checks:{},ms:{},reduced:{},monthly:{},t:state.t,view:state.view};save();renderAll();}else{t.dataset.armed='1';var pv=t.textContent;t.textContent='Confirmar reset?';t.classList.add('armed');setTimeout(function(){if(t.dataset.armed==='1'){t.dataset.armed='0';t.textContent=pv;t.classList.remove('armed');}},3500);}}
});
document.addEventListener('change',function(e){
if(e.target&&e.target.id==='repRange'){var o=document.getElementById('repOut');if(o)o.textContent=buildReport(parseInt(e.target.value,10));}
});
var tg=document.getElementById('navToggle'),nb=document.getElementById('navBody');
tg.addEventListener('click',function(){nb.classList.toggle('open');});
nb.addEventListener('click',function(e){if(e.target.closest('a')&&window.innerWidth<=900)nb.classList.remove('open');});
Sync.init({getState:function(){return state;},applyState:applyRemote,status:setStatus});
load().then(function(l){
if(l)adopt(l);
renderAll();
return Sync.start();
});
})();
