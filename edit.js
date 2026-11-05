const X={it:{edit:"Modifica",done:"Esci dalla modifica",nw:"Nuova voce",del:"Elimina",save:"Conferma",cancel:"Annulla",tok:"Token GitHub (fine-grained, solo questo repo):",login:"Accedi",out:"Logout",ph:"Aggiungi foto (vengono ridimensionate)",rm:"Rimuovi",ok:"Pubblicato. Il sito si aggiorna in 1-2 minuti.",cd:"Eliminare questa voce e le sue foto?",bad:"Token non valido o senza permessi.",req:"Marca e modello sono obbligatori.",pend:"Modifiche in sospeso",pa:"foto da aggiungere",pd:"foto da rimuovere",pub:"Pubblica tutto (1 commit)",dis:"Scarta tutto",cdis:"Scartare tutte le modifiche in sospeso?",back:"Indietro",nm:"Nome"},
en:{edit:"Edit",done:"Exit edit mode",nw:"New entry",del:"Delete",save:"Confirm",cancel:"Cancel",tok:"GitHub token (fine-grained, this repo only):",login:"Log in",out:"Log out",ph:"Add photos (resized automatically)",rm:"Remove",ok:"Published. The site updates in 1-2 minutes.",cd:"Delete this entry and its photos?",bad:"Invalid token or missing permissions.",req:"Brand and model are required.",pend:"Pending changes",pa:"photos to add",pd:"photos to remove",pub:"Publish all (1 commit)",dis:"Discard all",cdis:"Discard all pending changes?",back:"Back",nm:"Name"}};
const xt=k=>X[lang][k],newP=()=>({s:new Set(),a:{},d:new Set(),l:{}});let TK="",EM=0,P=newP();try{TK=sessionStorage.getItem("tk")||""}catch(e){}
const np=()=>Object.keys(P.l).length,rp=()=>cfg.repo||location.hostname.split(".")[0]+"/"+location.pathname.split("/")[1];
addEventListener("beforeunload",e=>{if(np()){e.preventDefault();e.returnValue=""}});
const gh=async(p,m="GET",b)=>{const r=await fetch(`https://api.github.com/repos/${rp()}${p?"/"+p:""}`,{method:m,headers:{Authorization:"Bearer "+TK,Accept:"application/vnd.github+json"},body:b&&JSON.stringify(b)});if(!r.ok)throw new Error("GitHub "+r.status);return r.json()};
const fresh=async()=>{for(const s of cfg.sections){const r=await fetch(`https://api.github.com/repos/${rp()}/contents/data/${s}.json`,{headers:{Authorization:"Bearer "+TK,Accept:"application/vnd.github.raw+json"}});if(r.ok)D[s]=await r.json()}const q=await fetch(`https://api.github.com/repos/${rp()}/contents/data/settings.json`,{headers:{Authorization:"Bearer "+TK,Accept:"application/vnd.github.raw+json"}});if(q.ok){ST=await q.json();look()}};
const slug=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const shrink=(f,mx=1600,ty="image/webp")=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,mx/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);c.toBlob(b=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.readAsDataURL(b)},ty,.82)};i.onerror=ko;i.src=URL.createObjectURL(f)});
const mark=(k,op)=>{const o=P.l[k];if(op==="-"&&o==="+")delete P.l[k];else P.l[k]=o==="+"?"+":op};
const unph=p=>{if(p in P.a)delete P.a[p];else P.d.add(p)};
async function enter(){try{await fresh()}catch(e){}EM=1;render()}
function ed(r){const n=$("#nav"),m=$("#main");
if(!EM){n.insertAdjacentHTML("beforeend",`<button id="em" style="margin-left:auto">${xt("edit")}</button>`);$("#em").onclick=login;return}
n.insertAdjacentHTML("beforeend",`<button id="em" class="on" style="margin-left:auto">${xt("done")}</button>${np()?`<button id="pb">${xt("pend")} (${np()})</button>`:""}<button id="st">${xt("sett")}</button><button id="lo">${xt("out")}</button>`);
$("#em").onclick=()=>{EM=0;render()};$("#lo").onclick=()=>{TK="";try{sessionStorage.removeItem("tk")}catch(e){}EM=0;render()};if(np())$("#pb").onclick=pend;$("#st").onclick=sett;
if(r.id){m.insertAdjacentHTML("afterbegin",`<p><button id="b1">${xt("edit")}</button> <button id="b2">${xt("del")}</button></p>`);$("#b1").onclick=()=>form(r.sec,D[r.sec].find(e=>e.id===r.id));$("#b2").onclick=()=>rm(r.sec,r.id)}
else{m.insertAdjacentHTML("afterbegin",`<p><button id="b1">+ ${xt("nw")}</button></p>`);$("#b1").onclick=()=>form(r.sec)}}
function login(){if(TK)return enter();
$("#main").innerHTML=`<p>${xt("tok")}</p><div class="bar"><input id="tk" type="password" autocomplete="off"><button id="go">${xt("login")}</button></div><p id="er"></p>`;
$("#go").onclick=async()=>{TK=$("#tk").value.trim();try{await gh("");try{sessionStorage.setItem("tk",TK)}catch(e){}enter()}catch(e){TK="";$("#er").textContent=xt("bad")}}}
const crow=(f,r)=>`<div class="bar"><input class="cn" list="dl_${f.k}" type="text" placeholder="${xt("nm")}" value="${esc(r.n||"")}">${f.t==="list"?"":`<input class="cc" type="number" min="1" value="${r.c||1}" style="width:60px">`}<button type="button" class="x">×</button></div>`;
function form(sec,x){const F=sch[sec],nw=!x;x=x||{photos:[]};
const dl=f=>`<datalist id="dl_${f.k}">${[...new Set([...(f.o||[]),...D[sec].flatMap(e=>flat(f,e[f.k]))])].map(o=>`<option value="${esc(o)}">`).join("")}</datalist>`;
const inp=f=>{const id="f_"+f.k,v=x[f.k];
if(f.t==="counts"||f.t==="list")return`<fieldset id="cr_${f.k}"><legend>${esc(f[lang])}</legend><div>${(v||[]).map(cn).map(r=>crow(f,r)).join("")}</div><button type="button" data-add="${f.k}">+</button>${dl(f)}</fieldset>`;
if(f.tr)return cfg.langs.map(l=>`<label>${esc(f[lang])} (${l.toUpperCase()})<textarea id="${id}_${l}" rows="3">${esc((v&&v[l])||"")}</textarea></label>`).join("");
return`<label>${esc(f[lang])}<input id="${id}" ${f.f||f.o?`list="dl_${f.k}"`:""} type="${f.t==="number"?"number":"text"}" value="${esc(Array.isArray(v)?v.join(", "):v??"")}"></label>${f.f||f.o?dl(f):""}`};
$("#main").innerHTML=`<form id="fm" class="fm">${F.map(inp).join("")}${x.photos.map(p=>`<label><input type="checkbox" data-f="${esc(p.f)}"> ${xt("rm")} ${esc(p.f)}</label>`).join("")}<label>${xt("ph")}<input id="ph" type="file" accept="image/*" multiple></label><p><button type="submit">${xt("save")}</button> <button type="button" id="cn">${xt("cancel")}</button> <span id="er"></span></p></form>`;
$("#cn").onclick=render;
$("#fm").onclick=e=>{const t=e.target;if(t.classList.contains("x"))t.parentNode.remove();if(t.dataset.add){const f=F.find(f=>f.k===t.dataset.add);t.previousElementSibling.insertAdjacentHTML("beforeend",crow(f,{}))}};
$("#fm").onsubmit=async e=>{e.preventDefault();const o={id:x.id};
F.forEach(f=>{if(f.t==="counts"||f.t==="list"){const a=[...document.querySelectorAll(`#cr_${f.k} .bar`)].map(b=>({n:b.querySelector(".cn").value.trim(),c:+(b.querySelector(".cc")||{}).value||1})).filter(i=>i.n).map(i=>f.t==="list"?i.n:i);if(a.length)o[f.k]=a}
else if(f.tr){const t={};cfg.langs.forEach(l=>{const v=$(`#f_${f.k}_${l}`).value.trim();if(v)t[l]=v});if(Object.keys(t).length)o[f.k]=t}
else{const v=$("#f_"+f.k).value.trim();if(v!=="")o[f.k]=f.t==="tags"?v.split(",").map(s=>s.trim()).filter(Boolean):f.t==="number"?+v:v}});
if(!o.brand||!o.model){$("#er").textContent=xt("req");return}
if(nw){o.id=slug(o.brand+" "+o.model);if(D[sec].some(e=>e.id===o.id))o.id+="-"+Date.now().toString(36)}
const gone=[...document.querySelectorAll("#fm input[type=checkbox]:checked")].map(i=>i.dataset.f);o.photos=x.photos.filter(p=>!gone.includes(p.f));
for(const[i,fl]of[...$("#ph").files].entries()){const nm=`${Date.now().toString(36)}-${i}.webp`;P.a[`photos/${sec}/${o.id}/${nm}`]=await shrink(fl);o.photos.push({f:nm})}
gone.forEach(f=>unph(`photos/${sec}/${o.id}/${f}`));
D[sec]=nw?[...D[sec],o]:D[sec].map(e=>e.id===o.id?o:e);P.s.add(sec);mark(sec+"/"+o.id,nw?"+":"~");
location.hash=`#/${sec}/${o.id}`;render()}}
function rm(sec,id){if(!confirm(xt("cd")))return;const x=D[sec].find(e=>e.id===id);(x.photos||[]).forEach(p=>unph(`photos/${sec}/${id}/${p.f}`));
D[sec]=D[sec].filter(e=>e.id!==id);P.s.add(sec);mark(sec+"/"+id,"-");location.hash="#/"+sec;render()}
function pend(){$("#main").innerHTML=`<h3>${xt("pend")}</h3><ul>${Object.entries(P.l).sort().map(([k,o])=>`<li>${o} ${esc(k)}</li>`).join("")}</ul><p class="dim">${Object.keys(P.a).length} ${xt("pa")}, ${P.d.size} ${xt("pd")}</p><p><button id="pub">${xt("pub")}</button> <button id="dis">${xt("dis")}</button> <button id="bk">${xt("back")}</button> <span id="er"></span></p>`;
$("#bk").onclick=render;
$("#dis").onclick=async()=>{if(!confirm(xt("cdis")))return;P=newP();await fresh();render()};
$("#pub").onclick=async()=>{try{await commit([...P.s],Object.entries(P.a),[...P.d],`Update collection (${np()} changes)`);P=newP();alert(xt("ok"));render()}catch(e){$("#er").textContent=e.message}}}
async function commit(secs,adds,dels,msg){const br=cfg.branch||"main",ref=await gh(`git/ref/heads/${br}`),cm=await gh(`git/commits/${ref.object.sha}`);
const blob=async(c,e)=>(await gh("git/blobs","POST",{content:c,encoding:e})).sha,tree=[];
for(const s of secs)tree.push({path:`data/${s}.json`,mode:"100644",type:"blob",sha:await blob(JSON.stringify(D[s],null,1)+"\n","utf-8")});
if(P.st)tree.push({path:"data/settings.json",mode:"100644",type:"blob",sha:await blob(JSON.stringify(ST,null,1)+"\n","utf-8")});for(const[p,b]of adds)tree.push({path:p,mode:"100644",type:"blob",sha:await blob(b,"base64")});
for(const p of dels)tree.push({path:p,mode:"100644",type:"blob",sha:null});
const t=await gh("git/trees","POST",{base_tree:cm.tree.sha,tree}),c=await gh("git/commits","POST",{message:msg,tree:t.sha,parents:[ref.object.sha]});
await gh(`git/refs/heads/${br}`,"PATCH",{sha:c.sha})}

Object.assign(X.it,{sett:"Impostazioni sito",th:"Tema predefinito",bg:"Sfondo predefinito",no:"Nessuno",addbg:"Aggiungi sfondi"});
Object.assign(X.en,{sett:"Site settings",th:"Default theme",bg:"Default background",no:"None",addbg:"Add backgrounds"});
function sett(){const B=ST.backgrounds||[];
$("#main").innerHTML=`<form id="fs" class="fm"><label>${xt("ti")}<input id="s_ti" type="text" value="${esc(ST.title||"")}"></label><label>${xt("ic")}<input id="s_ic" type="file" accept="image/*"></label><label>${xt("th")}<select id="s_t">${cfg.themes.map(x=>`<option value="${x.id}"${ST.theme===x.id?" selected":""}>${esc(x.name)}</option>`).join("")}</select></label><label>${xt("bg")}<select id="s_b"><option value="">${xt("no")}</option>${(cfg.walls||[]).map(w=>`<option value="w:${w.id}"${ST.bg==="w:"+w.id?" selected":""}>${esc(w.n)}</option>`).join("")}${B.map(b=>`<option value="${esc(b.f)}"${ST.bg===b.f?" selected":""}>${esc(b.n||b.f)}</option>`).join("")}</select></label>${B.map(b=>`<label><input type="checkbox" data-f="${esc(b.f)}"> ${xt("rm")} ${esc(b.n||b.f)}</label>`).join("")}<label>${xt("addbg")}<input id="s_f" type="file" accept="image/*" multiple></label><p><button type="submit">${xt("save")}</button> <button type="button" id="cn">${xt("cancel")}</button></p></form>`;
$("#cn").onclick=render;
$("#fs").onsubmit=async e=>{e.preventDefault();const gone=[...document.querySelectorAll("#fs input[type=checkbox]:checked")].map(i=>i.dataset.f),B2=B.filter(b=>!gone.includes(b.f));gone.forEach(f=>unph("backgrounds/"+f));
for(const[i,fl]of[...$("#s_f").files].entries()){const nm=`${Date.now().toString(36)}-${i}.webp`;P.a["backgrounds/"+nm]=await shrink(fl);B2.push({f:nm,n:fl.name.replace(/\.[^.]+$/,"")})}
const ic=$("#s_ic").files[0];let icon=ST.icon||"";if(ic){if(icon)unph("icons/"+icon);icon="ico-"+Date.now().toString(36)+".png";P.a["icons/"+icon]=await shrink(ic,64,"image/png")}
let bg=$("#s_b").value;if(gone.includes(bg))bg="";ST={...ST,title:$("#s_ti").value.trim(),icon,theme:$("#s_t").value,bg,backgrounds:B2};P.st=1;mark("settings","~");look();render()}}
Object.assign(X.it,{ti:"Titolo (finestra e scheda del browser)",ic:"Icona della scheda (favicon)"});Object.assign(X.en,{ti:"Title (window and browser tab)",ic:"Tab icon (favicon)"});
