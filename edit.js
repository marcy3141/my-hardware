const X={it:{edit:"Modifica",done:"Esci dalla modifica",nw:"Nuova voce",del:"Elimina",save:"Salva",cancel:"Annulla",tok:"Token GitHub (fine-grained, solo questo repo):",login:"Accedi",out:"Logout",ph:"Aggiungi foto (vengono ridimensionate)",rm:"Rimuovi",ok:"Salvato. Il sito si aggiorna in 1-2 minuti.",cd:"Eliminare questa voce e le sue foto?",bad:"Token non valido o senza permessi.",req:"Marca e modello sono obbligatori."},
en:{edit:"Edit",done:"Exit edit mode",nw:"New entry",del:"Delete",save:"Save",cancel:"Cancel",tok:"GitHub token (fine-grained, this repo only):",login:"Log in",out:"Log out",ph:"Add photos (resized automatically)",rm:"Remove",ok:"Saved. The site updates in 1-2 minutes.",cd:"Delete this entry and its photos?",bad:"Invalid token or missing permissions.",req:"Brand and model are required."}};
const xt=k=>X[lang][k];let TK="",EM=0;try{TK=sessionStorage.getItem("tk")||""}catch(e){}
const rp=()=>cfg.repo||location.hostname.split(".")[0]+"/"+location.pathname.split("/")[1];
const gh=async(p,m="GET",b)=>{const r=await fetch(`https://api.github.com/repos/${rp()}${p?"/"+p:""}`,{method:m,headers:{Authorization:"Bearer "+TK,Accept:"application/vnd.github+json"},body:b&&JSON.stringify(b)});if(!r.ok)throw new Error("GitHub "+r.status);return r.json()};
const slug=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const shrink=f=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);c.toBlob(b=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.readAsDataURL(b)},"image/webp",.82)};i.onerror=ko;i.src=URL.createObjectURL(f)});
function ed(r){const n=$("#nav"),m=$("#main");
if(!EM){n.insertAdjacentHTML("beforeend",`<button id="em" style="margin-left:auto">${xt("edit")}</button>`);$("#em").onclick=login;return}
n.insertAdjacentHTML("beforeend",`<button id="em" class="on" style="margin-left:auto">${xt("done")}</button><button id="lo">${xt("out")}</button>`);
$("#em").onclick=()=>{EM=0;render()};$("#lo").onclick=()=>{TK="";try{sessionStorage.removeItem("tk")}catch(e){}EM=0;render()};
if(r.id){m.insertAdjacentHTML("afterbegin",`<p><button id="b1">${xt("edit")}</button> <button id="b2">${xt("del")}</button></p>`);$("#b1").onclick=()=>form(r.sec,D[r.sec].find(e=>e.id===r.id));$("#b2").onclick=()=>rm(r.sec,r.id)}
else{m.insertAdjacentHTML("afterbegin",`<p><button id="b1">+ ${xt("nw")}</button></p>`);$("#b1").onclick=()=>form(r.sec)}}
function login(){if(TK){EM=1;return render()}
$("#main").innerHTML=`<p>${xt("tok")}</p><div class="bar"><input id="tk" type="password" autocomplete="off"><button id="go">${xt("login")}</button></div><p id="er"></p>`;
$("#go").onclick=async()=>{TK=$("#tk").value.trim();try{await gh("");try{sessionStorage.setItem("tk",TK)}catch(e){}EM=1;render()}catch(e){TK="";$("#er").textContent=xt("bad")}}}
function form(sec,x){const F=sch[sec],nw=!x;x=x||{photos:[]};
const inp=f=>{const id="f_"+f.k,v=x[f.k];
if(f.tr)return cfg.langs.map(l=>`<label>${esc(f[lang])} (${l.toUpperCase()})<textarea id="${id}_${l}" rows="3">${esc((v&&v[l])||"")}</textarea></label>`).join("");
const dl=f.f?`<datalist id="dl_${f.k}">${[...new Set(D[sec].flatMap(e=>flat(f,e[f.k])))].map(o=>`<option value="${esc(o)}">`).join("")}</datalist>`:"";
return`<label>${esc(f[lang])}<input id="${id}" ${f.f?`list="dl_${f.k}"`:""} type="${f.t==="number"?"number":"text"}" value="${esc(Array.isArray(v)?v.join(", "):v??"")}"></label>${dl}`};
$("#main").innerHTML=`<form id="fm" class="fm">${F.map(inp).join("")}${x.photos.map(p=>`<label><input type="checkbox" data-f="${esc(p.f)}"> ${xt("rm")} ${esc(p.f)}</label>`).join("")}<label>${xt("ph")}<input id="ph" type="file" accept="image/*" multiple></label><p><button type="submit">${xt("save")}</button> <button type="button" id="cn">${xt("cancel")}</button> <span id="er"></span></p></form>`;
$("#cn").onclick=render;
$("#fm").onsubmit=async e=>{e.preventDefault();const o={id:x.id};
F.forEach(f=>{if(f.tr){const t={};cfg.langs.forEach(l=>{const v=$(`#f_${f.k}_${l}`).value.trim();if(v)t[l]=v});if(Object.keys(t).length)o[f.k]=t}
else{const v=$("#f_"+f.k).value.trim();if(v!=="")o[f.k]=f.t==="tags"?v.split(",").map(s=>s.trim()).filter(Boolean):f.t==="number"?+v:v}});
if(!o.brand||!o.model){$("#er").textContent=xt("req");return}
if(nw){o.id=slug(o.brand+" "+o.model);if(D[sec].some(e=>e.id===o.id))o.id+="-"+Date.now().toString(36)}
const gone=[...document.querySelectorAll("#fm input[type=checkbox]:checked")].map(i=>i.dataset.f);o.photos=x.photos.filter(p=>!gone.includes(p.f));
const add=[];for(const[i,fl]of[...$("#ph").files].entries()){const nm=`${Date.now().toString(36)}-${i}.webp`;add.push([`photos/${sec}/${o.id}/${nm}`,await shrink(fl)]);o.photos.push({f:nm})}
const list=nw?[...D[sec],o]:D[sec].map(e=>e.id===o.id?o:e);
try{await commit(sec,list,add,gone.map(f=>`photos/${sec}/${o.id}/${f}`),(nw?"Add ":"Update ")+o.id);D[sec]=list;alert(xt("ok"));location.hash=`#/${sec}/${o.id}`;render()}catch(er){$("#er").textContent=er.message}}}
async function rm(sec,id){if(!confirm(xt("cd")))return;const x=D[sec].find(e=>e.id===id),list=D[sec].filter(e=>e.id!==id);
try{await commit(sec,list,[],(x.photos||[]).map(p=>`photos/${sec}/${id}/${p.f}`),"Delete "+id);D[sec]=list;alert(xt("ok"));location.hash="#/"+sec;render()}catch(e){alert(e.message)}}
async function commit(sec,list,adds,dels,msg){const br=cfg.branch||"main",ref=await gh(`git/ref/heads/${br}`),cm=await gh(`git/commits/${ref.object.sha}`);
const blob=async(c,e)=>(await gh("git/blobs","POST",{content:c,encoding:e})).sha,tree=[{path:`data/${sec}.json`,mode:"100644",type:"blob",sha:await blob(JSON.stringify(list,null,1)+"\n","utf-8")}];
for(const[p,b]of adds)tree.push({path:p,mode:"100644",type:"blob",sha:await blob(b,"base64")});
for(const p of dels)tree.push({path:p,mode:"100644",type:"blob",sha:null});
const t=await gh("git/trees","POST",{base_tree:cm.tree.sha,tree}),c=await gh("git/commits","POST",{message:msg,tree:t.sha,parents:[ref.object.sha]});
await gh(`git/refs/heads/${br}`,"PATCH",{sha:c.sha})}
