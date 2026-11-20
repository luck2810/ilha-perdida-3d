import{CAVE_IN}from'./world.js';
export const WRECK=[54,6],RADIO=[8,-6];
const n=(g,k,m)=>Math.min(g.got[k]||0,m);
export const MISSIONS=[
 {t:'Acordar na ilha',d:()=>'Você está confuso. Levante e ande pela praia.',ok:g=>Math.hypot(g.p.x-g.ms.s[0],g.p.z-g.ms.s[1])>12,m:'Você precisa de recursos para sobreviver.'},
 {t:'Encontrar recursos',d:g=>`Mire e segure o botão esquerdo (ou E): madeira ${n(g,'Madeira',8)}/8 · pedra ${n(g,'Pedra',4)}/4 · fibra ${n(g,'Fibra',3)}/3`,ok:g=>(g.got.Madeira||0)>=8&&(g.got.Pedra||0)>=4&&(g.got.Fibra||0)>=3,m:'Abra a mochila (I) e fabrique uma Bancada e um Abrigo.'},
 {t:'Construir um abrigo',d:()=>'Fabrique Bancada e Abrigo na mochila (I) e coloque o abrigo no chão.',ok:g=>g.builds.some(b=>b.t==='Abrigo'),m:'Um lugar seguro! Há um naufrágio na praia a leste.'},
 {t:'Explorar o naufrágio',d:()=>'Siga o feixe de luz até o naufrágio, na praia a leste.',target:WRECK,ok:g=>Math.hypot(g.p.x-WRECK[0],g.p.z-WRECK[1])<9,m:'Há caixas azuis com peças de rádio, espalhadas pela ilha.'},
 {t:'Encontrar peças para o rádio',d:g=>`Peças: ${n(g,'Peça',4)}/4. Três estão em caixas azuis nas praias. A quarta está enterrada: pegue a chave com o chefe da caverna (entrada preta na montanha), abra o baú lá dentro e siga o mapa.`,
  target:g=>{let b=null,bd=1e9;for(const r of g.res)if(r.type==='Peça'&&r.mesh.visible&&(!r.secret||g.ms.map)){const d=Math.hypot(r.x-g.p.x,r.z-g.p.z);if(d<bd){bd=d;b=[r.x,r.z]}}return b||CAVE_IN},ok:g=>(g.got.Peça||0)>=4,m:'Com as 4 peças dá para consertar o rádio, perto do centro da ilha.'},
 {t:'Consertar o rádio',d:()=>'Leve as 4 peças ao rádio quebrado e aperte E.',target:RADIO,ok:g=>g.ms.radio,m:'O rádio ligou! Envie o pedido de socorro.'},
 {t:'Enviar sinal de socorro',d:()=>'Aperte E perto do rádio para pedir socorro.',target:RADIO,ok:g=>g.ms.sent,m:'Sinal enviado!'}];
