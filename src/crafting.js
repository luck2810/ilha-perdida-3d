import{has,add}from'./inventory.js';
export const RECIPES=[
 {n:'Machado',c:{Madeira:3,Pedra:2,Fibra:2}},{n:'Picareta',c:{Madeira:3,Pedra:3,Fibra:2}},
 {n:'Lança',c:{Madeira:3,Pedra:2,Fibra:1}},{n:'Fogueira',c:{Madeira:5,Pedra:3}},{n:'Bancada',c:{Madeira:8,Fibra:2}},
 {n:'Abrigo',c:{Madeira:12,Fibra:6,Pedra:4},need:'Bancada'},{n:'Baú',c:{Madeira:8,Minério:1},need:'Bancada'}];
export const canCraft=(inv,r,bs=[])=>Object.entries(r.c).every(([k,v])=>has(inv,k,v))&&(!r.need||has(inv,r.need)||bs.some(b=>b.t===r.need));
export function craft(inv,r,bs=[]){if(!canCraft(inv,r,bs))return'Faltam materiais';const t={...inv};for(const[k,v]of Object.entries(r.c))t[k]-=v;if(!add(t,r.n))return'Mochila cheia';Object.assign(inv,t);return null}
