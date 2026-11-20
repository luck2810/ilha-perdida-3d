import*as T from'three';
// Mesmo boneco do arquivo player_blocky.glb, feito por código (usado como reserva e na versão de teste).
const C={skin:0xf0c08a,shirt:0xd35400,shorts:0x2c5f8a,hair:0x4a2e1a,shoe:0x5a3b22,eye:0x1a1a1a};
const L=[(-.16),.16].map(x=>[x,.7,0]);
const legs=[['skin',0,-.29,0,.3,.58,.3],['shoe',0,-.64,.03,.32,.12,.38],['shorts',0,-.05,0,.32,.2,.32]];
const arms=[['skin',0,-.3,0,.24,.6,.26],['shirt',0,-.05,0,.26,.22,.28]];
const SPEC={legL:[[-.16,.7,0],legs],legR:[[.16,.7,0],legs],body:[[0,.7,0],[['shirt',0,.35,0,.7,.7,.4]]],armL:[[-.48,1.35,0],arms],armR:[[.48,1.35,0],arms],
 head:[[0,1.4,0],[['skin',0,.25,0,.5,.5,.5],['hair',0,.45,-.01,.54,.18,.54],['hair',0,.25,-.28,.54,.5,.06],['eye',-.12,.28,.255,.09,.09,.02],['eye',.12,.28,.255,.09,.09,.02]]]};
export function blockyModel(){const root=new T.Group();root.name='player';
  for(const[n,[p,bx]]of Object.entries(SPEC)){const g=new T.Group();g.name=n;g.position.set(...p);
    for(const[m,x,y,z,w,h,d]of bx){const o=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color:C[m],flatShading:true}));o.position.set(x,y,z);g.add(o)}root.add(g)}
  return root}
