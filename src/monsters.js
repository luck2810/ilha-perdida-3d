import*as T from'three';
const mat=c=>new T.MeshLambertMaterial({color:c,flatShading:true});
const bx=(w,h,d,c,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));o.position.set(x,y,z);return o};
const eye=(c,w,h,x,y,z)=>{const e=new T.Mesh(new T.BoxGeometry(w,h,.05),new T.MeshBasicMaterial({color:c}));e.position.set(x,y,z);return e};
const TYPES={
 Slime:{hp:4,sp:2.2,dmg:6,r:.6,drop:['Fibra',2],make(){const g=new T.Group();g.add(bx(1.1,.9,1.1,0x6fd35a,0,.45,0),eye(0x111111,.18,.18,-.25,.6,.56),eye(0x111111,.18,.18,.25,.6,.56));return g}},
 Sombra:{hp:6,sp:3.3,dmg:10,r:.55,drop:['Pedra',1],make(){const g=new T.Group();g.add(bx(.8,1.3,.5,0x3b2a5c,0,1.15,0),bx(.6,.6,.6,0x2a1d44,0,2.05,0),bx(.2,.9,.2,0x3b2a5c,-.55,1.3,.2),bx(.2,.9,.2,0x3b2a5c,.55,1.3,.2),bx(.25,.6,.25,0x2a1d44,-.2,.3,0),bx(.25,.6,.25,0x2a1d44,.2,.3,0),eye(0xff2222,.14,.1,-.15,2.1,.31),eye(0xff2222,.14,.1,.15,2.1,.31));return g}},
 Cavernoso:{hp:5,sp:2.5,dmg:7,r:.6,drop:['Pedra',2],make(){const g=new T.Group();g.add(bx(1.1,.9,1.1,0x4a6fa5,0,.45,0),eye(0xffd23a,.2,.2,-.25,.6,.56),eye(0xffd23a,.2,.2,.25,.6,.56));return g}},
 Golem:{hp:40,sp:1.9,dmg:14,r:1.2,reach:2.6,stop:2.2,cdn:1.6,kb:.15,drop:['Chave',1],make(){const g=new T.Group();g.add(bx(1.6,1.8,1.1,0x5b5f66,0,1.7,0),bx(1.1,1,1,0x6d7178,0,3.1,0),bx(.6,1.7,.6,0x4a4d53,-1.2,1.9,.1),bx(.6,1.7,.6,0x4a4d53,1.2,1.9,.1),bx(.7,1,.7,0x44474c,-.45,.5,0),bx(.7,1,.7,0x44474c,.45,.5,0),eye(0xffa000,.25,.14,-.25,3.2,.53),eye(0xffa000,.25,.14,.25,3.2,.53));return g}}};
export function Monsters(scene,col,R){const list=[];let tsp=3;
  function add(type,x,z,home){const D=TYPES[type],g=D.make();g.position.set(x,0,z);scene.add(g);const m={type,D,g,hp:D.hp,max:D.hp,t:Math.random()*9,wa:Math.random()*6.283,wt:0,cd:0,flash:0,fs:false,kx:0,kz:0,leave:0,home:home||[0,0,R-2]};list.push(m);return m}
  function spawn(type,px,pz){const D=TYPES[type];for(let k=0;k<8;k++){const a=Math.random()*6.283,d=22+Math.random()*12,x=px+Math.cos(a)*d,z=pz+Math.sin(a)*d;
    if(Math.hypot(x,z)>R-5||col.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+D.r+.5))continue;add(type,x,z);return}}
  function remove(m){const i=list.indexOf(m);if(i<0)return;scene.remove(m.g);m.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});list.splice(i,1)}
  return{list,spawnAt:add,
    clear(x,z,r){for(const m of[...list])if(Math.hypot(m.g.position.x-x,m.g.position.z-z)<r)remove(m)},
    hit(m,dmg,px,pz){if(!list.includes(m))return false;m.hp-=dmg;m.flash=.15;const dx=m.g.position.x-px,dz=m.g.position.z-pz,l=Math.hypot(dx,dz)||1,k=m.D.kb??1;m.kx=dx/l*7*k;m.kz=dz/l*7*k;if(m.hp<=0){remove(m);return true}return false},
    update(dt,P){tsp-=dt;if(tsp<=0){tsp=P.night?5:9;const cn=list.filter(m=>m.type==='Sombra').length,cs=list.filter(m=>m.type==='Slime').length;if(P.night&&cn<5)spawn('Sombra',P.x,P.z);else if(!P.night&&cs<3)spawn('Slime',P.x,P.z)}
      for(const m of[...list]){const D=m.D,g=m.g,pos=g.position,hm=m.home;m.t+=dt;m.cd=Math.max(0,m.cd-dt);m.flash=Math.max(0,m.flash-dt);
        if(m.type==='Sombra'&&!P.night){m.leave+=dt;g.scale.setScalar(Math.max(.01,1-m.leave/2));if(m.leave>2){remove(m);continue}}
        const dx=P.x-pos.x,dz=P.z-pos.z,dist=Math.hypot(dx,dz)||1,fire=P.fire(pos.x,pos.z);let vx=0,vz=0,sp=D.sp,chase=false;
        if(fire){const fx=pos.x-fire[0],fz=pos.z-fire[1],l=Math.hypot(fx,fz)||1;vx=fx/l;vz=fz/l;sp*=1.3}
        else if(dist<(hm[0]?40:16)&&!P.sheltered){chase=true;if(dist>(D.stop||1.2)){vx=dx/dist;vz=dz/dist}}
        else{m.wt-=dt;if(m.wt<=0){m.wt=2+Math.random()*3;m.wa=Math.random()*6.283}vx=Math.cos(m.wa)*.5;vz=Math.sin(m.wa)*.5}
        if(chase&&dist<(D.reach||1.5)&&m.cd===0){P.hurt(D.dmg);m.cd=D.cdn||1.2}
        pos.x+=(vx*sp+m.kx)*dt;pos.z+=(vz*sp+m.kz)*dt;m.kx*=.85;m.kz*=.85;
        for(const c of col){const ex=pos.x-c.x,ez=pos.z-c.z;if(Math.abs(ex)>c.r+2.5||Math.abs(ez)>c.r+2.5)continue;const d=Math.hypot(ex,ez),mn=c.r+D.r;if(d<mn&&d>0){pos.x=c.x+ex/d*mn;pos.z=c.z+ez/d*mn}}
        const ex=pos.x-hm[0],ez=pos.z-hm[1],d0=Math.hypot(ex,ez);if(d0>hm[2]){pos.x=hm[0]+ex*hm[2]/d0;pos.z=hm[1]+ez*hm[2]/d0}
        if(vx||vz)g.rotation.y=Math.atan2(vx,vz);
        pos.y=(vx||vz)?(m.type==='Golem'?0:m.type==='Sombra'?Math.abs(Math.sin(m.t*5))*.08:Math.abs(Math.sin(m.t*7))*.35):0;
        const f=m.flash>0;if(f!==m.fs){m.fs=f;g.traverse(o=>{if(o.material&&o.material.emissive)o.material.emissive.setHex(f?0x992222:0)})}}}}}
