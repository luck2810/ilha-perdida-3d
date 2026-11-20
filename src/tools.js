import*as T from'three';
const mat=c=>new T.MeshLambertMaterial({color:c,flatShading:true});
const bx=(w,h,d,c,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));o.position.set(x,y,z);return o};
const cy=(r,h,c,x,y,z)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,6),mat(c));o.position.set(x,y,z);return o};
// Ferramentas apontam para +Y (cabo na origem). O chamador gira para a posição da mão.
export function makeTool(n){const g=new T.Group();
  if(n==='Lança'){g.add(cy(.035,1.7,0x8b5a2b,0,.6,0),bx(.09,.06,.09,0x6b4423,0,.95,0));const tip=new T.Mesh(new T.ConeGeometry(.08,.32,5),mat(0xd5d9de));tip.position.y=1.6;g.add(tip)}
  else if(n==='Machado'){g.add(cy(.04,1,0x8b5a2b,0,.4,0),bx(.34,.28,.07,0x7d8187,.17,.84,0),bx(.07,.36,.09,0xdfe3e8,.36,.84,0))}
  else if(n==='Picareta'){g.add(cy(.04,1,0x8b5a2b,0,.4,0),bx(.85,.1,.1,0x6e7279,0,.95,0),bx(.1,.24,.1,0xaeb4ba,-.45,.86,0),bx(.1,.24,.1,0xaeb4ba,.45,.86,0))}
  else if(n==='Fruta'){const f=new T.Mesh(new T.IcosahedronGeometry(.15),mat(0xd62839));f.position.y=.12;const l=bx(.1,.03,.06,0x3d9a40,.06,.28,0);g.add(f,l)}
  return g}
