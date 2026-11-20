import * as T from 'three';
export const R=58;
const MA=.7,MX=Math.cos(MA)*34,MZ=Math.sin(MA)*34,UX=-Math.cos(MA),UZ=-Math.sin(MA);
export const CAVE_IN=[MX+UX*6.3,MZ+UZ*6.3],CAVE_OUT=[MX+UX*9.5,MZ+UZ*9.5],CAVE_C=[300,0],CAVE_YAW=Math.atan2(UX,UZ);
const m=(c)=>new T.MeshLambertMaterial({color:c,flatShading:true});
function rnd(s){return()=>(s=(s*16807)%2147483647)/2147483647}
export function buildWorld(scene,seed=1){
  const col=[],res=[],r=rnd(42),GTR=new T.CylinderGeometry(.3,.4,2.4,6),GLF=new T.ConeGeometry(1.6,3.4,6),GOR=new T.OctahedronGeometry(.8),GFI=new T.IcosahedronGeometry(.5),GBU=new T.IcosahedronGeometry(.6),GFR=new T.SphereGeometry(.18,6,6);
  const sea=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshLambertMaterial({color:0x2a8fbd}));sea.rotation.x=-Math.PI/2;sea.position.y=-0.3;scene.add(sea);
  const sand=new T.Mesh(new T.CylinderGeometry(R+4,R+6,1,32),m(0xe8d594));sand.position.y=-0.5;scene.add(sand);
  const grass=new T.Mesh(new T.CylinderGeometry(R-10,R-8,1.02,32),m(0x5fae4e));grass.position.y=-0.49;scene.add(grass);
  function add(mesh,x,z,rad,type,hp=3){mesh.position.x=x;mesh.position.z=z;scene.add(mesh);if(rad)col.push({x,z,r:rad});if(type)res.push({mesh,type,x,z,hp,rad});}
  function spot(rMin,rMax){const a=r()*6.283,d=rMin+r()*(rMax-rMin);return[Math.cos(a)*d,Math.sin(a)*d]}
  for(let i=0;i<55;i++){const[x,z]=spot(15,46);const g=new T.Group();
    const t=new T.Mesh(GTR,m(0x7a4e2d));t.position.y=1.2;
    const l=new T.Mesh(GLF,m(0x2f8f46));l.position.y=3.6;g.add(t,l);g.position.y=0;add(g,x,z,.8,'Madeira',3)}
  for(let i=0;i<22;i++){const[x,z]=spot(5,50);add(new T.Mesh(new T.DodecahedronGeometry(.9+r()*.5),m(0x8a8f94)),x,z,1,'Pedra',3);}
  for(let i=0;i<5;i++){const[x,z]=spot(28,48);add(new T.Mesh(GOR,m(0xc0763a)),x,z,.9,'Minério',4);}
  for(let i=0;i<30;i++){const[x,z]=spot(8,50);add(new T.Mesh(GFI,m(0x7dcc5a)),x,z,0,'Fibra',1);}
  for(let i=0;i<12;i++){const[x,z]=spot(10,45);const b=new T.Group();b.add(new T.Mesh(GBU,m(0x3d9a40)));const f=new T.Mesh(GFR,m(0xd62839));f.position.set(.4,.3,.3);b.add(f);b.position.y=.5;add(b,x,z,.6,'Fruta',1);}
  for(let i=0;i<4;i++){const a=i*1.57+.7,x=Math.cos(a)*34,z=Math.sin(a)*34;const mt=new T.Mesh(new T.ConeGeometry(7+i,12+i*2,7),m(0x777c80));mt.position.set(x,5,z);scene.add(mt);col.push({x,z,r:6+i});}
  {const fg=new T.ConeGeometry(.12,.35,4),ims=[0xff6b81,0xfeca57,0xffffff].map(c=>new T.InstancedMesh(fg,m(c),14)),cn=[0,0,0],dm=new T.Object3D();
   for(let i=0;i<40;i++){const[x,z]=spot(2,50),k=i%3;dm.position.set(x,.18,z);dm.updateMatrix();ims[k].setMatrixAt(cn[k]++,dm.matrix)}
   ims.forEach((im,k)=>{im.count=cn[k];im.frustumCulled=false;im.instanceMatrix.needsUpdate=true;scene.add(im)})}
  const wreck=new T.Mesh(new T.BoxGeometry(6,2,2.4),m(0x8b5a2b));wreck.position.set(R-4,.5,6);wreck.rotation.z=.2;scene.add(wreck);col.push({x:R-4,z:6,r:3});
  {const r2=rnd(seed),a0=r2()*6.283;for(let i=0;i<4;i++){const a=a0+i*1.571+(r2()-.5)*.6,d=51+r2()*5;let x=Math.cos(a)*d,z=Math.sin(a)*d;
    for(let k=0;k<8&&col.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+1.2);k++){x-=Math.cos(a)*1.5;z-=Math.sin(a)*1.5}
    const c=new T.Mesh(new T.BoxGeometry(1,.8,.8),m(0x5b7f95));
    if(i<3){c.position.y=.4;add(c,x,z,.7,'Peça',2)}else{c.position.y=-.6;add(c,x,z,0,'Peça',2);res[res.length-1].secret=true}}}
  for(const r of res){if(Math.hypot(r.x-CAVE_IN[0],r.z-CAVE_IN[1])<4.5){const l=Math.hypot(r.x-CAVE_IN[0],r.z-CAVE_IN[1])||1,ux=(r.x-CAVE_IN[0])/l,uz=(r.z-CAVE_IN[1])/l,c=col.find(c=>c.x===r.x&&c.z===r.z);r.x=CAVE_IN[0]+ux*5.2;r.z=CAVE_IN[1]+uz*5.2;r.mesh.position.x=r.x;r.mesh.position.z=r.z;if(c){c.x=r.x;c.z=r.z}}}
  {const g=new T.Group(),bq=(w,h,d,c,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m(c));o.position.set(x,y,z);return o};
   g.add(bq(.9,3.6,2.6,0x6e7279,-1.6,1.8,-.9),bq(.9,3.6,2.6,0x6e7279,1.6,1.8,-.9),bq(4.2,.9,2.6,0x6e7279,0,3.9,-.9));
   const door=new T.Mesh(new T.BoxGeometry(2.3,3.4,.3),new T.MeshBasicMaterial({color:0x000000}));door.position.set(0,1.7,-2.1);g.add(door);
   g.position.set(CAVE_IN[0],0,CAVE_IN[1]);g.rotation.y=Math.atan2(UX,UZ);scene.add(g);
   for(const s of[-1,1])col.push({x:CAVE_IN[0]-UZ*s*1.6,z:CAVE_IN[1]+UX*s*1.6,r:.5})}
  {const cx=CAVE_C[0],cz=CAVE_C[1],fl=new T.Mesh(new T.CylinderGeometry(14,14,1,24),m(0x2c2c33));fl.position.set(cx,-.5,cz);
   const wl=new T.Mesh(new T.CylinderGeometry(14,14,9,24,1,true),new T.MeshLambertMaterial({color:0x3a3a42,flatShading:true,side:T.BackSide}));wl.position.set(cx,4.5,cz);
   const ce=new T.Mesh(new T.CircleGeometry(14,24),new T.MeshLambertMaterial({color:0x222226,side:T.DoubleSide}));ce.rotation.x=Math.PI/2;ce.position.set(cx,9,cz);scene.add(fl,wl,ce);
   for(let i=0;i<7;i++){const a=i/7*6.283+.3,tc=new T.Mesh(new T.ConeGeometry(.22,.6,5),new T.MeshBasicMaterial({color:0xffa030}));tc.position.set(cx+Math.cos(a)*13.2,2.6,cz+Math.sin(a)*13.2);scene.add(tc)}
   [[-5,3],[6,-1],[-7,-4],[4,8]].forEach(([dx,dz],i)=>{const rk=new T.Mesh(new T.DodecahedronGeometry(1.1+i*.1),m(0x55565c));rk.position.set(cx+dx,.5,cz+dz);scene.add(rk);col.push({x:cx+dx,z:cz+dz,r:1.1})});
   const ex=new T.Mesh(new T.BoxGeometry(2.4,3.2,.3),new T.MeshBasicMaterial({color:0xa6f0ff}));ex.position.set(cx,1.6,cz-12.6);scene.add(ex);
   const lt=new T.PointLight(0xffc27a,1.4,40);lt.position.set(cx,6,cz);scene.add(lt)}
  return{col,res};
}
