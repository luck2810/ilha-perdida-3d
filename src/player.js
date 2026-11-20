import * as T from 'three';
import{R}from'./world.js';
import{makeTool}from'./tools.js';
const m=(c)=>new T.MeshLambertMaterial({color:c,flatShading:true});
export class Player{
  constructor(scene,col){this.col=col;this.g=new T.Group();this.vy=0;this.t=0;
    const b=(w,h,d,c,x,y)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m(c));o.position.set(x,y,0);return o};
    this.body=b(.7,.9,.4,0xd35400,0,1.35);this.head=b(.55,.55,.55,0xf0c08a,0,2.1);
    this.armL=b(.22,.8,.22,0xf0c08a,-.5,1.4);this.armR=b(.22,.8,.22,0xf0c08a,.5,1.4);
    this.legL=b(.28,.9,.3,0x2c3e50,-.18,.45);this.legR=b(.28,.9,.3,0x2c3e50,.18,.45);
    this.g.add(this.body,this.head,this.armL,this.armR,this.legL,this.legR);this.g.position.set(0,0,0);scene.add(this.g);}
  setModel(m){[this.body,this.head,this.armL,this.armR,this.legL,this.legR].forEach(o=>o.visible=false);if(this.model)this.g.remove(this.model);this.model=m;this.g.add(m);const f=n=>m.getObjectByName(n);this.pt={legL:f('legL'),legR:f('legR'),armL:f('armL'),armR:f('armR'),body:f('body'),head:f('head')};this.setTool(this.tn)}
  setTool(n){this.tn=n;if(this.tool&&this.tool.parent)this.tool.parent.remove(this.tool);this.tool=null;const a=this.pt&&this.pt.armR;if(!a||!n||n==='Mão')return;this.tool=makeTool(n);this.tool.position.set(0,-.6,.12);this.tool.rotation.x=1.0;a.add(this.tool)}
  update(dt,i,yaw){
    const sp=(i.run?8:4.5)*(i.sp||1),dx=i.mx,dz=i.mz,len=Math.hypot(dx,dz);
    if(len>.05){const s=Math.sin(yaw),c=Math.cos(yaw);const vx=(-dx*c+dz*s)/Math.max(1,len),vz=(dx*s+dz*c)/Math.max(1,len);
      this.g.position.x+=vx*sp*dt;this.g.position.z+=vz*sp*dt;this.g.rotation.y=Math.atan2(vx,vz);
      this.t+=dt*sp*1.6;const w=Math.sin(this.t)*.7;this.armL.rotation.x=w;this.armR.rotation.x=-w;this.legL.rotation.x=-w;this.legR.rotation.x=w;}
    else{[this.armL,this.armR,this.legL,this.legR].forEach(p=>p.rotation.x*=.8)}
    const p=this.g.position;
    if(i.jump&&p.y<=0.001)this.vy=7;this.vy-=20*dt;p.y=Math.max(0,p.y+this.vy*dt);if(p.y===0)this.vy=0;
    for(const c of this.col){const ex=p.x-c.x,ez=p.z-c.z,d=Math.hypot(ex,ez),mn=c.r+.4;if(d<mn&&d>0){p.x=c.x+ex/d*mn;p.z=c.z+ez/d*mn}}
    const h=this.h||[0,0,R],ex=p.x-h[0],ez=p.z-h[1],d=Math.hypot(ex,ez);if(d>h[2]){p.x=h[0]+ex*h[2]/d;p.z=h[1]+ez*h[2]/d}
    if(this.model&&this.pt){const q=this.pt,mv=len>.05,air=p.y>.03,k=1-Math.exp(-dt*18),amp=i.run?.95:.6,w=mv?Math.sin(this.t)*amp:0,id=Math.sin(performance.now()/600)*.04;
      const tg=air?{lx:.5,rx:-.5,ax:-.4,bx:-.4,az:.35}:{lx:w,rx:-w,ax:-w,bx:w,az:0};
      q.legL.rotation.x+=(tg.lx-q.legL.rotation.x)*k;q.legR.rotation.x+=(tg.rx-q.legR.rotation.x)*k;
      q.armL.rotation.x+=(tg.ax+(mv||air?0:id)-q.armL.rotation.x)*k;let rx=tg.bx+(mv||air?0:id);const A=i.anim;if(A&&A.on){const p=A.p,kd=A.kind;if(kd==='Machado')rx=p<.6?-2.4*(p/.6):-2.4+1.9*((p-.6)/.4);else if(kd==='Picareta')rx=p<.5?-2.6*(p/.5):-2.6+2.1*((p-.5)/.5);else if(kd==='eat')rx=-2.1+.15*Math.sin(p*18);else rx=-1.1-.6*Math.max(0,Math.sin(p*6.283))}
      q.armR.rotation.x+=(rx-q.armR.rotation.x)*k;
      q.armL.rotation.z+=(-tg.az-q.armL.rotation.z)*k;q.armR.rotation.z+=(tg.az-q.armR.rotation.z)*k;
      this.model.position.y=mv&&!air?Math.abs(Math.sin(this.t))*.07:0;this.model.rotation.x+=((mv?(i.run?.14:.07):0)-this.model.rotation.x)*k}
  }
}
