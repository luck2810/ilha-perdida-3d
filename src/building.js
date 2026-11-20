import*as T from'three';
const mat=c=>new T.MeshLambertMaterial({color:c,flatShading:true});
const bx=(w,h,d,c,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));o.position.set(x,y,z);return o};
export const DEFS={Fogueira:{r:.9},Bancada:{r:1.1},Abrigo:{r:1.9},Baú:{r:.8}};
export function makeBuild(t){const g=new T.Group();
  if(t==='Fogueira'){for(let i=0;i<7;i++){const a=i/7*6.283,s=new T.Mesh(new T.DodecahedronGeometry(.22),mat(0x7d8187));s.position.set(Math.cos(a)*.6,.15,Math.sin(a)*.6);g.add(s)}
    const l1=bx(.9,.14,.14,0x6b4423,0,.14,0),l2=bx(.9,.14,.14,0x6b4423,0,.14,0);l1.rotation.y=.6;l2.rotation.y=-.6;g.add(l1,l2);
    const f=new T.Mesh(new T.ConeGeometry(.28,.8,5),new T.MeshBasicMaterial({color:0xff8c1a}));f.position.y=.55;g.add(f);g.userData.flame=f}
  else if(t==='Bancada'){g.add(bx(1.8,.12,.9,0x9c6b3a,0,.9,0));for(const x of[-.8,.8])for(const z of[-.35,.35])g.add(bx(.12,.9,.12,0x6b4423,x,.45,z));g.add(bx(1.6,.08,.7,0x7a4e2d,0,.35,0))}
  else if(t==='Abrigo'){g.add(bx(3,.15,3,0x8b6b43,0,.08,0),bx(3,2,.15,0x9c6b3a,0,1,-1.45),bx(.15,2,3,0x9c6b3a,-1.45,1,0),bx(.15,2,3,0x9c6b3a,1.45,1,0),bx(.15,2,.15,0x6b4423,-1.45,1,1.45),bx(.15,2,.15,0x6b4423,1.45,1,1.45));
    const r=new T.Mesh(new T.ConeGeometry(2.8,1.4,4),mat(0x7a4e2d));r.rotation.y=Math.PI/4;r.position.y=2.7;g.add(r)}
  else{g.add(bx(1,.5,.6,0x8b5a2b,0,.25,0),bx(1.04,.2,.64,0x6b4423,0,.6,0),bx(.12,.16,.04,0xf1c40f,0,.5,.32))}
  return g}
export function makeRadio(){const g=new T.Group();g.add(bx(1.4,.9,.8,0x39424a,0,.45,0),bx(.9,.5,.04,0x1d2328,0,.5,.42));
  const an=new T.Mesh(new T.CylinderGeometry(.04,.04,2.2,6),mat(0xb0b6bb));an.position.set(.5,2,0);g.add(an);
  const led=new T.Mesh(new T.SphereGeometry(.09,8,8),new T.MeshBasicMaterial({color:0xcc2222}));led.position.set(-.5,.75,.42);g.add(led);g.userData.led=led;return g}
