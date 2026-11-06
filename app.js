const $=s=>document.querySelector(s),get=u=>fetch(u).then(r=>r.json());
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let cfg,sch,I={},D={},lang,S,ST={},LC;
const t=k=>I[lang][k]||k;
const tr=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return{x:v??"",m:0};if(v[lang])return{x:v[lang],m:0};const o=cfg.langs.find(l=>v[l]);return{x:o?v[o]:"",m:!!o}};
const cn=i=>typeof i==="string"?{n:i,c:1}:i;
const val=(f,v)=>f.t==="counts"?(v||[]).map(cn).map(i=>i.c+"× "+i.n).join(", "):f.t==="stars"?(v===undefined?"":"★".repeat(v)+"☆".repeat(5-v)):f.t==="bool"?(v?"♥":""):Array.isArray(v)?v.join(", "):f.tr?tr(v).x:v??"";
const flat=(f,v)=>f.t==="counts"?(v||[]).map(i=>cn(i).n):f.t==="bool"?(v?["♥"]:[]):f.t==="tags"||f.t==="list"?(v||[]):(v===undefined||v===""?[]:[String(v)]);
function route(){const[p,q]=(location.hash.slice(1)||"/boards").split("?"),[,s,id]=p.split("/");return{sec:cfg.sections.includes(s)?s:cfg.sections[0],id:id&&decodeURIComponent(id),qs:new URLSearchParams(q||"")}}
function setLang(l){lang=l;try{localStorage.setItem("lang",l)}catch(e){}render()}
function render(){const r=route();document.documentElement.lang=lang;
$("#nav").innerHTML=cfg.sections.map(s=>`<button class="${s===r.sec?"on":""}" onclick="location.hash='#/${s}'">${esc(t(s))}</button>`).join("");
const o=cfg.langs.find(l=>l!==lang);$("#lang").textContent=o.toUpperCase();$("#lang").onclick=()=>setLang(o);$("#lk").textContent=t("look");$("#lk").onclick=appear;foot();
r.id?detail(r):list(r);window.ed&&ed(r)}
function list(r){const F=sch[r.sec],rows=D[r.sec];S={sec:r.sec,q:r.qs.get("q")||"",s:r.qs.get("s")||"",d:r.qs.get("d")||"a",f:{}};
F.filter(f=>f.f).forEach(f=>S.f[f.k]=r.qs.get("f."+f.k)||"");
const sel=F.filter(f=>f.f).map(f=>{const vs=[...new Set(rows.flatMap(x=>flat(f,x[f.k])))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
return`<select data-k="${f.k}" aria-label="${esc(f[lang])}"><option value="">${esc(f[lang])}: ${esc(t("all"))}</option>${vs.map(v=>`<option${S.f[f.k]===v?" selected":""}>${esc(v)}</option>`).join("")}</select>`}).join("");
$("#main").innerHTML=`<div class="bar"><input id="q" type="search" placeholder="${esc(t("search"))}" value="${esc(S.q)}">${sel}<button id="rs">${esc(t("reset"))}</button><span class="dim" id="n"></span></div><div class="tw"><table><thead></thead><tbody></tbody></table></div>`;
$("#q").oninput=e=>{S.q=e.target.value;upd()};
document.querySelectorAll("select").forEach(e=>e.onchange=()=>{S.f[e.dataset.k]=e.value;upd()});
$("#rs").onclick=()=>{S.q="";Object.keys(S.f).forEach(k=>S.f[k]="");$("#q").value="";document.querySelectorAll("select").forEach(e=>e.value="");upd()};upd()}
function upd(){const F=sch[S.sec],C=F.filter(f=>f.c);let rows=D[S.sec].filter(x=>{
if(S.q&&!JSON.stringify(x).toLowerCase().includes(S.q.toLowerCase()))return false;
return F.every(f=>!S.f[f.k]||flat(f,x[f.k]).includes(S.f[f.k]))});
const sf=C.find(f=>f.k===S.s);if(sf){const m=S.d==="a"?1:-1;rows=[...rows].sort((a,b)=>m*(sf.t==="number"||sf.t==="stars"?(a[sf.k]??-1)-(b[sf.k]??-1):String(val(sf,a[sf.k])).localeCompare(String(val(sf,b[sf.k])),undefined,{numeric:true})))}
$("thead").innerHTML="<tr>"+C.map(f=>`<th data-k="${f.k}">${esc(f[lang])}${S.s===f.k?(S.d==="a"?" ▲":" ▼"):""}</th>`).join("")+"</tr>";
document.querySelectorAll("th").forEach(h=>h.onclick=()=>{S.d=S.s===h.dataset.k&&S.d==="a"?"d":"a";S.s=h.dataset.k;upd()});
$("tbody").innerHTML=rows.length?rows.map(x=>"<tr>"+C.map(f=>{let v=fh(f,x[f.k]);if(f.k==="model")v=`<a href="#/${S.sec}/${encodeURIComponent(x.id)}">${v}</a>`+(x.fav?" "+HR:"")+(done(S.sec,x)?" "+CK():"")+(tr(x.warning).x?`<span class="badge" title="${esc(tr(x.warning).x)}">!</span>`:"");return`<td>${v}</td>`}).join("")+"</tr>").join(""):`<tr><td colspan="${C.length}">${esc(t("empty"))}</td></tr>`;
$("#n").textContent=`${rows.length}/${D[S.sec].length}`;
const p=new URLSearchParams();if(S.q)p.set("q",S.q);if(S.s){p.set("s",S.s);p.set("d",S.d)}Object.entries(S.f).forEach(([k,v])=>v&&p.set("f."+k,v));
history.replaceState(null,"","#/"+S.sec+(p.toString()?"?"+p:""))}
const md=s=>esc(s).split(/\n{2,}/).map(p=>"<p>"+p.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>")+"</p>").join("");
function detail(r){const x=D[r.sec].find(e=>e.id===r.id),F=sch[r.sec];if(!x){location.hash="#/"+r.sec;return}
const long=k=>{const f=F.find(f=>f.k===k),v=tr(x[k]);return v.x?{...v,l:f[lang]}:null},w=long("warning"),n=long("notes");
const mk=m=>m?` <span class="dim">(${esc(t("missing"))})</span>`:"";
$("#main").innerHTML=`<p><a href="#/${r.sec}">« ${esc(t("back"))}</a></p><h2>${esc(x.brand)} ${esc(x.model)}${x.fav?" "+HR:""}${done(r.sec,x)?" "+CK():""}</h2>`+
(w?`<div class="warn"><b>${esc(t("warning"))}:</b> ${esc(w.x)}${mk(w.m)}</div>`:"")+
`<dl class="dl">${F.filter(f=>f.t!=="long"&&val(f,x[f.k])!=="").map(f=>`<dt>${esc(f[lang])}</dt><dd>${fh(f,x[f.k])}</dd>`).join("")}</dl>`+
(n?`<h3>${esc(t("notes"))}${mk(n.m)}</h3>${md(n.x)}`:"")+
`<div class="ph">${(x.photos||[]).map(p=>`<figure><img class="zi" loading="lazy" src="photos/${r.sec}/${encodeURIComponent(x.id)}/${encodeURIComponent(p.f)}" alt="${esc(tr(p.c).x)}"><figcaption>${esc(tr(p.c).x)}</figcaption></figure>`).join("")}</div>`}
(async()=>{cfg=await get("config.json");sch=await get("data/schema.json");
for(const l of cfg.langs)I[l]=await get(`i18n/${l}.json`);for(const s of cfg.sections)D[s]=await get(`data/${s}.json`).catch(()=>[]);ST=await get("data/settings.json").catch(()=>({}));
let q=new URLSearchParams(location.search).get("lang"),st;try{st=localStorage.getItem("lang")}catch(e){}
lang=[q,st,navigator.language.slice(0,2)].find(l=>cfg.langs.includes(l))||cfg.langs[0];addEventListener("hashchange",render);look();render();fetch(`https://api.github.com/repos/${cfg.repo||location.hostname.split(".")[0]+"/"+location.pathname.split("/")[1]}/commits?per_page=1`).then(r=>r.json()).then(c=>{LC=c[0].commit.committer.date;foot()}).catch(()=>{})})();

const lu=()=>{try{return JSON.parse(localStorage.getItem("look")||"{}")}catch(e){return{}}};
function look(){document.title=ST.title||"my-hardware";document.querySelector(".title>span").textContent=ST.title||"my-hardware";{let i=$("#ic");if(!i){i=document.createElement("link");i.id="ic";i.rel="icon";document.head.appendChild(i)}ST.icon?i.setAttribute("href","icons/"+ST.icon):i.removeAttribute("href")}const u=lu(),th=u.t||ST.theme||"win98",T=cfg.themes.find(x=>x.id===th)||{},bg=u.b===undefined||u.b==="def"?(ST.bg||(T.wall?"w:"+T.wall:"")):u.b,c=T.css,l=$("#th");
c?l.setAttribute("href",c):l.removeAttribute("href");document.documentElement.dataset.theme=th;{const s=document.body.style,w=(cfg.walls||[]).find(x=>"w:"+x.id===bg);s.background="";s.backgroundImage=w?"":bg?`url("backgrounds/${encodeURIComponent(bg)}")`:"none";if(w)s.background=w.v}}
function appear(){const u=lu(),B=ST.backgrounds||[],W=(cfg.walls||[]).map(w=>`<option value="w:${w.id}"${u.b==="w:"+w.id?" selected":""}>${esc(w.n)}</option>`).join("");
$("#main").innerHTML=`<div class="bar"><label>${esc(t("theme"))} <select id="sa">${cfg.themes.map(x=>`<option value="${x.id}"${(u.t||ST.theme||"win98")===x.id?" selected":""}>${esc(x.name)}</option>`).join("")}</select></label> <label>${esc(t("bgl"))} <select id="sb"><option value="def">${esc(t("def"))}</option><option value=""${u.b===""?" selected":""}>${esc(t("none"))}</option>${W}${B.map(b=>`<option value="${esc(b.f)}"${u.b===b.f?" selected":""}>${esc(b.n||b.f)}</option>`).join("")}</select></label></div><p><button id="bk">${esc(t("back"))}</button></p>`;
$("#sa").onchange=$("#sb").onchange=()=>{try{localStorage.setItem("look",JSON.stringify({t:$("#sa").value,b:$("#sb").value}))}catch(e){}look()};$("#bk").onclick=render}
const foot=()=>{$("#ft").textContent=LC?`${t("last")}: ${new Date(LC).toLocaleString(lang,{dateStyle:"short",timeStyle:"short"})}`:""};

addEventListener("click",e=>{const i=e.target;if(i.classList&&i.classList.contains("zi")){const L=[...document.querySelectorAll(".zi")];zoom(L,L.indexOf(i))}});
function zoom(L,n){let b=$("#lb");if(!b){b=document.createElement("div");b.id="lb";document.body.appendChild(b)}const x=L[n];
b.innerHTML=`<img src="${esc(x.src)}" alt="${esc(x.alt)}"><div><button ${n?"":"disabled"} data-d="-1">‹</button> ${esc(x.alt)} <a href="${esc(x.src)}" target="_blank" rel="noopener">${esc(t("open"))}</a> ${n+1}/${L.length} <button ${n<L.length-1?"":"disabled"} data-d="1">›</button></div>`;
b.onclick=e=>{const g=e.target;if(g.tagName==="BUTTON"){zoom(L,n+ +g.dataset.d);return}if(g.tagName!=="A")b.remove()};
document.onkeydown=e=>{if(!$("#lb"))return;if(e.key==="Escape")b.remove();else if(e.key==="ArrowRight"&&n<L.length-1)zoom(L,n+1);else if(e.key==="ArrowLeft"&&n>0)zoom(L,n-1)}}
const emp=v=>v===undefined||v===null||v===""||(Array.isArray(v)&&!v.length)||(typeof v==="object"&&!Array.isArray(v)&&!Object.values(v).some(Boolean));
function missing(sec,x){const m=sch[sec].filter(f=>!f.opt&&depOk(f,x)&&emp(x[f.k])).map(f=>f[lang]);if(!(x.photos||[]).length)m.push(t("photos"));return m}
const done=(sec,x)=>!missing(sec,x).length;
const stars=v=>v===undefined?"":`<span class="stars" title="${v}/5">${[0,1,2,3,4].map(i=>`<i class="st ${i<v?"on":"off"}"></i>`).join("")}</span>`,HR='<i class="hr"></i>',CK=()=>`<i class="ck" title="${esc(t("complete"))}"></i>`;
const fh=(f,v)=>f.t==="stars"?stars(v):f.t==="bool"?(v?HR:""):esc(val(f,v));
const depOk=(f,x)=>!f.dep||new RegExp(f.dep.re,"i").test([].concat(x[f.dep.k]||"").join(" "));
