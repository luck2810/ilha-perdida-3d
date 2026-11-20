export function setupControls(canvas){
  const s={mx:0,mz:0,run:false,jump:false,act:false,yaw:0,pitch:.35,sens:1},k={};
  const fine=matchMedia('(pointer:fine)').matches;s.fine=fine;s.noLock=false;s.canLock=()=>true;s.locked=()=>document.pointerLockElement===canvas;
  s.lock=()=>{if(!fine||s.noLock||document.pointerLockElement)return;try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{s.noLock=true})}catch{s.noLock=true}};
  document.addEventListener('pointerlockerror',()=>{s.noLock=true});
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){s.yaw-=e.movementX*.0025*s.sens;s.pitch=Math.min(1.2,Math.max(-1.2,s.pitch+e.movementY*.0025*s.sens))}});
  const clr=()=>{for(const x in k)k[x]=0;s.mr=s.ah=false};
  addEventListener('keydown',e=>{if(e.code==='Space')e.preventDefault();if(e.repeat)return;k[e.code]=1;if(e.code==='KeyE')s.act=true;if(e.code==='KeyI')s.invT=true;if(e.code==='KeyV')s.camT=true},true);addEventListener('keyup',e=>{k[e.code]=0},true);
  addEventListener('blur',clr);addEventListener('focusout',clr);document.addEventListener('visibilitychange',clr);
  let drag=false,lx=0,ly=0,camId=null;
  const mv=(x,y)=>{s.yaw-=(x-lx)*.006*s.sens;s.pitch=Math.min(1.2,Math.max(-1.2,s.pitch+(y-ly)*.005*s.sens));lx=x;ly=y};
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){if(e.button===0){if(fine&&!s.noLock&&!document.pointerLockElement&&s.canLock()){s.lock();return}s.mr=true;s.act=true}else if(e.button===2){drag=true;lx=e.clientX;ly=e.clientY}return}if(camId===null){camId=e.pointerId;lx=e.clientX;ly=e.clientY}});addEventListener('pointerup',e=>{if(e.pointerType==='mouse'){if(e.button===0)s.mr=false;else if(e.button===2)drag=false}else if(e.pointerId===camId)camId=null});window.addEventListener('contextmenu',e=>e.preventDefault(),true);const mb=e=>{if(e.pointerType&&e.pointerType!=='mouse')return;s.mr=!!(e.buttons&1)};['pointerdown','pointermove','pointerup','mousedown','mouseup','mousemove'].forEach(n=>window.addEventListener(n,mb,true));
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){if(drag)mv(e.clientX,e.clientY)}else if(e.pointerId===camId)mv(e.clientX,e.clientY)});addEventListener('pointercancel',e=>{if(e.pointerId===camId)camId=null});
  const touch='ontouchstart'in window;if(touch)document.body.classList.add('touch');
  const joy=document.getElementById('joy'),kn=document.getElementById('knob');let joyId=null,jx=0,jz=0;
  joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);upd(e)});
  const upd=e=>{const r=joy.getBoundingClientRect(),x=(e.clientX-r.left-60)/50,y=(e.clientY-r.top-60)/50,l=Math.min(1,Math.hypot(x,y)),a=Math.atan2(y,x);jx=Math.cos(a)*l;jz=Math.sin(a)*l;kn.style.transform=`translate(${jx*40}px,${jz*40}px)`};
  joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)upd(e)});
  const rel=()=>{joyId=null;jx=jz=0;kn.style.transform=''};['pointerup','pointercancel','lostpointercapture'].forEach(n=>joy.addEventListener(n,rel));
  let jb=false;const bj=document.getElementById('bJump');bj.addEventListener('pointerdown',e=>{jb=true;bj.setPointerCapture(e.pointerId)});['pointerup','pointercancel'].forEach(n=>bj.addEventListener(n,()=>jb=false));
  const ba=document.getElementById('bAct');ba.addEventListener('pointerdown',e=>{s.act=true;s.ah=true;ba.setPointerCapture(e.pointerId)});['pointerup','pointercancel'].forEach(n=>ba.addEventListener(n,()=>s.ah=false));
  document.getElementById('bInv').addEventListener('pointerdown',()=>s.invT=true);
  document.getElementById('bCam').addEventListener('pointerdown',()=>s.camT=true);
  s.poll=()=>{s.mx=(k.KeyD?1:0)-(k.KeyA?1:0)+jx;s.mz=(k.KeyW?1:0)-(k.KeyS?1:0)-jz;s.hit=!!k.KeyE||s.mr||s.ah;s.run=!!(k.ShiftLeft||k.ShiftRight);s.jump=!!k.Space||jb};
  return s;
}
