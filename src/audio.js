// Sons gerados por código (WebAudio), sem arquivos externos.
let ctx=null,mg=null,vol=.6,NB=null;
export function initAudio(){if(ctx){if(ctx.state==='suspended')ctx.resume();return}
  try{ctx=new(window.AudioContext||window.webkitAudioContext)();mg=ctx.createGain();mg.gain.value=vol;mg.connect(ctx.destination);ambient()}catch{ctx=null}}
export function setVolume(v){vol=v;if(mg)mg.gain.value=v}
const nbuf=()=>{const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
function tone(f,d,type='square',g=.2,sl=0,dl=0){if(!ctx)return;const t=ctx.currentTime+dl,o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.linearRampToValueAtTime(Math.max(30,f+sl),t+d);
  v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v);v.connect(mg);o.start(t);o.stop(t+d+.02)}
function noise(d,g=.2,fq=1500,dl=0){if(!ctx)return;NB=NB||nbuf();const t=ctx.currentTime+dl,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),v=ctx.createGain();s.buffer=NB;f.type='lowpass';f.frequency.value=fq;
  v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(v);v.connect(mg);s.start(t);s.stop(t+d+.02)}
function ambient(){NB=NB||nbuf();const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),v=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
  s.buffer=NB;s.loop=true;f.type='lowpass';f.frequency.value=380;v.gain.value=.05;l.frequency.value=.12;lg.gain.value=.03;l.connect(lg);lg.connect(v.gain);s.connect(f);f.connect(v);v.connect(mg);s.start();l.start()}
export const sfx={
  step:()=>noise(.05,.07,600),chop:()=>{noise(.09,.28,1800);tone(140,.1,'square',.12,-40)},pick:()=>{tone(1100,.06,'triangle',.18,-300);noise(.05,.15,4000)},
  pop:()=>{tone(520,.08,'sine',.2,300);tone(780,.1,'sine',.15,200,.06)},hit:()=>{noise(.1,.3,2500);tone(200,.1,'sawtooth',.14,-120)},
  hurt:()=>{tone(180,.28,'sawtooth',.25,-120);noise(.15,.2,800)},eat:()=>{[0,.12,.24].forEach(d=>noise(.07,.22,2200,d))},
  craft:()=>{tone(440,.1,'square',.14);tone(660,.14,'square',.14,0,.1)},build:()=>{noise(.12,.3,700);tone(120,.2,'square',.15,-30)},
  chest:()=>{tone(300,.12,'triangle',.2,200);tone(600,.2,'triangle',.2,300,.1)},portal:()=>{tone(200,.5,'sine',.25,600);noise(.4,.15,2500)},
  mission:()=>{[523,659,784].forEach((f,i)=>tone(f,.18,'triangle',.2,0,i*.1))},win:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.22,0,i*.12))},
  radio:()=>{tone(1200,.08,'square',.1);tone(900,.08,'square',.1,0,.1);noise(.2,.1,3000,.2)}};
