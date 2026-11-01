(function(){
const KEY="office-move-in:v1";
const DAY=new Date("2026-11-10T00:00:00+09:00");
const G=window.GROUPS,C=window.CATS,T=window.TASKS;
const $=s=>document.querySelector(s);
let state={};
try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
let fcat="전체",fpri="전체",hideDone=false;
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
// KST today
function kstToday(){const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());return p}
const today=kstToday();
function dayDiff(a,b){return Math.round((new Date(a+"T00:00:00+09:00")-new Date(b+"T00:00:00+09:00"))/864e5)}
const wk=["일","월","화","수","목","금","토"];
function fmt(iso){const d=new Date(iso+"T12:00:00+09:00");return (d.getMonth()+1)+"/"+d.getDate()+"("+wk[d.getDay()]+")"}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
// D-day
(function(){const n=dayDiff("2026-11-10",today);$("#dday").textContent=n>0?"D-"+n:n===0?"D-DAY":"D+"+(-n);$("#today").textContent="오늘 "+fmt(today)+" 기준"})();
// chips
function chips(el,list,get,set){el.innerHTML=list.map(v=>`<button type="button" class="chip" aria-pressed="${v===get()}" data-v="${esc(v)}">${esc(v)}</button>`).join("");
 el.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;set(b.dataset.v);chips(el,list,get,set);render()}}
chips($("#cat-chips"),["전체",...C],()=>fcat,v=>fcat=v);
chips($("#pri-chips"),["전체","긴급","높음","보통"],()=>fpri,v=>fpri=v);
$("#hide-done").onchange=e=>{hideDone=e.target.checked;render()};
$("#jump").innerHTML=G.map(g=>`<a href="#${g.id}" data-g="${g.id}">${esc(g.name)}</a>`).join("");
function urgent(){
 const el=$("#urgent-list");
 const list=T.filter(t=>t.p==="긴급"&&!state[t.id]&&dayDiff(t.due,today)<=7).sort((a,b)=>a.due.localeCompare(b.due)||T.indexOf(a)-T.indexOf(b)).slice(0,5);
 if(!list.length){el.innerHTML='<li class="none-li"><span class="none">이번 주 긴급 할 일을 모두 끝냈어요 🎉</span></li>';return}
 el.innerHTML=list.map(t=>{const n=dayDiff(t.due,today);const w=n<0?`<span style="color:var(--red)">${-n}일 지남</span>`:n===0?"오늘까지":`${fmt(t.due)}까지`;
  return `<li><div><a href="#${t.id}">${esc(t.t)}</a><small>${esc(t.c)} · ${w}</small></div></li>`}).join("");
}
function render(){
 let shown=0;
 $("#groups").innerHTML=G.map(g=>{
  const all=T.filter(t=>t.g===g.id);
  const done=all.filter(t=>state[t.id]).length;
  const vis=all.filter(t=>(fcat==="전체"||t.c===fcat)&&(fpri==="전체"||t.p===fpri)&&!(hideDone&&state[t.id]));
  shown+=vis.length;
  if(!vis.length)return "";
  return `<section class="group" id="${g.id}"><div class="g-head"><div><h2>${esc(g.name)}</h2><small>${esc(g.range)}</small></div><span class="g-prog">${done}/${all.length}</span></div>
  <div class="g-bar"><i style="width:${all.length?done/all.length*100:0}%"></i></div>
  <div class="tasks">${vis.map(t=>{const n=dayDiff(t.due,today);const late=!state[t.id]&&n<0;
   return `<label class="task" id="${t.id}"><input type="checkbox" data-id="${t.id}" ${state[t.id]?"checked":""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg></span>
   <span class="body"><span class="t">${esc(t.t)}</span><span class="d">${esc(t.d)}</span>
   <span class="meta"><span class="tag p-${t.p}">${t.p}</span><span class="tag">${esc(t.c)}</span><span class="tag due${late?" late":""}">${late?"기한 지남 · ":""}${fmt(t.due)}</span>${t.a?`<span class="tag asm">${t.a.startsWith("확인")?"확인 필요":"가정"}</span>`:""}</span>
   ${t.a?`<span class="d asn">${esc(t.a.replace(/^(가정|확인 필요):\s*/,""))}</span>`:""}</span></label>`}).join("")}</div></section>`}).join("");
 $("#empty").hidden=shown>0;
 const tot=T.length,d=T.filter(t=>state[t.id]).length,p=Math.round(d/tot*100);
 $("#pct").textContent=p+"%";$("#barfill").style.width=p+"%";$("#bar").setAttribute("aria-valuenow",p);$("#count").textContent=`${tot}개 중 ${d}개 완료`;
 urgent();spy();
}
$("#groups").addEventListener("change",e=>{const i=e.target.closest("input[data-id]");if(!i)return;
 if(i.checked)state[i.dataset.id]=1;else delete state[i.dataset.id];save();
 const y=window.scrollY;render();window.scrollTo(0,y)});
$("#reset").onclick=()=>{if(confirm("체크한 항목을 모두 지울까요?")){state={};save();render()}};
function spy(){const gs=[...document.querySelectorAll(".group")];let cur=null;
 for(const g of gs){if(g.getBoundingClientRect().top<140)cur=g.id}
 document.querySelectorAll("#jump a").forEach(a=>a.classList.toggle("on",a.dataset.g===cur))}
addEventListener("scroll",spy,{passive:true});
render();
})();
