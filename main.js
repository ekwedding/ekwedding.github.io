import * as THREE from "three";
import {Sky} from "three/addons/objects/Sky.js";
import {Water} from "three/addons/objects/Water.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {GTAOPass} from "three/addons/postprocessing/GTAOPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {RGBELoader} from "three/addons/loaders/RGBELoader.js";
import {MeshoptDecoder} from "three/addons/libs/meshopt_decoder.module.js";
import {CONTENT,T} from "./strings.js";

const $=s=>document.querySelector(s);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const touch=matchMedia("(pointer: coarse)").matches;if(touch)document.body.classList.add("touch");
const mobile=touch||Math.min(innerWidth,innerHeight)<700;
let lang="el";try{const l=localStorage.getItem("wlang");if(T[l])lang=l}catch(e){}
const tx=()=>T[lang];
let state={done:{}};try{state=JSON.parse(localStorage.getItem("wq2")||"null")||state}catch(e){}
const save=()=>{try{localStorage.setItem("wq2",JSON.stringify(state))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ICON={cal:'<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  ring:'<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="6"/><path d="M9 4h6l-3 4z"/></svg>',
  plane:'<svg viewBox="0 0 24 24"><path d="M3 13l18-7-7 16-2.5-6.5z"/></svg>',
  music:'<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>'};

/* ---------- places around the plaza (door = where you walk in, face = direction the door looks) ---------- */
const PLACES={
  chapel:{quest:"bless",c:[0,-23],w:7,d:9,door:[0,-17.9],face:0},
  gallery:{quest:"story",c:[-21,-9],w:7,d:8,door:[-16.9,-9],face:Math.PI/2},
  estate:{quest:"date",c:[21,-9],w:7,d:8,door:[16.9,-9],face:-Math.PI/2},
  post:{quest:"wish",c:[-21,7],w:7,d:7,door:[-16.9,7],face:Math.PI/2},
  club:{quest:"dance",c:[21,7],w:8,d:8,door:[16.9,7],face:-Math.PI/2},
  agency:{quest:"honey",c:[13,-22],w:7,d:7,door:[13,-17.9],face:0,final:true}
};
const ORDER=["estate","gallery","chapel","club","post","agency"];
PLACES.arcade={c:[31,-1],w:7,d:8,door:[27,-1],face:-Math.PI/2};
const questOf=id=>PLACES[id]&&PLACES[id].quest;const QUEST_OF_ROOM=id=>PLACES[id]&&PLACES[id].quest;
const agencyOpen=()=>ORDER.filter(id=>!PLACES[id].final).every(id=>state.done[questOf(id)]);
const nextPlace=()=>ORDER.find(id=>!state.done[questOf(id)]&&(!PLACES[id].final||agencyOpen()))||null;

/* ---------- backend: Firestore REST when configured, local demo otherwise ---------- */
const DB=(()=>{const b=CONTENT.backend;if(!b.projectId)return null;
  const root=`projects/${b.projectId}/databases/(default)/documents`,base="https://firestore.googleapis.com/v1/"+root,key="?key="+encodeURIComponent(b.apiKey);
  const fv=v=>typeof v==="boolean"?{booleanValue:v}:typeof v==="number"?{integerValue:String(v|0)}:v instanceof Date?{timestampValue:v.toISOString()}:{stringValue:String(v)};
  const req=(u,body)=>fetch(u,{method:body?"POST":"GET",headers:{"Content-Type":"application/json"},body:body&&JSON.stringify(body)}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});
  return{add:(col,o)=>req(base+"/"+col+key,{fields:Object.fromEntries(Object.entries(o).map(([k,v])=>[k,fv(v)]))}),
    bump:()=>req(base+":commit"+key,{writes:[{transform:{document:root+"/stats/liveCounter",fieldTransforms:[{fieldPath:"total",increment:{integerValue:"1"}}]}}]}),
    count:()=>req(base+"/stats/liveCounter"+key).then(d=>+(d.fields?.total?.integerValue||0))}})();
let voteCount=0;try{voteCount=+(localStorage.getItem("wcount")||0)}catch(e){}
if(DB)DB.count().then(n=>voteCount=n,()=>{});
/* Google Sheet (Apps Script) when configured: every record carries the guest's one name; the sheet de-duplicates by it */
const SHEET=CONTENT.sheet;
function sheetPost(col,rec){return fetch(SHEET,{method:"POST",body:JSON.stringify({col,rec}),keepalive:true}).then(r=>r.json())}
function store(col,rec,isVote){rec={...rec,name:rec.name||state.guest||""};
  if(SHEET){const req=sheetPost(col,rec).then(r=>{if(isVote&&r.total!=null)voteCount=r.total;return r}).catch(()=>store.local(col,rec,isVote));
    /* only a vote needs the sheet's answer (it may be a repeat); everything else is confirmed instantly */
    return isVote?Promise.race([req,new Promise(res=>setTimeout(()=>res({ok:true,slow:true}),2500))]):Promise.resolve({ok:true})}
  return store.local(col,rec,isVote)}
store.local=(col,rec,isVote)=>{
  const local=()=>{try{const k="w_"+col,a=JSON.parse(localStorage.getItem(k)||"[]");a.push(rec);localStorage.setItem(k,JSON.stringify(a));if(isVote){voteCount++;localStorage.setItem("wcount",voteCount)}}catch(e){}return false};
  if(!DB)return Promise.resolve(local());
  return DB.add(col,{...rec,createdAt:new Date()}).then(()=>isVote?DB.bump().then(DB.count).then(n=>{voteCount=n;return true}):true).catch(local);
}

/* ================= UI ================= */
const labelEls={};let ready=false;const prog={groom:0,bride:0};
let mode="intro",goal=null,camYaw=0,camPitch=.42,camDist=11,room=null,userCamT=-9,tAll=0;
function renderUI(){
  const x=tx(),n=CONTENT.names[lang];document.documentElement.lang=lang;
  document.querySelectorAll("[data-t]").forEach(e=>{const v=x[e.dataset.t];if(typeof v==="string")e.textContent=v});
  $("#names").innerHTML=`${esc(n[0])}<span>&amp;</span>${esc(n[1])}`;
  const pc=Math.round((prog.groom+prog.bride)/2*100);$("#pG").textContent=ready?x.pickG:x.loading+(pc?" "+pc+"%":"");$("#pB").textContent=ready?x.pickB:x.loading+(pc?" "+pc+"%":"");
  document.querySelectorAll(".langs button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.l===lang)));
  $("#cardX").setAttribute("aria-label",x.close);$("#bSnd").setAttribute("aria-label",x.music);
  renderList();renderObj();renderLabels();
}
function renderList(){
  const x=tx(),main5=ORDER.filter(id=>!PLACES[id].final),n5=main5.filter(id=>state.done[questOf(id)]).length;$("#prog").innerHTML=`<b>${n5}/5</b>`+main5.map(id=>`<i class="${state.done[questOf(id)]?"on":""}"></i>`).join("")+`<span class="p6">+${state.done.honey?'<i class="on"></i>':`<svg class="lk ${agencyOpen()?"open":""}" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="${agencyOpen()?"M8 11V8a4 4 0 0 1 7.5-2":"M8 11V8a4 4 0 0 1 8 0v3"}"/></svg>`}1</span>`;
  $("#listBack").textContent="← "+x.backPlaza;$("#listH").textContent=`${x.stopsH} · ${n5}/5 ${x.tasksOf}`;
  $("#listOl").innerHTML=""+ORDER.map(id=>{const q=questOf(id),d=state.done[q],lock=PLACES[id].final&&!agencyOpen();
    return `<li class="${d?"done":""}${PLACES[id].final?" final":""}"><button class="row" type="button" data-go="${id}" ${lock?'aria-disabled="true"':""}><span class="mark">${d?ICON.check:""}</span><span><b>${id==="club"?x.clubName:x.P[id]} – ${x.Q[q][0]}</b><small>${lock?x.lock6:x.Q[q][1]}</small></span><span class="go">${d?x.done:lock?x.locked:x.go}</span></button></li>`}).join("");
  $("#destUl").innerHTML=ORDER.map(id=>{const lock=PLACES[id].final&&!agencyOpen();return `<li><button class="row" type="button" data-ride="${id}" ${lock?'aria-disabled="true"':""}><span class="mark">${state.done[questOf(id)]?ICON.check:""}</span><span><b>${x.P[id]}</b><small>${x.Q[questOf(id)][0]}</small></span><span class="go">${lock?x.locked:"→"}</span></button></li>`}).join("");
}
/* the line under the top bar: next stop outside, what to do here inside a building */
function renderObj(){const x=tx(),narrow=innerWidth<560,o=$("#obj");
  if(room){const q=questOf(room.id);if(q&&room.id!=="den"&&!PLACES[room.id].final||q==="honey"){o.innerHTML=state.done[q]?`<span class="qd">✓</span> ${x.questDone}`:`<b>Quest:</b> ${x.Q[q][1]} ${x.questToPass}`;return}o.innerHTML=`<b>${x.guide[room.id]}</b>${narrow?"":" · "+x.exitHint}`;return}
  const id=nextPlace();o.innerHTML=id?(narrow?`${x.nextStop}: <b>${x.P[id]}</b> ${x.nextGo}`:`${x.nextStop}: <b>${x.Q[questOf(id)][0]}</b> · ${x.P[id]} ${x.nextGo}`):state.quiz>=2?x.objEnd:x.honeyDone}
$("#obj").addEventListener("click",()=>{if(mode!=="play")return;if(room){if(room.id==="den"||state.done[questOf(room.id)]){const id=nextPlace();if(id&&id!==room.id)goPlace(id)}else walkTo(room.spot[0],room.spot[1]);return}const id=nextPlace();if(id)goPlace(id)});
function panel(sel,open){const p=$(sel);open=open==null?p.classList.contains("shut"):open;p.classList.toggle("shut",!open);
  const b=sel==="#list"?$("#bList"):$("#bVespa");b.setAttribute("aria-expanded",String(open));if(open)panel(sel==="#list"?"#dest":"#list",false)}
$("#bList").addEventListener("click",()=>panel("#list"));
$("#listBack").addEventListener("click",()=>{panel("#list",false);goPlaza()});
$("#bVespa").addEventListener("click",()=>{if(mode==="play"||mode==="drive")panel("#dest")});
$("#listOl").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;const id=b.dataset.go;if(id==="plaza"){panel("#list",false);goPlaza();return}
  if(PLACES[id].final&&!agencyOpen()){toast(tx().lockedMsg);return}panel("#list",false);goPlace(id)});
$("#destUl").addEventListener("click",e=>{const b=e.target.closest("[data-ride]");if(!b)return;const id=b.dataset.ride;
  if(PLACES[id].final&&!agencyOpen()){toast(tx().lockedMsg);return}panel("#dest",false);if(mode==="drive")driveTo(id);else startRide(id)});
document.querySelectorAll(".langs button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.l;try{localStorage.setItem("wlang",lang)}catch(e){}renderUI();if(cardFn)cardFn()}));
let toastT=0;function toast(s,ms=4200){const t=$("#toast");t.textContent=s;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),ms)}

/* ---------- quest cards ---------- */
let cardFn=null;
function openCard(where,title,body,bind){const c=$("#card");$("#cardW").textContent=where;$("#cardH").textContent=title;$("#cardB").innerHTML=body;
  c.classList.remove("shut");document.body.classList.add("cardopen");if(room)roomFocus(0);if(bind)bind();c.querySelectorAll("form").forEach(f=>f.addEventListener("submit",()=>{const b=f.querySelector("button[type=submit]");if(b&&f.checkValidity()){b.disabled=true;b.style.opacity=.6;setTimeout(()=>{b.disabled=false;b.style.opacity=""},2500)}}));if(state.guest)["nm","vn","wn","hName"].forEach(id=>{const f=document.getElementById(id);if(f){f.value=state.guest;f.readOnly=true}})}
function closeCard(){const yf=$("#cardB iframe,#cardB video.prop");if(yf){const wasYt=yf.tagName==="IFRAME";yf.remove();if(wasYt)setTimeout(soundscape,50)}$("#card").classList.add("shut");document.body.classList.remove("cardopen");if(room)roomZoomT=ROOM_FAR;cardFn=null;if(P&&P.lock>=59&&P.lock<=60.5&&selfieCam>0){selfieCam=0;[P,N].forEach(e=>e.lock=0)}}
$("#cardX").addEventListener("click",closeCard);
addEventListener("keydown",e=>{if(e.key==="Escape"){closeCard();panel("#list",false);panel("#dest",false)}});
function complete(q){if(state.done[q])return;state.done[q]=1;save();passBanner();mood("fun",14);mood("love",8);renderList();renderObj();renderLabels();if(navigator.vibrate)navigator.vibrate(25);
  const id=ORDER.find(k=>questOf(k)===q);if(!PLACES[id].final&&agencyOpen())setTimeout(()=>toast(tx().allDone,6000),900);
  if(ORDER.every(k=>state.done[questOf(k)]))setTimeout(()=>{const x=tx();state.fin=Date.now();save();openCard("· · ·",x.finaleH,`<p>${x.finaleP}</p><div class="acts"><button class="btn" type="button" id="fin">${x.finaleBtn}</button></div>`,()=>$("#fin").addEventListener("click",closeCard));for(let k=0;k<14;k++)setTimeout(()=>P&&heart(room?room.scene:world,P.pos.clone().setY(2.2)),k*220)},2200)}

function calText(){const x=tx();return{title:x.calTitle,loc:CONTENT.venue.name+", "+CONTENT.venue.addr,desc:CONTENT.schedule.map(s=>s[0]+" "+x.sched[s[1]]).join(" · ")+(CONTENT.demo?" ("+x.demoNote+")":"")+" "+location.href.split("?")[0]}}
const icsEsc=s=>s.replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g,"\\n");
function downloadICS(){const c=calText(),al=t=>["BEGIN:VALARM","TRIGGER:"+t,"ACTION:DISPLAY","DESCRIPTION:"+icsEsc(c.title),"END:VALARM"];
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//EK//wedding//EL","CALSCALE:GREGORIAN","BEGIN:VEVENT","UID:wedding-20270820@ek","DTSTAMP:20261029T000000Z","DTSTART:"+CONTENT.startUTC,"DTEND:"+CONTENT.endUTC,
    "SUMMARY:"+icsEsc(c.title),"LOCATION:"+icsEsc(c.loc),"DESCRIPTION:"+icsEsc(c.desc),...al("-P7D"),...al("-P1D"),"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar;charset=utf-8"}));a.download="gamos-20-08-2027.ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
const gcal=()=>{const c=calText();return"https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(c.title)+"&dates="+CONTENT.startUTC+"/"+CONTENT.endUTC+"&location="+encodeURIComponent(c.loc)+"&details="+encodeURIComponent(c.desc)};
const schedHTML=()=>`<dl class="sched">${CONTENT.schedule.map(s=>`<div><dt>${tx().sched[s[1]]}</dt><dd>${s[0]}</dd></div>`).join("")}</dl>`;

const L2=o=>o[lang]||o.en;
const infoHTML=rows=>`<dl class="info">${rows.map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join("")}</dl>`;
function passBanner(){let b=$("#pass");if(!b){b=document.createElement("div");b.id="pass";document.body.appendChild(b)}b.textContent="✓ "+tx().passed;b.classList.remove("show");void b.offsetWidth;b.classList.add("show")}
const CARDS={
  estate(tab="cal"){const x=tx();const tabs=`<div class="seg" role="tablist" style="margin:0 0 10px"><label><input type="radio" name="et" value="cal" ${tab==="cal"?"checked":""}><span>${x.tabCal}</span></label><label><input type="radio" name="et" value="rsvp" ${tab==="rsvp"?"checked":""}><span>${x.tabRsvp}</span></label></div>`;
    const body=tab==="cal"?`<p>${x.dateP}</p>${schedHTML()}<div class="acts"><button class="btn" type="button" id="aIcs">${ICON.cal}${x.addCal}</button><a class="btn ghost" id="aG" href="${gcal()}" target="_blank" rel="noopener">${ICON.ext}${x.gcal}</a><a class="btn ghost" href="${CONTENT.venue.maps}" target="_blank" rel="noopener">${ICON.pin}${x.maps}</a></div>${CONTENT.demo?`<p class="demo">${x.demoNote}</p>`:""}`
      :`<form id="rsvp" autocomplete="off"><label class="f"><span>${x.yourName}</span><input id="nm" required maxlength="80"></label>
      <div class="seg"><label><input type="radio" name="att" value="yes" checked><span>${x.yes}</span></label><label><input type="radio" name="att" value="no"><span>${x.no}</span></label></div>
      <div class="acts" style="align-items:end"><label class="f" style="margin:0;flex:0 0 120px"><span>${x.guests}</span><select id="gs"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label><button class="btn" type="submit" style="flex:1">${x.send}</button></div><p class="ok" id="rOk" hidden></p></form>`;
    openCard(x.P.estate,x.dateH,tabs+body,()=>{document.querySelectorAll("input[name=et]").forEach(r=>r.addEventListener("change",()=>CARDS.estate(r.value)));
      const A=(state.ans||{}).rsvp;if(tab!=="cal"&&A){$("#nm").value=A.name;document.querySelector(`input[name=att][value=${A.att?"yes":"no"}]`).checked=true;$("#gs").value=String(A.count);const o=$("#rOk");o.hidden=false;o.textContent=`${x.yourAns}: ${A.att?x.attY:x.attN} · ${A.count} ${x.persons}`}
      if(tab==="cal"){$("#aIcs").addEventListener("click",()=>{downloadICS();complete("date")});$("#aG").addEventListener("click",()=>complete("date"))}
      else $("#rsvp").addEventListener("submit",e=>{e.preventDefault();const name=$("#nm").value.trim();if(!name)return;
        const att=document.querySelector("input[name=att]:checked").value==="yes";state.ans=state.ans||{};state.ans.rsvp={name,att,count:+$("#gs").value};save();
        store("rsvp",{name,attending:att,count:+$("#gs").value,notes:"",lang}).then(r=>{const o=$("#rOk");o.hidden=false;o.textContent=r?x.thanks:x.thanksLocal;complete("date")})})});cardFn=()=>CARDS.estate(tab)},
  gallery(i=0){const x=tx(),s=CONTENT.story[i];openCard(x.P.gallery+` · ${i+1}/${CONTENT.story.length}`,s.city,`<div class="ph"><img class="photo" alt="${esc(s.city)}" src="${s.src||photoURL(i)}">${s.stamp?`<span class="stamp">${s.stamp}</span>`:""}</div><p>${x.storyT[i]}</p>${s.src?"":`<p class="demo">${x.photoDemo}</p>`}
    <div class="pnav"><button class="btn ghost" type="button" id="pPrev" ${i?"":"disabled"}>←</button><span>${i+1} / ${CONTENT.story.length}</span><button class="btn" type="button" id="pNext">${i<CONTENT.story.length-1?x.next+" →":x.close}</button></div>`,()=>{
      $("#pPrev").addEventListener("click",()=>CARDS.gallery(i-1));$("#pNext").addEventListener("click",()=>{if(i<CONTENT.story.length-1)CARDS.gallery(i+1);else{complete("story");closeCard()}});
      if(i===CONTENT.story.length-1)complete("story")});cardFn=()=>CARDS.gallery(i)},
  chapel(){const x=tx();openCard(x.P.chapel,x.blessH,`<p>${x.blessP}</p><div class="acts"><button class="btn" type="button" id="aB">${x.blessBtn}</button></div>`,()=>{
      $("#aB").addEventListener("click",()=>{closeCard();blessing();complete("bless")})});cardFn=CARDS.chapel},
  club(den){const x=tx(),cur=den?denTrack:clubTrack;openCard(den?"VIP":"DJ",x.clubTracks,`<div class="seg">${CLUB_TRACKS.map((t,i)=>`<label><input type="radio" name="tr" value="${i}" ${i===cur?"checked":""}><span>${t[0]}</span></label>`).join("")}</div>`,()=>{
      document.querySelectorAll("input[name=tr]").forEach(r=>r.addEventListener("change",()=>{if(den)denTrack=+r.value;else clubTrack=+r.value;if(!soundOn)setSound(true);else soundscape()}))});cardFn=()=>CARDS.club(den)},
  den(){const x=tx();openCard("· · ·",x.denH,`<p>${x.denP}</p><h4 class="sub">${x.vipH}</h4>${infoHTML(L2(CONTENT.vip))}<div class="acts"><a class="btn ghost" href="${CONTENT.villa}" target="_blank" rel="noopener">${ICON.ext}${x.villaBtn}</a></div><h4 class="sub">${x.vipIdeaH}</h4><p>${x.vipIdeaP}</p>
    <form id="vf"><label class="f"><span>${x.yourName}</span><input id="vn" maxlength="80" required></label><label class="f"><span>${x.vipIdeaL}</span><textarea id="vt" maxlength="800" required></textarea></label><div class="acts"><button class="btn" type="submit">${x.send}</button></div><p class="ok" id="vOk" hidden></p></form>`,()=>{
      $("#vf").addEventListener("submit",e=>{e.preventDefault();const n=$("#vn").value.trim(),w=$("#vt").value.trim();if(!n||!w)return;store("vip",{name:n,text:w,lang}).then(()=>{const o=$("#vOk");o.hidden=false;o.textContent=x.vipSent;$("#vt").value=""})})});cardFn=CARDS.den},
  drinks(){const x=tx(),had=(state.ans||{}).drinks||[];openCard("Bar",x.drinksH,`<p>${x.drinksP}</p><form id="df"><div class="qa">${CONTENT.drinks.map(k=>`<label class="chk"><input type="checkbox" value="${k}" ${had.includes(k)?"checked":""}><span>${x.dr[k]}</span></label>`).join("")}</div>
    <div class="acts"><button class="btn" type="submit">${x.send}</button></div><p class="ok" id="dOk" ${had.length?"":"hidden"}>${had.length?x.yourAns+": "+had.map(k=>x.dr[k]).join(", "):""}</p></form>`,()=>{
      $("#df").addEventListener("submit",e=>{e.preventDefault();const v=[...$("#df").querySelectorAll("input:checked")].map(i=>i.value);if(!v.length)return;state.ans=state.ans||{};state.ans.drinks=v;save();store("drinks",{picks:v.join(","),lang}).then(()=>{const o=$("#dOk");o.hidden=false;o.textContent=x.drinksSent})})});cardFn=CARDS.drinks},
  kids(){const x=tx();openCard(x.P.gallery,x.kidsH,`<img class="photo" style="aspect-ratio:auto;width:auto;max-width:100%;max-height:min(64vh,620px);margin:0 auto 12px;object-fit:contain" src="assets/collage.jpg?v=2" alt="${esc(x.kidsH)}">`);cardFn=CARDS.kids},
  years(){const x=tx(),ys=CONTENT.years||[];openCard(x.P.gallery,x.yearsH,ys.length?`<div class="yrs">${ys.map(y=>`<figure><img src="${y.src}" alt="${y.y}" loading="lazy"><figcaption>${y.y}</figcaption></figure>`).join("")}</div>`:`<p class="demo">${x.yearsSoon}</p>`);cardFn=CARDS.years},
  album(){const x=tx();openCard(x.P.gallery,x.albumH,`<p>${x.albumP}</p><div class="acts"><a class="btn" href="${CONTENT.album}" target="_blank" rel="noopener">${ICON.ext}${x.albumBtn}</a></div>`);cardFn=CARDS.album},
  menu(){const x=tx();openCard(x.P.estate,x.menuH,infoHTML(L2(CONTENT.menu))+(CONTENT.demo?`<p class="demo">${x.demoNote}</p>`:""));cardFn=CARDS.menu},
  /* the proposal, on the den's tablet: the video muted, under a soft track */
  proposal(){const x=tx();openCard("· · ·",x.tabletH,`<video class="prop" src="${CONTENT.proposal}" playsinline autoplay muted loop controls style="display:block;width:auto;max-width:100%;height:min(62vh,560px);margin:0 auto;object-fit:contain;border-radius:12px;background:#000"></video>`);cardFn=null},
  yt(id,title){openCard("· · ·",title,`<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&playsinline=1&rel=0" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`);ALL.forEach(a=>a.pause());cardFn=null},
  gift(){const x=tx(),g=CONTENT.gift,cp=(id,v)=>`<button class="btn ghost sm" type="button" data-cp="${esc(v)}">${x.copy}</button>`;
    openCard(x.P.agency,x.giftH,`<p>${x.giftP}</p><div class="gifts">
      ${g.iban?`<div class="gft"><img src="assets/logo-nbg.svg" alt="NBG" height="22"><small>${x.holder}: <b>${esc(g.holder)}</b></small><code>${esc(g.iban)}</code>${cp(0,g.iban.replace(/\s/g,""))}</div>`:""}
      ${g.iris?`<div class="gft"><span class="iris">IRIS</span><small>${x.irisP}</small><code>${esc(g.iris)}</code>${cp(1,g.iris.replace(/\s/g,""))}</div>`:""}
      ${g.revolut?`<div class="gft"><img src="assets/logo-revolut.svg" alt="Revolut" height="20"><code>@${esc(g.revolut)}</code><a class="btn sm" href="https://revolut.me/${encodeURIComponent(g.revolut)}" target="_blank" rel="noopener">${x.openRev}</a></div>`:""}
    </div>${CONTENT.demo?`<p class="demo">${x.demoNote}</p>`:""}`,()=>{$("#cardB").querySelectorAll("[data-cp]").forEach(b=>b.addEventListener("click",()=>{navigator.clipboard&&navigator.clipboard.writeText(b.dataset.cp).then(()=>{b.textContent=x.copied;setTimeout(()=>b.textContent=x.copy,1600)}).catch(()=>{})}))});cardFn=CARDS.gift},
  post(){const x=tx();openCard(x.P.post,x.wishH,`<p>${x.wishP}</p><form id="wf"><label class="f"><span>${x.yourName}</span><input id="wn" maxlength="80" required></label><label class="f"><span>${x.wishText}</span><textarea id="wt" maxlength="800" required></textarea></label>
    <div class="acts"><button class="btn" type="submit">${x.send}</button></div><p class="ok" id="wOk" hidden></p></form>`,()=>{
      const A=(state.ans||{}).wish;if(A){$("#wn").value=A.n;$("#wt").value=A.w;const o=$("#wOk");o.hidden=false;o.textContent=x.yourAns+" ✓"}
      $("#wf").addEventListener("submit",e=>{e.preventDefault();const n=$("#wn").value.trim(),w=$("#wt").value.trim();if(!n||!w)return;state.ans=state.ans||{};state.ans.wish={n,w};save();
        store("wishes",{name:n,text:w,lang}).then(r=>{const o=$("#wOk");o.hidden=false;o.textContent=r?x.thanks:x.thanksLocal;complete("wish")})})});cardFn=CARDS.post},
  agency(){const x=tx();openCard(x.P.agency,x.honeyH,`<p>${x.honeyP}</p><p><b>${x.honeyPick}</b></p><form id="hf"><div class="seg">${CONTENT.honey.map(k=>`<label><input type="radio" name="hm" value="${k}" required><span>${x.opt[k]}</span></label>`).join("")}</div>
    <label class="f"><span>${x.voteName}</span><input id="hName" autocomplete="name" required maxlength="60"></label><p class="demo" style="margin:6px 0 10px">${x.voteOnce}</p><div class="acts" style="align-items:center"><button class="btn" type="submit">${x.vote}</button><span><b id="vc">${voteCount}</b> ${x.voted}</span></div><p class="ok" id="hOk" ${state.done.honey?"":"hidden"}>${x.honeyDone}</p></form>`,()=>{
      const A=(state.ans||{}).honey;if(A&&!state.done.honey&&agencyOpen())setTimeout(()=>complete("honey"),300);if(A){const r=document.querySelector(`input[name=hm][value=${A}]`);if(r)r.checked=true;$("#hf").querySelectorAll("input,button").forEach(i=>i.disabled=true);if(state.ans.honeyName)$("#hName").value=state.ans.honeyName;$("#hOk").textContent=`${x.yourAns}: ${x.opt[A]} · ${x.honeyDone}`}
      $("#hf").addEventListener("submit",e=>{e.preventDefault();const v=(document.querySelector("input[name=hm]:checked")||{}).value,nm=$("#hName").value.trim();if(!v||!nm||state.done.honey||(state.ans||{}).honey)return;state.ans=state.ans||{};state.ans.honey=v;state.ans.honeyName=nm;save();$("#hf").querySelectorAll("input,button").forEach(i=>i.disabled=true);
        store("votes",{optionId:v,name:nm,attending:true},true).then(r=>{if(r&&r.dup){state.ans.honey=r.optionId;save();$("#hOk").textContent=`${x.votedAlready}: ${x.opt[r.optionId]||r.optionId}`}$("#vc").textContent=voteCount;$("#hOk").hidden=false;complete("honey")})})});cardFn=CARDS.agency}
};
/* drawn placeholder photo: a postcard of the city until the couple adds real pictures */
const photoCache={};
function photoURL(i){if(photoCache[i])return photoCache[i];const c=document.createElement("canvas");c.width=800;c.height=600;const g=c.getContext("2d");
  const pal=[["#e9b88f","#7a4b3a"],["#9cc3d9","#2c4f6b"],["#c9ced6","#3b4250"],["#b8d0b0","#3d5a40"],["#f0c3a0","#8a3e5a"]][i%5];
  const gr=g.createLinearGradient(0,0,0,600);gr.addColorStop(0,pal[0]);gr.addColorStop(1,"#fbfaf7");g.fillStyle=gr;g.fillRect(0,0,800,600);
  g.fillStyle=pal[1];for(let k=0;k<14;k++){const w=30+((k*37)%60),h=60+((k*53)%170);g.fillRect(k*58,430-h,w,h+170)}
  g.fillStyle="rgba(255,255,255,.9)";g.font="300 76px Piazzolla, Georgia, serif";g.textAlign="center";g.fillText(CONTENT.story[i].city,400,250);
  return photoCache[i]=c.toDataURL("image/jpeg",.85)}

/* ---------- simple version ---------- */
function giftRows(){const g=CONTENT.gift,x=tx();return infoHTML([g.iban&&["NBG · IBAN",g.iban+" · "+g.holder],g.iris&&["IRIS",g.iris],g.revolut&&["Revolut","@"+g.revolut]].filter(Boolean))}
function showSimple(){const x=tx(),n=CONTENT.names[lang];$("#simple").hidden=false;
  const stops=ORDER.map(id=>{const q=questOf(id),lock=PLACES[id].final&&!agencyOpen();
    return `<li class="${state.done[q]?"done":""}"><div class="row" style="cursor:default"><span class="mark">${state.done[q]?ICON.check:""}</span><span><b>${x.Q[q][0]}</b><small>${id==="club"?x.clubName:x.P[id]}</small></span><button class="btn ${lock?"ghost":""}" type="button" data-tp="${id}" ${lock?'aria-disabled="true"':""}>${lock?x.locked:x.teleport}</button></div></li>`}).join("");
  $("#simpleB").innerHTML=`<h1>${esc(n[0])} &amp; ${esc(n[1])}</h1><p><b>${x.dateH}</b> · 19:00 · ${x.koropi}</p>
  <section><h2>${x.Q.date[0]}</h2>${schedHTML()}<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"><button class="btn" type="button" id="sI">${ICON.cal}${x.addCal}</button><a class="btn ghost" href="${gcal()}" target="_blank" rel="noopener">${ICON.ext}${x.gcal}</a><a class="btn ghost" href="${CONTENT.venue.maps}" target="_blank" rel="noopener">${ICON.pin}${x.maps}</a></div></section>
  <section><h2>${x.koumW}</h2>${["kp","ka"].map(k=>`<p style="display:flex;gap:12px;align-items:flex-start"><img src="assets/av_${k}.jpg" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none"><span><b>${x[k+"Full"]}</b><br>${x[k+"P"]} <i>— ${x[k+"Sig"]}</i></span></p>`).join("")}</section>
  <section><h2>${x.infoH}</h2>${infoHTML(L2(CONTENT.info))}</section>
  <section><h2>${x.giftH}</h2><p>${x.giftP}</p>${giftRows()}</section>
  <section><h2>${x.albumH}</h2><p>${x.albumP}</p><a class="btn" href="${CONTENT.album}" target="_blank" rel="noopener">${ICON.ext}${x.albumBtn}</a></section>
  <section><h2>${x.storyH}</h2><ol style="padding-left:20px">${x.storyT.map(t=>`<li>${t}</li>`).join("")}</ol></section>
  <section><h2>${x.blessH}</h2><p>${x.blessP}</p></section>
  <section><h2>${x.simpleStops}</h2><p>${x.simpleNote}</p><ul style="list-style:none;margin-top:8px">${stops}</ul></section>
  ${CONTENT.demo?`<p class="demo">${x.demoNote}</p>`:""}${GL?`<button class="btn ghost" type="button" id="sBack">${x.back}</button>`:""}`;
  $("#sI").addEventListener("click",downloadICS);const b=$("#sBack");if(b)b.addEventListener("click",()=>{$("#simple").hidden=true});
  $("#simpleB").querySelectorAll("[data-tp]").forEach(bt=>bt.addEventListener("click",()=>{const id=bt.dataset.tp;if(PLACES[id].final&&!agencyOpen()){toast(x.lockedMsg);return}teleport(id)}))}
/* teleport: straight into a building, from anywhere (also from the intro); without 3D the stop's card opens instead */
function teleport(id){$("#simple").hidden=true;
  if(!GL){document.body.classList.add("play");CARDS[id]();return}
  if(mode==="intro"){choose("groom");mode="play";flyT=1}
  const go=()=>{mode="play";enterRoom(id)};if(room)exitRoom(go);else if(mode==="play")go();else setTimeout(go,300)}
$("#bSimple").addEventListener("click",()=>{panel("#list",false);showSimple()});

/* ---------- sound: one function decides what plays where ---------- */
const music=$("#music"),chant=new Audio("assets/chant.m4a"),secretSong=new Audio("assets/music/innerbloom.m4a"),clubSong=new Audio();
chant.preload=secretSong.preload=clubSong.preload="none";secretSong.loop=clubSong.loop=true;
const CLUB_TRACKS=[["Καμπάνες","assets/music/kabanes.m4a"],["Where Is My Husband!","assets/music/raye_husband.m4a"],["Τόσα Καλοκαίρια","assets/music/tosa_kalokairia.m4a"],["Aicha","assets/music/aicha.m4a"],["Φανάρια","assets/music/fanaria.m4a"],["Innerbloom","assets/music/innerbloom.m4a"]];
let clubTrack=1,denTrack=5,soundOn=false,actx=null,chanting=false,atSecret=false;
const denSong=new Audio();denSong.loop=true;denSong.preload="none";const ALL=[music,chant,secretSong,clubSong,denSong];
const SEG=new Map([[music,[18,180]],[secretSong,[93,1e9]]]);music.loop=secretSong.loop=false;
SEG.forEach(([a,b],el)=>{el.addEventListener("timeupdate",()=>{const end=Math.min(b,(el.duration||1e9)-.35);if(el.currentTime>=end)el.currentTime=a});el.addEventListener("ended",()=>{el.currentTime=a;el.play().catch(()=>{})})});
function soundscape(){if(!soundOn){ALL.forEach(a=>a.pause());return}
  const want=chanting?chant:(room&&room.id==="den")?denSong:(room&&room.id==="club")?clubSong:room?null:music;
  if(!want){ALL.forEach(a=>a.pause());return}
  if(want===clubSong&&!clubSong.src.endsWith(CLUB_TRACKS[clubTrack][1]))clubSong.src=CLUB_TRACKS[clubTrack][1];
  if(want===denSong&&!denSong.src.endsWith(CLUB_TRACKS[denTrack][1]))denSong.src=CLUB_TRACKS[denTrack][1];
  ALL.forEach(a=>{if(a!==want)a.pause()});const sg=SEG.get(want);if(sg&&want.currentTime<sg[0])want.currentTime=sg[0];want.volume=want===denSong&&denTrack===5?.12:.5;if(want.paused)want.play().catch(()=>{})}
/* every place keeps its own mute: the plaza choice is remembered; rooms start on; the chant always plays when asked for */
const zoneOn={};const zone=()=>chanting?"chant":room?room.id:"plaza";
function syncSnd(){const k=zone();applySound(k in zoneOn?zoneOn[k]:true)}
function setSound(on){const k=zone();zoneOn[k]=on;if(k==="plaza")try{localStorage.setItem("wsound",on?"1":"0")}catch(e){}applySound(on)}
function applySound(on){soundOn=on;$("#bSnd").setAttribute("aria-pressed",String(on));$("#sndOn").toggleAttribute("hidden",!on);$("#sndOff").toggleAttribute("hidden",on);
  if(on){if(!actx){try{actx=new AudioContext();const n=actx.createBufferSource(),b=actx.createBuffer(1,actx.sampleRate*4,actx.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=l*.985+(Math.random()*2-1)*.015;d[i]=l*3}
      n.buffer=b;n.loop=true;const f=actx.createBiquadFilter();f.type="lowpass";f.frequency.value=600;const g=actx.createGain();g.gain.value=.08;n.connect(f).connect(g).connect(actx.destination);n.start()}catch(e){}}else actx.resume()}
  else if(actx)actx.suspend();soundscape()}
let primed=false;addEventListener("pointerdown",()=>{if(primed)return;primed=true;if(!clubSong.src)clubSong.src=CLUB_TRACKS[clubTrack][1];if(!denSong.src)denSong.src=CLUB_TRACKS[denTrack][1];
  ALL.forEach(a=>{if(!a.paused)return;const v=a.volume;a.volume=0;a.play().then(()=>{if(a!==soundscapeWant())a.pause();a.volume=v}).catch(()=>{a.volume=v})})},true);
const soundscapeWant=()=>soundOn?(chanting?chant:(room&&room.id==="den")?denSong:(room&&room.id==="club")?clubSong:room?null:music):null;
chant.addEventListener("ended",()=>{chanting=false;syncSnd()});
$("#bSnd").addEventListener("click",()=>setSound(!soundOn));
function bell(){if(zoneOn[zone()]===false)return;if(!actx){try{actx=new AudioContext()}catch(e){return}}actx.resume&&actx.resume();[0,.9,1.8].forEach((t,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=[392,330,262][i];g.gain.setValueAtTime(.0001,actx.currentTime+t);g.gain.exponentialRampToValueAtTime(.045,actx.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t+2.4);o.connect(g).connect(actx.destination);o.start(actx.currentTime+t);o.stop(actx.currentTime+t+2.5)})}

/* ================= 3D ================= */
const canvas=$("#gl");let GL=false,renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});GL=renderer.capabilities.isWebGL2}catch(e){GL=false}
renderUI();
if(!GL){$("#intro").hidden=true;showSimple();throw new Error("no webgl2")}
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=+(new URLSearchParams(location.search).get("exp")||.52);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=mobile?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
const camera=new THREE.PerspectiveCamera(46,1,.2,3000);
const world=new THREE.Scene();
const SUN=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(84),THREE.MathUtils.degToRad(32));
const UP=new THREE.Vector3(0,1,0);

function makeSky(scene,envI=.12){const sky=new Sky();sky.scale.setScalar(2800);const u=sky.material.uniforms;u.turbidity.value=8;u.rayleigh.value=2.6;u.mieCoefficient.value=.005;u.mieDirectionalG.value=.85;u.sunPosition.value.copy(SUN);scene.add(sky);
  const pm=new THREE.PMREMGenerator(renderer),sc=new THREE.Scene();sc.add(sky.clone());scene.environment=pm.fromScene(sc).texture;scene.environmentIntensity=envI;return sky}
makeSky(world);
new RGBELoader().load("assets/sky_1k.hdr",t=>{const pm=new THREE.PMREMGenerator(renderer);world.environment=pm.fromEquirectangular(t).texture;world.environmentIntensity=.55;t.dispose();pm.dispose()});
world.fog=new THREE.FogExp2(0xc9a99a,.0034);
function sunLight(scene,size){const s=new THREE.DirectionalLight(0xffb27c,3.6);s.castShadow=true;s.shadow.mapSize.setScalar(mobile?1024:2048);s.shadow.bias=-.0004;s.shadow.normalBias=.03;
  const c=s.shadow.camera;c.left=c.bottom=-size;c.right=c.top=size;c.near=1;c.far=200;c.updateProjectionMatrix();scene.add(s,s.target);return s}
const sun=sunLight(world,mobile?28:36);sun.intensity=3.1;sun.color.set(0xffc596);const hemiW=new THREE.HemisphereLight(0xd6dde8,0x6a5a4c,.3);world.add(hemiW);

/* ---------- materials + procedural textures ---------- */
function canvasTex(w,h,draw,rep,srgb=true){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t}
let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const pave=canvasTex(512,512,(g,w,h)=>{g.fillStyle="#efe9de";g.fillRect(0,0,w,h);let y=0;while(y<h){const rh=48+rnd()*36;let x=-rnd()*60;while(x<w){const rw=60+rnd()*80,t=150+rnd()*28;
  g.fillStyle=`rgb(${t+6},${t+2},${t-4})`;g.beginPath();g.roundRect(x+5,y+5,rw-10,rh-10,10);g.fill();x+=rw}y+=rh}},[18,18]);
const mat=(o)=>new THREE.MeshStandardMaterial(o);
/* scanned PBR surfaces from Poly Haven (CC0): colour, normal and AO/roughness, smaller on phones */
const texL=new THREE.TextureLoader(),TQ=mobile?"512":"1k";
function pbr(id,o={}){const ld=(k,srgb)=>{const t=texL.load(`assets/${id}_${k}_${TQ}.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=mobile?4:8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t};
  const arm=ld("arm");return mat({map:ld("Diffuse",true),normalMap:ld("nor_gl"),normalScale:new THREE.Vector2(o.ns??1,o.ns??1),roughnessMap:arm,aoMap:arm,aoMapIntensity:o.ao??1,roughness:o.r??1,color:o.color??0xffffff,...(o.extra||{})})}
const M={
  wash:pbr("white_stucco_02",{color:0xfffbf4,ns:.7}),wash2:pbr("white_stucco_02",{color:0xf1e2c8,ns:.7}),
  blue:mat({color:0x1f5fae,roughness:.55}),blue2:mat({color:0x3a8cc8,roughness:.6}),green:mat({color:0x2f7a63,roughness:.6}),red:mat({color:0xa8322a,roughness:.6}),
  wood:pbr("weathered_planks",{color:0xb08060}),wood2:pbr("weathered_planks",{color:0xffd6a8}),darkwood:pbr("weathered_planks",{color:0x6a4a36}),dark:mat({color:0x1b2430,roughness:.7}),
  stone:pbr("square_cobblestone",{color:0xe8dccb}),dome:mat({color:0x2a64b0,roughness:.45}),
  gold:mat({color:0xd6a645,roughness:.3,metalness:.85}),brass:mat({color:0xb08a3e,roughness:.35,metalness:.8}),
  bulb:mat({color:0xffe08a,emissive:0xffc23a,emissiveIntensity:3.2}),bulbW:mat({color:0xffe08a,emissive:0xffb020,emissiveIntensity:3.2}),flame:mat({color:0xffe2a0,emissive:0xffb648,emissiveIntensity:2.4}),
  leaf:mat({color:0x5b7a3c,roughness:.85}),olive:mat({color:0x8fa36f,roughness:.9}),bark:mat({color:0x6a5644,roughness:1}),palm:mat({color:0x4f7a3a,roughness:.8,side:THREE.DoubleSide}),
  bloom:mat({color:0xc2186b,roughness:.8}),terra:mat({color:0xb5643f,roughness:.9}),water:mat({color:0x4aa3c8,roughness:.1,metalness:.1}),
  cushion:mat({color:0xf5f1ea,roughness:.95}),linen:mat({color:0xe9dfcf,roughness:1}),thatch:mat({color:0xb9975e,roughness:1}),
  red2:mat({color:0x8e1f2a,roughness:.8}),glass:mat({color:0xbfd8e2,roughness:.05,metalness:.1,transparent:true,opacity:.35}),
  yellow:mat({color:0xf2c230,roughness:.5}),white:mat({color:0xfbfbf8,roughness:.6}),black:mat({color:0x1a1a1a,roughness:.5}),concrete:mat({color:0xcfccc6,roughness:.8})
};
const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(.5,.5,1,20),cone:new THREE.ConeGeometry(.5,1,20),sph:new THREE.SphereGeometry(.5,20,14)};
/* geometry is collected per material and merged: a whole room in a handful of draw calls */
function Builder(){const parts={},o=new THREE.Object3D(),wrap=new THREE.Object3D();
  return{at(x,z,ry){wrap.position.set(x,0,z);wrap.rotation.set(0,ry||0,0);wrap.updateMatrix();return this},
    add(geo,m,x,y,z,sx=1,sy=1,sz=1,ry=0,rx=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();
      let g=geo.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(wrap.matrix,o.matrix));if(g.index)g=g.toNonIndexed();for(const k of Object.keys(g.attributes))if(!["position","normal","uv"].includes(k))g.deleteAttribute(k);
      if(!g.attributes.uv)g.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));(parts[m]||(parts[m]=[])).push(g);return this},
    build(scene,shadow=true,occ=null){for(const k in parts){const gm=mergeGeometries(parts[k]);if(/^(wash|wash2|wood|wood2|darkwood|stone)$/.test(k))boxUV(gm,k[0]==="w"&&k[1]==="o"?1.6:2.4);const me=new THREE.Mesh(gm,M[k]);if(occ&&/^(wash|wash2|dome|stone)$/.test(k))occ.push(me);if(scene===world){me.name=k;STATIC.push(me)}me.castShadow=shadow&&!["bulb","bulbW","flame","glass"].includes(k);me.receiveShadow=true;scene.add(me)}}}}
/* Cycladic paving: irregular grey slabs with limewashed joints; the normal and roughness maps come from the same layout so light catches every slab edge */
function paveMat(){const N=mobile?512:1024,k=N/512,col=document.createElement("canvas"),hgt=document.createElement("canvas");col.width=col.height=hgt.width=hgt.height=N;
  const c=col.getContext("2d"),h=hgt.getContext("2d");c.fillStyle="#f1ede6";c.fillRect(0,0,N,N);h.fillStyle="#000";h.fillRect(0,0,N,N);h.filter=`blur(${3*k}px)`;
  let y=0;while(y<N){const rh=(40+rnd()*34)*k;let x=-rnd()*50*k;while(x<N){const rw=(52+rnd()*76)*k,t=128+rnd()*44,j=4*k;
    for(const dx of [-N,0,N]){c.fillStyle=`rgb(${t+16},${t+10},${t+1})`;c.beginPath();c.roundRect(x+dx+j,y+j,rw-2*j,rh-2*j,7*k);c.fill();h.fillStyle=`rgb(${200+rnd()*55|0},0,0)`;h.beginPath();h.roundRect(x+dx+j,y+j,rw-2*j,rh-2*j,9*k);h.fill()}x+=rw}y+=rh}
  for(let i=0;i<9000*k*k;i++){c.fillStyle=`rgba(${rnd()<.5?"60,55,50":"255,252,245"},${.04+rnd()*.08})`;c.fillRect(rnd()*N,rnd()*N,1+rnd()*2.5*k,1+rnd()*2.5*k)}
  const hd=h.getImageData(0,0,N,N).data,nrm=c.createImageData(N,N),rg=c.createImageData(N,N),H=(x,y)=>hd[(((y+N)%N)*N+((x+N)%N))*4]/255;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=(H(x+1,y)-H(x-1,y))*3.2,dy=(H(x,y+1)-H(x,y-1))*3.2,l=Math.hypot(dx,dy,1),i=(y*N+x)*4;
    nrm.data[i]=(-dx/l*.5+.5)*255;nrm.data[i+1]=(dy/l*.5+.5)*255;nrm.data[i+2]=(1/l*.5+.5)*255;nrm.data[i+3]=255;const v=H(x,y);rg.data[i]=255;rg.data[i+1]=(.95-v*.35+rnd()*.05)*255;rg.data[i+2]=0;rg.data[i+3]=255}
  const tex=(cv,srgb)=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=mobile?4:8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t},cv2=d=>{const e=document.createElement("canvas");e.width=e.height=N;e.getContext("2d").putImageData(d,0,0);return e};
  return mat({map:tex(col,true),normalMap:tex(cv2(nrm)),normalScale:new THREE.Vector2(1.2,1.2),roughnessMap:tex(cv2(rg)),roughness:1})}
function boxUV(g,s){const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
  u.setXY(i,ax>=ay&&ax>=az?p.getZ(i)/s:ay>=az?p.getX(i)/s:p.getX(i)/s,ax>=ay&&ax>=az?p.getY(i)/s:ay>=az?p.getZ(i)/s:p.getY(i)/s)}u.needsUpdate=true}
const solid=[],round=[],occluders=[],STATIC=[];
const block=(arr,x0,z0,x1,z1)=>arr.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1)});
const blockRot=(cx,cz,w,d,ry)=>{const q=Math.abs(Math.sin(ry))>.5;const hw=(q?d:w)/2,hd=(q?w:d)/2;block(solid,cx-hw,cz-hd,cx+hw,cz+hd)};

const W=Builder(),blooms=[];
function house(cx,cz,w,d,h,ry,o={}){
  const mt=o.cream?"wash2":"wash",dc=o.door||"blue";W.at(cx,cz,ry);
  W.add(new RoundedBoxGeometry(w,h,d,4,.3),mt,0,h/2,0).add(new RoundedBoxGeometry(w+.16,.28,d+.16,3,.12),mt,0,h+.08,0);
  const f=d/2+.02;
  if(!o.noDoor){W.add(G.box,dc,o.dx||0,1.1,f,1,2.2,.1).add(G.box,mt,o.dx||0,2.3,f+.04,1.3,.16,.16)}
  const n=Math.max(1,Math.floor(w/2.4));
  const win=(x,y)=>W.add(G.box,"dark",x,y,f-.03,.72,.92,.1).add(G.box,mt,x,y-.52,f+.05,.94,.1,.16).add(G.box,dc,x-.56,y,f+.03,.36,.94,.05).add(G.box,dc,x+.56,y,f+.03,.36,.94,.05);
  for(let i=0;i<n;i++){const x=-w/2+(i+.5)*w/n;if(!o.noDoor&&Math.abs(x-(o.dx||0))<1.2)continue;win(x,1.7)}
  if(h>4.6)for(let i=0;i<n;i++)win(-w/2+(i+.5)*w/n,h-1.4);
  if(o.up){const uw=w*.45,ux=o.up*(w/2-uw/2-.2);W.add(new RoundedBoxGeometry(uw,2.3,d*.55,4,.26),mt,ux,h+1.2,-d*.2).add(new RoundedBoxGeometry(uw+.14,.22,d*.55+.14,3,.1),mt,ux,h+2.42,-d*.2)}
  if(o.bloom){const bx=o.bx??(w/2-.6);blooms.push(new THREE.Vector3(bx,h-.4,f+.3).applyMatrix4(new THREE.Matrix4().makeRotationY(ry)).add(new THREE.Vector3(cx,0,cz)).toArray().concat([o.bloom]))}
  blockRot(cx,cz,w,d,ry);
}
function signTex(text,bg="#1f5fae",fg="#fff"){return canvasTex(512,128,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;let fs=54;g.font=`600 ${fs}px Commissioner, sans-serif`;while(g.measureText(text).width>w-40&&fs>20){fs-=2;g.font=`600 ${fs}px Commissioner, sans-serif`};g.textAlign="center";g.textBaseline="middle";g.fillText(text,w/2,h/2+3)})}
const signs=[];
function landmark(id){const p=PLACES[id],[cx,cz]=p.c,ry=p.face;
  if(id==="chapel"){W.at(cx,cz,ry);
    W.add(G.box,"stone",0,.06,0,p.w+2,.12,p.d+2);
    W.add(new RoundedBoxGeometry(p.w,4.4,p.d,4,.35),"wash",0,2.2,0).add(G.cyl,"wash",0,4.8,-.8,4,1,4);
    W.add(new THREE.SphereGeometry(2.05,40,20,0,Math.PI*2,0,Math.PI/2),"dome",0,5.3,-.8).add(G.box,"gold",0,7.65,-.8,.1,.8,.1).add(G.box,"gold",0,7.78,-.8,.5,.1,.1);
    W.add(new RoundedBoxGeometry(2.4,2.6,.5,3,.15),"wash",0,5.6,p.d/2-.2).add(G.box,"dark",0,5.7,p.d/2-.2,.8,1,.54).add(G.sph,"gold",0,5.55,p.d/2-.2,.5,.5,.5).add(G.box,"gold",0,7.2,p.d/2-.2,.08,.6,.08).add(G.box,"gold",0,7.32,p.d/2-.2,.36,.08,.08);
    W.add(G.box,"blue",0,1.35,p.d/2+.03,1.5,2.7,.1).add(G.box,"wash",0,2.85,p.d/2+.06,1.9,.2,.16);
    for(const sx of [-1,1])W.add(G.box,"blue",sx*2.2,2.2,p.d/2+.03,.7,1.4,.06);
    blockRot(cx,cz,p.w+.4,p.d+.4,ry);
  }else if(id==="club"){/* the plaza side of the beach club: a whitewashed gate open to the sea path */
    W.at(cx,cz,ry);W.add(new RoundedBoxGeometry(1.2,3.6,1.2,3,.2),"wash",-2.2,1.8,p.d/2-.6).add(new RoundedBoxGeometry(1.2,3.6,1.2,3,.2),"wash",2.2,1.8,p.d/2-.6).add(new RoundedBoxGeometry(5.6,.7,1.3,3,.2),"wash",0,3.85,p.d/2-.6);
    /* low whitewashed walls, a timber pergola open to the sky, palms and lanterns: it reads as a summer terrace */
    W.add(new RoundedBoxGeometry(p.w,1,.5,3,.2),"wash2",0,.5,-p.d/2+.3).add(new RoundedBoxGeometry(.5,1,p.d-1.4,3,.2),"wash2",-p.w/2+.25,.5,-.4).add(new RoundedBoxGeometry(.5,1,p.d-1.4,3,.2),"wash2",p.w/2-.25,.5,-.4);
    for(let k=0;k<5;k++)W.add(G.box,"wood2",-3+k*1.5,3.3,-.6,.14,.14,p.d-1.4);for(const sx of [-1,1])W.add(G.box,"wood2",sx*3.3,3.2,-.6,.16,.16,p.d-1.2);
    for(const sx of [-1,1])for(const sz of [-1,1])W.add(G.cyl,"wood2",sx*3.3,1.6,-.6+sz*(p.d/2-.9),.16,3.2,.16);
    for(let k=0;k<3;k++)W.add(new RoundedBoxGeometry(1.8,.4,.9,3,.15),"cushion",-2.2+k*2.2,.3,-p.d/2+1.2);
    for(let k=0;k<4;k++){W.add(G.cyl,"wood2",-2.6+k*1.7,1.2,-1.6,.1,2.4,.1);for(let j=0;j<6;j++){const a=j/6*Math.PI*2;W.add(G.cone,"palm",-2.6+k*1.7+Math.cos(a)*.4,2.5,-1.6+Math.sin(a)*.4,.3,1.6,.14,a,Math.cos(a)*1.1,Math.sin(a)*1.1)}}
    blockRot(cx,cz,p.w,p.d-.4,ry);
  }else{
    const h={gallery:5,estate:5.6,post:4.4,agency:4.6}[id],dc={gallery:"green",estate:"blue",post:"yellow",agency:"blue"}[id];
    house(cx,cz,p.w,p.d,h,ry,{door:dc,bloom:id==="estate"||id==="post"?1.8:0,up:id==="gallery"?1:0});
  }
  const s=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshStandardMaterial({map:signTex(id==="club"?tx().clubName:tx().P[id]),roughness:.6}));
  const off=new THREE.Vector3(0,id==="chapel"?3.4:id==="club"?3.85:2.95,(p.d/2+(id==="club"?.07:.08))).applyAxisAngle(UP,ry);s.position.set(cx+off.x,off.y,cz+off.z);s.rotation.y=ry;world.add(s);signs.push({id,s});
}
ORDER.forEach(landmark);
{const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshStandardMaterial({map:signTex("ARCADE ★","#6a3cc9","#ffe36b"),roughness:.5,emissive:0x2a1060,emissiveIntensity:.6}));sg.position.set(26.92,2.95,-1);sg.rotation.y=-Math.PI/2;world.add(sg)}
[[-14.5,-24,8,7,6.5,0,{door:"green",up:-1}],[23,-24,8,8,5,0,{door:"red",bloom:1.4}],[-30,-20,9,9,7,Math.PI/2,{door:"blue"}],[-31,-1,7,8,5.2,Math.PI/2,{door:"blue2",cream:1}],[31,-1,7,8,6,-Math.PI/2,{door:"green",up:1}],
 [-30,14,7,7,4.4,Math.PI/2,{door:"blue",bloom:1.2}],[30,15,7,7,5,-Math.PI/2,{door:"red",cream:1}],[33,-20,9,9,7.2,-Math.PI/2,{door:"blue"}],[0,-33,12,8,8,0,{door:"blue",cream:1,noDoor:1}],[-25,-33,9,8,8.5,0,{noDoor:1}],[18,-32,10,8,9,0,{noDoor:1,cream:1}]]
 .forEach(a=>house(...a));
/* the island: a sandy coastline all round, the paved town on top, the harbour quay to the south */
const ISLE=(()=>{const N=180,pts=[];for(let k=0;k<N;k++){const a=k/N*Math.PI*2,n=1+.07*Math.sin(3*a+1)+.045*Math.sin(7*a+2)+.03*Math.sin(13*a);
    let x=Math.cos(a)*68*n,z=-16+Math.sin(a)*50*n;if(z>23.8&&Math.abs(x)<47)z=23.8;pts.push([x,z])}return pts})();
const sandTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle="#f6dca6";g.fillRect(0,0,w,h);for(let k=0;k<2600;k++){g.fillStyle=["#eccb8c","#fbe9c6","#e2bf86","#f8ecd2"][k%4];g.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2)}},[30,30]);
{const sandM=pbr("aerial_beach_01",{color:0xfff4e0,ns:.8}),sh=new THREE.Shape(ISLE.map(([x,z])=>new THREE.Vector2(x,-z)));
  const top=new THREE.Mesh(new THREE.ShapeGeometry(sh,2),sandM);top.name="g_sand";STATIC.push(top);top.rotation.x=-Math.PI/2;top.position.y=-.02;top.receiveShadow=true;world.add(top);
  /* the beach slopes into the sea (except along the quay) */
  const pos=[],idx=[],c=[0,-16];ISLE.forEach(([x,z])=>{const q=z>=23.79&&Math.abs(x)<47,dx=x-c[0],dz=z-c[1],l=Math.hypot(dx,dz),o=q?0:9;pos.push(x,-.02,z,x+dx/l*o,-1.6,z+dz/l*o)});
  for(let k=0;k<ISLE.length;k++){const a=k*2,b=((k+1)%ISLE.length)*2;idx.push(a,b,a+1,b,b+1,a+1)}
  const bg=new THREE.BufferGeometry();bg.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));bg.setIndex(idx);bg.computeVertexNormals();
  const uv=[];for(let k=0;k<pos.length;k+=3)uv.push(pos[k]/4,pos[k+2]/4);bg.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  const beach=new THREE.Mesh(bg,pbr("aerial_beach_01",{color:0xfff4e0,ns:.8,extra:{side:THREE.DoubleSide}}));beach.receiveShadow=true;beach.name="g_beach";STATIC.push(beach);world.add(beach);
  /* the paved town, with rounded corners */
  const r=12,x0=-45,x1=45,z0=-57,z1=23.4,rs=new THREE.Shape();rs.moveTo(x0+r,-z1);rs.lineTo(x1-r,-z1);rs.lineTo(x1,-z1);rs.lineTo(x1,-(z0+r));rs.quadraticCurveTo(x1,-z0,x1-r,-z0);rs.lineTo(x0+r,-z0);rs.quadraticCurveTo(x0,-z0,x0,-(z0+r));rs.lineTo(x0,-z1);rs.lineTo(x0+r,-z1);
  const pg=new THREE.ShapeGeometry(rs,4),pa=pg.attributes.position,puv=[];for(let k=0;k<pa.count;k++)puv.push(pa.getX(k)/5,pa.getY(k)/5);pg.setAttribute("uv",new THREE.Float32BufferAttribute(puv,2));
  const g=new THREE.Mesh(pg,paveMat());g.rotation.x=-Math.PI/2;g.receiveShadow=true;g.name="g_pave";STATIC.push(g);world.add(g);
  pave.repeat.set(1,1);
  /* a sandy footpath from the plaza, between the houses, up to the windmills */
  const path=[[-3.5,-10],[-6.5,-19],[-7.5,-27],[-9,-35],[-13,-41],[-20,-44.5],[-30,-45],[-36,-38.5]],spur=[[-13,-41],[-8,-45],[-6,-46.6]],W2=3.4;
  const ribbon=(pl,w)=>{const P2=[],I=[];pl.forEach(([x,z],k)=>{const [ax,az]=pl[Math.max(0,k-1)],[bx,bz]=pl[Math.min(pl.length-1,k+1)],dx=bx-ax,dz=bz-az,l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;P2.push(x+nx,.025,z+nz,x-nx,.025,z-nz);if(k){const a=(k-1)*2;I.push(a,a+2,a+1,a+2,a+3,a+1)}});
    const g2=new THREE.BufferGeometry();g2.setAttribute("position",new THREE.Float32BufferAttribute(P2,3));g2.setIndex(I);g2.computeVertexNormals();const u=[];for(let k=0;k<P2.length;k+=3)u.push(P2[k]/4,P2[k+2]/4);g2.setAttribute("uv",new THREE.Float32BufferAttribute(u,2));
    const m=new THREE.Mesh(g2,pbr("aerial_beach_01",{color:0xffffff,ns:.8,extra:{side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}}));m.receiveShadow=true;m.name="g_path"+STATIC.length;STATIC.push(m);world.add(m)};
  ribbon(path,W2);ribbon(spur,2.4);
  /* little stones and tufts along the path */
  path.forEach(([x,z],k)=>{if(k%2)W.add(G.sph,"stone",x+W2*.62,.12,z+.6,.5,.25,.4).add(G.sph,"leaf",x-W2*.64,.2,z-.4,.6,.35,.6)})}
W.at(0,0,0);
W.add(G.cyl,"wash",0,.35,0,5,.7,5).add(G.cyl,"water",0,.62,0,4.4,.06,4.4).add(G.cyl,"wash",0,1.2,0,.9,1.6,.9).add(G.cyl,"wash",0,2.05,0,2,.18,2).add(G.cyl,"water",0,2.15,0,1.7,.04,1.7);round.push({x:0,z:0,r:2.7});
[[-8,-6],[9,3]].forEach(([x,z],i)=>{W.add(G.cyl,"stone",x,.3,z,2.6,.6,2.6).add(G.cyl,"bark",x,1.6,z,.4,2.6,.4);
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+i;W.add(G.sph,"olive",x+Math.cos(a)*1.1,3.1+((k*7)%3)*.3,z+Math.sin(a)*1.1,2.2,1.5,2.2)}W.add(G.sph,"olive",x,3.8,z,2.4,1.8,2.4);round.push({x,z,r:1.5})});
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
/* scanned CC0 props from Poly Haven, scaled to a target width or height and lit in real time */
function prop(name,x,z,ry,o,scene=world){loader.load(`assets/m_${name}.glb`,g=>{const m=g.scene,b=new THREE.Box3().setFromObject(m),sz=b.getSize(new THREE.Vector3()),sz0=sz.y,k=o.h?o.h/sz.y:o.w/Math.max(sz.x,sz.z);
  let turn=0;if(o.back){/* put the tall back (vertices high up) on local -z, like the original bench */const v=new THREE.Vector3(),c=b.getCenter(new THREE.Vector3());let sx=0,sz=0,n=0;m.updateMatrixWorld(true);
    m.traverse(q=>{if(!q.isMesh)return;const P=q.geometry.attributes.position;for(let i=0;i<P.count;i+=7){v.fromBufferAttribute(P,i).applyMatrix4(q.matrixWorld);if(v.y>b.min.y+sz0*.75){sx+=v.x-c.x;sz+=v.z-c.z;n++}}});
    if(n)turn=Math.atan2(sx/n,sz/n)+Math.PI}
  m.scale.setScalar(k);m.position.set(x,-b.min.y*k,z);m.rotation.y=ry+turn;m.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true}});scene.add(m)},undefined,()=>{})}
/* a classic park bench: wooden slats on black cast-iron sides, facing local +z */
function parkBench(x,z,ry){const g=new THREE.Group(),slat=new THREE.BoxGeometry(1.9,.045,.1),iron=M.black,wd=M.wood2;
  for(let k=0;k<4;k++){const m=new THREE.Mesh(slat,wd);m.position.set(0,.46,-.2+k*.13);g.add(m)}
  for(let k=0;k<3;k++){const m=new THREE.Mesh(slat,wd);m.position.set(0,.62+k*.13,-.29-k*.025);m.rotation.x=-.18;g.add(m)}
  for(const sx of [-.85,.85]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.05,.46,.06),iron);leg.position.set(sx,.23,.15);g.add(leg);
    const back=new THREE.Mesh(new THREE.BoxGeometry(.05,.95,.06),iron);back.position.set(sx,.46,-.3);back.rotation.x=-.12;g.add(back);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.5),iron);arm.position.set(sx,.66,-.05);g.add(arm)}
  g.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true}});g.position.set(x,0,z);g.rotation.y=ry;world.add(g)}
const BENCH=[];for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,x=Math.cos(a)*6.2,z=Math.sin(a)*6.2,ry=-a+Math.PI/2;parkBench(x,z,ry);round.push({x,z,r:1.1});BENCH.push({x,z,ry})}
W.at(0,0,0);
[[-15,-3],[-15,2],[15,-3],[15,2],[-5,-17],[5,-17],[9,-17]].forEach(([x,z],i)=>{prop(i%2?"planter_box_01":"potted_plant_04",x,z,i,{h:i%2?.9:1.3});round.push({x,z,r:.6})});
/* taverna tables between the doors */
[[-11.5,-.5,.4],[11.5,-.5,-.4]].forEach(([x,z,ry])=>{prop("outdoor_table_chair_set_01",x,z,ry,{w:2.2});round.push({x,z,r:1.25})});
const lampPos=[[-12,-12],[12,-12],[-12,12],[12,12]];
lampPos.forEach(([x,z])=>{W.add(G.cyl,"dark",x,1.8,z,.12,3.6,.12).add(G.sph,"bulb",x,3.7,z,.34,.34,.34);round.push({x,z,r:.35})});
W.add(G.cyl,"wash",0,5.5,0,.32,7,.32).add(G.sph,"bulbW",0,9.1,0,.5,.5,.5).add(G.cyl,"brass",0,8.85,0,.5,.08,.5);
const POLE_TOP=[0,8.9,0],ANCH=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2,R=k%2?15.5:17;ANCH.push([Math.cos(a)*R,4.6,Math.sin(a)*R*.86])}
ANCH.forEach(([ax,ay,az],k)=>{for(let j=1;j<22;j++){const t=j/22,sag=Math.sin(t*Math.PI)*1.4;W.add(G.sph,k%2?"bulb":"bulbW",POLE_TOP[0]+(ax-POLE_TOP[0])*t,POLE_TOP[1]+(ay-POLE_TOP[1])*t-sag,POLE_TOP[2]+(az-POLE_TOP[2])*t,.13,.13,.13)}});
/* a little warm light where it matters: the pole and the four lamps */
(mobile?[[0,8,0,30,30]]:[[0,8,0,26,26],...lampPos.map(([x,z])=>[x,3.4,z,10,12])]).forEach(([x,y,z,i,d])=>{const l=new THREE.PointLight(0xffb44a,i,d,1.4);l.position.set(x,y,z);world.add(l)});
W.add(G.box,"stone",0,-1.01,23.8,140,2,1.2).add(G.box,"wash",-24,.35,23.3,40,.7,.5).add(G.box,"wash",24,.35,23.3,40,.7,.5);
for(let s=0;s<4;s++)W.add(G.box,"stone",0,-.15-s*.22,24.3+s*.5,8,.22,.5);
block(solid,-70,22.9,70,24.2);
const MILLS=[[-36,-42],[-26,-45],[-15,-47.5],[-5,-51]],sails=[];
MILLS.forEach(([x,z],i)=>{W.at(x,z,0).add(G.cyl,"wash",0,3.2,0,4.4,6.4,4.4).add(G.cone,"thatch",0,7.5,0,5,2.3,5).add(G.box,i===3?"darkwood":"blue",0,1.1,2.2,.95,2.2,.12).add(G.box,"stone",0,.08,0,6,.16,6);
  const hub=new THREE.Group();hub.position.set(x,6.8,z+2.4);world.add(hub);
  for(let k=0;k<8;k++){const arm=new THREE.Group();arm.rotation.z=k/8*Math.PI*2;hub.add(arm);const sp=new THREE.Mesh(new THREE.BoxGeometry(.08,4.2,.08),M.wood);sp.position.y=2.1;sp.castShadow=true;arm.add(sp);
    const sh=new THREE.Shape();sh.moveTo(0,.4);sh.lineTo(1.25,1);sh.lineTo(.05,4.1);sh.lineTo(0,4.1);const sm=new THREE.Mesh(new THREE.ShapeGeometry(sh),M.linen);sm.material.side=THREE.DoubleSide;sm.castShadow=true;arm.add(sm)}
  /* the last mill turns the other way: the only clue */
  sails.push({g:hub,s:i===3?-.55:.35+i*.06});round.push({x,z,r:2.4})});
/* dry-stone walls along a goat path that winds up behind the houses */
for(let k=0;k<8;k++)W.at(0,0,0).add(G.box,"stone",-16-k*3,.35,-38+k*.6,2.6,.7,.5);
for(let k=0;k<6;k++)W.add(G.sph,"olive",-28+k*5,.5,-40-((k*3)%4),1.4,.9,1.4);
const SECRET={door:[-5,-48.4]};
/* the only hint on the secret door: a little round plaque with a Maltese face */
{const t=canvasTex(256,256,(g,w,h)=>{g.fillStyle="#2a5f8f";g.beginPath();g.arc(128,128,124,0,7);g.fill();g.fillStyle="#f2c14e";g.beginPath();g.arc(128,128,116,0,7);g.fill();g.fillStyle="#fbfaf6";
  for(let k=0;k<26;k++){const a=k/26*Math.PI*2;g.beginPath();g.arc(128+Math.cos(a)*62,138+Math.sin(a)*58,26,0,7);g.fill()}g.beginPath();g.arc(128,135,64,0,7);g.fill();
  g.fillStyle="#efe6dc";g.beginPath();g.ellipse(70,150,26,48,.2,0,7);g.fill();g.beginPath();g.ellipse(186,150,26,48,-.2,0,7);g.fill();
  g.fillStyle="#1a1a1a";g.beginPath();g.arc(102,128,10,0,7);g.fill();g.beginPath();g.arc(154,128,10,0,7);g.fill();g.beginPath();g.ellipse(128,156,13,10,0,0,7);g.fill();
  g.fillStyle="#fff";g.beginPath();g.arc(105,125,3,0,7);g.fill();g.beginPath();g.arc(157,125,3,0,7);g.fill();g.fillStyle="#f48aa8";g.beginPath();g.ellipse(128,176,8,6,0,0,7);g.fill();
  g.fillStyle="#e2406b";g.beginPath();g.moveTo(128,70);g.lineTo(100,56);g.lineTo(100,84);g.closePath();g.fill();g.beginPath();g.moveTo(128,70);g.lineTo(156,56);g.lineTo(156,84);g.closePath();g.fill()});
  const pl=new THREE.Mesh(new THREE.CircleGeometry(.24,32),mat({map:t,roughness:.5,metalness:.2}));pl.position.set(-5,1.75,-48.73);world.add(pl)}
W.build(world,true,occluders);

function scatterBlooms(scene,list){const geo=new THREE.IcosahedronGeometry(.15,0);let n=0;list.forEach(b=>n+=Math.round(b[3]*70));
  const im=new THREE.InstancedMesh(geo,M.bloom,n),il=new THREE.InstancedMesh(geo,M.leaf,n);let i=0,j=0;const c=new THREE.Color(),o=new THREE.Object3D();
  list.forEach(([x,y,z,s])=>{for(let k=0,cnt=Math.round(s*70);k<cnt;k++){const a=rnd()*Math.PI,r=rnd()*s;o.position.set(x+Math.cos(a)*r*1.1-s*.3,y-Math.sin(a)*r*.8,z+rnd()*.35);o.scale.setScalar(.6+rnd()*.9);o.rotation.set(rnd()*3,rnd()*3,0);o.updateMatrix();
    if(k%5<3){im.setMatrixAt(i,o.matrix);c.setHSL(.93+rnd()*.04,.72,.36+rnd()*.14);im.setColorAt(i++,c)}else il.setMatrixAt(j++,o.matrix)}});
  im.count=i;il.count=j;im.castShadow=il.castShadow=true;scene.add(im,il)}
scatterBlooms(world,blooms);
document.fonts?.ready.then(()=>signs.forEach(({id,s})=>{s.material.map=signTex(id==="club"?tx().clubName:tx().P[id]);s.material.needsUpdate=true}));

const waterNormals=new THREE.TextureLoader().load("assets/waternormals.jpg",t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping});
function makeWater(scene,y){const w=new Water(new THREE.PlaneGeometry(1600,1600),{textureWidth:mobile?256:512,textureHeight:mobile?256:512,waterNormals,sunDirection:SUN.clone(),sunColor:0xffcf9e,waterColor:0x0f4d66,distortionScale:2.4,fog:true});
  w.rotation.x=-Math.PI/2;w.position.y=y;w.material.uniforms.size.value=2;scene.add(w);return w}
const waters=[makeWater(world,-1.1)];
const boats=[];
/* hulls are built from a cross-section swept along the length: double-ended caïques, square-sterned speedboats */
function hullGeo(L,B,D,kind){const nu=28,nv=10,pos=[],idx=[];
  for(let a=0;a<=nu;a++){const u=a/nu,z=(u-.5)*L;
    const w=kind==="speed"?B*(u<.62?1:Math.pow(Math.cos((u-.62)/.38*Math.PI/2),.7))*(u<.05?.92:1):B*Math.pow(Math.sin(Math.PI*u),.55),
      sheer=kind==="speed"?.12*Math.max(0,u-.6)/.4:.38*Math.pow(Math.abs(u-.5)*2,2.4),depth=D*(kind==="speed"?(.75+.25*Math.sin(Math.PI*Math.min(1,u*1.3))):(.55+.45*Math.sin(Math.PI*u)));
    for(let b=0;b<=nv;b++){const t=b/nv*Math.PI,xx=Math.cos(t)*w,yy=-Math.sin(t)*depth*(kind==="speed"?.8+.2*Math.abs(Math.cos(t)):1);pos.push(xx,yy+sheer,z)}}
  for(let a=0;a<nu;a++)for(let b=0;b<nv;b++){const i0=a*(nv+1)+b,i1=i0+1,i2=i0+nv+1,i3=i2+1;idx.push(i0,i2,i1,i1,i2,i3)}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
function caique(scene,x,z,ry,hull,stripe,y=-1.02){
  const g=new THREE.Group(),L=6.4,B=1.25,P=new THREE.MeshStandardMaterial({color:hull,roughness:.55,side:THREE.DoubleSide});
  const h=new THREE.Mesh(hullGeo(L,B,1,"caique"),P);h.castShadow=true;g.add(h);
  /* a painted band under the gunwale, a wooden deck, a little wheelhouse, a mast with a rolled sail, nets */
  const band=new THREE.Mesh(hullGeo(L*1.002,B*1.01,.22,"caique"),new THREE.MeshStandardMaterial({color:stripe,roughness:.5,side:THREE.DoubleSide}));band.position.y=.02;g.add(band);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(B*1.7,.06,L*.8),M.wood);deck.position.y=.02;g.add(deck);
  const cab=new THREE.Mesh(new RoundedBoxGeometry(1.3,.95,1.2,3,.08),M.wash);cab.position.set(0,.5,-.9);cab.castShadow=true;g.add(cab);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(1.45,.07,1.35),new THREE.MeshStandardMaterial({color:stripe}));roof.position.set(0,1,-.9);g.add(roof);
  const win=new THREE.Mesh(new THREE.BoxGeometry(1.32,.3,.02),M.dark);win.position.set(0,.65,-.29);g.add(win);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,3,8),M.wood);mast.position.set(0,1.5,1);g.add(mast);
  const sail=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,2.2,8),M.linen);sail.rotation.x=Math.PI/2;sail.position.set(0,2.1,.4);g.add(sail);
  const net=new THREE.Mesh(new THREE.SphereGeometry(.4,10,8),new THREE.MeshStandardMaterial({color:0xe8743b,roughness:1}));net.scale.set(1.3,.45,1);net.position.set(.3,.15,1.9);g.add(net);
  for(const s of [-1,1]){const eye=new THREE.Mesh(new THREE.CircleGeometry(.1,12),new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide}));eye.position.set(s*(B*.62),.05,2.6);eye.rotation.y=s*Math.PI/2;g.add(eye)}
  g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);boats.push({g,ph:rnd()*6,y})}
function speedboat(scene,x,z,ry,col,y=-1.0){
  const g=new THREE.Group(),L=5,B=.95,h=new THREE.Mesh(hullGeo(L,B,.75,"speed"),new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.25,clearcoat:1,side:THREE.DoubleSide}));h.castShadow=true;g.add(h);
  const st=new THREE.Mesh(hullGeo(L*1.003,B*1.012,.16,"speed"),new THREE.MeshStandardMaterial({color:col,roughness:.4,side:THREE.DoubleSide}));st.position.y=-.18;g.add(st);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(B*1.6,.05,L*.7),mat({color:0xd9c7a8,roughness:.8}));deck.position.set(0,.02,-.2);g.add(deck);
  const ws=new THREE.Mesh(new THREE.BoxGeometry(B*1.5,.42,.05),M.glass);ws.position.set(0,.3,.55);ws.rotation.x=-.5;g.add(ws);
  for(const sx of [-.4,.4]){const seat=new THREE.Mesh(new RoundedBoxGeometry(.5,.35,.5,2,.08),M.cushion);seat.position.set(sx,.2,0);g.add(seat)}
  const motor=new THREE.Mesh(new RoundedBoxGeometry(.4,.6,.4,2,.08),M.black);motor.position.set(0,.15,-2.6);g.add(motor);
  g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);boats.push({g,ph:rnd()*6,y});return g}
caique(world,-14,31,.3,0x2a6fb5,0xf2c94c);caique(world,-4,33.5,-.2,0xf4f0e8,0x2a6fb5);caique(world,9,31,.15,0xc94b3b,0xf4f0e8);caique(world,22,35,-.35,0x2f7a63,0xf2c94c);
speedboat(world,-24,38,.9,0x1f5fae);speedboat(world,30,40,-.6,0xc2185b);speedboat(world,3,44,1.4,0x2f7a63);
/* big ships crossing far out at sea */
const ships=[];function bigShip(z,len,sp,col,x0){const g=new THREE.Group(),wh=mat({color:0xf6f4ef,roughness:.5});
  const hull=new THREE.Mesh(new RoundedBoxGeometry(len,len*.12,len*.16,3,len*.02),mat({color:col,roughness:.5}));hull.position.y=len*.03;g.add(hull);
  const deckW=new THREE.Mesh(new THREE.BoxGeometry(len*.96,len*.02,len*.15),mat({color:0xffffff}));deckW.position.y=len*.09;g.add(deckW);
  for(let k=0;k<3;k++){const d=new THREE.Mesh(new THREE.BoxGeometry(len*(.62-k*.12),len*.05,len*.13),wh);d.position.set(-len*.06,len*.12+k*len*.05,0);g.add(d);
    const w=new THREE.Mesh(new THREE.BoxGeometry(len*(.62-k*.12)+.1,len*.012,len*.132),mat({color:0x22303f}));w.position.copy(d.position);w.position.y+=len*.008;g.add(w)}
  const fun=new THREE.Mesh(new THREE.CylinderGeometry(len*.03,len*.035,len*.1,16),mat({color:0x1f5fae}));fun.position.set(-len*.22,len*.3,0);g.add(fun);
  g.position.set(x0,-1.1,z);world.add(g);ships.push({g,sp,len})}
bigShip(170,70,2.2,0x1f3b5c,-150);bigShip(240,95,1.6,0xffffff,220);bigShip(-210,60,-2,0x8a2b2b,60);
function yacht(x,z,R,sp){const g=new THREE.Group(),h=new THREE.Mesh(hullGeo(7,1.2,.8,"speed"),new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.3,clearcoat:1,side:THREE.DoubleSide}));g.add(h);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,9,8),M.white||mat({color:0xffffff}));mast.position.set(0,4.5,.6);g.add(mast);
  const s1=new THREE.Shape();s1.moveTo(0,0);s1.lineTo(0,8.2);s1.lineTo(3.2,0);const main=new THREE.Mesh(new THREE.ShapeGeometry(s1),new THREE.MeshStandardMaterial({color:0xfbf8f0,side:THREE.DoubleSide,roughness:.8}));main.rotation.y=Math.PI/2;main.position.set(0,.8,.6);g.add(main);
  const s2=new THREE.Shape();s2.moveTo(0,0);s2.lineTo(0,7);s2.lineTo(-2.4,0);const jib=new THREE.Mesh(new THREE.ShapeGeometry(s2),main.material);jib.rotation.y=Math.PI/2;jib.position.set(0,.8,.5);g.add(jib);
  world.add(g);ships.push({g,yc:[x,z,R],sp,a:rnd()*6})}
yacht(-20,70,26,.025);yacht(40,95,30,-.02);yacht(-70,10,20,.03);
/* islands on the horizon, so the sea has a far shore */
{const m=mat({color:0x8a7f8f,roughness:1});[[-160,280,90,26],[40,330,140,34],[260,240,80,22],[-320,120,70,18],[0,-320,160,40],[-220,-260,90,24],[230,-280,110,30]].forEach(([x,z,r,h])=>{
  const g=new THREE.Mesh(new THREE.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2),m);g.scale.set(r,h,r*.55);g.position.set(x,-1.2,z);world.add(g)})}

/* ---------- out at sea: a surfer, two kitesurfers and a wakeboarder behind a boat ---------- */
const riders=[];
function kiteMesh(c){const sh=new THREE.Shape();sh.moveTo(-3,0);sh.quadraticCurveTo(0,1.6,3,0);sh.quadraticCurveTo(0,.8,-3,0);const k=new THREE.Mesh(new THREE.ShapeGeometry(sh,16),mat({color:c,side:THREE.DoubleSide,roughness:.6}));return k}
const KITE_COL=[0xe2406b,0x2a9df4,0xf2c14e,0x3fae5a,0xff7a3d,0x8e5cff,0xffffff,0x00b8a9];
function seaRider(i,kind,cx,cz,rx,rz,sp,light){
  const make=e=>{const g=new THREE.Group();world.add(g);
    if(e){g.add(e.m);e.m.position.set(0,.12,0);e.m.rotation.set(0,Math.PI/2,0)}
    else{/* a simple rider for the far ones: wetsuit, harness, arms out */const body=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.9,4,8),mat({color:0x1b2430}));body.position.y=.85;body.rotation.z=-.35;g.add(body);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),mat({color:0xe9c3a3}));head.position.set(-.25,1.5,0);g.add(head)}
    const board=new THREE.Mesh(new RoundedBoxGeometry(kind==="surf"?.6:.45,.08,kind==="surf"?2.2:1.4,3,.04),mat({color:KITE_COL[(i+3)%8],roughness:.4}));board.castShadow=!light;g.add(board);
    let kite=null;if(kind==="kite"){kite=kiteMesh(KITE_COL[i%8]);kite.position.set(0,14,-9);g.add(kite);
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,1.3,0),new THREE.Vector3(-2.8,14,-9),new THREE.Vector3(0,1.3,0),new THREE.Vector3(2.8,14,-9)]),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.6})))}
    let tow=null;if(kind==="wake"){tow=speedboat(world,0,0,0,0x1f5fae);boats.splice(boats.findIndex(b=>b.g===tow),1);tow.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.5,-2.4),new THREE.Vector3(0,1,-14)]),new THREE.LineBasicMaterial({color:0x222222})))}
    riders.push({g,e,kind,cx,cz,rx,rz,sp,t:i*1.7,kite,tow})};
  if(light){make(null);return}
  guest(world,[3,4,0][i%3],cx,cz,0,"idle").then(e=>{if(!e){make(null);return}const n=npcs.indexOf(e);if(n>=0)npcs.splice(n,1);make(e)})}
function updRiders(dt){riders.forEach(r=>{r.t+=dt*r.sp;const x=r.cx+Math.cos(r.t)*r.rx,z=r.cz+Math.sin(r.t)*r.rz,dx=-Math.sin(r.t)*r.rx,dz=Math.cos(r.t)*r.rz;
  r.g.position.set(x,-1.05+Math.sin(r.t*6)*.05,z);r.g.rotation.y=Math.atan2(dx,dz);r.g.rotation.z=Math.sin(r.t*2)*.12;if(r.e)r.e.mix.update(dt);
  if(r.kite){r.kite.rotation.z=Math.sin(r.t*1.3)*.2;r.kite.position.x=Math.sin(r.t*.9)*2}
  if(r.tow){const a=r.t+.55;r.tow.position.set(r.cx+Math.cos(a)*r.rx,-1,r.cz+Math.sin(a)*r.rz);r.tow.rotation.y=Math.atan2(-Math.sin(a)*r.rx,Math.cos(a)*r.rz)}})}
function seaLife(){seaRider(0,"surf",-12,46,14,6,.18);seaRider(1,"kite",14,58,22,10,.12);seaRider(2,"kite",-26,64,18,9,.1,mobile);seaRider(3,"wake",4,86,30,12,.09,mobile);
  /* more kites south, past the boats, and north, behind the windmills */
  [[30,70,16,8],[-40,82,20,10],[6,104,26,9],[-14,120,18,7],[44,96,14,8]].forEach((a,k)=>seaRider(4+k,"kite",...a,.08+k*.012,true));
  [[-20,-90,22,9],[10,-104,18,8],[-46,-112,24,10],[26,-128,16,7],[-6,-140,20,8]].forEach((a,k)=>seaRider(9+k,"kite",...a,.09+k*.01,true))}

/* ---------- our Maltese: a ball of white fur that follows the couple and does tricks ---------- */
/* the Maltese: one soft body with a long coat that falls to the ground, a round head with long ear hair,
   button eyes, a black nose, a topknot with a blue bow (he's a boy) and a plumed tail curled over the back */
function furGeo(geo,amp,freq){const p=geo.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=v.clone().normalize();
  const k=1+amp*(Math.sin(n.x*freq+n.y*freq*.7)*Math.sin(n.z*freq*1.3+n.y*3)+.5*Math.sin(Math.atan2(n.z,n.x)*freq*2));v.multiplyScalar(k);p.setXYZ(i,v.x,v.y,v.z)}geo.computeVertexNormals();return geo}
function makeDog(){const g=new THREE.Group(),coat=new THREE.MeshPhysicalMaterial({color:0xfcfbf7,roughness:.95,sheen:1,sheenColor:new THREE.Color(0xffffff),sheenRoughness:.6}),
    coat2=new THREE.MeshPhysicalMaterial({color:0xf3eee6,roughness:.95,sheen:1,sheenColor:new THREE.Color(0xffffff)}),blk=mat({color:0x111111,roughness:.25}),bowM=mat({color:0x2a7bd8,roughness:.5});
  const add=(par,geo,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;par.add(o);return o};
  const body=new THREE.Group();g.add(body);
  /* puppy cut: a round fluffy body on four short fluffy legs, the coat ending above the paws */
  add(body,furGeo(new THREE.SphereGeometry(.125,30,22),.06,9),coat,0,.22,0,1,.85,1.5);
  add(body,furGeo(new THREE.SphereGeometry(.105,24,18),.07,10),coat2,0,.16,0,1.1,.6,1.4);
  const paws=[];[[-.07,.1],[.07,.1],[-.07,-.11],[.07,-.11]].forEach(([x,z])=>{const leg=new THREE.Group();leg.position.set(x,.15,z);body.add(leg);
    add(leg,furGeo(new THREE.CylinderGeometry(.05,.044,.12,14,4),.09,11),coat2,0,-.07,0);add(leg,new THREE.SphereGeometry(.044,12,8),coat,0,-.128,.01,1,.6,1.2);paws.push(leg)});
  /* head */
  const head=new THREE.Group();head.position.set(0,.34,.19);body.add(head);
  add(head,furGeo(new THREE.SphereGeometry(.095,28,20),.06,10),coat,0,0,0,1.05,.95,1);
  add(head,furGeo(new THREE.SphereGeometry(.05,18,14),.05,12),coat2,0,-.035,.075,1,.8,1.1);
  for(const sx of [-1,1]){const ear=add(head,furGeo(new THREE.SphereGeometry(.05,16,12),.08,10),coat2,sx*.085,-.07,-.01,.75,1.9,.8);ear.rotation.z=sx*.18;
    const eye=add(head,new THREE.SphereGeometry(.017,12,10),blk,sx*.038,.012,.083);add(eye,new THREE.SphereGeometry(.005,6,5),mat({color:0xffffff,emissive:0xffffff,emissiveIntensity:.6}),.004,.006,.014)}
  add(head,new THREE.SphereGeometry(.019,12,10),blk,0,-.022,.128,1.15,.85,.9);
  add(head,new THREE.SphereGeometry(.012,8,6),mat({color:0xe9849e,roughness:.6}),0,-.06,.1,1.4,.5,1);
  /* topknot + blue bow */
  add(head,furGeo(new THREE.SphereGeometry(.035,12,10),.08,12),coat,0,.09,-.005,1,1.3,1);
  for(const sx of [-1,1]){const loop=add(head,new THREE.ConeGeometry(.027,.048,12),bowM,sx*.027,.108,.03,1,1,.5);loop.rotation.z=-sx*Math.PI/2}
  add(head,new THREE.SphereGeometry(.012,10,8),bowM,0,.108,.03);
  /* tail: a plume curled over the back */
  const tail=new THREE.Group();tail.position.set(0,.28,-.18);body.add(tail);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.07,-.03),new THREE.Vector3(0,.11,.04),new THREE.Vector3(.02,.09,.11)]);
  add(tail,new THREE.TubeGeometry(curve,16,.028,10),coat,0,0,0);add(tail,furGeo(new THREE.SphereGeometry(.05,14,10),.1,9),coat,.02,.09,.08,.8,.7,1.3);
  return{g,body,head,tail,legs:paws,pos:new THREE.Vector3(1.5,0,12),yaw:0,trick:null,t:0}}
const dog=makeDog();dog.g.scale.setScalar(1.25);world.add(dog.g);let barkT=0;
function bark(){if(soundOn&&actx){[0,.22].forEach(o=>{const t=actx.currentTime+o,os=actx.createOscillator(),g=actx.createGain();os.type="sawtooth";os.frequency.setValueAtTime(900,t);os.frequency.exponentialRampToValueAtTime(420,t+.09);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.12);const f=actx.createBiquadFilter();f.type="bandpass";f.frequency.value=1100;os.connect(f).connect(g).connect(actx.destination);os.start(t);os.stop(t+.14)})}}
function dogTrick(k){dog.trick=k;dog.t=0;if(k==="bark"){bark();barkT=.5}if(k==="pet"){for(let i=0;i<5;i++)setTimeout(()=>heart(room?room.scene:world,dog.pos.clone().setY(.8)),i*300);[P].forEach(e=>{e.lock=2;e.yaw=Math.atan2(dog.pos.x-e.pos.x,dog.pos.z-e.pos.z);play(e,"clap",.3)})}}
function dogMenu(px,py){openPie(px,py,[{k:"pet",fn:()=>{const t=dog.pos.clone().addScaledVector(new THREE.Vector3(P.pos.x-dog.pos.x,0,P.pos.z-dog.pos.z).normalize(),.6);walkTo(t.x,t.z,()=>dogTrick("pet"))}},{k:"dead",fn:()=>dogTrick("dead")},{k:"bark",fn:()=>dogTrick("bark")},{k:"sit",fn:()=>dogTrick("sit")}],"dpie")}
const _dv=new THREE.Vector3();function updDog(dt){if(!P)return;const sc=room?room.scene:world;if(dog.g.parent!==sc){sc.add(dog.g);dog.pos.copy(P.pos).add(new THREE.Vector3(-1,0,.8))}
  /* riding: the dog sits in the front basket */
  if(mode==="ride"||mode==="drive"){dog.inBasket=1;dog.g.visible=true;dog.g.scale.setScalar(1.05*VSC);dog.g.position.copy(vespaObj.localToWorld(_dv.set(0,1.12,.86)));dog.g.rotation.y=vespaObj.rotation.y;dog.head.rotation.y=Math.sin(tAll*1.3)*.4;dog.tail.rotation.z=Math.sin(tAll*14)*.5;return}
  if(dog.inBasket){dog.inBasket=0;dog.g.scale.setScalar(1.25);dog.pos.copy(P.pos).add(new THREE.Vector3(-.9,0,.6));resolve(dog.pos)}
  dog.t+=dt;const tr=dog.trick,want=P.pos.clone().addScaledVector(new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw)),-.9).addScaledVector(new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),-.6);
  _v.subVectors(want,dog.pos);_v.y=0;const d=_v.length();let mv=0;
  if(tr==="pose"){dog.g.position.copy(dog.pos)}else if(!tr||tr==="pet"){if(d>.5){const sp=Math.min(d>4?5.5:4,d*3);_v.normalize();dog.pos.addScaledVector(_v,sp*dt);resolve(dog.pos);dog.yaw=angLerp(dog.yaw,Math.atan2(_v.x,_v.z),1-Math.exp(-10*dt));mv=sp;if(d>10)dog.pos.copy(want)}
    else dog.yaw=angLerp(dog.yaw,Math.atan2(P.pos.x-dog.pos.x,P.pos.z-dog.pos.z),dt*3)}
  if(tr==="pose"){if(selfieCam<=0)dog.trick=null}else if(tr&&dog.t>(tr==="dead"?3.5:tr==="sit"?4:1.6)){dog.trick=null}
  /* poses: trot, wag, sit, belly-up, little bark hops */
  const run=Math.min(1,mv/3),ph=tAll*16;dog.legs.forEach((l,i)=>{l.rotation.x=Math.sin(ph+(i%2?Math.PI:0)+(i>1?Math.PI:0))*.6*run});
  dog.tail.rotation.y=Math.sin(tAll*(tr==="pet"?22:10))*.5;dog.head.rotation.x=tr==="bark"?-.3*Math.abs(Math.sin(dog.t*14)):Math.sin(tAll*2)*.05;dog.head.rotation.z=tr==="pet"?Math.sin(dog.t*6)*.2:0;
  const dead=tr==="dead"?Math.min(1,dog.t*3):0,sit=tr==="sit"?Math.min(1,dog.t*4):0;
  dog.body.rotation.z=dead*Math.PI/2;dog.body.position.x=dead*.14;dog.body.position.y=dead*.15+(tr==="bark"?Math.abs(Math.sin(dog.t*14))*.07:0)+Math.abs(Math.sin(ph))*.025*run;
  dog.body.rotation.x=-sit*.32+Math.sin(ph)*.03*run;dog.tail.rotation.x=dead?.6:0;
  dog.g.position.copy(dog.pos);dog.g.rotation.y=dog.yaw;dog.g.visible=true}

/* ---------- the Vespa ---------- */
function vespa(color=0x9fd3c7){
  const g=new THREE.Group(),paint=new THREE.MeshPhysicalMaterial({color,roughness:.28,metalness:.15,clearcoat:1,clearcoatRoughness:.12}),
    chrome=new THREE.MeshStandardMaterial({color:0xdfe3e6,metalness:1,roughness:.18}),tyre=new THREE.MeshStandardMaterial({color:0x151515,roughness:.9}),seat=new THREE.MeshStandardMaterial({color:0x5a3a28,roughness:.6});
  const m=(geo,mt,x,y,z,sx=1,sy=1,sz=1,rx=0)=>{const o=new THREE.Mesh(geo,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.x=rx;o.castShadow=true;g.add(o);return o};
  const wheel=z=>{m(new THREE.TorusGeometry(.26,.09,12,28),tyre,0,.34,z).rotation.y=Math.PI/2;m(new THREE.CylinderGeometry(.17,.17,.14,20),chrome,0,.34,z).rotation.z=Math.PI/2};
  wheel(.72);wheel(-.62);
  m(new THREE.SphereGeometry(.5,32,20),paint,0,.62,-.48,.78,.62,1.15);m(new RoundedBoxGeometry(.5,.12,.9,3,.05),paint,0,.32,.15);
  m(new RoundedBoxGeometry(.56,1,.16,4,.08),paint,0,.85,.62,1,1,1,-.22);m(new THREE.SphereGeometry(.3,24,16,0,Math.PI*2,0,Math.PI/2),paint,0,.6,.74,1,.9,1.3);
  m(new RoundedBoxGeometry(.38,.14,.86,3,.06),seat,0,1.0,-.38);m(new THREE.CylinderGeometry(.03,.03,1.1,8),chrome,0,1.02,.52,1,1,1,-.25);
  m(new THREE.CylinderGeometry(.025,.025,.78,8),chrome,0,1.5,.38).rotation.z=Math.PI/2;
  m(new THREE.SphereGeometry(.11,16,12),new THREE.MeshStandardMaterial({color:0xfff6dc,emissive:0xffe9b0,emissiveIntensity:.6}),0,1.42,.5,1,1,.6);
  m(new THREE.SphereGeometry(.12,16,10),paint,0,1.42,.42,1.6,.7,1);
  /* a flat wooden rack on the front: the dog rides on it */
  const rack=new THREE.MeshStandardMaterial({color:0x8a5f3a,roughness:.7});m(new THREE.BoxGeometry(.46,.035,.4),rack,0,1.1,.86);m(new THREE.BoxGeometry(.03,.12,.03),rack,-.2,1.04,.86);m(new THREE.BoxGeometry(.03,.12,.03),rack,.2,1.04,.86);return g}
const VSC=.8,vespaObj=vespa();vespaObj.scale.setScalar(VSC);vespaObj.position.set(5.5,0,14);vespaObj.rotation.y=-Math.PI/2;world.add(vespaObj);

/* ---------- characters ---------- */
const cache={};
/* sky light and its bounces, baked offline in Blender Cycles: the static town swaps in lightmapped copies of its own geometry */
const LMI=+(new URLSearchParams(location.search).get("lmi")||2.8);
if(!/nobake/.test(location.search))loader.load("assets/town_lm.glb",g=>{const by={};STATIC.forEach(m=>by[m.name]=m);g.scene.updateMatrixWorld(true);
  g.scene.traverse(o=>{if(!o.isMesh)return;const k=(o.userData.key||o.name).split(".")[0],m=by[k];if(!m||!o.geometry.attributes.uv1)return;
    const t=texL.load(`assets/lm_${k}.jpg`);t.colorSpace=THREE.SRGBColorSpace;t.channel=1;t.flipY=false;
    const mt=m.material.clone();mt.lightMap=t;mt.lightMapIntensity=LMI;mt.envMapIntensity=.25;if(m.material.onBeforeCompile)mt.onBeforeCompile=m.material.onBeforeCompile;
    m.geometry.dispose();m.geometry=o.geometry.applyMatrix4(o.matrixWorld);m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1,1);m.updateMatrix();m.material=mt});
  hemiW.intensity=.12},undefined,()=>{});
const loadChar=name=>cache[name]||(cache[name]=new Promise((res,rej)=>loader.load(`assets/${name}.glb`,res,e=>{if(name in prog){prog[name]=e.total?e.loaded/e.total:0;$("#load i").style.width=((prog.groom+prog.bride)/2*100)+"%";if(!ready)renderUI()}},rej)));
/* texture repaint helpers: work on the model's single texture atlas */
function repaint(m,fn){const im=m.map&&m.map.image;if(!im)return;const Wd=im.width,Ht=im.height,c=document.createElement("canvas");c.width=Wd;c.height=Ht;const g=c.getContext("2d");g.drawImage(im,0,0);
  const d=g.getImageData(0,0,Wd,Ht),px=d.data;for(let y=0;y<Ht;y++)for(let x=0;x<Wd;x++){const i=(y*Wd+x)*4,o=fn(px[i]/255,px[i+1]/255,px[i+2]/255,x/Wd*512,y/Ht*512);if(o){px[i]=Math.min(255,o[0]);px[i+1]=Math.min(255,o[1]);px[i+2]=Math.min(255,o[2])}}
  g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.flipY=m.map.flipY;t.colorSpace=THREE.SRGBColorSpace;m.map=t;m.needsUpdate=true}
function hsl(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
const isSkin=(h,s,l)=>h>4&&h<40&&s>.18&&s<.8&&l>.3&&l<.9;
/* The bride is the Mixamo "Peasant Girl" repainted: skirt, bodice and sleeves become ivory fabric (shading kept),
   the sash satin, the hair golden blonde, the skin fairer. */
const BR={gown:[[0,0,380,250],[418,0,512,236],[0,318,102,508],[198,292,302,372]],hair:[[338,348,512,512],[372,84,418,236]]};
const inR=(rs,x,y)=>rs.some(r=>x>=r[0]&&x<r[2]&&y>=r[1]&&y<r[3]);
const brideTint=m=>repaint(m,(r,g,b,x,y)=>{const[h,s,l]=hsl(r,g,b);
  if(inR(BR.gown,x,y)||(h>150&&h<225&&s>.2)){const v=.74+l*.36;return[248*v,243*v,233*v]}
  if(inR(BR.hair,x,y)){const v=.45+l*.8;return[236*v,200*v,128*v]}
  if(isSkin(h,s,l))return[r*158+95,g*158+87,b*158+81]});
/* the priest: everything that is not skin becomes the black cassock */
const priestTint=m=>repaint(m,(r,g,b)=>{const[h,s,l]=hsl(r,g,b);if(isSkin(h,s,l))return[r*190+60,g*190+52,b*190+48];const v=12+l*42;return[v,v,v*1.1]});
/* guests: fairer skin, clothes kept */
const fairTint=m=>repaint(m,(r,g,b)=>{const[h,s,l]=hsl(r,g,b);if(isSkin(h,s,l))return[r*170+80,g*170+70,b*170+62]});
/* Mixamo exports in centimetres, but a few characters come out at another scale: normalise odd ones to 1.75 m */
function modelScale(gltf){if(gltf.userData.sc)return gltf.userData.sc;const h=new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3()).y;return gltf.userData.sc=(h>200||h<140)?1.75/h:.01}
function fixClips(gltf){if(gltf.userData.fixed)return;gltf.userData.fixed=1;const k=.01/modelScale(gltf);if(Math.abs(k-1)<.01)return;
  gltf.animations.forEach(c=>c.tracks.forEach(t=>{if(t.name.endsWith(".position"))for(let i=0;i<t.values.length;i++)t.values[i]*=k}))}
function makeEnt(gltf,tint,scale=modelScale(gltf)){fixClips(gltf);const m=SkeletonUtils.clone(gltf.scene);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
    if(tint&&o.material){o.material=o.material.clone();tint(o.material)}}});m.scale.setScalar(scale);
  const mix=new THREE.AnimationMixer(m),act={};gltf.animations.forEach(c=>{act[c.name]=mix.clipAction(c)});
  const e={m,mix,act,pos:new THREE.Vector3(),yaw:0,spd:0,cur:null,lock:0};play(e,act.idle?"idle":Object.keys(act)[0]);return e}
function play(e,name,fade=.25,once=false){const a=e.act[name];if(!a||e.cur===a)return;a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat);a.clampWhenFinished=once;a.enabled=true;a.fadeIn(fade).play();if(e.cur)e.cur.fadeOut(fade);e.cur=a;e.curName=name}
const findBone=(m,re)=>{let b=null;m.traverse(o=>{if(!b&&o.isBone&&re.test(o.name))b=o});return b};
let P=null,N=null,priest=null;
const XRAY=new THREE.MeshBasicMaterial({visible:false,color:0x8fd3ff,transparent:true,opacity:.4,depthWrite:false,depthFunc:THREE.GreaterDepth});
function addXray(e){const list=[];e.m.traverse(o=>{if(o.isSkinnedMesh)list.push(o)});list.forEach(o=>{const x=new THREE.SkinnedMesh(o.geometry,XRAY);x.bind(o.skeleton,o.bindMatrix);x.frustumCulled=false;x.renderOrder=10;o.parent.add(x)})}
Promise.all([loadChar("groom"),loadChar("bride")]).then(([g,b])=>{
  const G1=makeEnt(g),B1=makeEnt(b,brideTint);G1.kind="groom";B1.kind="bride";addXray(G1);addXray(B1);[G1,B1].forEach(e=>world.add(e.m));
  G1.pos.set(-.8,0,11);B1.pos.set(.8,0,11);G1.yaw=B1.yaw=Math.PI;window.__ents=[G1,B1];
  ready=true;$("#pG").disabled=$("#pB").disabled=false;$("#load").style.opacity=0;renderUI();
  /* the rest of the couple's moves (dance, kiss, ride, sit...) arrive in the background */
  [["groom",G1],["bride",B1]].forEach(([n,e])=>loader.load(`assets/${n}_anims.glb`,a=>a.animations.forEach(c=>{if(!e.act[c.name])e.act[c.name]=e.mix.clipAction(c)}),undefined,()=>{}));
}).catch(err=>{console.error(err);$("#intro").hidden=true;showSimple()});

/* ---------- guests: a few from each side, everywhere ---------- */
const GUESTS=["kate","megan","sophie","remy","josh"],npcs=[];
function guest(scene,i,x,z,yaw,act,o={}){const name=GUESTS[i%GUESTS.length];return loadChar(name).then(g=>{const e=makeEnt(g,fairTint);e.name=name;e.pos.set(x,o.y||0,z);e.yaw=yaw;e.home={x,z};e.act0=act;e.t=rnd()*5;e.wander=o.wander;
  scene.add(e.m);e.m.position.copy(e.pos);e.m.rotation.y=yaw;play(e,act);if(e.cur)e.cur.time=rnd()*e.cur.getClip().duration;e.scene=scene;npcs.push(e);return e}).catch(()=>null)}
function plazaGuests(){
  /* two chatting groups, two on benches, two strolling */
  guest(world,0,-4.2,6.4,2.4,"talk");guest(world,3,-5.4,5.2,-.8,"laugh");
  guest(world,1,6.8,-6.8,-2.2,"talk");guest(world,4,5.6,-8,.9,"talk");
  BENCH.slice(0,2).forEach((b,i)=>guest(world,2+i,b.x+Math.sin(b.ry)*.3,b.z+Math.cos(b.ry)*.3,b.ry,"sit",{y:.04}));
  guest(world,2,-10,0,0,"walk",{wander:[[-10,0],[-10,-12],[10,-12],[10,0]]});guest(world,3,12,9,0,"walk",{wander:[[12,9],[-12,9]]});
}
/* the koumbaroi: Thanos in a blue suit, Dimitra in dark green; always in the middle of the square, and in the chapel for Isaiah's dance */
const suitTint=m=>repaint(m,(r,g,b)=>{const[h,s,l]=hsl(r,g,b);if(isSkin(h,s,l))return[r*170+80,g*170+70,b*170+62];if(l<.16)return null;const v=.45+l*.9;return[34*v,62*v,138*v]});
const gownTint=m=>repaint(m,(r,g,b)=>{const[h,s,l]=hsl(r,g,b);if(isSkin(h,s,l))return[r*170+80,g*170+70,b*170+62];if(l<.16)return null;const v=.35+l*.9;return[22*v,72*v,52*v]});
/* Dimitra's long dark-green dress: a flared satin skirt hung from the hips bone (bone space is in centimetres) */
function koumDress(e){const hip=findBone(e.m,/hips/i);if(!hip)return;const g=new THREE.CylinderGeometry(15,34,92,28,1,true);g.translate(0,-40,0);
  const sk=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x1d4a37,roughness:.42,metalness:.05,side:THREE.DoubleSide}));sk.castShadow=true;sk.frustumCulled=false;hip.add(sk)}
const KOUM={kp:{model:"josh",tint:suitTint},ka:{model:"kate",tint:gownTint}};
const koumTags={};["kp","ka"].forEach(k=>{const t=document.createElement("div");t.className="ktag";t.hidden=true;$("#labels").appendChild(t);koumTags[k]=t});
function koumbaros(scene,k,x,z,yaw){return loadChar(KOUM[k].model).then(g=>{const e=makeEnt(g,KOUM[k].tint);e.name=KOUM[k].model;e.koum=k;if(k==="ka")koumDress(e);e.pos.set(x,0,z);e.yaw=yaw;e.home={x,z,yaw};e.act0="idle";
  scene.add(e.m);e.m.position.copy(e.pos);e.m.rotation.y=yaw;play(e,e.act.idle?"idle":"talk");e.scene=scene;npcs.push(e);return e}).catch(()=>null)}
const KP_AT=[[-1.15,4.05,.35],[1.15,4.05,-.35]];KP_AT.forEach(([x,z])=>round.push({x,z,r:.38}));
/* outdoor floor marks: yellow ring at the door of a building whose quest is still open, small green once done; small green discs at everything else you can use */
const doorMarks=[];function outdoorSpots(){for(const id in PLACES){const[a,b]=doorFront(id,1.3),q=PLACES[id].quest;
    const y=new THREE.Mesh(new THREE.RingGeometry(.55,.72,40),new THREE.MeshBasicMaterial({color:0xffb24a,transparent:true,opacity:.9,depthWrite:false}));y.rotation.x=-Math.PI/2;y.position.set(a,.05,b);world.add(y);
    const g=greenSpot(a,b);world.add(g);doorMarks.push({q,y,g})}
  KP_AT.forEach(([x,z])=>world.add(greenSpot(x,z+.9)));BENCH.forEach(b=>world.add(greenSpot(b.x+Math.sin(b.ry)*1.1,b.z+Math.cos(b.ry)*1.1)))}
function updDoorMarks(){const s=1+.1*Math.sin(tAll*3);for(const d of doorMarks){const open=d.q&&!state.done[d.q];d.y.visible=open;d.y.scale.setScalar(s);d.g.visible=!open}}
function plazaKoum(){outdoorSpots();koumbaros(world,"kp",...KP_AT[0]);koumbaros(world,"ka",...KP_AT[1])}
function koumCard(k){const x=tx();openCard(x.koumW,x[k+"H"],`<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px"><img src="assets/av_${k}.jpg" alt="" style="width:68px;height:68px;border-radius:50%;object-fit:cover;flex:none;box-shadow:0 2px 8px rgba(0,0,0,.18)"><b>${x[k+"Full"]}</b></div><p>${x[k+"P"]}</p><p style="text-align:right"><i>— ${x[k+"Sig"]}</i></p><div class="acts"><button class="btn" type="button" id="kDance">${x[k==="kp"?"kpieM":"kpieF"].dance}</button></div>`,
  ()=>$("#kDance").addEventListener("click",()=>{closeCard();const e=npcs.find(n=>n.koum===k&&n.scene===(room?room.scene:world));if(e)koumDance(e)}))}
function nearTo(e,d,then){const t=e.pos.clone().addScaledVector(new THREE.Vector3(P.pos.x-e.pos.x,0,P.pos.z-e.pos.z).normalize(),d);walkTo(t.x,t.z,()=>{P.yaw=Math.atan2(e.pos.x-P.pos.x,e.pos.z-P.pos.z);e.yaw=P.yaw+Math.PI;then()})}
function koumDance(e){nearTo(e,.85,()=>{const m=["dance","dance2","dance3"].find(n=>P.act[n])||"dance";P.lock=7;play(P,m,.3);e.lock=7;play(e,e.act.dance?"dance":"laugh",.3);mood("party",8);
  for(let k=0;k<9;k++)setTimeout(()=>heart(e.scene,P.pos.clone().lerp(e.pos,.5).setY(2.05)),k*650);setTimeout(()=>{e.lock=0;e.yaw=e.home.yaw;play(e,"idle",.4)},7000)})}
function koumMenu(e,px,py){const x=tx(),k=e.koum;openPie(px,py,[{k:"meet",fn:()=>koumCard(k)},
  {k:"chat",fn:()=>nearTo(e,1.1,()=>{play(e,"talk",.3);P.lock=8;play(P,"talk",.3);thinkWith(e,8);toast(x[k+"Say"],5000);mood("fun",6);setTimeout(()=>{e.yaw=e.home.yaw;play(e,"idle",.4)},8000)})},
  {k:"dance",fn:()=>koumDance(e)},
  {k:"wave",fn:()=>{P.lock=1.6;P.yaw=Math.atan2(e.pos.x-P.pos.x,e.pos.z-P.pos.z);play(P,"wave",.2);play(e,e.act.wave?"wave":"laugh",.3);setTimeout(()=>play(e,"idle",.4),1800);mood("fun",4)}}],k==="kp"?"kpieM":"kpieF")}
function updKoumTags(scene){if(scene===world)updDoorMarks();const v=new THREE.Vector3(),x=tx();for(const k in koumTags)koumTags[k].hidden=true;if(mode!=="play"&&mode!=="drive")return;
  for(const e of npcs){if(!e.koum||e.scene!==scene)continue;v.copy(e.pos).setY(2.15).project(camera);if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1)continue;const t=koumTags[e.koum],tg=x[e.koum+"Tag"].split(" · ");t.innerHTML=`<small>${tg[0]}</small>${tg[1]}`;t.hidden=false;
    t._x=(v.x*.5+.5)*innerWidth;t._y=(-v.y*.5+.5)*innerHeight}
  const a=koumTags.kp,b=koumTags.ka;if(!a.hidden&&!b.hidden){const need=(a.offsetWidth+b.offsetWidth)/2+4,gap=Math.abs(b._x-a._x);if(gap<need){const m=(a._x+b._x)/2,s=a._x<=b._x?1:-1;a._x=m-s*need/2;b._x=m+s*need/2}}
  for(const t of [a,b])if(!t.hidden)t.style.transform=`translate(${t._x|0}px,${t._y|0}px) translate(-50%,-100%)`}
function updNPCs(dt,scene){updKoumTags(scene);for(const e of npcs){if(e.scene!==scene)continue;
  if(e.wander){const tg=e.wander[e.wi||0],dx=tg[0]-e.pos.x,dz=tg[1]-e.pos.z,d=Math.hypot(dx,dz);if(d<.4)e.wi=((e.wi||0)+1)%e.wander.length;else{e.pos.x+=dx/d*1.2*dt;e.pos.z+=dz/d*1.2*dt;e.yaw=angLerp(e.yaw,Math.atan2(dx,dz),dt*4)}}
  else if(e.act0==="talk"||e.act0==="laugh"){e.t-=dt;if(e.t<0){e.t=3+rnd()*4;play(e,e.curName==="talk"?"laugh":"talk",.4)}}
  e.m.position.copy(e.pos);e.m.rotation.y=e.yaw;e.mix.update(dt)}}

/* ---------- pathfinding: A* on a half-metre grid, so the auto-walk never gets stuck on a corner ---------- */
function makeGrid(b,solids,rounds,pad=.45){const s=.5,Wd=Math.ceil((b[2]-b[0])/s)+1,Ht=Math.ceil((b[3]-b[1])/s)+1,g=new Uint8Array(Wd*Ht);
  for(let j=0;j<Ht;j++)for(let i=0;i<Wd;i++){const x=b[0]+i*s,z=b[1]+j*s;let bl=false;
    for(const q of solids)if(x>q.x0-pad&&x<q.x1+pad&&z>q.z0-pad&&z<q.z1+pad){bl=true;break}
    if(!bl)for(const c of rounds)if(Math.hypot(x-c.x,z-c.z)<c.r+pad){bl=true;break}g[j*Wd+i]=bl?1:0}
  return{b,s,W:Wd,H:Ht,g}}
function cellOf(G,x,z){return[THREE.MathUtils.clamp(Math.round((x-G.b[0])/G.s),0,G.W-1),THREE.MathUtils.clamp(Math.round((z-G.b[1])/G.s),0,G.H-1)]}
function freeNear(G,[i,j]){if(!G.g[j*G.W+i])return[i,j];for(let r=1;r<20;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<G.W&&b<G.H&&!G.g[b*G.W+a])return[a,b]}return[i,j]}
function los(G,x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/(G.s*.5));for(let k=0;k<=n;k++){const[i,j]=cellOf(G,x0+(x1-x0)*k/n,z0+(z1-z0)*k/n);if(G.g[j*G.W+i])return false}return true}
function findPath(G,from,to){const s=freeNear(G,cellOf(G,from.x,from.z)),t=freeNear(G,cellOf(G,to.x,to.z)),tx0=G.b[0]+t[0]*G.s,tz0=G.b[1]+t[1]*G.s;
  const end=G.g[cellOf(G,to.x,to.z)[1]*G.W+cellOf(G,to.x,to.z)[0]]?new THREE.Vector3(tx0,0,tz0):to.clone();
  if(los(G,from.x,from.z,end.x,end.z))return[end];
  const n=G.W*G.H,gs=new Float32Array(n).fill(1e9),from_=new Int32Array(n).fill(-1),closed=new Uint8Array(n),open=[];const si=s[1]*G.W+s[0],ti=t[1]*G.W+t[0];gs[si]=0;
  const hh=i=>Math.hypot(i%G.W-t[0],(i/G.W|0)-t[1]);const push=(i,f)=>{open.push([f,i]);let k=open.length-1;while(k){const p=(k-1)>>1;if(open[p][0]<=open[k][0])break;[open[p],open[k]]=[open[k],open[p]];k=p}};
  const pop=()=>{const top=open[0],l=open.pop();if(open.length){open[0]=l;let k=0;for(;;){const a=2*k+1,b=a+1;let m=k;if(a<open.length&&open[a][0]<open[m][0])m=a;if(b<open.length&&open[b][0]<open[m][0])m=b;if(m===k)break;[open[m],open[k]]=[open[k],open[m]];k=m}}return top};
  push(si,hh(si));let found=false;
  while(open.length){const c=pop()[1];if(closed[c])continue;closed[c]=1;if(c===ti){found=true;break}const ci=c%G.W,cj=c/G.W|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=ci+di,b=cj+dj;if(a<0||b<0||a>=G.W||b>=G.H)continue;const ni=b*G.W+a;if(G.g[ni]||closed[ni])continue;if(di&&dj&&(G.g[cj*G.W+a]||G.g[b*G.W+ci]))continue;
      const ng=gs[c]+(di&&dj?1.414:1);if(ng<gs[ni]){gs[ni]=ng;from_[ni]=c;push(ni,ng+hh(ni))}}}
  if(!found)return[end];
  const pts=[];for(let c=ti;c!==-1;c=from_[c])pts.push(new THREE.Vector3(G.b[0]+(c%G.W)*G.s,0,G.b[1]+(c/G.W|0)*G.s));pts.reverse();
  const out=[];let cx=from.x,cz=from.z,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(G,cx,cz,pts[j].x,pts[j].z))j--;out.push(pts[j]);cx=pts[j].x;cz=pts[j].z;i=j+1}
  out[out.length-1]=end;return out}
const WORLD_B=[-40,-54,34,22.4];let worldGrid=null;const gridNow=()=>room?room.grid:(worldGrid||(worldGrid=makeGrid(WORLD_B,solid,round)));

/* ---------- movement + collision ---------- */
const keys={};addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea,select"))return;keys[e.key.toLowerCase()]=true});addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false});addEventListener("blur",()=>{for(const k in keys)keys[k]=false});
const joy={x:0,y:0};
/* joystick "up" = away from the camera actually on screen (rooms use their own camera) */
const _cf=new THREE.Vector3();function camFwd(){camera.getWorldDirection(_cf);_cf.y=0;if(_cf.lengthSq()<1e-6)_cf.set(-Math.sin(camYaw),0,-Math.cos(camYaw));return _cf.normalize().clone()}
function resolve(p){const r=.38,b=room?room.bounds:WORLD_B,sl=room?room.solid:solid,rl=room?room.round:round;
  p.x=THREE.MathUtils.clamp(p.x,b[0],b[2]);p.z=THREE.MathUtils.clamp(p.z,b[1],b[3]);
  for(const c of rl){const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-4){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m}}
  for(const q of sl){if(p.x<q.x0-r||p.x>q.x1+r||p.z<q.z0-r||p.z>q.z1+r)continue;const l=p.x-(q.x0-r),rt=q.x1+r-p.x,t=p.z-(q.z0-r),bt=q.z1+r-p.z,m=Math.min(l,rt,t,bt);
    if(m===l)p.x=q.x0-r;else if(m===rt)p.x=q.x1+r;else if(m===t)p.z=q.z0-r;else p.z=q.z1+r}}
const dancing=()=>!!(room&&(room.dance||room.wantDance));
function freeLocks(){if(dancing())return;[P,N].forEach(e=>{if(e&&e.lock>0&&mode!=="ride"){e.lock=0;e.m.position.y=0}})}
function walkTo(x,z,then){if(dancing()){toast(tx().isaiahWait,2500);return}freeLocks();goal={pts:findPath(gridNow(),P.pos,new THREE.Vector3(x,0,z)),i:0,then,t:0}}
const doorFront=(id,d)=>{const p=PLACES[id],o=new THREE.Vector3(0,0,d).applyAxisAngle(UP,p.face);return[p.door[0]+o.x,p.door[1]+o.z]};
function goPlace(id){if(room){exitRoom(()=>goPlace(id));return}const[a,b]=doorFront(id,1.6);walkTo(a,b,()=>walkTo(PLACES[id].door[0],PLACES[id].door[1]))}
const angLerp=(a,b,k)=>{const d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*k};
const _v=new THREE.Vector3();
function stepChar(e,dir,sp,dt){const bx=e.pos.x,bz=e.pos.z;e.pos.addScaledVector(dir,sp*dt);resolve(e.pos);e.yaw=angLerp(e.yaw,Math.atan2(dir.x,dir.z),1-Math.exp(-12*dt));return Math.hypot(e.pos.x-bx,e.pos.z-bz)}
function animFor(e){if(e.lock>0)return;const w=e.spd>.4;play(e,w?"walk":(e.chat||"idle"),.25);if(w&&e.act.walk)e.act.walk.timeScale=THREE.MathUtils.clamp(e.spd/1.4,.7,1.5)}
let idleT=0;
function updateChars(dt){
  let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,iy=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)+joy.y;let dir=null,sp=0;
  if(document.body.classList.contains("cardopen")){ix=iy=0}
  if(Math.hypot(ix,iy)>.1){goal=null;freeLocks();const f=camFwd(),r=new THREE.Vector3(-f.z,0,f.x);dir=f.multiplyScalar(iy).addScaledVector(r,ix).normalize();sp=(keys.shift?5.6:3.4)*Math.min(1,Math.hypot(ix,iy))}
  else if(goal){const tg=goal.pts[goal.i];_v.subVectors(tg,P.pos);_v.y=0;const d=_v.length(),last=goal.i===goal.pts.length-1;
    if(d<(last?.3:.6)){goal.i++;if(goal.i>=goal.pts.length){const g=goal;goal=null;g.then&&g.then()}}else{dir=_v.normalize().clone();sp=Math.min(3.6,1.1+d*1.6)}
    if(goal&&(goal.t+=dt)>45)goal=null}
  if(dir&&P.lock<=0){const mv=stepChar(P,dir,sp,dt);P.spd+=(mv/dt-P.spd)*Math.min(1,dt*10);
    if(goal){if(mv<sp*dt*.3){goal.stuck=(goal.stuck||0)+dt;if(goal.stuck>.6){const end=goal.pts[goal.pts.length-1],tries=(goal.tries||0)+1,then=goal.then;
        if(tries>2||P.pos.distanceTo(end)<1.2){goal=null;then&&P.pos.distanceTo(end)<1.6&&then()}
        else{const G=room?(room.grid=makeGrid(room.bounds,room.solid,room.round.concat(npcs.filter(n=>n.scene===room.scene).map(n=>({x:n.pos.x,z:n.pos.z,r:.45}))),.4)):gridNow();goal={pts:findPath(G,P.pos,end),i:0,then,t:0,tries}}}}
      else if(goal.stuck)goal.stuck=Math.max(0,goal.stuck-dt)}
    /* when walking on its own, the camera swings round behind the walker so the destination stays in view */
    if(goal&&!room&&tAll-userCamT>2.5)camYaw=angLerp(camYaw,Math.atan2(-dir.x,-dir.z),dt*1.2)}
  else P.spd+=(0-P.spd)*Math.min(1,dt*8);
  /* partner: beside you while walking; when you stop for a while you turn to each other and chat */
  const moving=P.spd>.3||goal;idleT=moving?0:idleT+dt;const chatting=idleT>2.2&&mode==="play"&&!document.body.classList.contains("cardopen")&&P.lock<=0;
  const side=new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw)),want=chatting?P.pos.clone().addScaledVector(new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),1.15):P.pos.clone().addScaledVector(side,1.05).addScaledVector(new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),-.35);
  _v.subVectors(want,N.pos);_v.y=0;const nd=_v.length();
  if(N.lock<=0){if(nd>.35){const s=Math.min(nd>5?6:3.8,nd*2.6);_v.normalize();const mv=stepChar(N,_v,s,dt);N.spd+=(mv/dt-N.spd)*Math.min(1,dt*8);if(nd>9)N.pos.copy(want)}
    else{N.spd+=(0-N.spd)*Math.min(1,dt*6);N.yaw=angLerp(N.yaw,P.spd>.3?P.yaw:Math.atan2(P.pos.x-N.pos.x,P.pos.z-N.pos.z),dt*4)}}
  if(chatting){P.yaw=angLerp(P.yaw,Math.atan2(N.pos.x-P.pos.x,N.pos.z-P.pos.z),dt*3);chatTick(dt)}else endChat();
  [P,N].forEach(e=>{e.m.position.copy(e.pos);e.m.rotation.y=e.yaw;animFor(e);e.mix.update(dt)});
  /* doors */
  if(!room&&mode==="play"){for(const id of ORDER){const p=PLACES[id],d=Math.hypot(P.pos.x-p.door[0],P.pos.z-p.door[1]);if(d<1.2){
    if(p.final&&!agencyOpen()){if(!p._warn){p._warn=1;toast(tx().lockedMsg);const[a,b]=doorFront(id,2);walkTo(a,b)}}else enterRoom(id);break}else if(p._warn&&d>3)p._warn=0}}
  if(!room&&mode==="play"&&Math.hypot(P.pos.x-PLACES.arcade.door[0],P.pos.z-PLACES.arcade.door[1])<1.2)enterRoom("arcade");
  if(!room&&mode==="play"){const d=Math.hypot(P.pos.x-SECRET.door[0],P.pos.z-SECRET.door[1]);
    if(d<1.6&&!atSecret){atSecret=true;goal=null;secretCard()}else if(d>3.5&&atSecret){atSecret=false;closeCard()}}
  if(room){const ex=room.exit;if(Math.hypot(P.pos.x-ex[0],P.pos.z-ex[1])<1&&P.spd>.2&&room.age>1.5)exitRoom();
    const sp=room.spot,ds=Math.hypot(P.pos.x-sp[0],P.pos.z-sp[1]);if(!room.shown&&ds<sp[2]){room.shown=1;goal=null;roomFocus(6);P.yaw=Math.atan2(sp[3]-P.pos.x,sp[4]-P.pos.z);(room.spotFn||CARDS[room.id]||(()=>{}))()}
    if(room.shown&&ds>sp[2]+2)room.shown=0}
}

/* ---------- Sims-style chat: hearts and little thought bubbles ---------- */
const heartTex=canvasTex(64,64,(g)=>{g.translate(32,34);g.beginPath();g.moveTo(0,18);g.bezierCurveTo(-30,-2,-18,-28,0,-12);g.bezierCurveTo(18,-28,30,-2,0,18);g.fillStyle="#ff5a86";g.fill()});const _unusedHeart=canvasTex(64,64,(g)=>{g.translate(32,34);g.beginPath();g.moveTo(0,18);g.bezierCurveTo(-30,-2,-18,-28,0,-12);g.bezierCurveTo(18,-28,30,-2,0,18);g.fillStyle="#e2406b";g.fill()});
const hearts=[];let chatT=0,bubT=0,bubWho=0;
const fx=new THREE.Scene();
function heart(scene,pos){if(scene===world)scene=fx;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTex,transparent:true,depthWrite:false}));s.scale.setScalar(.32);s.position.copy(pos);scene.add(s);hearts.push({s,t:0,vx:(rnd()-.5)*.3})}
const bub=[document.createElement("div"),document.createElement("div")];bub.forEach(b=>{b.className="bub";b.hidden=true;$("#labels").appendChild(b)});
const BUBS=["heart","ring","plane","music","sun","heart"];
function chatTick(dt){chatT+=dt;bubT-=dt;
  [P,N].forEach((e,i)=>{e.chat=((chatT/2.6+i*.5)|0)%3===2?"laugh":"talk"});
  if(chatT%0.7<dt){const sc=room?room.scene:world;heart(sc,P.pos.clone().lerp(N.pos,.5).setY(2.1))}
  if(bubT<0){bubT=2.4;bubWho^=1;bub.forEach((b,i)=>{b.hidden=i!==bubWho;if(i===bubWho)b.innerHTML=ICON[BUBS[(Math.random()*BUBS.length)|0]]})}}
function endChat(){if(!chatT)return;chatT=0;bubT=0;bub.forEach(b=>b.hidden=true);[P,N].forEach(e=>e.chat=null)}
function updHearts(dt){for(let i=hearts.length-1;i>=0;i--){const h=hearts[i];h.t+=dt;h.s.position.y+=dt*.6;h.s.position.x+=h.vx*dt;h.s.material.opacity=1-h.t/1.8;if(h.t>1.8){h.s.parent&&h.s.parent.remove(h.s);h.s.material.dispose();hearts.splice(i,1)}}
  const _q=new THREE.Vector3();[P,N].forEach((e,i)=>{const b=bub[i];if(!e||b.hidden)return;_q.copy(e.pos).setY(2.35).project(camera);b.style.transform=`translate(${(_q.x*.5+.5)*innerWidth|0}px,${(-_q.y*.5+.5)*innerHeight|0}px) translate(-50%,-100%)`})}

/* ================= interiors: cut-away walls like a dollhouse, so you always see inside ================= */
const rooms={};
function roomBase(id,o){const s=new THREE.Scene();s.background=new THREE.Color(o.bg||0x16110d);
  s.add(new THREE.HemisphereLight(0xfff0dc,0x5a4a40,o.hemi??.75));const k=new THREE.DirectionalLight(o.key||0xffd7a8,o.keyI??1.4);k.position.set(5,11,7);k.castShadow=true;k.shadow.mapSize.setScalar(1024);
  {const c=k.shadow.camera;c.left=c.bottom=-11;c.right=c.top=11;c.updateProjectionMatrix()}s.add(k);
  const B=Builder();const fl=new THREE.Mesh(new THREE.PlaneGeometry(16,13),new THREE.MeshStandardMaterial({map:o.floor,roughness:o.floorR??.6}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.add(fl);
  M["w_"+id]=mat({color:o.wall,roughness:.95,map:o.wallMap||null});M["t_"+id]=mat({color:o.trim||0xffffff,roughness:.8});
  const H=o.h||4.6;
  B.add(G.box,"w_"+id,0,H/2,-6.6,16.4,H,.3).add(G.box,"w_"+id,-8.1,H/2,0,.3,H,13.4).add(G.box,"w_"+id,8.1,H/2,0,.3,H,13.4);
  /* front wall cut down to knee height with the doorway in the middle, framed and lit */
  B.add(G.box,"w_"+id,-4.75,.35,6.6,6.7,.7,.3).add(G.box,"w_"+id,4.75,.35,6.6,6.7,.7,.3).add(G.box,"t_"+id,-8.1,.72,6.6,.34,.06,.34);
  B.add(G.box,"t_"+id,-1.45,1.25,6.6,.25,2.5,.4).add(G.box,"t_"+id,1.45,1.25,6.6,.25,2.5,.4).add(G.box,"t_"+id,0,2.55,6.6,3.15,.25,.4);
  B.add(G.box,"terra",0,.015,5.7,2.4,.03,1.2);
  const r={id,scene:s,B,bounds:[-7.5,-6,7.5,6.4],solid:[],round:[],exit:[0,6.25],anim:()=>{},spot:null,people:[]};
  const ex=new THREE.PointLight(0xffe2b0,6,6,2);ex.position.set(0,2.4,6.2);s.add(ex);return r}
function lightCone(r,x,y,z,tx,tz,color=0xfff1d6,i=26){const l=new THREE.SpotLight(color,i,12,.42,.7,1.6);l.position.set(x,y,z);l.target.position.set(tx,0,tz);r.scene.add(l,l.target)}
function rug(r,x,z,w,d,c1,c2){const t=canvasTex(256,256,(g,W,H)=>{g.fillStyle=c1;g.fillRect(0,0,W,H);g.strokeStyle=c2;g.lineWidth=10;g.strokeRect(14,14,W-28,H-28);g.lineWidth=3;g.strokeRect(30,30,W-60,H-60);
  for(let i=0;i<6;i++){g.beginPath();g.arc(W/2,H/2,20+i*14,0,7);g.stroke()}});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat({map:t,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,.02,z);m.receiveShadow=true;r.scene.add(m)}
function plant(B,x,z,s=1){B.add(G.cyl,"terra",x,.35*s,z,.7*s,.7*s,.7*s);for(let k=0;k<7;k++){const a=k/7*Math.PI*2;B.add(G.cone,"palm",x+Math.cos(a)*.25*s,1.1*s,z+Math.sin(a)*.25*s,.35*s,1.3*s,.12*s,a,Math.cos(a)*.5,Math.sin(a)*.5)}}
/* painted icon: gold leaf ground, arched frame, a haloed figure in a red-brown robe (original, stylised) */
function iconTex(i){return canvasTex(256,384,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,"#e8c46a");gr.addColorStop(.5,"#c99a3a");gr.addColorStop(1,"#e2b95a");g.fillStyle="#5a2a1a";g.fillRect(0,0,w,h);
  g.fillStyle=gr;g.beginPath();g.moveTo(16,h-16);g.lineTo(16,110);g.arc(w/2,110,w/2-16,Math.PI,0);g.lineTo(w-16,h-16);g.closePath();g.fill();
  const robe=["#7d1f1a","#1f3a6b","#2d5a3a","#6b2a5a","#7d4a1a","#1f3a6b"][i%6];g.fillStyle="#f2d06b";g.beginPath();g.arc(w/2,130,52,0,7);g.fill();g.strokeStyle="#9a6a1a";g.lineWidth=3;g.stroke();
  g.fillStyle="#d9a77a";g.beginPath();g.ellipse(w/2,135,26,34,0,0,7);g.fill();g.fillStyle="#4a2a18";g.beginPath();g.ellipse(w/2,112,28,16,0,Math.PI,0);g.fill();
  g.fillStyle=robe;g.beginPath();g.moveTo(w/2-30,170);g.quadraticCurveTo(w/2-80,240,w/2-70,h-30);g.lineTo(w/2+70,h-30);g.quadraticCurveTo(w/2+80,240,w/2+30,170);g.closePath();g.fill();
  g.fillStyle="#c99a3a";g.fillRect(w/2-4,190,8,h-230);g.fillStyle="#3a1a10";g.font="600 18px Georgia";g.textAlign="center";g.fillText(["ΙΣ ΧΣ","ΜΡ ΘΥ","Ο ΑΓΙΟΣ","Η ΑΓΙΑ","Ο ΑΓΙΟΣ","ΙΩ"][i%6],w/2,60)},null)}
function stoneTex(c1,c2){return canvasTex(512,512,(g,w,h)=>{g.fillStyle=c2;g.fillRect(0,0,w,h);let y=0;while(y<h){const rh=36+rnd()*30;let x=-rnd()*40;while(x<w){const rw=50+rnd()*70,t=rnd()*24-12;
  g.fillStyle=`hsl(35,${18+rnd()*10}%,${parseInt(c1)+t}%)`;g.beginPath();g.roundRect(x+3,y+3,rw-6,rh-6,8);g.fill();x+=rw}y+=rh}},[3,1.2])}
function plankTex(c1,c2){return canvasTex(512,512,(g,w,h)=>{for(let y=0;y<h;y+=32){g.fillStyle=y/32%2?c1:c2;g.fillRect(0,y,w,32);g.fillStyle="rgba(0,0,0,.18)";g.fillRect(0,y,w,2);
  for(let k=0;k<3;k++){const x=rnd()*w;g.fillRect(x,y,2,32)}g.fillStyle="rgba(255,255,255,.05)";for(let k=0;k<20;k++)g.fillRect(rnd()*w,y+rnd()*32,40+rnd()*80,1)}},[4,3])}
function marbleTex(){return canvasTex(512,512,(g,w,h)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=(x+y)%2?"#ece6dc":"#c9bfae";g.fillRect(x*64,y*64,64,64);g.strokeStyle="rgba(120,100,80,.25)";
  for(let k=0;k<3;k++){g.beginPath();g.moveTo(x*64+rnd()*64,y*64);g.bezierCurveTo(x*64+rnd()*64,y*64+20,x*64+rnd()*64,y*64+44,x*64+rnd()*64,y*64+64);g.stroke()}}},[2,1.6])}

function buildRoom(id){if(rooms[id])return rooms[id];let r;const x=tx();
  if(id==="chapel"){
    r=roomBase(id,{floor:marbleTex(),wall:0xe8d4b0,trim:0xd8c4a0,hemi:.55,keyI:.9,h:5.2});const B=r.B;
    /* red carpet down the nave, the solea step, the gilded iconostasis with royal doors */
    rug(r,0,1.2,2.2,9,"#7e1a22","#c99a3a");
    B.add(G.box,"stone",0,.1,-5.2,15,.2,2.4);
    B.add(G.box,"darkwood",0,.35,-5.9,15,.7,.4).add(G.box,"gold",0,3.1,-5.95,15,4.8,.12).add(G.box,"darkwood",0,5.4,-5.9,15.4,.3,.5);
    for(let i=0;i<6;i++){const xx=[-6,-4,-2,2,4,6][i];const ic=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.25),mat({map:iconTex(i),roughness:.4,metalness:.2}));ic.position.set(xx,2.55,-5.86);r.scene.add(ic);
      B.add(G.box,"darkwood",xx,2.55,-5.9,1.7,2.45,.06);B.add(G.box,"gold",xx-.95,2.6,-5.86,.12,3.2,.14);}
    B.add(G.box,"darkwood",0,2.1,-5.88,2.2,3.6,.1).add(G.box,"gold",-.55,2,-5.84,1,3.1,.06).add(G.box,"gold",.55,2,-5.84,1,3.1,.06);
    for(let i=0;i<5;i++){const ic=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.2),mat({map:iconTex(i+2),roughness:.4}));ic.position.set(-4.4+i*2.2,4.55,-5.86);r.scene.add(ic)}
    B.add(G.box,"gold",0,5.9,-5.9,.12,.9,.12).add(G.box,"gold",0,6.05,-5.9,.6,.12,.12);
    /* polyeleos: brass ring of candles hanging from the dome */
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;B.add(G.cyl,"brass",Math.cos(a)*2,3.7,Math.sin(a)*2-1,.09,.18,.09).add(G.cyl,"flame",Math.cos(a)*2,3.86,Math.sin(a)*2-1,.04,.12,.04)}
    B.add(new THREE.TorusGeometry(2,.05,8,48),"brass",0,3.62,-1,1,1,1,0,Math.PI/2);for(let k=0;k<4;k++){const a=k/4*Math.PI*2;B.add(G.cyl,"brass",Math.cos(a),4.6,Math.sin(a)-1,.03,2,.03,0,0,0)}
    const pl=new THREE.PointLight(0xffc27a,14,12,1.6);pl.position.set(0,3.4,-1);r.scene.add(pl);
    /* candle stands by the door with thin beeswax candles */
    for(const sx of [-1,1]){const cx=sx*4.6;B.add(G.cyl,"brass",cx,.6,4.2,.12,1.2,.12).add(G.cyl,"brass",cx,1.25,4.2,1.1,.12,1.1).add(G.cyl,"stone",cx,1.33,4.2,1,.06,1);
      for(let k=0;k<11;k++){const a=k*2.4,rr=.15+(k%3)*.13;B.add(G.cyl,"linen",cx+Math.cos(a)*rr,1.55,4.2+Math.sin(a)*rr,.03,.4,.03).add(G.sph,"flame",cx+Math.cos(a)*rr,1.8,4.2+Math.sin(a)*rr,.05,.09,.05)}
      const cl=new THREE.PointLight(0xffb45a,5,5,2);cl.position.set(cx,2,4.2);r.scene.add(cl);r.round.push({x:cx,z:4.2,r:.7})}
    /* stasidia: carved wooden stalls along both walls */
    for(const sx of [-1,1])for(let k=0;k<6;k++){const zz=-3.6+k*1.3,xx=sx*7.3;B.add(G.box,"darkwood",xx,.5,zz,.9,.12,1).add(G.box,"darkwood",xx+sx*.4,1.3,zz,.12,2.6,1.1).add(G.box,"darkwood",xx,.85,zz-.5,.9,.7,.08).add(G.box,"darkwood",xx,.85,zz+.5,.9,.7,.08).add(G.box,"gold",xx+sx*.4,2.65,zz,.14,.1,1.1)}
    r.solid.push({x0:-8,z0:-4.2,x1:-6.8,z1:3.6},{x0:6.8,z0:-4.2,x1:8,z1:3.6},{x0:-7.5,z0:-6.6,x1:7.5,z1:-4.6});
    /* arched windows with evening light */
    for(const sx of [-1,1])for(let k=0;k<2;k++){const win=new THREE.Mesh(new THREE.PlaneGeometry(1,2),mat({color:0xffd9a0,emissive:0xffb060,emissiveIntensity:.9}));win.position.set(sx*7.94,3.1,-2+k*3.6);win.rotation.y=-sx*Math.PI/2;r.scene.add(win)}
    r.spot=[0,-2.6,1.4,0,-3.9];
    loadChar("priest").then(g=>{priest=makeEnt(g,priestTint);priest.pos.set(0,0,-3.9);priest.m.position.copy(priest.pos);
      /* kalimafi hat and a grey beard, fixed to the head bone */
      const head=findBone(priest.m,/Head$/);if(head){const s=1/.01;const hat=new THREE.Mesh(new THREE.CylinderGeometry(.13*s,.12*s,.17*s,24),mat({color:0x111111,roughness:.6}));hat.position.set(0,.2*s,0);head.add(hat);
        const brim=new THREE.Mesh(new THREE.CylinderGeometry(.15*s,.15*s,.02*s,24),hat.material);brim.position.set(0,.29*s,0);head.add(brim);
        const beard=new THREE.Mesh(new THREE.SphereGeometry(.1*s,16,12),mat({color:0x8a8580,roughness:1}));beard.scale.set(1,1.4,.7);beard.position.set(0,-.02*s,.08*s);head.add(beard)}
      r.scene.add(priest.m);r.anim=dt=>{priest.mix.update(dt);if(priest.lock>0&&(priest.lock-=dt)<=0)play(priest,"idle",.5);updIsaiah(dt)};if(room===r&&r.wantDance)startIsaiah()});
    r.round.push({x:0,z:-3.9,r:.7});
    [[-5.8,1.2,1.4,"idle"],[5.8,-.8,-1.4,"idle"],[-5.8,-2.2,1.6,"talk"]].forEach(([gx,gz,gy,a],i)=>guest(r.scene,i+1,gx,gz,gy,a).then(e=>e&&r.round.push({x:gx,z:gz,r:.5})));
  }else if(id==="gallery"){
    r=roomBase(id,{floor:plankTex("#c9a982","#c19f78"),wall:0xf7f6f2,trim:0xffffff,hemi:.7,keyI:.6,bg:0x1d1b19});const B=r.B;
    const title=new THREE.Mesh(new THREE.PlaneGeometry(6,.7),mat({map:canvasTex(1024,120,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle="#1c2833";g.font="300 72px Piazzolla, Georgia, serif";g.textAlign="center";g.fillText(x.storyH,w/2,86)}),transparent:true}));title.position.set(0,4,-6.43);r.scene.add(title);
    CONTENT.story.forEach((s,i)=>{const xx=-6+i*3,t=new THREE.TextureLoader().load(s.src||photoURL(i));t.colorSpace=THREE.SRGBColorSpace;const fr=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.58),mat({map:t,roughness:.5,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));fr.position.set(xx,2.3,-6.36);r.scene.add(fr);
      B.add(G.box,"black",xx,2.3,-6.46,2.4,1.86,.06).add(G.box,"white",xx,2.3,-6.405,2.26,1.72,.02);
      const cap=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),mat({map:canvasTex(256,64,(g,w,h)=>{g.fillStyle="#fff";g.fillRect(0,0,w,h);g.fillStyle="#333";g.font="500 26px Commissioner, sans-serif";g.fillText(s.city,12,40)})}));cap.material.polygonOffset=true;cap.material.polygonOffsetFactor=-4;cap.material.polygonOffsetUnits=-4;cap.position.set(xx,1.15,-6.38);r.scene.add(cap);
      lightCone(r,xx,4.4,-4.8,xx,-6.4,0xfff4e0,30);B.add(G.cyl,"black",xx,4.45,-4.8,.12,.3,.12)});
    /* track rail, leather bench, plinths with vases */
    B.add(G.box,"black",0,4.6,-4.8,14,.06,.06).add(G.box,"black",0,.42,0,3.2,.12,.9).add(G.box,"darkwood",0,.2,0,3,.36,.7).add(G.box,"black",-1.4,.2,0,.06,.4,.7).add(G.box,"black",1.4,.2,0,.06,.4,.7);
    for(const sx of [-1,1]){B.add(G.box,"white",sx*5.4,.55,1.5,.8,1.1,.8).add(G.sph,"terra",sx*5.4,1.4,1.5,.5,.7,.5).add(G.cyl,"terra",sx*5.4,1.85,1.5,.18,.3,.18);r.solid.push({x0:sx*5.4-.5,z0:1,x1:sx*5.4+.5,z1:2})}
    r.solid.push({x0:-1.7,z0:-.5,x1:1.7,z1:.5});
    /* left wall: the "these kids are getting married" collage and a wall of small frames, one per year */
    {const t=new THREE.TextureLoader().load("assets/collage.jpg?v=2");t.colorSpace=THREE.SRGBColorSpace;const cg=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.375),mat({map:t,roughness:.6,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));cg.position.set(-7.86,2.4,-2.6);cg.rotation.y=Math.PI/2;r.scene.add(cg);
      B.add(G.box,"darkwood",-7.96,2.4,-2.6,.06,2.55,2.08);lightCone(r,-5.8,4.4,-2.6,-7.9,-2.6,0xfff4e0,26);
      const yrs=CONTENT.years||[];for(let k=0;k<16;k++){const c=k%4,rw=k/4|0,zz=1.2+c*.62,yy=3.3-rw*.62,y0=CONTENT.years&&CONTENT.years[k];
        const tx2=y0&&y0.src?new THREE.TextureLoader().load(y0.src,tt=>{const ar=tt.image.width/tt.image.height;if(ar>1){tt.repeat.set(1/ar,1);tt.offset.set((1-1/ar)/2,0)}else{tt.repeat.set(1,ar);tt.offset.set(0,(1-ar)/2)}}):null;if(tx2)tx2.colorSpace=THREE.SRGBColorSpace;
        const f=new THREE.Mesh(new THREE.PlaneGeometry(.48,.48),mat(tx2?{map:tx2}:{map:canvasTex(96,96,(g,w,h)=>{g.fillStyle=["#e9d8c0","#cfe0e8","#e8cfd6","#d8e6cf"][k%4];g.fillRect(0,0,w,h);g.fillStyle="#6b6358";g.font="600 22px Commissioner, sans-serif";g.textAlign="center";g.fillText(2011+k,w/2,56)})}));
        f.material.polygonOffset=true;f.material.polygonOffsetFactor=-4;f.material.polygonOffsetUnits=-4;f.position.set(-7.86,yy,zz);f.rotation.y=Math.PI/2;r.scene.add(f);B.add(G.box,"black",-7.95,yy,zz,.04,.54,.54)}}
    r.spot=[0,-3.6,1.6,0,-6.4];r.items=[{label:()=>"📷 "+tx().albumL,at:[5.4,2.7,1.5],go:[4.3,2.8],fn:()=>CARDS.album()},{label:()=>tx().kidsL,at:[-7.6,3.9,-2.6],go:[-5.8,-2.6],fn:()=>CARDS.kids()},{label:()=>"2011 – 2026",at:[-7.6,3.9,2.1],go:[-5.6,2.6],fn:()=>CARDS.years()}];
    [[-4.2,-4.6,Math.PI,"idle"],[3.8,-4.8,Math.PI,"talk"]].forEach(([gx,gz,gy,a],i)=>guest(r.scene,i+2,gx,gz,gy,a).then(e=>e&&r.round.push({x:gx,z:gz,r:.5})));
  }else if(id==="estate"){
    r=roomBase(id,{floor:canvasTex(256,256,(g,w,h)=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=`hsl(18,${45+rnd()*10}%,${40+rnd()*8}%)`;g.fillRect(x*64+2,y*64+2,60,60)}g.fillStyle="#e5d6bf";g.globalCompositeOperation="destination-over";g.fillRect(0,0,w,h)},[8,6.5]),
      wall:0xe1cfb2,wallMap:stoneTex("62","#bfae92"),trim:0x6e4a30,hemi:.95,keyI:1.1});const B=r.B;
    /* oak barrels, a long tasting table with candles, the invitation on an easel */
    const barrel=new THREE.LatheGeometry([...Array(9)].map((_,i)=>new THREE.Vector2(.5+Math.sin(i/8*Math.PI)*.1,i/8*1.2-.6)),24);
    for(let k=0;k<5;k++){const bx=-6.6+k*1.15;B.add(barrel,"wood2",bx,.55,-5.6,1,1,1,0,0,Math.PI/2).add(new THREE.TorusGeometry(.56,.03,6,24),"black",bx-.35,.55,-5.6,1,1,1,Math.PI/2);if(k<4)B.add(barrel,"wood2",bx+.55,1.6,-5.6,1,1,1,0,0,Math.PI/2)}
    r.solid.push({x0:-7.5,z0:-6.6,x1:-1.2,z1:-4.8});
    B.add(G.box,"darkwood",-1,.78,0,7,.1,1.4);for(const sx of [-3.8,1.8])for(const sz of [-.55,.55])B.add(G.box,"darkwood",sx,.38,sz,.12,.76,.12);
    for(let k=0;k<5;k++){B.add(G.cyl,"linen",-3.8+k*1.4,1.0,0,.08,.36,.08).add(G.sph,"flame",-3.8+k*1.4,1.24,0,.06,.12,.06);for(const sz of [-.4,.4])B.add(G.cyl,"glass",-3.4+k*1.4,.95,sz,.08,.24,.08)}
    for(let k=0;k<5;k++)for(const sz of [-1.1,1.1])B.add(G.box,"wood",-3.8+k*1.4,.45,sz,.5,.06,.5).add(G.box,"wood",-3.8+k*1.4,.75,sz*1.22,.5,.6,.06);
    r.solid.push({x0:-4.6,z0:-1.4,x1:2.6,z1:1.4});
    const pl=new THREE.PointLight(0xffc27a,8,8,1.8);pl.position.set(-1,2.2,0);r.scene.add(pl);
    /* easel + printed invitation */
    const card=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.6),mat({map:canvasTex(300,400,(g,w,h)=>{g.fillStyle="#fbfaf7";g.fillRect(0,0,w,h);g.strokeStyle="#b08a3e";g.lineWidth=4;g.strokeRect(14,14,w-28,h-28);g.fillStyle="#14273a";g.textAlign="center";
      g.font="300 34px Piazzolla, Georgia, serif";const n=CONTENT.names[lang];g.fillText(n[0],w/2,130);g.font="500 22px Piazzolla, Georgia, serif";g.fillText("&",w/2,165);g.font="300 34px Piazzolla, Georgia, serif";g.fillText(n[1],w/2,205);g.font="600 20px Commissioner, sans-serif";g.fillText("20 · 08 · 2027",w/2,270);g.fillText(x.koropi,w/2,300)})}));
    card.position.set(5,1.7,-4.6);card.rotation.set(-.12,-.5,0);r.scene.add(card);B.add(G.box,"wood",5,.85,-4.75,.06,1.9,.06,-.5,-.12).add(G.box,"wood",4.7,.85,-4.4,.06,1.9,.06,-.5,.15).add(G.box,"wood",5.3,.85,-4.5,.06,1.9,.06,-.5,.15);
    lightCone(r,5,4.4,-2.6,5,-4.6,0xfff1d6,22);r.round.push({x:5,z:-4.6,r:.6});
    plant(B,6.8,4.5,1.2);plant(B,-6.8,4.5,1.2);
    r.spot=[4.2,-3,1.6,5,-4.6];r.items=[{label:()=>tx().menuL,at:[-1,1.7,0],go:[-1,1.9],fn:()=>CARDS.menu()}];
    [[-2.2,1.6,Math.PI,"talk"],[-1,1.6,Math.PI,"laugh"]].forEach(([gx,gz,gy,a],i)=>guest(r.scene,i,gx,gz,gy,a).then(e=>e&&r.round.push({x:gx,z:gz,r:.5})));
  }else if(id==="post"){
    r=roomBase(id,{floor:canvasTex(256,256,(g,w,h)=>{g.fillStyle="#d8d2c6";g.fillRect(0,0,w,h);for(let k=0;k<900;k++){g.fillStyle=["#9b8f7c","#efe9dd","#6e7a86","#b85a3a"][k%4];g.fillRect(rnd()*w,rnd()*h,2+rnd()*3,2+rnd()*3)}},[6,5]),wall:0xf2e7c4,trim:0x1f5fae,hemi:.75,keyI:.9});const B=r.B;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(5,.8),mat({map:signTex("ΤΑΧΥΔΡΟΜΕΙΟ · POST","#1f5fae","#f2c230")}));sign.position.set(0,4.1,-6.43);r.scene.add(sign);
    /* counter with glass, PO boxes, writing desk for the wish */
    B.add(G.box,"wood2",-2.5,.55,-4.4,7,1.1,.9).add(G.box,"glass",-2.5,1.75,-4.4,7,1.3,.04).add(G.box,"wood2",-2.5,1.12,-4.2,7,.06,1.2);
    r.solid.push({x0:-6.1,z0:-6.6,x1:1.1,z1:-3.9});
    const box=canvasTex(512,256,(g,w,h)=>{g.fillStyle="#6b5428";g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x2=0;x2<8;x2++){g.fillStyle="#c9a24a";g.fillRect(x2*64+4,y*64+4,56,56);g.fillStyle="#5a4520";g.fillRect(x2*64+20,y*64+26,24,6);g.fillStyle="#3a2a10";g.font="12px sans-serif";g.fillText(100+y*8+x2,x2*64+8,y*64+18)}});
    const pob=new THREE.Mesh(new THREE.PlaneGeometry(4,2),mat({map:box,metalness:.5,roughness:.4}));pob.position.set(4.6,2.2,-6.43);r.scene.add(pob);
    B.add(G.box,"darkwood",3.6,.78,-1.6,2.4,.08,1.2);for(const sx of [-1,1])B.add(G.box,"darkwood",3.6+sx*1.1,.38,-1.6,.08,.76,1.1);
    B.add(G.box,"white",3.3,.84,-1.7,.5,.02,.7).add(G.box,"white",3.9,.84,-1.5,.5,.02,.7).add(G.cyl,"black",4.4,.88,-1.4,.03,.1,.03).add(G.box,"wood",3.6,.48,-.6,.5,.06,.5).add(G.box,"wood",3.6,.75,-.35,.5,.6,.06);
    r.solid.push({x0:2.3,z0:-2.3,x1:4.9,z1:-.9});
    /* the yellow Greek mailbox */
    B.add(new RoundedBoxGeometry(.7,1.3,.55,3,.1),"yellow",6.6,.65,1.8).add(G.box,"dark",6.6,1.05,2.08,.4,.06,.02);r.round.push({x:6.6,z:1.8,r:.6});
    for(let k=0;k<4;k++)B.add(G.cyl,"brass",-5+k*1.6,.5,-1.6,.08,1,.08);
    plant(B,-6.8,4.6,1.1);
    r.spot=[3.6,.4,1.3,3.6,-1.6];
    [[-3.6,-3.3,Math.PI,"talk"]].forEach(([gx,gz,gy,a],i)=>guest(r.scene,4,gx,gz,gy,a).then(e=>e&&r.round.push({x:gx,z:gz,r:.5})));
    guest(r.scene,1,-2.2,-5.2,0,"idle");
  }else if(id==="agency"){
    r=roomBase(id,{floor:canvasTex(256,256,(g,w,h)=>{for(let y=0;y<4;y++)for(let x2=0;x2<4;x2++){g.fillStyle=(x2+y)%2?"#e9eef2":"#3f78b5";g.fillRect(x2*64,y*64,64,64)}},[6,5]),wall:0xfaf8f4,trim:0x1f5fae,hemi:.8,keyI:.9});const B=r.B;
    CONTENT.honey.forEach((k,i)=>{const c=canvasTex(512,680,(g,w,h)=>{const P={namerica:["#f6b26b","#3b5f8a","#22303f"],samerica:["#ffcf6a","#2e8a6e","#6b5a3e"],oceania:["#8fd3f0","#1f7fb8","#ffffff"],antarctica:["#cfe6f5","#eaf4fb","#14212c"]}[k];
      const gr=g.createLinearGradient(0,0,0,h*.7);gr.addColorStop(0,P[0]);gr.addColorStop(1,"#fff2dc");g.fillStyle=gr;g.fillRect(0,0,w,h);const tri=(a,b,c2,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.lineTo(...c2);g.fill()};
      if(k==="namerica"){tri([0,h*.66],[150,h*.3],[300,h*.66],P[1]);tri([200,h*.66],[360,h*.36],[512,h*.66],P[1]);g.fillStyle=P[2];for(let j=0;j<7;j++){const bh=60+((j*37)%90);g.fillRect(30+j*66,h*.66-bh,48,bh)}g.fillRect(0,h*.66,w,h*.34)}
      else if(k==="samerica"){tri([0,h*.66],[120,h*.28],[260,h*.66],P[1]);tri([180,h*.66],[330,h*.22],[512,h*.66],"#3f7a55");g.fillStyle=P[2];for(let j=0;j<5;j++)g.fillRect(140+j*14,h*.5+j*22,240-j*28,18);g.fillStyle=P[1];g.fillRect(0,h*.66,w,h*.34)}
      else if(k==="oceania"){g.fillStyle="#ffd36a";g.beginPath();g.arc(400,h*.2,46,0,7);g.fill();g.fillStyle=P[1];g.fillRect(0,h*.6,w,h*.4);g.fillStyle=P[2];for(let j=0;j<4;j++){g.beginPath();g.moveTo(120+j*70,h*.6);g.quadraticCurveTo(150+j*70,h*.38-j*8,200+j*70,h*.6);g.fill()}}
      else{g.fillStyle="#9cc6e0";g.fillRect(0,h*.62,w,h*.38);tri([20,h*.62],[130,h*.36],[230,h*.62],P[1]);tri([260,h*.62],[400,h*.3],[500,h*.62],"#ffffff");g.fillStyle=P[2];g.beginPath();g.ellipse(256,h*.6,34,58,0,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.ellipse(256,h*.62,22,42,0,0,7);g.fill();g.fillStyle="#f2a33a";tri([248,h*.53],[264,h*.53],[256,h*.56],"#f2a33a")}
      g.fillStyle="#14273a";g.font="500 54px Piazzolla, Georgia, serif";g.textAlign="center";g.fillText(x.opt[k],w/2,h-60)});
      const px=-5.4+i*3.6,m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.2),mat({map:c}));m.position.set(px,2.6,-6.43);r.scene.add(m);B.add(G.box,"black",px,2.6,-6.47,2.5,3.3,.04);lightCone(r,px,4.5,-4.6,px,-6.4,0xfff4e0,20)});
    /* a big wrapped present for gifts */
    B.add(new RoundedBoxGeometry(1.2,1.1,1.2,3,.05),"white",-5.4,.55,-1.4).add(G.box,"red",-5.4,.56,-1.4,.18,1.12,1.22).add(G.box,"red",-5.4,.56,-1.4,1.22,1.12,.18);
    for(const sx of [-1,1])B.add(new THREE.TorusGeometry(.2,.06,8,20),"red",-5.4+sx*.18,1.2,-1.4,1,.7,1,0,0,sx*.5);
    r.solid.push({x0:-6.1,z0:-2.1,x1:-4.7,z1:-.7});r.items=[{label:()=>tx().giftL,at:[-5.4,2.2,-1.4],go:[-4.2,-.4],fn:()=>CARDS.gift()}];
    B.add(G.box,"white",0,.76,-2.6,3.6,.08,1.3).add(G.box,"white",-1.6,.38,-2.6,.1,.76,1.2).add(G.box,"white",1.6,.38,-2.6,.1,.76,1.2);
    B.add(G.cyl,"brass",.9,.9,-2.8,.04,.2,.04).add(G.sph,"blue2",.9,1.25,-2.8,.5,.5,.5);r.solid.push({x0:-1.9,z0:-3.3,x1:1.9,z1:-1.9});
    for(const sx of [-.7,.7])B.add(G.box,"blue",sx,.45,-1.2,.55,.08,.55).add(G.box,"blue",sx,.75,-.95,.55,.6,.08);
    plant(B,-6.8,-5.6,1.3);plant(B,6.8,-5.6,1.3);
    r.spot=[0,-.6,1.5,0,-2.6];
    guest(r.scene,4,0,-3.7,0,"talk").then(e=>e&&r.round.push({x:0,z:-3.7,r:.5}));guest(r.scene,0,-4.6,-4.2,0,"idle");
  }
  if(id==="club")r=buildClub();
  if(id==="arcade")r=buildArcade();
  if(id==="den")r=buildDen();
  /* each building furnished differently with scanned CC0 pieces: [model, x, z, rotation, size, collider radius] */
  (ROOM_PROPS[id]||[]).forEach(([n,x,z,ry,o,cr])=>{prop(n,x,z,ry,o,r.scene);if(cr)r.round.push({x,z,r:cr})});
  r.B.build(r.scene);r.grid=makeGrid(r.bounds,r.solid,r.round,.4);
  /* the glowing spot that marks what to do, and HTML labels for it and for the exit */
  const ring=new THREE.Mesh(new THREE.RingGeometry(.75,.95,48),new THREE.MeshBasicMaterial({color:id==="arcade"?0xffffff:0xffb24a,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(r.spot[0],.04,r.spot[1]);r.scene.add(ring);r.ring=ring;
  /* the same spot once its quest is done turns into a small green ring, still usable; every other thing to tap gets a small green disc on the floor */
  const done=new THREE.Mesh(new THREE.RingGeometry(.42,.56,40),new THREE.MeshBasicMaterial({color:0x34c26b,transparent:true,opacity:.85,depthWrite:false}));done.rotation.x=-Math.PI/2;done.position.set(r.spot[0],.045,r.spot[1]);done.visible=false;r.scene.add(done);r.doneRing=done;
  (r.items||[]).forEach(it=>{if(!it.go)return;r.scene.add(greenSpot(it.go[0],it.go[1]))});
  return rooms[id]=r}
const SPOT_G=new THREE.CircleGeometry(.32,32),SPOT_M=new THREE.MeshBasicMaterial({color:0x34c26b,transparent:true,opacity:.55,depthWrite:false});
const QH=Math.PI/2,ROOM_PROPS={
  chapel:[["brass_vase_03",-6.9,5.3,0,{h:.9},.4],["brass_vase_03",6.9,5.3,0,{h:.9},.4],["vintage_oil_lamp",-4.6,4.2,0,{h:.5}]],
  gallery:[["antique_ceramic_vase_01",-7,5.3,0,{h:1.1},.4],["antique_ceramic_vase_01",7,5.3,1,{h:1.1},.4],["mid_century_lounge_chair",6.5,-2.6,-QH,{h:.9},.6],["vintage_day_bed",-6.6,4,QH,{w:1.9},.8]],
  estate:[["barrel_03",6.9,5,0,{h:1},.5],["barrel_03",6.9,3.8,1,{h:1},.5],["barrel_03",5.8,5.2,2,{h:1},.5],["vintage_grandfather_clock_01",-7.1,3.6,QH,{h:2.1},.5],["painted_wooden_cabinet",-7.1,1.2,QH,{h:1.8},.6],["ceramic_vase_02",-1,0,0,{h:.35}],["lantern_chandelier_01",-7,5.3,0,{h:.6},.3]],
  post:[["painted_wooden_cabinet",7,-3.6,-QH,{h:1.9},.6],["painted_wooden_cabinet_02",-7.05,1.6,QH,{h:1.6},.6],["cardboard_box_01",6.6,4.7,.3,{h:.5},.5],["cardboard_box_01",7,5.4,1.1,{h:.4},.4],["small_wooden_table_01",-6.6,4.6,0,{h:.75},.6],["standing_picture_frame_01",-6.6,4.6,.4,{h:.3}],["painted_wooden_stool",-5.6,4.6,0,{h:.5},.3]],
  agency:[["sofa_02",-6.9,3.6,QH,{w:2.2},1],["modern_coffee_table_01",-5.3,3.6,0,{w:1.1},.6],["vintage_binocular",-5.3,3.6,.5,{h:.15}],["modern_arm_chair_01",6.6,2.4,-QH,{h:.95},.6],["modern_arm_chair_01",6.6,4.2,-QH,{h:.95},.6],["potted_plant_04",7,-5.3,0,{h:1.4},.4],["potted_plant_04",-7,-5.3,1,{h:1.4},.4]],
  arcade:[["metal_stool_01",-4,-4.35,0,{h:.7}],["metal_stool_01",0,-4.35,1,{h:.7}],["metal_stool_01",4,-4.35,2,{h:.7}],["sofa_03",-6.9,3.8,QH,{w:2.1},1]],
  den:[["boombox",5.2,4.9,-.4,{h:.35},.3],["brass_vase_02",7,5.3,0,{h:.7},.3],["painted_wooden_sofa",6.9,1.2,-QH,{w:2},.9]]};
function greenSpot(x,z){const m=new THREE.Mesh(SPOT_G,SPOT_M);m.rotation.x=-Math.PI/2;m.position.set(x,.035,z);m.renderOrder=2;return m}

/* the beach club: open air on the rocks above the sea, daybeds, straw parasols, a stone DJ booth and a crowd */
function buildClub(){const id="club",s=new THREE.Scene();makeSky(s,.14);s.fog=new THREE.FogExp2(0xd7a48e,.006);
  const sl=sunLight(s,16);s.add(new THREE.HemisphereLight(0xffd6bf,0x6a7c92,.55));const r={id,scene:s,B:Builder(),bounds:[-11,-7,11,8.5],solid:[],round:[],exit:[0,8.3],anim:()=>{},sun:sl,outdoor:true};const B=r.B;
  r.waters=[makeWater(s,-2.2)];
  const deck=new THREE.Mesh(new THREE.PlaneGeometry(26,18),mat({map:plankTex("#b48a5e","#a97f55"),roughness:.8}));deck.rotation.x=-Math.PI/2;deck.receiveShadow=true;s.add(deck);
  B.add(G.box,"stone",0,-1.23,0,27,2.4,19).add(G.box,"stone",0,-1.6,-11,30,1.6,4);
  /* glass balustrade toward the sea, wooden posts */
  B.add(G.box,"glass",0,.55,-8.9,26,1.1,.05).add(G.box,"wood2",0,1.12,-8.9,26,.06,.12);for(let k=-6;k<=6;k++)B.add(G.box,"wood2",k*2,.55,-8.9,.08,1.1,.08);
  r.solid.push({x0:-13,z0:-9.4,x1:13,z1:-8.4});
  /* DJ booth: rough whitewashed stone with decks and speakers */
  B.add(new RoundedBoxGeometry(3.4,1.2,1.2,3,.25),"wash",0,.6,-6.6).add(G.box,"black",-.7,1.24,-6.6,.8,.06,.6).add(G.box,"black",.7,1.24,-6.6,.8,.06,.6).add(G.box,"black",-2.4,.8,-6.8,.7,1.6,.6).add(G.box,"black",2.4,.8,-6.8,.7,1.6,.6);
  r.solid.push({x0:-2.8,z0:-7.4,x1:2.8,z1:-5.9});
  /* daybeds with parasols along the sides */
  for(const sx of [-1,1])for(let k=0;k<3;k++){const bx=sx*9,bz=-4+k*4;B.add(G.box,"wood2",bx,.25,bz,2.2,.3,1.6).add(new RoundedBoxGeometry(2.1,.3,1.5,3,.12),"cushion",bx,.55,bz).add(new RoundedBoxGeometry(.5,.5,1.4,3,.18),"linen",bx+sx*.8,.85,bz);
    B.add(G.cyl,"wood2",bx-sx*1.4,1.4,bz,.08,2.8,.08).add(G.cone,"thatch",bx-sx*1.4,2.95,bz,2.6,.7,2.6);r.solid.push({x0:bx-1.2,z0:bz-.9,x1:bx+1.2,z1:bz+.9})}
  /* bar on the right */
  B.add(new RoundedBoxGeometry(1,1.15,5,3,.15),"wash",7.2,.58,5).add(G.box,"wood2",7.2,1.18,5,1.2,.08,5.2);for(let k=0;k<8;k++)B.add(G.cyl,"glass",7.4,1.35,3+k*.55,.1,.3,.1);r.solid.push({x0:6.6,z0:2.4,x1:7.8,z1:7.6});
  /* string lights in zig-zags over the floor, lanterns on the deck */
  for(let k=0;k<3;k++){const a=[-10,-5+k*5],b=[10,-3+k*5];for(let j=1;j<14;j++){const t=j/14;B.add(G.sph,"bulb",a[0]+(b[0]-a[0])*t,3.6-Math.sin(t*Math.PI)*.6,a[1]+(b[1]-a[1])*t,.07,.07,.07)}}
  for(let k=0;k<6;k++)B.add(G.cyl,"wood2",[-10,10][k%2],1.8,-6+((k/2)|0)*6,.1,3.6,.1);
  for(let k=0;k<8;k++){const lx=-9+k*2.6;B.add(G.cyl,"glass",lx,.25,7.2,.3,.5,.3).add(G.sph,"flame",lx,.25,7.2,.12,.18,.12)}
  /* palms in planters */
  plant(B,-11,7,1.6);plant(B,11,7,1.6);plant(B,-11,-7.6,1.6);plant(B,11,-7.6,1.6);
  /* entrance path from the plaza */
  B.add(G.box,"wash",-1.6,.5,8.9,.4,1,.4).add(G.box,"wash",1.6,.5,8.9,.4,1,.4);
  caique(s,-8,-26,.4,0x2a6fb5,0xf2c94c,-2.12);caique(s,10,-30,-.3,0xf4f0e8,0xc94b3b,-2.12);
  const floorL=[0xff4f8b,0x4fc3ff,0xffc24a].map((c,i)=>{const l=new THREE.SpotLight(c,30,16,.45,.6,1.5);l.position.set(-5+i*5,5,0);l.target.position.set(0,0,-2);s.add(l,l.target);return l});
  r.spot=[0,-1.4,1.8,0,-6.6];r.spotL=[0,.4,-1.2];r.spotFn=()=>{coupleDance();complete("dance");mood("party",25);toast(tx().danceHint,3500)};
  r.items=[{label:()=>"DJ · "+tx().clubTracks,at:[0,3.6,-6.6],go:[0,-5.2],fn:()=>CARDS.club()},{label:()=>"Bar",at:[7.2,2.4,5],go:[5.6,4.4],fn:()=>{[P,N].forEach(e=>{e.lock=3;play(e,"laugh",.3)});CARDS.drinks()}}];
  /* the crowd: guests from both sides dancing on the deck */
  const dances=["dance","dance2","dance3","dance4"];
  [[-4,-3.5],[-2.6,-4.8],[-1.2,-3],[2,-4.4],[3.4,-3],[4.6,-4.6],[-4.6,-.8],[4.4,-.4],[-3,1.4],[3,1.8],[-.8,-5],[1.4,-2],[5.6,2.4],[-5.6,2.6]].slice(0,mobile?8:14).forEach(([gx,gz],i)=>
    guest(s,i,gx,gz,Math.atan2(-gx,-3-gz)+(rnd()-.5),dances[i%4]).then(e=>{if(!e)return;if(!e.act[e.act0])play(e,"dance");r.round.push({x:gx,z:gz,r:.45});r.grid=makeGrid(r.bounds,r.solid,r.round,.4)}));
  guest(s,3,7.9,4,-Math.PI/2,"talk");guest(s,1,8.8,-4,-Math.PI/2,"sit",{y:.5});guest(s,0,-8.8,0,Math.PI/2,"sit",{y:.5});
  let tt=0;r.anim=dt=>{tt+=dt;floorL.forEach((l,i)=>l.target.position.set(Math.sin(tt*.7+i*2)*4,0,-2+Math.cos(tt*.5+i)*2.5))};
  return r}


/* ---------- the secret windmill: a code only the groom knows, Innerbloom while you wait ---------- */
const fnv=t=>{let h=0x811c9dc5;for(const c of new TextEncoder().encode(t)){h^=c;h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")};
function secretCard(){const x=tx(),wa=`https://wa.me/${CONTENT.secret.whatsapp}?text=${encodeURIComponent(x.waText)}`;
  openCard("· · ·",x.secretH,`<p>${x.secretP}</p><form id="sf" autocomplete="off"><label class="f"><span>${x.codeLbl}</span><input id="sc" inputmode="numeric" pattern="[0-9]*" maxlength="4" style="font-size:28px;letter-spacing:.5em;text-align:center"></label>
    <div class="acts"><button class="btn" type="submit">${x.enter}</button><a class="btn ghost" href="${wa}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2 2 .8-.4 1.6c-3.5.3-7.6-3.8-7.3-7.3l1.6-.4.8 2z"/></svg>${x.waBtn}</a></div><p class="ok" id="sErr" hidden>${x.wrong}</p></form>`,()=>{
    const i=$("#sc");setTimeout(()=>i.focus({preventScroll:true}),200);
    $("#sf").addEventListener("submit",e=>{e.preventDefault();if(fnv(i.value.trim())===CONTENT.secret.hash){state.secret=1;save();closeCard();enterRoom("den",true)}else{$("#sErr").hidden=false;i.value="";if(navigator.vibrate)navigator.vibrate([40,60,40])}})});cardFn=secretCard}

/* the den: cosy sofas, a big screen with a game on, the best friends, a smoky corner */
function buildDen(){const r=roomBase("den",{floor:plankTex("#8a5f42","#7d553a"),wall:0x3a3550,trim:0x1a1824,hemi:.75,keyI:.6,bg:0x0c0b12});const B=r.B;
  [[-2,1.5,0],[3,1.5,-2],[-5,1.5,3]].forEach(([lx,ly,lz])=>{const l=new THREE.PointLight(0xffb870,9,9,1.6);l.position.set(lx,ly+1.4,lz);r.scene.add(l)});
  /* LED strips along the walls */
  for(const [x0,z0,w,d] of [[0,-6.42,16,.04],[-7.95,0,.04,13],[7.95,0,.04,13]])B.add(G.box,"bulb",x0,4.3,z0,w,.06,d);
  M.led=mat({color:0x7b5cff,emissive:0x6a4cff,emissiveIntensity:2});B.add(G.box,"led",0,.08,-6.4,16,.05,.05);
  /* the screen: an animated canvas with a match on */
  const tvc=document.createElement("canvas");tvc.width=512;tvc.height=288;const tg=tvc.getContext("2d"),tvt=new THREE.CanvasTexture(tvc);tvt.colorSpace=THREE.SRGBColorSpace;
  /* a huge screen so the kills read from the sofa */const tv=new THREE.Mesh(new THREE.PlaneGeometry(7.2,4.05),new THREE.MeshBasicMaterial({map:tvt}));tv.position.set(0,2.55,-6.33);r.scene.add(tv);B.add(G.box,"black",0,2.55,-6.42,7.45,4.3,.08).add(G.box,"black",0,.45,-5.9,3.6,.6,.7);
  B.add(new RoundedBoxGeometry(.5,.12,.4,2,.04),"white",-.6,.82,-5.9).add(new RoundedBoxGeometry(.12,.5,.4,2,.04),"white",.9,1,-5.9);
  const glow=new THREE.PointLight(0x5a8cff,10,9,1.6);glow.position.set(0,2.2,-5.2);r.scene.add(glow);
  /* the TV: the Fortnite kills leaderboard over the victory screenshot, filling the whole screen */
  tvc.width=1600;tvc.height=900;tvt.anisotropy=8;const tvBg=new Image();tvBg.src="assets/tv-bg.jpg";tvBg.onload=()=>drawTV();
  let tt=0;const drawTV=()=>{const W=1024,H=576;tg.setTransform(1600/1024,0,0,1600/1024,0,0);
    if(tvBg.complete&&tvBg.naturalWidth){const a=tvBg.naturalWidth/tvBg.naturalHeight,w=a>W/H?H*a:W,h=a>W/H?H:W/a;tg.drawImage(tvBg,(W-w)/2,(H-h)/2,w,h)}
    else{const g0=tg.createLinearGradient(0,0,W,H);g0.addColorStop(0,"#1b2a6b");g0.addColorStop(1,"#5a1f6e");tg.fillStyle=g0;tg.fillRect(0,0,W,H)}
    const sh=tg.createLinearGradient(0,0,W,0);sh.addColorStop(0,"rgba(10,8,24,.15)");sh.addColorStop(.45,"rgba(10,8,24,.55)");sh.addColorStop(1,"rgba(10,8,24,.8)");tg.fillStyle=sh;tg.fillRect(0,0,W,H);
    /* slanted orange banner */
    tg.save();tg.translate(W*.56,86);tg.rotate(-.06);const bg2=tg.createLinearGradient(-300,0,300,0);bg2.addColorStop(0,"#ff7a2e");bg2.addColorStop(1,"#ffb347");tg.fillStyle=bg2;
    tg.beginPath();tg.moveTo(-330,-46);tg.lineTo(330,-58);tg.lineTo(300,46);tg.lineTo(-300,58);tg.closePath();tg.fill();tg.fillStyle="#fff";tg.textAlign="center";tg.font="italic 900 54px Commissioner, sans-serif";tg.fillText(tx().boardH.toUpperCase(),0,18);tg.restore();
    CONTENT.board.forEach(([n,k],i)=>{const y=190+i*92,x0=W*.27,pulse=i===0?.5+.5*Math.sin(tt*3):0;tg.fillStyle=`rgba(255,255,255,${.12+pulse*.1})`;tg.beginPath();tg.roundRect(x0,y-50,W*.66,76,14);tg.fill();
      tg.fillStyle=["#ffcc33","#d9dde6","#e0904f","#8a86a0"][i];tg.beginPath();tg.arc(x0+50,y-12,30,0,7);tg.fill();tg.fillStyle="#14121c";tg.textAlign="center";tg.font="900 34px Commissioner, sans-serif";tg.fillText("#"+(i+1),x0+50,y);
      tg.textAlign="left";tg.fillStyle="#fff";tg.font="800 40px Commissioner, sans-serif";tg.fillText(n,x0+100,y);tg.textAlign="right";tg.fillStyle="#ffcc33";tg.font="900 44px Commissioner, sans-serif";tg.fillText(k+" kills",x0+W*.66-24,y);tg.textAlign="left"});
    tvt.needsUpdate=true};
  /* L sofa, bean bags, coffee table with pizza and cans, posters, a rug */
  rug(r,0,-1.5,7,4.6,"#3a2f4a","#c9a24a");
  const sofa=(x,z,w,ry)=>{B.at(x,z,ry).add(new RoundedBoxGeometry(w,.45,1.1,3,.15),"linen",0,.32,0).add(new RoundedBoxGeometry(w,.8,.3,3,.14),"linen",0,.7,-.45);for(let k=0;k<Math.round(w/1.1);k++)B.add(new RoundedBoxGeometry(.9,.18,.85,3,.08),"cushion",-w/2+.55+k*1.1,.6,.05);B.at(0,0,0)};
  sofa(-.5,.9,5.2,Math.PI);sofa(-3.6,-1.5,3.6,Math.PI/2);r.solid.push({x0:-3.2,z0:.3,x1:2.2,z1:1.5},{x0:-4.2,z0:-3.4,x1:-3,z1:.4});
  B.add(new RoundedBoxGeometry(2.2,.4,1,3,.12),"darkwood",-.6,.25,-1.6).add(G.box,"terra",-1,.47,-1.6,.6,.05,.6).add(G.cyl,"red",-.2,.55,-1.5,.07,.14,.07).add(G.cyl,"blue2",0,.55,-1.75,.07,.14,.07).add(G.cyl,"red",.2,.55,-1.4,.07,.14,.07);r.solid.push({x0:-1.8,z0:-2.2,x1:.6,z1:-1});
  for(const [bx,bz,c] of [[2.6,-2.6,"red"],[3.6,-1.4,"blue2"]]){B.add(G.sph,c,bx,.35,bz,1.1,.7,1.1);r.round.push({x:bx,z:bz,r:.6})}
  ["#e84a5f","#2a9df4","#ffcc33"].forEach((c,i)=>{const po=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2),mat({map:canvasTex(256,360,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,c);gr.addColorStop(1,"#14121c");g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle="#fff";g.font="800 44px Commissioner, sans-serif";g.fillText(["LEVEL","PLAYER","GAME"][i],20,70);g.font="800 90px Commissioner, sans-serif";g.fillText(["99","2","ON"][i],20,200)}),emissive:0x111111}));po.position.set(-7.93,2.6,-3.6+i*2.4);po.rotation.y=Math.PI/2;r.scene.add(po)});
  plant(B,6.8,4.6,1.2);plant(B,-6.8,4.6,1.2);
  /* the corner with the smokers: a lazy haze */
  const smoke=[];for(let k=0;k<26;k++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTex,color:0xbfbcc8,transparent:true,opacity:.0,depthWrite:false}));m.material.map=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,"rgba(255,255,255,.6)");gr.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=gr;g.fillRect(0,0,64,64)});m.scale.setScalar(1.2);r.scene.add(m);smoke.push({m,t:k/26*4})}
  r.spot=[-.4,-.2,1.4,-.5,.9];
  r.spotFn=()=>{const x=tx();[P,N].forEach((e,i)=>{e.lock=60;e.pos.set(-1.2+i*1.1,0,.75);e.yaw=Math.PI;play(e,"sittalk",.3)});mood("fun",20);toast(x.denP,5000)};
  /* friends: two on the sofa playing, two chatting on the side sofa, two smoking in the corner */
  [[.6,.75,Math.PI,"game"],[1.6,.75,Math.PI,"game"],[-3.75,-.6,Math.PI/2,"sitlaugh"],[-3.75,-2.4,Math.PI/2,"sittalk"],[5.8,-5,-2.3,"smoke"],[6.4,-4.2,-2.6,"talk"]].forEach(([gx,gz,gy,a],i)=>
    guest(r.scene,[3,4,1,0,4,3][i],gx,gz,gy,a,{y:a.startsWith("s")&&a!=="smoke"?.05:0}).then(e=>{if(e&&!e.act[a])play(e,a.startsWith("sit")?"sit":"idle")}));
  r.round.push({x:5.8,z:-5,r:.5},{x:6.4,z:-4.2,r:.5});
  /* a high table for the smokers, with an ashtray and two glasses */
  B.add(G.cyl,"darkwood",6.7,1.05,-5.4,.42,.06,.42).add(G.cyl,"black",6.7,.52,-5.4,.05,1.04,.05).add(G.cyl,"black",6.7,.03,-5.4,.3,.05,.3).add(G.cyl,"glass",6.62,1.12,-5.3,.13,.05,.13).add(G.cyl,"glass",6.8,1.18,-5.55,.05,.18,.05).add(G.cyl,"glass",6.55,1.18,-5.6,.05,.18,.05);r.round.push({x:6.7,z:-5.4,r:.45});
  /* a tablet on the coffee table */
  B.add(new RoundedBoxGeometry(.5,.03,.36,2,.012),"black",-1.25,.47,-1.8);const tab=new THREE.Mesh(new THREE.PlaneGeometry(.44,.3),new THREE.MeshBasicMaterial({color:0x9ad0ff}));tab.rotation.x=-Math.PI/2;tab.position.set(-1.25,.49,-1.8);r.scene.add(tab);
  r.items=[{label:()=>"🎵 "+tx().clubTracks,at:[5.2,1.3,4.9],go:[4.6,3.6],fn:()=>CARDS.club(true)},{label:()=>"🎮 "+tx().tvL,at:[0,4.75,-6.3],go:[0,-3.6],fn:()=>CARDS.yt(CONTENT.tvVideo,"Fortnite")},{label:()=>"▶ "+tx().tabletL,at:[-1.25,1.1,-1.8],go:[-1.25,-2.9],fn:()=>CONTENT.proposal?CARDS.proposal():CARDS.yt(CONTENT.tabletVideo,tx().tabletH)}];
  let tvT=0;r.anim=dt=>{tt+=dt;if((tvT-=dt)<0){tvT=.25;drawTV()}glow.intensity=8+Math.sin(tt*5)*2;smoke.forEach(p=>{p.t+=dt;const a=(p.t%4)/4;p.m.position.set(6+Math.sin(p.t)*.4,1.7+a*2.4,-4.6+Math.cos(p.t*.7)*.4);p.m.material.opacity=.35*(1-a);p.m.scale.setScalar(.6+a*1.6)})};
  return r}

/* ---------- Sims touches: mood bars, the heart gem, the pie menu, the selfie ---------- */
const moods=Object.assign({fun:20,love:30,party:5},state.moods||{});
function renderMoods(){return;const x=tx();moodEl.innerHTML=["fun","love","party"].map(k=>`<div><span>${x.moods[k]}</span><i><b style="width:${Math.round(moods[k])}%"></b></i></div>`).join("")}
function mood(k,v){moods[k]=THREE.MathUtils.clamp((moods[k]||0)+v,0,100);state.moods=moods;save();renderMoods()}
renderMoods();
const gem=(()=>{const sh=new THREE.Shape();sh.moveTo(0,-.12);sh.bezierCurveTo(-.2,.02,-.12,.16,0,.07);sh.bezierCurveTo(.12,.16,.2,.02,0,-.12);
  const g=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2}),new THREE.MeshStandardMaterial({color:0xf2c14e,emissive:0xb8860b,emissiveIntensity:.6,metalness:.8,roughness:.25}));g.geometry.center();return g})();
const pie=document.createElement("div");pie.id="pie";pie.hidden=true;$("#hud").appendChild(pie);
function openPie(px,py,items,set="pie"){const x=tx();pie.innerHTML=items.map((it,i)=>{const a=-Math.PI/2+i/items.length*Math.PI*2,R=items.length>3?78:items.length>1?64:0;return`<button type="button" style="transform:translate(${Math.cos(a)*R}px,${Math.sin(a)*R-(R?0:44)}px)" data-i="${i}">${x[set][it.k]}</button>`}).join("")+`<i></i>`;
  pie.style.left=THREE.MathUtils.clamp(px,110,innerWidth-110)+"px";pie.style.top=THREE.MathUtils.clamp(py,150,innerHeight-110)+"px";pie.hidden=false;
  pie.querySelectorAll("button").forEach(b=>b.addEventListener("click",ev=>{ev.stopPropagation();pie.hidden=true;items[+b.dataset.i].fn()}))}
addEventListener("pointerdown",e=>{if(!pie.hidden&&!pie.contains(e.target))pie.hidden=true},true);
function faceOff(d=.55){/* partner steps in front of you, both turn in */const f=new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw));N.pos.copy(P.pos).addScaledVector(f,d);N.yaw=P.yaw+Math.PI}
function coupleAct(pa,na,secs,m){goal=null;endChat();faceOff(pa.startsWith("kiss")?.42:.9);[P,N].forEach((e,i)=>{e.lock=secs;play(e,i?na:pa,.3)});if(m)mood(m,10);
  for(let k=0;k<Math.round(secs*1.5);k++)setTimeout(()=>heart(room?room.scene:world,P.pos.clone().lerp(N.pos,.5).setY(2.05)),k*650)}
function partnerMenu(px,py){openPie(px,py,[{k:"kiss",fn:()=>coupleAct("kiss","kiss",3.2,"love")},{k:"kisslong",fn:()=>coupleAct("kisslong","kisslong",6,"love")},{k:"dance",fn:()=>{coupleAct("dance2","dance2",8,"party")}},{k:"chat",fn:()=>{idleT=3}},{k:"selfie",fn:selfie}])}
const shoutEl=document.createElement("div");shoutEl.className="say";shoutEl.hidden=true;$("#labels").appendChild(shoutEl);let shoutT=0;
function seaMenu(r,px,py){const face=()=>{P.yaw=Math.atan2(r.g.position.x-P.pos.x,r.g.position.z-P.pos.z)};
  openPie(px,py,[{k:"wave",fn:()=>{face();P.lock=1.8;play(P,"wave",.2);mood("fun",3)}},{k:"shout",fn:()=>{face();P.lock=1.8;play(P,"wave",.2);mood("fun",5)}}])}
function npcMenu(e,px,py){openPie(px,py,[{k:"wave",fn:()=>{P.lock=1.6;P.yaw=Math.atan2(e.pos.x-P.pos.x,e.pos.z-P.pos.z);play(P,"wave",.2);play(e,"laugh",.3);mood("fun",4)}},
  {k:"chat",fn:()=>{const t=e.pos.clone().addScaledVector(new THREE.Vector3(P.pos.x-e.pos.x,0,P.pos.z-e.pos.z).normalize(),1.1);walkTo(t.x,t.z,()=>{P.yaw=Math.atan2(e.pos.x-P.pos.x,e.pos.z-P.pos.z);e.yaw=P.yaw+Math.PI;play(e,"talk",.3);P.lock=8;play(P,"talk",.3);thinkWith(e,8);mood("fun",6)})}},
  {k:"dance",fn:()=>{play(e,"dance",.3);coupleAct("dance","dance",6,"party")}}])}
const FEMALE=new Set(["kate","megan","sophie"]);
const TI={ski:'<path d="M3 20l18-6M5 21l17-5"/><circle cx="15" cy="5" r="1.8"/><path d="M14 7l-3 5 4 2-2 4M11 12l-4-1"/>',
  kite:'<path d="M14 3c4 1 7 4 7 8-3-2-7-3-10-2 0-2 1-4 3-6z"/><path d="M11 9L5 19M5 19h4M21 11L5 19"/>',
  car:'<path d="M3 15v-3l2-4h11l4 4h1v3z"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/><path d="M8 8l-1 4h10"/>',
  moto:'<circle cx="5.5" cy="16" r="3"/><circle cx="18.5" cy="16" r="3"/><path d="M5.5 16l4-6h5l4 6M12 10l-2-3h-2M14 10l2-3h3"/>',
  nails:'<rect x="9" y="10" width="6" height="10" rx="1.5"/><path d="M10 10V6h4v4M11 6V3h2v3"/>',
  hair:'<path d="M5 12a7 7 0 0 1 14 0v7"/><path d="M5 12v7M9 9c1 2 4 3 7 2"/>',
  dress:'<path d="M9 3h6l-1 4 4 13H6l4-13z"/>',
  plane:'<path d="M3 13l18-7-7 16-2.5-6.5z"/>',
  matcha:'<path d="M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2M9 6c0-2 2-2 2-4M13 6c0-2 2-2 2-4"/>',
  shoe:'<path d="M3 17c4 0 6-6 8-9l3 1c-1 3 0 5 3 6l4 1v2H3z"/><path d="M14 9l1 9"/>'};
const icon=k=>`<svg viewBox="0 0 24 24">${TI[k]}</svg>`;
const TOPICS={groom:["ski","kite","car","moto"],bride:["nails","hair","dress","plane","matcha","shoe"]};
const thinkEls=[document.createElement("div"),document.createElement("div")];thinkEls.forEach(b=>{b.className="bub";b.hidden=true;$("#labels").appendChild(b)});let think=null;
function thinkWith(e,secs){const same=(P.kind==="bride")===FEMALE.has(e.name),list=same?TOPICS[P.kind]:["plane","car","dress"];think={e,t:secs,list,k:0,next:0}}
function updThink(dt){if(!think){thinkEls.forEach(b=>b.hidden=true);return}think.t-=dt;think.next-=dt;if(think.t<0||room&&think.e.scene!==room.scene){think=null;return}
  if(think.next<0){think.next=1.8;think.k++;thinkEls[0].innerHTML=icon(think.list[think.k%think.list.length]);thinkEls[1].innerHTML=icon(think.list[(think.k+1+((Math.random()*2)|0))%think.list.length]);thinkEls.forEach(b=>b.hidden=false)}
  const v=new THREE.Vector3();[[P,0],[think.e,1]].forEach(([w,i])=>{v.copy(w.pos).setY(2.45).project(camera);thinkEls[i].style.transform=`translate(${(v.x*.5+.5)*innerWidth|0}px,${(-v.y*.5+.5)*innerHeight|0}px) translate(-50%,-100%)`})}
function benchMenu(b,px,py){openPie(px,py,[{k:"sit",fn:()=>{const f=new THREE.Vector3(Math.sin(b.ry),0,Math.cos(b.ry));walkTo(b.x+f.x*1.2,b.z+f.z*1.2,()=>{[P,N].forEach((e,i)=>{e.lock=60;e.pos.set(b.x+f.x*.12+Math.cos(b.ry)*(i?.5:-.5),.06,b.z+f.z*.12-Math.sin(b.ry)*(i?.5:-.5));e.yaw=b.ry;play(e,"sittalk",.3)});mood("love",6)})}}])}
/* tap on someone: screen-space pick against heads, so a big finger still hits */
function pickAt(px,py){const cand=[];const v=new THREE.Vector3();const test=(e,kind)=>{if(!e)return;v.copy(e.pos).setY(1.1).project(camera);if(v.z>1)return;const sx=(v.x*.5+.5)*innerWidth,sy=(-v.y*.5+.5)*innerHeight,d=Math.hypot(sx-px,sy-py);if(d<60)cand.push({d,e,kind})};
  test(N,"partner");{v.copy(dog.pos).setY(.35).project(camera);const dd=Math.hypot((v.x*.5+.5)*innerWidth-px,(-v.y*.5+.5)*innerHeight-py);if(v.z<1&&dd<55)cand.push({d:dd*.8,kind:"dog"})}
  if(!room){v.copy(vespaObj.position).setY(.8).project(camera);const dv=Math.hypot((v.x*.5+.5)*innerWidth-px,(-v.y*.5+.5)*innerHeight-py);if(v.z<1&&dv<60)cand.push({d:dv,kind:"vespa"})}npcs.forEach(e=>{if(e.scene===(room?room.scene:world))test(e,"npc")});if(!room)BENCH.forEach(b=>{v.set(b.x,.5,b.z).project(camera);const d=Math.hypot((v.x*.5+.5)*innerWidth-px,(-v.y*.5+.5)*innerHeight-py);if(d<50&&v.z<1)cand.push({d,b,kind:"bench"})});
  if(!room)riders.forEach(r=>{v.copy(r.g.position).setY(1).project(camera);const dd=Math.hypot((v.x*.5+.5)*innerWidth-px,(-v.y*.5+.5)*innerHeight-py);if(v.z<1&&dd<70)cand.push({d:dd,kind:"sea",r})});
  if(room)(room.items||[]).forEach(it=>{if(!it.go)return;v.set(it.go[0],0,it.go[1]).project(camera);const d=Math.hypot((v.x*.5+.5)*innerWidth-px,(-v.y*.5+.5)*innerHeight-py);if(v.z<1&&d<48)cand.push({d,kind:"item",it})});
  cand.sort((a,b)=>a.d-b.d);return cand[0]||null}
/* selfie: the couple poses, the frame gets the names and the date, guests save or share it */
function selfie(){const x=tx(),n=CONTENT.names[lang];goal=null;endChat();faceOff(.9);N.pos.copy(P.pos).addScaledVector(new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw)),.8);N.yaw=P.yaw;
  [P,N].forEach(e=>{e.lock=60;play(e,"idle",.25)});P.yaw=N.yaw=P.yaw;dog.trick="pose";dog.t=0;dog.pos.copy(P.pos).lerp(N.pos,.5).addScaledVector(new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),.7);dog.yaw=P.yaw;selfieCam=1.8;mood("fun",6);
  setTimeout(()=>{renderer.render(room?room.scene:world,camera);const src=renderer.domElement,c=document.createElement("canvas"),W=1080,H=Math.round(1080*src.height/src.width);c.width=W;c.height=H+170;const g=c.getContext("2d");
    g.fillStyle="#fbfaf7";g.fillRect(0,0,c.width,c.height);g.drawImage(src,0,0,W,H);g.fillStyle="#14273a";g.textAlign="center";g.font="300 64px Piazzolla, Georgia, serif";g.fillText(`${n[0]} & ${n[1]}`,W/2,H+82);
    g.font="600 30px Commissioner, sans-serif";g.fillStyle="#b81d5b";g.fillText("20 · 08 · 2027 · "+x.koropi,W/2,H+130);const url=c.toDataURL("image/jpeg",.9);
    openCard("Selfie",x.selfieH,`<div style="position:relative"><img class="photo" id="sImg" style="aspect-ratio:auto" src="${url}" alt="${esc(n[0]+" & "+n[1])}"><video id="sVid" playsinline muted autoplay hidden style="position:absolute;right:10px;bottom:22px;width:34%;aspect-ratio:1;object-fit:cover;border-radius:50%;border:4px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,.3);transform:scaleX(-1)"></video></div>
      <div class="acts"><button class="btn" type="button" id="cam">${x.camOn}</button><a class="btn ghost" id="sSave" href="${url}" download="selfie-EK.jpg">${x.save}</a>${navigator.share?`<button class="btn ghost" type="button" id="shr">${x.share}</button>`:""}</div><p class="demo" id="camErr" hidden>${x.camNo}</p>`,()=>{
      let cur=url,stream=null;const setUrl=u=>{cur=u;$("#sImg").src=u;$("#sSave").href=u};
      const stop=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null};$("#cardX").addEventListener("click",stop,{once:true});
      $("#cam").addEventListener("click",async()=>{const b=$("#cam"),v=$("#sVid");
        if(!stream){try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:720,height:720},audio:false});v.srcObject=stream;v.hidden=false;b.textContent=x.camShot}catch(e){$("#camErr").hidden=false}return}
        /* snap: the guest's face in a round frame on the couple's photo */
        const im=new Image();im.onload=()=>{const c2=document.createElement("canvas");c2.width=im.width;c2.height=im.height;const g2=c2.getContext("2d");g2.drawImage(im,0,0);
          const R=im.width*.17,cx=im.width-R-40,cy=im.height-170-R-30;g2.save();g2.beginPath();g2.arc(cx,cy,R,0,7);g2.clip();const vw=v.videoWidth,vh=v.videoHeight,sz=Math.min(vw,vh);
          g2.translate(cx+R,cy-R);g2.scale(-1,1);g2.drawImage(v,(vw-sz)/2,(vh-sz)/2,sz,sz,0,0,R*2,R*2);g2.restore();g2.lineWidth=12;g2.strokeStyle="#fff";g2.beginPath();g2.arc(cx,cy,R,0,7);g2.stroke();
          setUrl(c2.toDataURL("image/jpeg",.9));stop();v.hidden=true;b.hidden=true};im.src=url});
      const sh=$("#shr");if(sh)sh.addEventListener("click",()=>fetch(cur).then(r=>r.blob()).then(bl=>navigator.share({files:[new File([bl],"selfie-EK.jpg",{type:"image/jpeg"})],title:`${n[0]} & ${n[1]}`})).catch(()=>{}))})},reduce?300:1300)}
let selfieCam=0,startOnVespa=false;

/* ---------- entering and leaving ---------- */
function fade(cb){const f=$("#fade");f.classList.add("on");setTimeout(()=>{cb();setTimeout(()=>f.classList.remove("on"),80)},reduce?20:360)}
function enterRoom(id){if(room||mode!=="play")return;resetJoy();atSecret=false;setTimeout(renderLabels,450);mode="busy";goal=null;endChat();fade(()=>{room=buildRoom(id);room.shown=0;room.age=0;roomYaw=0;roomZoom=roomZoomT=ROOM_FAR;roomFocusT=0;syncSnd();[P,N].forEach(e=>{world.remove(e.m);room.scene.add(e.m)});
  P.pos.set(-.6,0,5.4);N.pos.set(.6,0,5.8);P.yaw=N.yaw=Math.PI;snapCam();mode="play";renderObj();renderLabels();soundscape();if(id==="chapel"){bell();startIsaiah()}if(id==="den")setTimeout(()=>CARDS.den(),500);mood("fun",6);
  /* walk in toward the thing to do; the guest can take over at any time */
  setTimeout(()=>{if(room&&room.id===id&&!goal&&!room.shown&&!(QUEST_OF_ROOM(id)&&state.done[QUEST_OF_ROOM(id)]))walkTo(room.spot[0],room.spot[1])},reduce?50:700)})}
function exitRoom(then){if(!room)return;if(dancing()){toast(tx().isaiahWait,2500);return}resetJoy();const id=room.id;mode="busy";closeCard();endChat();chanting=false;delete zoneOn.chant;chant.pause();freeLocks();[P,N].forEach(e=>{e.lock=0;e.pos.y=0;play(e,"idle",.1)});fade(()=>{[P,N].forEach(e=>{room.scene.remove(e.m);world.add(e.m)});room=null;syncSnd();
  if(id!=="den"){const[a,b]=doorFront(id,2.4);P.pos.set(a,0,b);N.pos.copy(P.pos).addScaledVector(new THREE.Vector3(Math.cos(PLACES[id].face),0,-Math.sin(PLACES[id].face)),1.1)}
  if(id==="den"){P.pos.set(SECRET.door[0],0,SECRET.door[1]+2.4);N.pos.set(SECRET.door[0]+1.1,0,SECRET.door[1]+2.6);P.yaw=N.yaw=0;camYaw=0}else{P.yaw=N.yaw=PLACES[id].face;camYaw=PLACES[id].face}
  atSecret=false;snapCam();mode="play";renderObj();renderLabels();soundscape();then&&then()})}
function askName(){const x=tx();openCard("· · ·",x.nameH,`<p>${x.nameP}</p><form id="gnf" autocomplete="on"><label class="f"><span>${x.voteName}</span><input id="gn" autocomplete="name" required maxlength="60" style="font-size:17px"></label><div class="acts"><button class="btn" type="submit">${x.nameBtn}</button></div></form>`,
  ()=>$("#gnf").addEventListener("submit",e=>{e.preventDefault();const n=$("#gn").value.trim().replace(/\s+/g," ");if(n.split(" ").length<2&&n.length<5)return;state.guest=n;save();closeCard();
    /* already voted from another phone? lock the vote to what was saved */
    if(SHEET)fetch(SHEET+"?name="+encodeURIComponent(n)).then(r=>r.json()).then(d=>{voteCount=d.total||voteCount;if(d.voted){state.ans=state.ans||{};state.ans.honey=d.voted;state.ans.honeyName=n;save()}}).catch(()=>{})}))}
function homeNow(){pie.hidden=true;if(dancing()){toast(tx().isaiahWait,2500);return}if(mode==="drive"){getOff(homeNow);return}if(room){exitRoom(homeNow);return}if(mode!=="play")return;
  fade(()=>{goal=null;freeLocks();P.pos.set(-.6,0,7.6);N.pos.set(.6,0,7.6);P.yaw=N.yaw=Math.PI;camYaw=0;dog.pos.set(-1.6,0,8.2);snapCam()})}
$("#bHome").addEventListener("click",homeNow);
function goPlaza(){if(room){exitRoom(goPlaza);return}walkTo(0,6.5)}

/* moments */
/* "Isaiah, dance": on entering the chapel the priest leads the couple around in a circle while the hymn plays */
function chapelKoum(r){if(r.koum)return;r.koum=[];[["kp",-1.7,-.6,.9],["ka",1.7,-.6,-.9]].forEach(([k,x,z,y])=>koumbaros(r.scene,k,x,z,y).then(e=>{if(e){r.koum.push(e);if(r.dance)play(e,"walk",.2)}}))}
function startIsaiah(){const r=room;if(!r||r.id!=="chapel")return;chapelKoum(r);if(!priest){r.wantDance=1;r.shown=1;return}r.wantDance=0;r.dance={t:0};r.shown=1;goal=null;
  chant.currentTime=0;chanting=true;zoneOn.chant=true;syncSnd();say(tx().isaiah,7000);[P,N,...(r.koum||[])].forEach(e=>{e.lock=999;play(e,"walk",.2)});play(priest,"walk",.2)}
function updIsaiah(dt){const r=room,d=r&&r.dance;if(!d)return;d.t+=dt;const LAPS=2,SP=.75,a=Math.min(d.t*SP,LAPS*Math.PI*2),C=[0,-1.9],R=1.25;
  [[priest,a+1.1],[P,a],[N,a-.75],...(r.koum||[]).map((e,i)=>[e,a-1.6-i*.8])].forEach(([e,th])=>{if(!e)return;e.pos.set(C[0]+Math.sin(th)*R,0,C[1]+Math.cos(th)*R);e.yaw=Math.atan2(Math.cos(th),-Math.sin(th));e.m.position.copy(e.pos);e.m.rotation.y=e.yaw});
  if(a>=LAPS*Math.PI*2){r.dance=null;priest.pos.set(0,0,-3.9);priest.m.position.copy(priest.pos);priest.m.rotation.y=0;play(priest,"idle",.4);[P,N].forEach(e=>{e.lock=0;play(e,"idle",.3)});(r.koum||[]).forEach(e=>{e.lock=0;e.pos.set(e.home.x,0,e.home.z);e.yaw=e.home.yaw;play(e,"idle",.3)});r.shown=0;
    if(!state.done.bless)walkTo(r.spot[0],r.spot[1])}}
function blessing(){const x=tx();if(priest){play(priest,"bless",.3);priest.lock=6}[P,N].forEach(e=>{e.yaw=Math.atan2(0-e.pos.x,-3.9-e.pos.z)});
  chant.currentTime=0;chanting=true;zoneOn.chant=true;syncSnd();mood("love",15);
  say(x.priestSays,6000)}
const sayEl=document.createElement("div");sayEl.className="say";sayEl.hidden=true;$("#labels").appendChild(sayEl);let sayT=0;
function say(t,ms){sayEl.textContent=t;sayEl.hidden=false;clearTimeout(sayT);sayT=setTimeout(()=>sayEl.hidden=true,ms)}
function coupleDance(){[P,N].forEach(e=>{e.lock=9;play(e,["dance","dance2","dance3"][(Math.random()*3)|0],.3)});N.yaw=Math.atan2(P.pos.x-N.pos.x,P.pos.z-N.pos.z);P.yaw=N.yaw+Math.PI;
  for(let k=0;k<12;k++)setTimeout(()=>room&&heart(room.scene,P.pos.clone().lerp(N.pos,.5).setY(2)),k*600)}

/* ---------- Vespa ride ---------- */
let ride=null;
function startRide(id){if(mode!=="play")return;const go=()=>{const[a,b]=doorFront(id,2.6),dest=new THREE.Vector3(a,0,b);goal=null;endChat();mode="ride";document.body.classList.add("ride");
  const toCam=Math.atan2(camera.position.x-P.pos.x,camera.position.z-P.pos.z);[P,N].forEach(e=>{e.yaw=toCam;e.lock=1.8;play(e,"wave",.2)});toast(tx().wave,1800);
  setTimeout(()=>fade(()=>{const fwd=Math.atan2(dest.x-P.pos.x,dest.z-P.pos.z);vespaObj.position.set(P.pos.x,0,P.pos.z);vespaObj.rotation.y=fwd;
    ride={pts:findPath(gridNow(),vespaObj.position,dest),i:0,dest,id,fwd};[P,N].forEach(e=>{e.lock=999;play(e,"ride",.1)})}),reduce?0:1700)};
  room?exitRoom(go):go()}
function updateRide(dt){const R=ride;if(!R){[P,N].forEach(e=>{e.m.position.copy(e.pos);e.m.rotation.y=e.yaw;e.mix.update(dt)});return}
  const tg=R.pts[R.i];_v.subVectors(tg,vespaObj.position);_v.y=0;const d=_v.length();
  if(d<.7){R.i++;if(R.i>=R.pts.length){endRide();return}}
  else{const sp=Math.min(7,1.5+d*1.2);_v.normalize();vespaObj.position.addScaledVector(_v,sp*dt);const yaw=Math.atan2(_v.x,_v.z),dy=angLerp(0,yaw-vespaObj.rotation.y,1);vespaObj.rotation.y=angLerp(vespaObj.rotation.y,yaw,1-Math.exp(-5*dt));vespaObj.rotation.z=-dy*.3}
  const y=vespaObj.rotation.y,f=new THREE.Vector3(Math.sin(y),0,Math.cos(y));camYaw=angLerp(camYaw,y+Math.PI,dt*2);driveOcc(dt);
  P.pos.copy(vespaObj.position).addScaledVector(f,-.05);N.pos.copy(vespaObj.position).addScaledVector(f,-.5);P.yaw=N.yaw=y;
  [P,N].forEach(e=>{e.m.position.copy(e.pos);e.m.position.y=.12;e.m.rotation.y=e.yaw;e.mix.update(dt)})}
function endRide(){const R=ride;fade(()=>{ride=null;document.body.classList.remove("ride");vespaObj.rotation.z=0;
  const side=new THREE.Vector3(Math.cos(R.fwd),0,-Math.sin(R.fwd));vespaObj.position.copy(R.dest).addScaledVector(side,2.2);
  P.pos.copy(R.dest);N.pos.copy(R.dest).addScaledVector(side,-1.1);[P,N].forEach(e=>{e.lock=0;e.m.position.y=0;play(e,"idle",.1)});mode="play";camYaw=PLACES[R.id].face;snapCam();
  vBack={pts:findPath(gridNow(),vespaObj.position,VESPA_HOME),i:0};walkTo(PLACES[R.id].door[0],PLACES[R.id].door[1])})}

/* ---------- riding the Vespa yourself ---------- */
const VESPA_HOME=new THREE.Vector3(5.5,0,14),offBtn=document.createElement("button");offBtn.className="chip";offBtn.id="bOff";offBtn.type="button";offBtn.hidden=true;$("#hud").appendChild(offBtn);
let vSpd=0,vGoal=null,vBack=null,gSpd=6;
function driveTo(id){const[a,b]=doorFront(id,2.6);vGoal={pts:findPath(gridNow(),vespaObj.position,new THREE.Vector3(a,0,b)),i:0,id}}
function arriveDrive(id){vSpd=0;getOff(()=>{if(!PLACES[id].final||agencyOpen())goPlace(id)})}
function mountVespa(){if(room){exitRoom(mountVespa);return}const go=()=>{resetJoy();goal=null;endChat();freeLocks();mode="drive";document.body.classList.add("ride");vBack=null;
    [P,N].forEach(e=>{e.lock=999;play(e,"ride",.1)});offBtn.textContent=tx().getOff;offBtn.hidden=false;toast(tx().driveHint,4500)};
  if(P.pos.distanceTo(vespaObj.position)>3){walkTo(vespaObj.position.x+1.2,vespaObj.position.z,()=>fade(go))}else fade(go)}
function getOff(then){if(mode!=="drive")return;resetJoy();goal=null;fade(()=>{resetJoy();mode="play";document.body.classList.remove("ride");offBtn.hidden=true;vGoal=null;vSpd=0;
  const y=vespaObj.rotation.y,side=new THREE.Vector3(Math.cos(y),0,-Math.sin(y));P.pos.copy(vespaObj.position).addScaledVector(side,1.1);N.pos.copy(vespaObj.position).addScaledVector(side,2.1);resolve(P.pos);resolve(N.pos);
  [P,N].forEach(e=>{e.lock=0;e.m.position.y=0;play(e,"idle",.1)});vespaObj.rotation.z=0;
  /* the scooter heads home by itself */
  vBack={pts:findPath(gridNow(),vespaObj.position,VESPA_HOME),i:0};if(typeof then==="function")setTimeout(then,60)})}
offBtn.addEventListener("click",getOff);
function updDrive(dt){let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,iy=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)+joy.y;let want=null;
  if(Math.hypot(ix,iy)>.15){vGoal=null;const f=camFwd(),r=new THREE.Vector3(-f.z,0,f.x);want=f.multiplyScalar(iy).addScaledVector(r,ix).normalize()}
  else if(vGoal){const last=vGoal.i>=vGoal.pts.length-1,tg=vGoal.pts[Math.min(vGoal.i,vGoal.pts.length-1)];_v.subVectors(tg,vespaObj.position);_v.y=0;const d=_v.length();
    if(d<(last?1.2:2)){vGoal.i++;if(vGoal.i>=vGoal.pts.length){const id=vGoal.id;vGoal=null;if(id)arriveDrive(id)}}else{want=_v.normalize().clone();
      const err=Math.abs(angLerp(0,Math.atan2(want.x,want.z)-vespaObj.rotation.y,1));gSpd=Math.min(7,Math.max(1.5,d*1.6))*Math.max(.25,Math.cos(Math.min(err,1.4)))}}
  const target=want?(vGoal?gSpd:8):0;vSpd+=(target-vSpd)*Math.min(1,dt*(want?2.2:4));
  if(want){const yaw=Math.atan2(want.x,want.z),dy=angLerp(0,yaw-vespaObj.rotation.y,1);vespaObj.rotation.y=angLerp(vespaObj.rotation.y,yaw,1-Math.exp(-(vGoal?7:4)*dt));vespaObj.rotation.z=-THREE.MathUtils.clamp(dy,-.6,.6)*.4}else vespaObj.rotation.z*=.9;
  const f=new THREE.Vector3(Math.sin(vespaObj.rotation.y),0,Math.cos(vespaObj.rotation.y));vespaObj.position.addScaledVector(f,vSpd*dt);resolve(vespaObj.position);
  P.pos.copy(vespaObj.position).addScaledVector(f,-.05);N.pos.copy(vespaObj.position).addScaledVector(f,-.5);
  [P,N].forEach(e=>{e.yaw=vespaObj.rotation.y;e.m.position.copy(e.pos);e.m.position.y=.12;e.m.rotation.y=e.yaw;e.mix.update(dt)});
  if(tAll-userCamT>1.5)camYaw=angLerp(camYaw,vespaObj.rotation.y+Math.PI,dt*(vSpd>1?2.4:1.2));driveOcc(dt)}
let dOccT=0;function driveOcc(dt){if((dOccT-=dt)>0)return;dOccT=.3;const o=vespaObj.position.clone().setY(1.2),d=9*(innerWidth<innerHeight?1.3:1),c=new THREE.Vector3(o.x+Math.sin(camYaw)*Math.cos(.42)*d,1.4+Math.sin(.42)*d,o.z+Math.cos(camYaw)*Math.cos(.42)*d),dir=c.sub(o),L=dir.length();_r.set(o,dir.normalize());_r.far=L;if(_r.intersectObjects(occluders,false).length)topView=1.2}
function updVespaHome(dt){if(!vBack||mode==="drive"||mode==="ride")return;const tg=vBack.pts[vBack.i];_v.subVectors(tg,vespaObj.position);_v.y=0;const d=_v.length();
  if(d<.6){vBack.i++;if(vBack.i>=vBack.pts.length){vBack=null;vespaObj.rotation.y=-Math.PI/2;return}}else{_v.normalize();vespaObj.position.addScaledVector(_v,Math.min(5,1+d)*dt);vespaObj.rotation.y=angLerp(vespaObj.rotation.y,Math.atan2(_v.x,_v.z),1-Math.exp(-5*dt))}}

/* ---------- input ---------- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),groundPl=new THREE.Plane(UP,0);let drag=null;
canvas.addEventListener("pointerdown",e=>{if(mode!=="play"&&mode!=="drive")return;drag={lx:e.clientX,ly:e.clientY,m:0,id:e.pointerId};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;camTarget=null;const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;drag.m+=Math.abs(dx)+Math.abs(dy);
  if(drag.m>8&&room){roomYaw=THREE.MathUtils.clamp(roomYaw-dx*.005,-1,1);return}
  if(drag.m>8){userCamT=tAll;camYaw-=dx*.005;camPitch=THREE.MathUtils.clamp(camPitch+dy*.003,.2,1.1)}});
canvas.addEventListener("pointerup",e=>{const d=drag;drag=null;if(!d||d.m>8)return;
  if(mode==="drive"){ndc.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(ndc,camera);const h=ray.ray.intersectPlane(groundPl,_v);if(h)vGoal={pts:findPath(gridNow(),vespaObj.position,h.clone()),i:0};return}
  if(mode!=="play")return;panel("#list",false);panel("#dest",false);
  const pk=pickAt(e.clientX,e.clientY);if(pk){if(pk.kind==="sea")seaMenu(pk.r,e.clientX,e.clientY);else if(pk.kind==="dog")dogMenu(e.clientX,e.clientY);else if(pk.kind==="vespa")openPie(e.clientX,e.clientY,[{k:"ride",fn:()=>mountVespa()}],"vpie");else if(pk.kind==="partner")partnerMenu(e.clientX,e.clientY);else if(pk.kind==="npc")(pk.e.koum?koumMenu:npcMenu)(pk.e,e.clientX,e.clientY);else if(pk.kind==="item"){const q=pk.it;walkTo(q.go[0],q.go[1],()=>{P.yaw=Math.atan2(q.at[0]-P.pos.x,q.at[2]-P.pos.z);q.fn()})}else benchMenu(pk.b,e.clientX,e.clientY);return}
  ndc.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(ndc,camera);const h=ray.ray.intersectPlane(groundPl,_v);if(h)walkTo(h.x,h.z)});
const pts=new Map();let pinch0=0,dist0=0;
canvas.addEventListener("pointerdown",e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);dist0=camDist;drag=null}});
canvas.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2&&pinch0){const[a,b]=[...pts.values()];camDist=THREE.MathUtils.clamp(dist0*pinch0/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1])),6,20)}});
const ptUp=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch0=0};canvas.addEventListener("pointerup",ptUp);canvas.addEventListener("pointercancel",ptUp);
["gesturestart","gesturechange"].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener("dblclick",e=>e.preventDefault(),{passive:false});
canvas.addEventListener("wheel",e=>{e.preventDefault();camDist=THREE.MathUtils.clamp(camDist*(e.deltaY>0?1.08:.93),6,20)},{passive:false});
{const j=$("#joy"),k=j.querySelector("i");let id=null,cx=0,cy=0;
  window.resetJoy=()=>{id=null;k.style.transform="";joy.x=joy.y=0;for(const q in keys)keys[q]=false};j.addEventListener("lostpointercapture",()=>resetJoy());
  j.addEventListener("pointerdown",e=>{id=e.pointerId;j.setPointerCapture(id);const r=j.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;mv(e)});
  const mv=e=>{let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy),R=40;if(l>R){dx*=R/l;dy*=R/l}k.style.transform=`translate(${dx}px,${dy}px)`;joy.x=dx/R;joy.y=-dy/R};
  j.addEventListener("pointermove",e=>{if(e.pointerId===id)mv(e)});const up=e=>{if(e.pointerId!==id)return;id=null;k.style.transform="";joy.x=joy.y=0};j.addEventListener("pointerup",up);j.addEventListener("pointercancel",up)}

/* ---------- floating labels: doors outside; the task spot and the exit inside ---------- */
function mkLabel(key,onClick){let el=labelEls[key];if(!el){el=labelEls[key]=document.createElement("button");el.type="button";el.className="lbl";el.addEventListener("click",onClick);$("#labels").appendChild(el)}return el}
function renderLabels(){const x=tx();ORDER.forEach(id=>{const el=mkLabel(id,()=>{if(PLACES[id].final&&!agencyOpen()){toast(x.lockedMsg);return}goPlace(id)});
  el.textContent=id==="club"?x.clubName:x.P[id];el.classList.toggle("done",!!state.done[questOf(id)]);el.classList.toggle("todo",!state.done[questOf(id)]);el.classList.toggle("lock",!!PLACES[id].final&&!agencyOpen())});
  mkLabel("_spot",()=>room&&walkTo(room.spot[0],room.spot[1])).textContent=room?x.spot[room.id]:"";
  const ex=mkLabel("_exit",()=>{if(!room)return;walkTo(room.exit[0],room.exit[1]-.2,()=>exitRoom())});ex.textContent=x.exitLbl;ex.classList.add("exit");
  for(let i=0;i<4;i++){const it=room&&room.items&&room.items[i],el=mkLabel("_it"+i,()=>{const q=room&&room.items&&room.items[i];if(q)walkTo(q.go[0],q.go[1],()=>{P.yaw=Math.atan2(q.at[0]-P.pos.x,q.at[2]-P.pos.z);q.fn()})});el.textContent=it?it.label():"";el.dataset.on=it?"1":""}}
const _p=new THREE.Vector3();
function place(el,v){_p.copy(v).project(camera);if(_p.z>1||Math.abs(_p.x)>1.15||_p.y<-1.1){el.style.display="none";return}el.style.display="flex";
  const w=(el.offsetWidth||90)/2+8,x=THREE.MathUtils.clamp((_p.x*.5+.5)*innerWidth,w,innerWidth-w),y=THREE.MathUtils.clamp((-_p.y*.5+.5)*innerHeight,Math.max(150,labelTop+(el.offsetHeight||36)+6),innerHeight-(touch?170:60));
  el._x=x;el._y=y;el._z=_p.z;el.style.transform=`translate(${x|0}px,${y|0}px) translate(-50%,-100%)`}
/* building labels must never sit on top of each other (far ones all clamp to the same top line on a phone): nearer wins, the rest step down */
function declutter(els){const vis=els.filter(e=>e&&e.style.display!=="none").sort((a,b)=>a._z-b._z),done=[];
  for(const e of vis){const w=e.offsetWidth,h=e.offsetHeight;let y=e._y;
    for(let k=0;k<6;k++){const hit=done.find(d=>Math.abs(d.x-e._x)<(d.w+w)/2+4&&Math.abs(d.y-y)<(d.h+h)/2+3);if(!hit)break;y=hit.y+(hit.h+h)/2+4}
    done.push({x:e._x,y,w,h});if(y!==e._y)e.style.transform=`translate(${e._x|0}px,${y|0}px) translate(-50%,-100%)`}}
let labelTop=0;function updLabels(){const hide=mode==="intro"||mode==="ride"||mode==="drive";{const o=$("#obj");labelTop=o&&o.offsetParent?o.getBoundingClientRect().bottom:0}
  for(let i=0;i<4;i++){const el=labelEls["_it"+i];if(el&&(!room||hide))el.style.display="none"}
  ORDER.forEach(id=>{const el=labelEls[id];if(!el)return;if(room||hide){el.style.display="none";return}const p=PLACES[id];place(el,new THREE.Vector3(p.door[0],id==="chapel"?6.2:5.6,p.door[1]))});if(!room&&!hide)declutter(ORDER.map(id=>labelEls[id]));
  const sp=labelEls._spot,ex=labelEls._exit;if(!room||hide){sp&&(sp.style.display="none");ex&&(ex.style.display="none");return}
  place(sp,room.spotL?new THREE.Vector3(...room.spotL):new THREE.Vector3(room.spot[3],2.9,room.spot[4]));place(ex,new THREE.Vector3(0,3,room.exit[1]));
  for(let i=0;i<4;i++){const el=labelEls["_it"+i],it=room.items&&room.items[i];if(!el)continue;if(!it){el.style.display="none";continue}place(el,new THREE.Vector3(...it.at))}
  if(!shoutEl.hidden&&P){_p.copy(P.pos).setY(2.5).project(camera);shoutEl.style.transform=`translate(${(_p.x*.5+.5)*innerWidth|0}px,${(-_p.y*.5+.5)*innerHeight|0}px) translate(-50%,-100%)`}
  if(sayEl&&!sayEl.hidden&&priest){(priest?_p.copy(priest.pos).setY(2.5):_p.set(0,2.5,-3.9)).project(camera);sayEl.style.transform=`translate(${(_p.x*.5+.5)*innerWidth|0}px,${(-_p.y*.5+.5)*innerHeight|0}px) translate(-50%,-100%)`}}

/* ---------- camera ---------- */
const camPos=new THREE.Vector3(0,30,80),camLook=new THREE.Vector3(0,2,0);let introT=0,flyT=0;
function followPose(){const portrait=innerWidth<innerHeight;if(window.__dogCam){const d=dog.pos,a=window.__dogCam;return{p:new THREE.Vector3(d.x+Math.sin(a)*1.6,.75,d.z+Math.cos(a)*1.6),l:d.clone().setY(.32)}}
  if(selfieCam>0&&P){const f=new THREE.Vector3(Math.sin(P.yaw),0,Math.cos(P.yaw)),mid=P.pos.clone().lerp(N.pos,.5);return{p:mid.clone().addScaledVector(f,3.2).setY(1.75),l:mid.clone().setY(1.35)}}
  if(room){const k=portrait?1.45:1,o=room.outdoor?1.25:1,l=new THREE.Vector3(P.pos.x*.55,.8,P.pos.z*.5-2);
    /* rooms: pulled back to show everything, closer while something happens; the guest can swing it round, but only within the room */
    const off=new THREE.Vector3(P.pos.x*.45,7.8*k*o,P.pos.z*.5+8.6*k*o).sub(l).multiplyScalar(roomZoom).applyAxisAngle(UP,roomYaw);return{p:l.clone().add(off),l}}
  if((mode==="ride"&&ride)||mode==="drive"){const v=vespaObj.position,d=9*(portrait?1.3:1),pt=topView>0?1.1:.42;return{p:new THREE.Vector3(v.x+Math.sin(camYaw)*Math.cos(pt)*d,1.4+Math.sin(pt)*d,v.z+Math.cos(camYaw)*Math.cos(pt)*d),l:v.clone().setY(1)}}
  const d=camDist*(portrait?1.3:1),pt=topView>0?1.32:camPitch;return{p:new THREE.Vector3(P.pos.x+Math.sin(camYaw)*Math.cos(pt)*d,1.4+Math.sin(pt)*d,P.pos.z+Math.cos(camYaw)*Math.cos(pt)*d),l:new THREE.Vector3(P.pos.x,1.3,P.pos.z)}}
/* when a house stands between the camera and the couple, swing round to the nearest clear angle */
let occT=0;const _r=new THREE.Raycaster();
function camClear(yaw){const d=camDist*(innerWidth<innerHeight?1.3:1),o=new THREE.Vector3(P.pos.x,1.4,P.pos.z),c=new THREE.Vector3(P.pos.x+Math.sin(yaw)*Math.cos(camPitch)*d,1.4+Math.sin(camPitch)*d,P.pos.z+Math.cos(yaw)*Math.cos(camPitch)*d);if(topView>0&&yaw===camYaw)return false;
  const dir=c.sub(o),L=dir.length();_r.set(o,dir.normalize());_r.far=L;return _r.intersectObjects(occluders,false).length===0}
function avoidOcclusion(dt){if(room||!P||mode!=="play"){XRAY.visible=false;return}occT-=dt;if(occT>0)return;occT=.25;const clear=camClear(camYaw);
  /* the silhouette shows only while a house really stands in front of them */
  XRAY.visible=!clear;if(clear||tAll-userCamT<2.5)return;
  for(const k of [.45,-.45,.9,-.9,1.35,-1.35,1.8,-1.8,2.4,-2.4,Math.PI])if(camClear(camYaw+k)){camTarget=camYaw+k;topView=0;return}
  topView=3}
let topView=0,roomYaw=0,roomZoom=1.3,roomZoomT=1.3,roomFocusT=0;
const ROOM_FAR=1.3,ROOM_NEAR=.82;function roomFocus(secs){roomZoomT=ROOM_NEAR;roomFocusT=secs||0}
let camTarget=null;
function snapCam(){const f=followPose();camPos.copy(f.p);camLook.copy(f.l)}
function introPose(t){const a=Math.min(1,t/14),e=1-Math.pow(1-a,3);return{p:new THREE.Vector3(Math.sin(t*.05)*14,26-e*14,78-e*44),l:new THREE.Vector3(0,3.5-e*1.5,-8)}}
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
function choose(kind){if(!ready||mode!=="intro")return;if(kind==="bride")startOnVespa=true;const[g,b]=window.__ents;P=kind==="groom"?g:b;N=kind==="groom"?b:g;mode="fly";flyT=0;
  $("#intro").classList.add("gone");document.body.classList.add("play");let so="1";try{so=localStorage.getItem("wsound")??"1"}catch(e){}setSound(so==="1");plazaGuests();plazaKoum();if(!state.guest)setTimeout(askName,1800);setTimeout(bell,1500);
  setTimeout(seaLife,3000);
  setTimeout(()=>{toast(tx().hint,7000)},reduce?0:2600)}
$("#seal").addEventListener("click",()=>{const de=document.documentElement;if(touch&&de.requestFullscreen&&!document.fullscreenElement)de.requestFullscreen({navigationUI:"hide"}).catch(()=>{});$("#env").classList.add("open");if(navigator.vibrate)navigator.vibrate(15)});
$("#pG").addEventListener("click",()=>choose("groom"));$("#pB").addEventListener("click",()=>choose("bride"));

let composer=null;
if(!mobile&&!/noao/.test(location.search)){try{composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:4}));composer.addPass(new RenderPass(world,camera));const ao=new GTAOPass(world,camera,innerWidth,innerHeight);ao.output=GTAOPass.OUTPUT.Default;ao.blendIntensity=.9;
  ao.updateGtaoMaterial({radius:.6,distanceExponent:1.4,thickness:1.5,scale:1});composer.addPass(ao);composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.35,.6,.92));composer.addPass(new OutputPass())}catch(e){composer=null}}
/* frames too slow: step the resolution down; fast again: step it back up */
let prCap=Math.min(devicePixelRatio||1,mobile?1.5:2),prNow=mobile?Math.min(prCap,1.25):prCap,fpsAcc=0,fpsN=0;
function adaptRes(dt){fpsAcc+=dt;fpsN++;if(fpsAcc<2.5)return;const fps=fpsN/fpsAcc;fpsAcc=fpsN=0;const nx=fps<26?Math.max(.7,prNow*.85):fps>50?Math.min(prCap,prNow*1.1):prNow;if(Math.abs(nx-prNow)>.03){prNow=nx;resize()}}
/* size from the canvas box itself: home-screen (standalone) iOS reports innerHeight late or wrong */
let lastWH="";function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight,pr=prNow;lastWH=w+"x"+h;renderer.setPixelRatio(pr);renderer.setSize(w,h,false);if(composer){composer.setPixelRatio(pr);composer.setSize(w,h)}camera.aspect=w/h;camera.fov=w<h?60:46;camera.updateProjectionMatrix()}
addEventListener("resize",()=>{resize();renderObj()});resize();
if(window.visualViewport)visualViewport.addEventListener("resize",()=>{resize();renderObj()});addEventListener("orientationchange",()=>setTimeout(resize,350));
setInterval(()=>{if((canvas.clientWidth+"x"+canvas.clientHeight)!==lastWH)resize()},700);

let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;tAll+=dt;
  adaptRes(dt);
  if(mode==="intro"){introT+=dt;const a=introPose(introT);camPos.copy(a.p);camLook.copy(a.l);(window.__ents||[]).forEach(e=>{e.m.position.copy(e.pos);e.m.rotation.y=e.yaw;e.mix.update(dt)})}
  else{if(mode==="ride")updateRide(dt);else if(mode==="drive")updDrive(dt);else if(P&&mode!=="busy")updateChars(dt);updVespaHome(dt);if(room){if(roomFocusT>0&&(roomFocusT-=dt)<=0)roomZoomT=ROOM_FAR;roomZoom+=(roomZoomT-roomZoom)*Math.min(1,dt*2)}const f=followPose();
    if(mode==="fly"){flyT+=dt/(reduce?.01:2.6);const a=introPose(introT),e=ease(Math.min(1,flyT));camPos.lerpVectors(a.p,f.p,e);camLook.lerpVectors(a.l,f.l,e);[P,N].forEach(x=>x.mix.update(dt));if(flyT>=1){mode="play";renderObj();if(startOnVespa){startOnVespa=false;vespaObj.position.set(P.pos.x+1.4,0,P.pos.z);vespaObj.rotation.y=Math.PI;mountVespa()}}}
    else{const k=1-Math.exp(-6*dt);camPos.lerp(f.p,k);camLook.lerp(f.l,k)}}
  camera.position.copy(camPos);camera.lookAt(camLook);
  const scene=room?room.scene:world;
  if(room){room.age+=dt;room.anim(dt);if(room.ring){const s=1+.12*Math.sin(tAll*3);room.ring.scale.setScalar(s);room.ring.visible=room.id==="den"?P.lock<=0:!state.done[questOf(room.id)];if(room.doneRing)room.doneRing.visible=room.id!=="den"&&!!state.done[questOf(room.id)]}
    if(room.sun){room.sun.position.copy(P.pos).addScaledVector(SUN,60);room.sun.target.position.copy(P.pos)}(room.waters||[]).forEach(w=>w.material.uniforms.time.value+=dt*.4)}
  else{const c=P?P.pos:new THREE.Vector3();sun.position.copy(c).addScaledVector(SUN,90);sun.target.position.copy(c);waters.forEach(w=>w.material.uniforms.time.value+=dt*.4)}
  updNPCs(dt,scene);if(!room)updRiders(dt);updDog(dt);
  ships.forEach(s2=>{if(s2.yc){s2.a+=s2.sp*dt;const[x,z,R]=s2.yc;s2.g.position.set(x+Math.cos(s2.a)*R,-1.05+Math.sin(tAll*1.2+s2.a)*.06,z+Math.sin(s2.a)*R*.5);s2.g.rotation.y=Math.atan2(-Math.sin(s2.a),Math.cos(s2.a)*.5)+(s2.sp<0?Math.PI:0);s2.g.rotation.z=.12}else{s2.g.position.x+=s2.sp*dt;if(s2.g.position.x>420)s2.g.position.x=-420;if(s2.g.position.x<-420)s2.g.position.x=420;s2.g.rotation.y=s2.sp>0?0:Math.PI}});
  boats.forEach(b=>{b.g.position.y=b.y+Math.sin(tAll*1.1+b.ph)*.07;b.g.rotation.z=Math.sin(tAll*.9+b.ph)*.03;b.g.rotation.x=Math.sin(tAll*.7+b.ph)*.015});
  updHearts(dt);updLabels();updThink(dt);
  if(selfieCam>0&&!document.body.classList.contains("cardopen"))selfieCam-=dt;if(topView>0)topView-=dt;avoidOcclusion(dt);if(camTarget!=null){camYaw=angLerp(camYaw,camTarget,1-Math.exp(-3*dt));if(Math.abs(((camTarget-camYaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI)<.02)camTarget=null}
  if(false){const gs=room?scene:fx;if(gem.parent!==gs)gs.add(gem);gem.position.set(P.pos.x,P.pos.y+2.35+Math.sin(tAll*2)*.05,P.pos.z);gem.rotation.y+=dt*1.6;gem.visible=mode!=="ride"&&selfieCam<=0}
  if(!reduce)sails.forEach(m=>m.g.rotation.z-=dt*m.s);
  if(composer&&!room)composer.render();else renderer.render(scene,camera);
  if(!room){renderer.autoClear=false;renderer.render(fx,camera);renderer.autoClear=true}}
requestAnimationFrame(frame);


/* ---------- the arcade: three easy games, a name, a live score and a leaderboard ---------- */
function buildArcade(){const r=roomBase("arcade",{floor:canvasTex(256,256,(g,w,h)=>{g.fillStyle="#1b1530";g.fillRect(0,0,w,h);for(let k=0;k<26;k++){g.fillStyle=["#ff4fa3","#3ad1ff","#ffe36b","#7cff6b"][k%4];g.globalAlpha=.22;g.fillRect(rnd()*w,rnd()*h,3+rnd()*6,3+rnd()*6)}g.globalAlpha=1},[6,5]),wall:0x2a2147,trim:0x120d22,hemi:.7,keyI:.5,bg:0x0b0816});const B=r.B;
  M.neonA=mat({color:0xff4fa3,emissive:0xff4fa3,emissiveIntensity:2});M.neonB=mat({color:0x3ad1ff,emissive:0x3ad1ff,emissiveIntensity:2});
  B.add(G.box,"neonA",0,4.3,-6.42,16,.08,.05).add(G.box,"neonB",-7.95,4.3,0,.05,.08,13).add(G.box,"neonB",7.95,4.3,0,.05,.08,13);
  const games=[["ttt","#ff4fa3"],["snake","#7cff6b"],["maze","#3ad1ff"]];
  games.forEach(([k,c],i)=>{const x0=-4+i*4;B.add(new RoundedBoxGeometry(1.5,2.6,1,3,.08),"black",x0,1.3,-5.6).add(G.box,"black",x0,.9,-5.0,1.5,.12,.5);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.85),new THREE.MeshBasicMaterial({map:canvasTex(256,200,(g,w,h)=>{g.fillStyle="#0b0816";g.fillRect(0,0,w,h);g.strokeStyle=c;g.lineWidth=6;g.strokeRect(6,6,w-12,h-12);g.fillStyle=c;g.font="800 30px Commissioner, sans-serif";g.textAlign="center";g.fillText(tx().games[k],w/2,110)})}));
    scr.position.set(x0,1.85,-5.09);r.scene.add(scr);const l=new THREE.PointLight(new THREE.Color(c),6,5,1.6);l.position.set(x0,2,-4.4);r.scene.add(l);r.solid.push({x0:x0-.8,z0:-6.2,x1:x0+.8,z1:-4.7})});
  for(const sx of [-1,1])B.add(G.cyl,"red",sx*2,.3,-.4,.35,.6,.35).add(G.cyl,"black",sx*2,.62,-.4,.4,.06,.4);
  r.spot=[0,-1.2,1.4,0,-5];r.spotL=[0,.5,-1.2];r.spotFn=()=>CARDS.arcade();{const l=new THREE.PointLight(0xffd9a8,7,12,1.4);l.position.set(0,3.6,0);r.scene.add(l)}
  r.items=games.map(([k],i)=>({label:()=>tx().games[k],at:[-4+i*4,3.1,-5.4],go:[-4+i*4,-3.8],fn:()=>CARDS.game(k)}));
  guest(r.scene,2,5.6,-2,-1.2,"talk");return r}
const scoresLocal=()=>{try{return JSON.parse(localStorage.getItem("wscores")||"[]")}catch(e){return[]}};
function saveScore(game,score){const name=localStorage.getItem("wname")||"?",a=scoresLocal();a.push({name,game,score,t:Date.now()});try{localStorage.setItem("wscores",JSON.stringify(a.slice(-300)))}catch(e){}store("scores",{name,game,score,lang})}
function boardHTML(game){const x=tx(),best={};scoresLocal().filter(s=>s.game===game).forEach(s=>{if(!(s.name in best)||s.score>best[s.name])best[s.name]=s.score});
  const rows=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,8);return rows.length?`<ol class="lb">${rows.map(([n,v])=>`<li><span>${esc(n)}</span><b>${v}</b></li>`).join("")}</ol>`:`<p class="demo">${x.noScores}</p>`}
Object.assign(CARDS,{
  arcade(){const x=tx();openCard("ARCADE",x.arcadeH,`<p>${x.arcadeP}</p><div class="acts">${["ttt","snake","maze"].map(k=>`<button class="btn" type="button" data-g="${k}">${x.games[k]}</button>`).join("")}</div>`,()=>$("#cardB").querySelectorAll("[data-g]").forEach(b=>b.addEventListener("click",()=>CARDS.game(b.dataset.g))));cardFn=CARDS.arcade},
  game(k){const x=tx(),nm=localStorage.getItem("wname");
    if(!nm){openCard("ARCADE",x.nameH,`<form id="nf"><label class="f"><span>${x.username}</span><input id="un" maxlength="20" required autocomplete="nickname"></label><div class="acts"><button class="btn" type="submit">${x.play}</button></div></form>`,()=>$("#nf").addEventListener("submit",e=>{e.preventDefault();const v=$("#un").value.trim();if(!v)return;try{localStorage.setItem("wname",v)}catch(er){}CARDS.game(k)}));return}
    openCard("ARCADE · "+esc(nm),x.games[k],`<div class="gm"><div class="gsc">${x.score}: <b id="gs">0</b></div><canvas id="gc" width="300" height="300"></canvas>
      ${k==="ttt"?"":`<div class="pad"><button type="button" data-d="u">▲</button><button type="button" data-d="l">◀</button><button type="button" data-d="d">▼</button><button type="button" data-d="r">▶</button></div>`}
      <div class="acts"><button class="btn ghost" type="button" id="gAgain">${x.again}</button></div><h4 class="sub">${x.board}</h4><div id="gb">${boardHTML(k)}</div></div>`,()=>{const stop=GAMES[k]($("#gc"),v=>$("#gs").textContent=v,v=>{saveScore(k,v);$("#gb").innerHTML=boardHTML(k)});
      $("#gAgain").addEventListener("click",()=>{stop();CARDS.game(k)});const obs=new MutationObserver(()=>{if($("#card").classList.contains("shut")){stop();obs.disconnect()}});obs.observe($("#card"),{attributes:true})});cardFn=null}});
/* each game: (canvas, onScore, onEnd) -> stop() */
const GAMES={
  ttt(c,onS,onEnd){const g=c.getContext("2d"),b=Array(9).fill(0);let wins=0,over=false;const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],win=p=>L.some(l=>l.every(i=>b[i]===p));
    const draw=()=>{g.fillStyle="#fbf7ef";g.fillRect(0,0,300,300);g.strokeStyle="#1f3b78";g.lineWidth=5;g.lineCap="round";for(let k=1;k<3;k++){g.beginPath();g.moveTo(k*100,12);g.lineTo(k*100,288);g.moveTo(12,k*100);g.lineTo(288,k*100);g.stroke()}
      b.forEach((v,i)=>{const cx=(i%3)*100+50,cy=(i/3|0)*100+50;g.lineWidth=9;if(v===1){g.strokeStyle="#e2406b";g.beginPath();g.moveTo(cx-26,cy-26);g.lineTo(cx+26,cy+26);g.moveTo(cx+26,cy-26);g.lineTo(cx-26,cy+26);g.stroke()}else if(v===2){g.strokeStyle="#2a7bd8";g.beginPath();g.arc(cx,cy,28,0,7);g.stroke()}})};
    const ai=()=>{const free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);for(const p of [2,1])for(const i of free){b[i]=p;const w=win(p);b[i]=0;if(w)return i}if(!b[4])return 4;return free[(Math.random()*free.length)|0]};
    const end=t=>{over=true;draw();g.fillStyle="rgba(20,30,50,.75)";g.fillRect(0,120,300,60);g.fillStyle="#fff";g.font="800 26px Commissioner, sans-serif";g.textAlign="center";g.fillText(t,150,160);setTimeout(()=>{b.fill(0);over=false;draw()},1300)};
    const click=e=>{if(over)return;const r=c.getBoundingClientRect(),i=((e.clientY-r.top)/r.height*3|0)*3+((e.clientX-r.left)/r.width*3|0);if(b[i])return;b[i]=1;
      if(win(1)){wins++;onS(wins);onEnd(wins);return end(tx().youWin)}if(b.every(v=>v))return end(tx().draw);b[ai()]=2;if(win(2))return end(tx().youLose);draw()};
    c.addEventListener("pointerdown",click);draw();return()=>c.removeEventListener("pointerdown",click)},
  snake(c,onS,onEnd){const g=c.getContext("2d"),N=15,S=20;let sn=[[7,7],[6,7],[5,7]],dir=[1,0],nd=[1,0],food=[11,7],sc=0,dead=false;const keyMap={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
    const turn=d=>{const v=keyMap[d];if(v&&(v[0]!==-dir[0]||v[1]!==-dir[1]))nd=v};const kd=e=>{const m={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r"}[e.key];if(m){turn(m);e.preventDefault()}};
    const pad=[...document.querySelectorAll(".pad [data-d]")];pad.forEach(p=>p.onclick=()=>turn(p.dataset.d));addEventListener("keydown",kd);
    let sx=0,sy=0;const ts=e=>{sx=e.clientX;sy=e.clientY},te=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>18)turn(Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u"))};c.addEventListener("pointerdown",ts);c.addEventListener("pointerup",te);
    const place=()=>{do food=[(Math.random()*N)|0,(Math.random()*N)|0];while(sn.some(p=>p[0]===food[0]&&p[1]===food[1]))};
    const tick=()=>{if(dead)return;dir=nd;const h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||sn.some(p=>p[0]===h[0]&&p[1]===h[1])){dead=true;onEnd(sc);draw(tx().gameOver);return}
      sn.unshift(h);if(h[0]===food[0]&&h[1]===food[1]){sc++;onS(sc);place()}else sn.pop();draw()};
    const draw=t=>{g.fillStyle="#123a2a";g.fillRect(0,0,300,300);g.fillStyle="#ff5a5f";g.beginPath();g.arc(food[0]*S+10,food[1]*S+10,8,0,7);g.fill();sn.forEach((p,i)=>{g.fillStyle=i?"#7cff6b":"#e7ff9a";g.fillRect(p[0]*S+1,p[1]*S+1,S-2,S-2)});
      if(t){g.fillStyle="rgba(0,0,0,.6)";g.fillRect(0,120,300,60);g.fillStyle="#fff";g.font="800 24px Commissioner, sans-serif";g.textAlign="center";g.fillText(t,150,158)}};
    draw();const iv=setInterval(tick,150);return()=>{clearInterval(iv);removeEventListener("keydown",kd);c.removeEventListener("pointerdown",ts);c.removeEventListener("pointerup",te)}},
  /* an original maze: collect the shells, keep away from the two seagulls */
  maze(c,onS,onEnd){const g=c.getContext("2d"),MAP=["###############","#.....#.......#","#.###.#.#####.#","#.#.........#.#","#.#.##.#.##.#.#","#......#......#","###.#.###.#.###","#...#.....#...#","#.#####.#####.#","#......o......#","#.##.#####.##.#","#..#...#...#..#","##.#.#.#.#.#.##","#....#...#....#","###############"],N=15,S=20;
    const grid=MAP.map(r=>r.split(""));let me=[7,9],dir=[0,0],nd=[0,0],sc=0,dead=false,left=grid.flat().filter(v=>v===".").length;grid[9][7]=" ";
    const gulls=[{p:[1,1]},{p:[13,13]}];const keyMap={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};const free=(x,y)=>grid[y]&&grid[y][x]&&grid[y][x]!=="#";
    const turn=d=>{nd=keyMap[d]||nd};const kd=e=>{const m={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r"}[e.key];if(m){turn(m);e.preventDefault()}};
    document.querySelectorAll(".pad [data-d]").forEach(p=>p.onclick=()=>turn(p.dataset.d));addEventListener("keydown",kd);
    let sx=0,sy=0;const ts=e=>{sx=e.clientX;sy=e.clientY},te=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>18)turn(Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u"))};c.addEventListener("pointerdown",ts);c.addEventListener("pointerup",te);
    const draw=t=>{g.fillStyle="#0e2340";g.fillRect(0,0,300,300);grid.forEach((r,y)=>r.forEach((v,x)=>{if(v==="#"){g.fillStyle="#f4efe6";g.fillRect(x*S+1,y*S+1,S-2,S-2)}else if(v==="."){g.fillStyle="#ffcf6a";g.beginPath();g.arc(x*S+10,y*S+10,3,0,7);g.fill()}}));
      g.fillStyle="#ff9a3c";g.beginPath();g.arc(me[0]*S+10,me[1]*S+10,8,0,7);g.fill();gulls.forEach(q=>{g.fillStyle="#fff";g.beginPath();g.ellipse(q.p[0]*S+10,q.p[1]*S+10,9,6,0,0,7);g.fill();g.fillStyle="#f2a33a";g.fillRect(q.p[0]*S+15,q.p[1]*S+9,5,3)});
      if(t){g.fillStyle="rgba(0,0,0,.6)";g.fillRect(0,120,300,60);g.fillStyle="#fff";g.font="800 24px Commissioner, sans-serif";g.textAlign="center";g.fillText(t,150,158)}};
    const tick=()=>{if(dead)return;if(free(me[0]+nd[0],me[1]+nd[1]))dir=nd;if(free(me[0]+dir[0],me[1]+dir[1])){me=[me[0]+dir[0],me[1]+dir[1]]}
      if(grid[me[1]][me[0]]==="."){grid[me[1]][me[0]]=" ";sc++;left--;onS(sc)}
      gulls.forEach((q,i)=>{if((tAll*10|0)%3===i)return;const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(v=>free(q.p[0]+v[0],q.p[1]+v[1]));opts.sort((a,b)=>Math.hypot(q.p[0]+a[0]-me[0],q.p[1]+a[1]-me[1])-Math.hypot(q.p[0]+b[0]-me[0],q.p[1]+b[1]-me[1]));const v=Math.random()<.7?opts[0]:opts[(Math.random()*opts.length)|0];if(v)q.p=[q.p[0]+v[0],q.p[1]+v[1]]});
      if(gulls.some(q=>q.p[0]===me[0]&&q.p[1]===me[1])){dead=true;onEnd(sc);draw(tx().gameOver);return}if(!left){dead=true;onEnd(sc+20);onS(sc+20);draw(tx().youWin);return}draw()};
    draw();const iv=setInterval(tick,170);return()=>{clearInterval(iv);removeEventListener("keydown",kd);c.removeEventListener("pointerdown",ts);c.removeEventListener("pointerup",te)}}};
/* ---------- end quiz: after everything, back in the plaza, 5 questions unlock pawprints to the secret windmill ---------- */
let paws=null;
function showPaws(){if(paws)return;const pts=findPath(gridNow(),new THREE.Vector3(0,0,-6),new THREE.Vector3(SECRET.door[0],0,SECRET.door[1]+1.2)),all=[new THREE.Vector3(0,0,-6),...pts],gs=[];
  let side=1;for(let k=1;k<all.length;k++){const a=all[k-1],b=all[k],L=a.distanceTo(b),dir=b.clone().sub(a).normalize(),r=new THREE.Vector3(-dir.z,0,dir.x),yaw=Math.atan2(dir.x,dir.z);
    for(let t=.4;t<L;t+=.55){side=-side;const c=a.clone().addScaledVector(dir,t).addScaledVector(r,side*.09);
      [[0,0,.055],[-.045,.06,.02],[0,.075,.02],[.045,.06,.02]].forEach(([x,z,rr])=>{const g=new THREE.CircleGeometry(rr,10).rotateX(-Math.PI/2).translate(x,0,z).rotateY(yaw).translate(c.x,.025,c.z);gs.push(g.toNonIndexed())})}}
  paws=new THREE.Mesh(mergeGeometries(gs),new THREE.MeshBasicMaterial({color:0x8a5a3c,transparent:true,opacity:.75,depthWrite:false}));world.add(paws)}
if(state.quiz===2)setTimeout(()=>{try{showPaws()}catch(e){}},3000);
function quizCard(){const x=tx(),got=state.qa||{};if(state.quiz===3){openCard(x.qzW,x.qzH,`<p>${x.qzFail}</p>`);return}state.quiz=1;save();
  const body=`<p class="qwarn">${x.qzOnce}</p><p>${x.qzP}</p><ol class="qz">${x.qz.map((q,i)=>`<li><b>${q[0]}</b><div class="qa">${q[1].map((a,j)=>`<button type="button" class="chip${got[i]===j?" ok":""}" data-q="${i}" data-a="${j}">${a}</button>`).join("")}</div><small class="qr" id="qr${i}">${got[i]!=null?x.qzOk:""}</small></li>`).join("")}</ol><p class="qscore" id="qsc"></p>`;
  openCard(x.qzW,x.qzH,body,()=>{const upd=()=>{const n=Object.keys(got).length;$("#qsc").textContent=`${n}/${x.qz.length} ${x.qzOf}`;
      if(n===x.qz.length&&!state.hint){/* the hint shows once, for 11 seconds, never again */state.quiz=2;state.hint=1;save();showPaws();renderObj();setTimeout(()=>{openCard("· · ·",x.qzWinH,`<p>${x.qzWin}</p><div class="acts"><button class="btn" type="button" id="qgo">${x.qzGo}</button></div>`,()=>$("#qgo").addEventListener("click",closeCard));setTimeout(()=>{if($("#qgo"))closeCard()},11000)},900)}};
    upd();$("#cardB").querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>{const i=+b.dataset.q,j=+b.dataset.a;if(got[i]!=null)return;
      if(x.qz[i][2]===j){got[i]=j;state.qa=got;save();b.classList.add("ok");$("#qr"+i).textContent=x.qzOk;upd()}else{/* one chance only: a wrong answer ends the test for good */b.classList.add("no");$("#qr"+i).textContent=x.qzNo;state.quiz=3;save();$("#cardB").querySelectorAll("[data-q]").forEach(c=>c.disabled=true);$("#qsc").textContent=x.qzFail}}))})}
setInterval(()=>{if(!state.quiz&&state.fin&&Date.now()-state.fin>4000&&mode==="play"&&!room&&ORDER.every(k=>state.done[questOf(k)])&&!document.body.classList.contains("cardopen"))quizCard()},1500);
/* TEMP admin (testing only, remove before sending): marks every quest done, finale already seen */
$("#bReset").addEventListener("click",()=>{try{localStorage.removeItem("wq2")}catch(e){}location.reload()});
/* zoom: far (default) -> x1 -> x2 -> far */
/* each entry: distance, and the label of what the next tap does */
const ZOOMS=[[11,"x1"],[7.5,"x2"],[4.8,"⤢"]];let zoomI=0;$("#bZoom").addEventListener("click",()=>{zoomI=(zoomI+1)%ZOOMS.length;camDist=ZOOMS[zoomI][0];$("#bZoom").textContent=ZOOMS[zoomI][1]});
$("#bAdmin").addEventListener("click",()=>{ORDER.forEach(k=>state.done[questOf(k)]=1);state.fin=Date.now()-5000;delete state.quiz;delete state.qa;delete state.hint;save();panel("#list",false);renderList();renderObj();renderLabels();toast("admin: 5/5 + 6/6 ✓",2500)});
window.__w={rinfo:()=>room&&{s:room.solid.map(q=>[q.x0,q.z0,q.x1,q.z1].map(v=>+v.toFixed(1))),r:room.round.map(c=>[c.x,c.z,c.r].map(v=>+v.toFixed(1))),b:room.bounds},exportStatic:async()=>{const {GLTFExporter}=await import("three/addons/exporters/GLTFExporter.js");const sc=new THREE.Scene();STATIC.forEach(m=>{m.updateMatrixWorld();const c=new THREE.Mesh(m.geometry.clone().applyMatrix4(m.matrixWorld),new THREE.MeshStandardMaterial({name:m.name}));c.name=m.name;sc.add(c)});const b=await new GLTFExporter().parseAsync(sc,{binary:true});let s="";const u=new Uint8Array(b);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)},dbgP:()=>({lock:P.lock,goal:goal&&{i:goal.i,n:goal.pts.length,end:goal.pts[goal.pts.length-1].toArray(),tries:goal.tries||0},pos:P.pos.toArray(),spd:P.spd,mode,cur:P.curName,shown:room&&room.shown}),setDist:d=>{camDist=d;camPitch=.3},dog:()=>dog.pos.toArray(),mountVespa,getOff,dogTrick,mode:()=>mode,ready:()=>ready,choose,goPlace,enterRoom,exitRoom,startRide,P:()=>P,room:()=>room&&room.id,tp:(x,z)=>{P.pos.set(x,0,z);N.pos.set(x+1,0,z);goal=null;snapCam()},selfie,info:()=>renderer.info.render,blessing,npcs:()=>npcs.length,complete,driveTo,vespa:()=>vespaObj.position.toArray(),setV:(x,z)=>vespaObj.position.set(x,0,z),vg:()=>vGoal&&{i:vGoal.i,pts:vGoal.pts.map(p=>[+p.x.toFixed(1),+p.z.toFixed(1)])},snd:()=>({soundOn,zone:zone(),zoneOn:{...zoneOn},chant:!chant.paused,club:!clubSong.paused,music:!music.paused}),setSound,card:()=>$("#card").textContent.slice(0,200),cards:()=>CARDS,dance:()=>room&&{t:room.dance&&room.dance.t,w:room.wantDance},quiz:()=>state.quiz,qzKey:i=>tx().qz[i][2]};
