import * as T from 'three';
import{buildWorld,R,CAVE_IN,CAVE_C,CAVE_OUT,CAVE_YAW}from'./world.js';import{makeTool}from'./tools.js';import{initAudio,setVolume,sfx}from'./audio.js';import{Monsters}from'./monsters.js';import{MISSIONS,WRECK,RADIO}from'./missions.js';import{DEFS,makeBuild,makeRadio}from'./building.js';import{Player}from'./player.js';import{setupControls}from'./controls.js';import{blockyModel}from'./blocky.js';import{ICON,SLOTS,has,add,remove}from'./inventory.js';import{RECIPES,canCraft,craft}from'./crafting.js';window.__ok=1;
const $=id=>document.getElementById(id),KEY='ilha-perdida-save';
const canvas=$('c'),rd=new T.WebGLRenderer({canvas,antialias:false});rd.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,300);
const bgc=new T.Color(),fog=new T.Fog(0x87ceeb,40,140);scene.background=bgc;scene.fog=fog;
const sun=new T.DirectionalLight(0xffffff,1.6),amb=new T.AmbientLight(0xffffff,.7);scene.add(sun,amb);
let seed=1+Math.floor(Math.random()*2e9);try{const s0=JSON.parse(localStorage.getItem(KEY));if(s0&&s0.ms&&s0.ms.seed)seed=s0.ms.seed}catch{}
const{col,res}=buildWorld(scene,seed),pl=new Player(scene,col),ctl=setupControls(canvas);
pl.setModel(blockyModel());
let inv={Madeira:0,Pedra:0,Fibra:0,Fruta:0,Minério:0},st={v:100,f:100,e:100},tm=6,builds=[],fp=true,ms={i:0,got:{},s:[0,0],days:1,radio:false,sent:false,done:false,intro:false},fin=false,gone=[],paused=false,hurt=0,inCave=false,busy=false;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s){inv=s.inv;st=s.st;tm=s.tm;builds=s.builds||[];fp=s.fp!==false;ms={...ms,...s.ms};gone=s.gone||[];pl.g.position.set(...s.pos)}}catch{}
const V=new T.Vector3(),rc=new T.Raycaster(),WH=new T.Color(1,1,1),BK=new T.Color(0,0,0);rc.far=12;res.forEach(r=>r.mesh.traverse(o=>o.userData.res=r));
function tint(r,p){r.mesh.traverse(o=>{const m=o.material;if(!m||!m.color||m.isMeshBasicMaterial)return;if(!m.userData.c0)m.userData.c0=m.color.clone();const c=m.userData.c0;
  if(p<=0)m.color.copy(c);else if(p<.15)m.color.copy(c).lerp(WH,p/.15*.35);else m.color.copy(c).lerp(WH,.35).lerp(BK,(p-.15)/.85*.95)})}
const dur=r=>({Madeira:3,Pedra:3,Minério:4,Fibra:.5,Fruta:.5,Peça:2}[r.type])*((r.type==='Madeira'&&eq()==='Machado')||((r.type==='Pedra'||r.type==='Minério')&&eq()==='Picareta')?.5:1);
function collect(r){const q=r.type==='Madeira'&&eq()==='Machado'?2:1;tint(r,0);r.mesh.position.x=r.x;
  if(add(inv,r.type,q)){r.mesh.visible=false;r.hp=0;r.t0=performance.now();const i=col.findIndex(c=>c.x===r.x&&c.z===r.z);if(i>=0)col.splice(i,1);ms.got[r.type]=(ms.got[r.type]||0)+q;sfx.pop();toast(`+${q} ${r.type}`)}else toast('Mochila cheia!');render()}
const fl=[],w={f:0,e:0,v:0},HP={Madeira:3,Pedra:3,Fibra:1,Fruta:1};
setInterval(()=>{const n=performance.now();for(const r of res)if(r.t0&&n-r.t0>180000&&HP[r.type]){r.t0=0;r.hp=HP[r.type];r.mesh.visible=true;if(r.rad)col.push({x:r.x,z:r.z,r:r.rad})}},5000);function spawn(b){const g=makeBuild(b.t);g.position.set(b.x,0,b.z);g.rotation.y=b.ry;scene.add(g);col.push({x:b.x,z:b.z,r:DEFS[b.t].r});if(g.userData.flame)fl.push(g.userData.flame)}
builds.forEach(spawn);let bd=null;
const radio=makeRadio();radio.position.set(RADIO[0],0,RADIO[1]);scene.add(radio);col.push({x:RADIO[0],z:RADIO[1],r:1.3});
const marker=new T.Mesh(new T.CylinderGeometry(.3,.3,60,8,1,true),new T.MeshBasicMaterial({color:0xffe14d,transparent:true,opacity:.4,depthWrite:false,side:T.DoubleSide}));marker.position.y=30;marker.visible=false;scene.add(marker);
const marker2=new T.Mesh(marker.geometry,new T.MeshBasicMaterial({color:0x4dd2ff,transparent:true,opacity:.45,depthWrite:false,side:T.DoubleSide}));marker2.visible=false;scene.add(marker2);
const setLed=()=>radio.userData.led.material.color.setHex(ms.radio?0x22dd44:0xcc2222),G={res};
function tgt0(){const M=MISSIONS[ms.i];G.p=pl.g.position;return ms.sent?RADIO:M&&(typeof M.target==='function'?M.target(G):M.target)}
function setMarker(){const sr=res.find(r=>r.secret),sh=!!(ms.map&&sr&&sr.mesh.visible&&!inCave);marker2.visible=sh;if(sh)marker2.position.set(sr.x,30,sr.z);const t=tgt0();marker.visible=!!t&&!inCave;if(t){marker.position.x=t[0];marker.position.z=t[1]}marker.material.color.setHex(ms.sent?0xff3030:0xffe14d)}
function chk(){G.p=pl.g.position;G.ms=ms;G.got=ms.got;G.builds=builds;G.inv=inv;
  while(ms.i<MISSIONS.length&&MISSIONS[ms.i].ok(G)){const M=MISSIONS[ms.i];sfx.mission();toast(`✔ Missão ${ms.i+1} concluída: ${M.t}\n${M.m}`,4500);ms.i++;setMarker();save()}}
function updMission(){setMarker();const M=MISSIONS[ms.i],sc=res.find(r=>r.secret),mp=ms.map&&sc&&sc.mesh.visible?`<br>📍 Mapa: x ${Math.round(sc.x)}, z ${Math.round(sc.z)} · ${Math.round(Math.hypot(sc.x-G.p.x,sc.z-G.p.z))} m`:'';if(!M){$('mission').innerHTML='<b>Todas as missões concluídas!</b>';return}
  const t=tgt0(),ds=t?` · ${Math.round(Math.hypot(t[0]-G.p.x,t[1]-G.p.z))} m`:'';$('mission').innerHTML=`<b>Missão ${ms.i+1}/7: ${M.t}</b><small>${ds}</small><span class="d"><br>${M.d(G)}${mp}</span>`}
function finish(){if(ms.done)return;ms.done=true;fin=true;save();$('endtxt').textContent=`Você enviou o sinal e a equipe de resgate chegou! Dias na ilha: ${ms.days}.`;$('end').hidden=false}
function radioAct(){if(!ms.radio){if(has(inv,'Peça',4)){remove(inv,'Peça',4);ms.radio=true;setLed();sfx.radio();toast('Rádio consertado!',3000);render();save()}else toast('Faltam peças: você precisa de 4.')}
  else if(!ms.sent){ms.sent=true;setMarker();toast('Sinal enviado! Aguarde o resgate...',5000);save();setTimeout(finish,6000)}}
$('endCont').onclick=()=>{$('end').hidden=true;fin=false;ctl.lock()};$('endNew').onclick=()=>{localStorage.removeItem(KEY);location.reload()};
$('play').addEventListener('click',()=>{if(!ms.intro){ms.intro=true;toast('Você acorda em uma ilha desconhecida após um acidente.\nExplore, construa um abrigo e peça socorro pelo rádio.',7000)}});
setLed();setMarker();if(ms.sent&&!ms.done)setTimeout(finish,3000);let fc=0;scene.add(cam);
const fpH=new T.Group(),fpA=new T.Mesh(new T.BoxGeometry(.17,.17,.75),new T.MeshLambertMaterial({color:0xf0c08a,flatShading:true}));fpA.position.set(0,-.05,.05);fpH.add(fpA);fpH.position.set(.5,-.5,-.85);fpH.rotation.y=-.25;cam.add(fpH);
let fpT=null,lastEq=null;function setFPTool(n){if(fpT){fpH.remove(fpT);fpT=null}if(n&&n!=='Mão'){fpT=makeTool(n);fpT.position.set(0,.05,-.38);fpT.rotation.x=-1.0;fpH.add(fpT)}}
const mon=Monsters(scene,col,R),uiOpen=()=>open||paused||fin||$('start').style.display!=='none';ctl.canLock=()=>!uiOpen();
function attack(){if(atk>0||!mt)return;atk=.45;sfx.hit();const E=eq(),dm=E==='Lança'?4:E==='Machado'?2:E==='Picareta'?1.5:1,ty=mt.type;
  if(mon.hit(mt,dm,pl.g.position.x,pl.g.position.z)){const d=mt.D.drop;if(!add(inv,d[0],d[1])&&ty==='Golem')inv[d[0]]=(inv[d[0]]||0)+d[1];ms.got[d[0]]=(ms.got[d[0]]||0)+d[1];
    if(ty==='Golem'){ms.boss=1;sfx.win();toast('Chefe derrotado! Ele soltou uma chave 🔑\nProcure o baú trancado da caverna.',5000);save()}else toast(`+${d[1]} ${d[0]}`);render()}}
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&!uiOpen()&&ctl.fine&&!ctl.noLock)setPause(true)});
$('play').addEventListener('click',()=>{ctl.lock();initAudio()});addEventListener('pointerdown',initAudio);addEventListener('keydown',initAudio);
ms.seed=seed;$('mission').onclick=()=>$('mission').classList.toggle('open');if(pl.g.position.x>100)pl.g.position.set(CAVE_OUT[0],0,CAVE_OUT[1]);
const CH=[CAVE_C[0]-8,CAVE_C[1]+8],chestG=makeBuild('Baú');chestG.position.set(CH[0],0,CH[1]);chestG.rotation.y=Math.atan2(8,-8);scene.add(chestG);col.push({x:CH[0],z:CH[1],r:.9});
function openLid(){const l=chestG.children[1];l.rotation.x=-.9;l.position.set(0,.7,-.28)}
function revealSecret(){for(const r of res)if(r.secret&&r.mesh.position.y<0){r.mesh.position.y=.4;r.rad=.7;col.push({x:r.x,z:r.z,r:.7})}}
function chestAct(){if(ms.chest){toast('O baú está vazio.');return}
  if(!has(inv,'Chave')){toast('Trancado! A chave está com o Golem.');return}
  remove(inv,'Chave');sfx.chest();ms.chest=1;ms.map=1;inv.Mapa=1;openLid();revealSecret();setMarker();toast('Você abriu o baú e achou um Mapa 🗺️!\nUm ponto foi marcado na praia (feixe azul).',6000);render();save()}
if(ms.chest)openLid();if(ms.map)revealSecret();
function fade(fn){busy=true;$('fade').style.opacity=1;setTimeout(()=>{fn();$('fade').style.opacity=0;busy=false},300)}
function enterCave(){sfx.portal();fade(()=>{inCave=true;pl.h=[CAVE_C[0],CAVE_C[1],12.4];pl.g.position.set(CAVE_C[0],0,CAVE_C[1]-8.5);ctl.yaw=0;ctl.pitch=fp?0:.35;setMarker();mon.clear(CAVE_C[0],CAVE_C[1],40);
  const hm=[CAVE_C[0],CAVE_C[1],12];if(!ms.boss)mon.spawnAt('Golem',CAVE_C[0],CAVE_C[1]+6,hm);
  for(let i=0;i<4;i++){const a=.5+Math.random()*2.1,d=5+Math.random()*5;mon.spawnAt('Cavernoso',CAVE_C[0]+Math.cos(a)*d*(Math.random()<.5?1:-1),CAVE_C[1]+Math.sin(a)*d,hm)}
  toast(ms.boss?'A caverna está silenciosa...':'Uma caverna escura... Derrote o Golem: ele guarda a chave de um baú!',4500)})}
function exitCave(now){sfx.portal();const go=()=>{inCave=false;pl.h=null;mon.clear(CAVE_C[0],CAVE_C[1],40);pl.g.position.set(CAVE_OUT[0],0,CAVE_OUT[1]);ctl.yaw=CAVE_YAW;applyCfg();setMarker()};if(now)go();else fade(go)}
for(const[i,l]of gone){const r=res[i];if(!r)continue;r.mesh.visible=false;r.t0=performance.now()-(180000-l);const k=col.findIndex(c=>c.x===r.x&&c.z===r.z);if(k>=0)col.splice(k,1)}
const CK='ilha-perdida-cfg',Q={baixa:{pr:1,fn:25,ff:90},media:{pr:1.25,fn:40,ff:140},alta:{pr:1.75,fn:60,ff:200}};let cfg={q:null,sens:1,vol:.6};try{cfg={...cfg,...JSON.parse(localStorage.getItem(CK))}}catch{}
if(!Q[cfg.q])cfg.q=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent)?'baixa':'media';
function applyCfg(){const q=Q[cfg.q];rd.setPixelRatio(Math.min(devicePixelRatio,q.pr));resize();fog.near=q.fn;fog.far=q.ff;ctl.sens=cfg.sens;setVolume(cfg.vol);$('vol').value=cfg.vol;
  document.querySelectorAll('#qSeg button').forEach(b=>b.classList.toggle('on',b.dataset.q===cfg.q));$('sens').value=cfg.sens;$('pView').textContent='Câmera: '+(fp?'1ª pessoa':'3ª pessoa')+' (toque para trocar)';try{localStorage.setItem(CK,JSON.stringify(cfg))}catch{}}
function setPause(v){paused=v;$('pause').hidden=!v;if(v){save();applyCfg()}else ctl.lock()}
$('bPause').onclick=()=>setPause(true);$('pResume').onclick=()=>setPause(false);$('pSave').onclick=()=>{save();toast('Jogo salvo')};
$('qSeg').onclick=e=>{const b=e.target.closest('button');if(b){cfg.q=b.dataset.q;applyCfg()}};$('sens').oninput=e=>{cfg.sens=+e.target.value;applyCfg()};$('vol').oninput=e=>{cfg.vol=+e.target.value;applyCfg()};
$('pView').onclick=()=>{ctl.camT=true;setTimeout(applyCfg,80)};let nt=0;
$('pNew').onclick=()=>{if(!nt){$('pNew').textContent='Tem certeza? Toque de novo';nt=setTimeout(()=>{nt=0;$('pNew').textContent='Reiniciar jogo (apaga o progresso)'},3000)}else{localStorage.removeItem(KEY);location.reload()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&$('start').style.display==='none')setPause(true)});applyCfg();

function setView(){pl.g.visible=!fp;cam.fov=fp?75:60;cam.updateProjectionMatrix();$('cross').style.display='block'}setView();ctl.pitch=fp?0:.35;
function startBuild(t){panel(false);const g=makeBuild(t);g.traverse(o=>{if(o.material&&!o.material.isMeshBasicMaterial){o.material.transparent=true;o.material.opacity=.65}});scene.add(g);bd={t,g,ok:false,x:0,z:0};toast('Modo construção: ande até o local')}
function endBuild(){if(!bd)return;scene.remove(bd.g);bd.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});bd=null;$('prompt').textContent=''}
const save=()=>{try{const n=performance.now();localStorage.setItem(KEY,JSON.stringify({inv,st,tm,pos:pl.g.position.toArray(),builds,fp,ms,gone:res.map((r,i)=>r.mesh.visible?null:[i,Math.max(0,180000-(n-(r.t0||n)))]).filter(Boolean)}))}catch{}};setInterval(save,5000);
let open=false,tt=0;
const toast=(t,d2=2200)=>{const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>e.style.opacity=0,d2)};
const HB=['Mão','Lança','Machado','Picareta','Fruta'];
const eq=()=>ms.eq&&has(inv,ms.eq)?ms.eq:'Mão';
function renderHB(){$('hotbar').innerHTML=HB.map((n,i)=>{const own=n==='Mão'||has(inv,n);return `<div class="hs${eq()===n?' sel':''}${own?'':' off'}" data-n="${n}"><b>${n==='Mão'?'✋':ICON[n]}</b>${n==='Fruta'?`<em>${inv.Fruta||0}</em>`:''}<small>${i+1}</small></div>`}).join('')}
function useSlot(n){if(n==='Fruta'){eat();return}if(n!=='Mão'&&!has(inv,n)){toast(`Você ainda não tem: ${n} (fabrique na mochila)`);return}ms.eq=n==='Mão'?null:n;renderHB();toast(n==='Mão'?'Mão livre':`Equipado: ${n}`)}
$('hotbar').onclick=e=>{const s=e.target.closest('[data-n]');if(s)useSlot(s.dataset.n)};
function render(){const sl=Object.entries(inv).filter(([,v])=>v>0);
 $('inv').innerHTML=sl.map(([k,v])=>`<span>${ICON[k]||''} ${v}</span>`).join('');renderHB();if(!open)return;
 $('cap').textContent=`${sl.length}/${SLOTS} espaços`;
 $('grid').innerHTML=Array.from({length:SLOTS},(_,i)=>sl[i]?`<div class="slot" data-n="${sl[i][0]}"><b>${ICON[sl[i][0]]||'?'}</b><em>${sl[i][1]}</em><small>${sl[i][0]}</small></div>`:'<div class="slot"></div>').join('');
 $('rec').innerHTML=RECIPES.map((r,i)=>`<div class="rc"><b>${ICON[r.n]} ${r.n}</b><small>${Object.entries(r.c).map(([k,v])=>`${ICON[k]}${v}${has(inv,k,v)?'':'✗'}`).join(' ')}${r.need?` · precisa ${ICON[r.need]}`:''}</small><button data-i="${i}" ${canCraft(inv,r,builds)?'':'disabled'}>Fabricar</button></div>`).join('')}
function eat(){if(remove(inv,'Fruta')){st.f=Math.min(100,st.f+25);animEat=.7;sfx.eat();toast('Você comeu uma fruta');render()}else toast('Sem frutas')}
function panel(v=!open){open=v;$('panel').hidden=!open;render();if(!open)ctl.lock()}
$('grid').onclick=e=>{const s=e.target.closest('[data-n]');if(s&&s.dataset.n==='Fruta')eat();else if(s&&s.dataset.n==='Mapa'){const sr=res.find(r=>r.secret);if(sr)toast(`📍 Ponto marcado: x ${Math.round(sr.x)}, z ${Math.round(sr.z)}`)}else if(s&&DEFS[s.dataset.n])startBuild(s.dataset.n)};
$('rec').onclick=e=>{const b=e.target.closest('button');if(!b)return;const r=RECIPES[b.dataset.i],er=craft(inv,r,builds);if(!er&&['Lança','Machado','Picareta'].includes(r.n))ms.eq=r.n;if(!er)sfx.craft();toast(er||`Fabricado: ${r.n}!`);render();save()};
$('close').onclick=()=>panel(false);addEventListener('keydown',e=>{if(e.code==='KeyF'&&!open&&!paused)eat();if(/^Digit[1-5]$/.test(e.code)&&!open&&!paused)useSlot(HB[+e.code[5]-1]);if(e.code==='Escape'){if(bd)endBuild();else if(open)panel(false);else setPause(!paused)}});render();
$('reset').onclick=()=>{localStorage.removeItem(KEY);location.reload()};
function resize(){rd.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
const sky=[new T.Color(0x0a1030),new T.Color(0x87ceeb)],clk=new T.Clock();let tgt=null,cur=null,prog=0,mt=null,atk=0,animEat=0,bt=0,stT=0,aph=0;
const setT=(id,t)=>{const e=$(id);if(e.textContent!==t)e.textContent=t};
function loop(){const raw=Math.min(clk.getDelta(),.05),dt=paused?0:raw;ctl.poll();if((open||paused||fin)&&document.pointerLockElement)document.exitPointerLock();$('lockhint').style.display=ctl.fine&&!ctl.noLock&&!ctl.locked()&&!uiOpen()?'block':'none';ctl.sp=st.e<=0?.6:st.e<20?.8:1;if(st.e<=10)ctl.run=false;if(ctl.camT){ctl.camT=false;fp=!fp;ctl.pitch=fp?0:.35;setView();toast(fp?'Primeira pessoa':'Terceira pessoa');save()}
  if(ctl.invT){ctl.invT=false;if(paused);else if(bd)endBuild();else panel()}if(!open&&!fin&&!paused&&!busy)pl.update(dt,ctl,ctl.yaw);else ctl.act=false;
  const p=pl.g.position,d=7,cy=ctl.yaw,cp=ctl.pitch;
  if(fp){cam.position.set(p.x,p.y+1.75,p.z);cam.lookAt(p.x+Math.sin(cy)*Math.cos(cp),p.y+1.75-Math.sin(cp),p.z+Math.cos(cy)*Math.cos(cp))}
  else{const tp=Math.max(.05,cp);cam.position.set(p.x-Math.sin(cy)*d*Math.cos(tp),p.y+2+d*Math.sin(tp),p.z-Math.cos(cy)*d*Math.cos(tp));cam.lookAt(p.x,p.y+1.6,p.z)}
  const t0=tm;tm=(tm+dt*24/240)%24;if(tm<t0)ms.days++;const day=Math.max(0,Math.sin((tm-6)/12*Math.PI)),c=bgc.copy(sky[0]).lerp(sky[1],day);fog.color.copy(c);
  sun.intensity=.2+1.4*day;amb.intensity=.25+.5*day;sun.position.set(Math.cos((tm-6)/12*Math.PI)*60,Math.max(10,Math.sin((tm-6)/12*Math.PI)*60),20);
  if(inCave){bgc.setHex(0x050507);fog.color.copy(bgc);fog.near=3;fog.far=36;sun.intensity=.15;amb.intensity=.75}
  st.f=Math.max(0,st.f-dt*.15);const rest=builds.some(b=>(b.t==='Fogueira'&&Math.hypot(b.x-p.x,b.z-p.z)<5)||(b.t==='Abrigo'&&Math.hypot(b.x-p.x,b.z-p.z)<2.6));
  st.e=Math.min(100,Math.max(0,st.e+(ctl.run&&(ctl.mx||ctl.mz)?-dt*2:dt*1)+(rest?dt*3:0)));const ft=performance.now()/90;fl.forEach((f,i)=>f.scale.set(1,1+.25*Math.sin(ft+i),1));
  if(st.f<=0)st.v=Math.max(0,st.v-dt*.5);else if(st.f>50&&st.e>20)st.v=Math.min(100,st.v+dt*.3);
  const night=day<.2,inSh=builds.some(b=>b.t==='Abrigo'&&Math.hypot(b.x-p.x,b.z-p.z)<2.6);
  if(st.v<=0){st={v:50,f:40,e:40};if(inCave)exitCave(true);pl.g.position.set(0,0,0);mon.clear(0,0,18);w.f=w.e=w.v=0;toast('Você desmaiou e acordou no centro da ilha. Procure comida e descanse!');save()}
  if(st.f<25&&!w.f){w.f=1;toast('Você está com fome! Coma uma fruta (F)')}if(st.f>=40)w.f=0;
  if(st.e<20&&!w.e){w.e=1;toast('Cansaço: fique perto da fogueira ou do abrigo para descansar')}if(st.e>=40)w.e=0;
  if(st.v<30&&!w.v){w.v=1;toast('Vida baixa!')}if(st.v>=50)w.v=0;
  hurt=Math.max(0,hurt-dt*1.5);$('vig').style.opacity=Math.max(hurt,st.v<30?Math.min(.7,(30-st.v)/30):0);
  if(!busy&&!fin&&!paused){if(!inCave&&Math.hypot(p.x-CAVE_IN[0],p.z-CAVE_IN[1])<2.2)enterCave();else if(inCave&&Math.hypot(p.x-CAVE_C[0],p.z-(CAVE_C[1]-12.5))<1.8)exitCave()}
  const bs=inCave&&mon.list.find(q=>q.type==='Golem');$('boss').hidden=!bs;if(bs)$('bossv').style.width=Math.max(0,bs.hp/bs.max*100)+'%';
  atk=Math.max(0,atk-dt);if(night&&!ms.warn&&!inCave){ms.warn=1;toast('A noite chegou: criaturas surgem! Fique perto de uma fogueira ou dentro do abrigo.',5000)}
  if(!fin){const fires=builds.filter(b=>b.t==='Fogueira');mon.update(dt,{x:p.x,z:p.z,night,sheltered:inSh,fire:(x,z)=>{for(const b of fires)if(Math.hypot(b.x-x,b.z-z)<7)return[b.x,b.z];return null},hurt:d=>{st.v=Math.max(0,st.v-d);hurt=.6;sfx.hurt()}})}
  tgt=null;if(!open&&!bd){cam.updateMatrixWorld();const fw=cam.getWorldDirection(V),ex=cam.position;let best=9;
    for(const r of res){if(!r.mesh.visible)continue;if(r.secret&&!ms.map)continue;if(Math.hypot(r.x-p.x,r.z-p.z)-(r.rad||0)>3.6)continue;
      const tr=r.type==='Madeira',vx=r.x-ex.x,vy=(tr?1.6:.6)-ex.y,vz=r.z-ex.z,L=Math.hypot(vx,vy,vz),ang=Math.acos(Math.min(1,(vx*fw.x+vy*fw.y+vz*fw.z)/L)),tol=Math.atan2(tr?1.1:(r.rad||.5)+.25,L)+.1;
      if(ang<tol&&ang<best){best=ang;tgt=r}}}
  mt=null;if(!open&&!bd){const fw=cam.getWorldDirection(V),ex=cam.position;let best=9;for(const m of mon.list){const mp=m.g.position;if(Math.hypot(mp.x-p.x,mp.z-p.z)>2.6+m.D.r)continue;
    const vx=mp.x-ex.x,vy=(m.type==='Sombra'?1.2:m.type==='Golem'?1.8:.5)-ex.y,vz=mp.z-ex.z,L=Math.hypot(vx,vy,vz),ang=Math.acos(Math.min(1,(vx*fw.x+vy*fw.y+vz*fw.z)/L)),tol=Math.atan2(m.D.r+.5,L)+.12;if(ang<tol&&ang<best){best=ang;mt=m}}}
  if(mt)tgt=null;
  if(tgt!==cur){if(cur){tint(cur,0);cur.mesh.position.x=cur.x}cur=tgt;prog=0}
  const hold=ctl.hit&&!open&&!bd&&!paused,needP=cur&&cur.type==='Minério'&&eq()!=='Picareta';
  if(cur&&hold&&!needP){bt-=dt;if(bt<=0){bt=.33;sfx[cur.type==='Madeira'?'chop':'pick']()}prog+=dt/dur(cur);tint(cur,prog);cur.mesh.position.x=cur.x+Math.sin(performance.now()/25)*.04;if(prog>=1){collect(cur);cur=null;prog=0}}
  else if(cur&&prog>0){prog=Math.max(0,prog-dt*1.5);tint(cur,prog);cur.mesh.position.x=cur.x}
  {animEat=Math.max(0,animEat-dt);const en=animEat>0?'Fruta':eq();if(en!==lastEq){lastEq=en;pl.setTool(en);setFPTool(en)}
   stT-=dt;if(ctl.mx*ctl.mx+ctl.mz*ctl.mz>.04&&p.y<.05&&!open&&!paused&&!busy&&stT<=0){stT=ctl.run?.26:.4;sfx.step()}
   const sw=animEat>0||(hold&&cur&&!needP)||atk>0,kd=animEat>0?'eat':eq(),per={Machado:.7,Picareta:.8,Lança:.55,Mão:.45,eat:.7}[kd]||.5;
   if(animEat>0)aph=1-animEat/.7;else if(sw)aph=(aph+dt/per)%1;else aph=0;
   ctl.anim={on:sw,kind:kd,p:aph};fpH.visible=fp;let rx=0,px=.5,py=-.5,pz=-.85;
   if(sw){const p=aph,sn=Math.max(0,Math.sin(p*6.283));
     if(kd==='Machado'||kd==='Picareta'){const a=kd==='Machado'?[.9,-.7,.6]:[1.1,-.8,.5];rx=p<a[2]?a[0]*(p/a[2]):a[0]+(a[1]-a[0])*((p-a[2])/(1-a[2]));py=-.5+.15*Math.max(0,rx)}
     else if(kd==='eat'){const mm=Math.sin(p*Math.PI);px=.5-.38*mm;py=-.5+.3*mm;pz=-.85+.25*mm;rx=.7*mm}
     else{pz=-.85-.45*sn;rx=kd==='Lança'?-.1:0}}
   fpH.rotation.x=rx;fpH.position.set(px,py,pz)}
  $('brk').style.display=cur&&prog>0?'block':'none';$('brk').firstChild.style.width=prog*100+'%';
  $('prompt').textContent=mt?`${mt.type}: clique para atacar`:cur?(needP?'Minério: equipe a Picareta (barra de itens)':`${cur.type}: segure o botão esquerdo (ou E)`):'';
  if(bd){const ry=fp?ctl.yaw:pl.g.rotation.y,x=p.x+Math.sin(ry)*3.6,z=p.z+Math.cos(ry)*3.6,rr=DEFS[bd.t].r;
    bd.ok=Math.hypot(x,z)<R-6&&col.every(c=>Math.hypot(c.x-x,c.z-z)>rr+c.r+.2);bd.x=x;bd.z=z;bd.g.position.set(x,0,z);bd.g.rotation.y=ry+Math.PI;
    bd.g.traverse(o=>{if(o.material&&o.material.emissive)o.material.emissive.setHex(bd.ok?0x0a5a0a:0x7a0a0a)});
    $('prompt').textContent=bd.ok?`[E] Colocar ${bd.t} · [I] cancelar`:'Local inválido, mova-se · [I] cancelar'}
  if(!bd&&!cur&&inSh)$('prompt').textContent=night?'[E] Dormir':'Só dá para dormir à noite';
  const nr=!bd&&!cur&&Math.hypot(RADIO[0]-p.x,RADIO[1]-p.z)<3.2;
  if(nr)$('prompt').textContent=!ms.radio?(has(inv,'Peça',4)?'[E] Consertar o rádio':'Rádio quebrado: faltam 4 peças'):ms.sent?'':'[E] Enviar sinal de socorro';
  const nc=inCave&&!cur&&!mt&&!bd&&Math.hypot(p.x-CH[0],p.z-CH[1])<2.6;if(nc)$('prompt').textContent=ms.chest?'Baú vazio':has(inv,'Chave')?'[E] Abrir o baú':'Baú trancado: o Golem tem a chave';
  chk();if((fc++&15)===0)updMission();const tn=performance.now();if(marker.visible)marker.material.opacity=.3+.15*Math.sin(tn/300);if(marker2.visible)marker2.material.opacity=.35+.15*Math.sin(tn/250);if(ms.sent&&!ms.done)radio.userData.led.visible=Math.sin(tn/120)>0;
  if(ctl.act){ctl.act=false;if(mt&&!bd){attack()}else if(!bd&&!cur&&inSh&&night){if(tm>=18)ms.days++;tm=6;st.e=100;st.v=Math.min(100,st.v+30);st.f=Math.max(0,st.f-20);toast('Você dormiu. Bom dia!');save()}else if(nc){chestAct()}else if(nr){radioAct()}else if(bd){if(bd.ok&&remove(inv,bd.t)){const b={t:bd.t,x:bd.x,z:bd.z,ry:bd.g.rotation.y};builds.push(b);spawn(b);sfx.build();toast(`${b.t} construída!`);endBuild();render();save()}}}
  setT('nv','❤ '+Math.round(st.v));setT('nf','🍖 '+Math.round(st.f));setT('ne','⚡ '+Math.round(st.e));$('bv').style.width=st.v+'%';$('bf').style.width=st.f+'%';$('be').style.width=st.e+'%';
  $('clock').textContent=String(Math.floor(tm)).padStart(2,'0')+':'+String(Math.floor(tm%1*60)).padStart(2,'0');
  rd.render(scene,cam);requestAnimationFrame(loop)}
loop();if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js');
