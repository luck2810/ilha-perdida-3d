export const ICON={Madeira:'🪵',Pedra:'🪨',Fibra:'🌿',Fruta:'🍎',Minério:'🔶',Machado:'🪓',Picareta:'⛏️',Fogueira:'🔥',Bancada:'🛠️',Abrigo:'⛺',Baú:'📦',Peça:'⚙️',Lança:'🗡️',Chave:'🔑',Mapa:'🗺️'};
export const SLOTS=12,STACK=99;
export const has=(inv,n,q=1)=>(inv[n]||0)>=q;
const used=inv=>Object.values(inv).filter(v=>v>0).length;
export function add(inv,n,q=1){const c=inv[n]||0;if(!c&&used(inv)>=SLOTS)return false;if(c+q>STACK)return false;inv[n]=c+q;return true}
export function remove(inv,n,q=1){if(!has(inv,n,q))return false;inv[n]-=q;return true}
