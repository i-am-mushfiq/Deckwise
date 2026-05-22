export const hap={
  light:()=>{try{navigator.vibrate?.(25);}catch{}},
  medium:()=>{try{navigator.vibrate?.(50);}catch{}},
  success:()=>{try{navigator.vibrate?.([30,20,30]);}catch{}},
  error:()=>{try{navigator.vibrate?.([60,30,60]);}catch{}}
};

export let _actx=null;
export const actx=()=>{
  if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();
  if(_actx.state==="suspended")_actx.resume();
  return _actx;
};
export function nburst(dur,f0,f1,q,vol){
  const ctx=actx(),n=Math.ceil(ctx.sampleRate*dur),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const src=ctx.createBufferSource();src.buffer=buf;
  const flt=ctx.createBiquadFilter();flt.type="bandpass";flt.Q.value=q;
  flt.frequency.setValueAtTime(f0,ctx.currentTime);
  if(f1)flt.frequency.exponentialRampToValueAtTime(f1,ctx.currentTime+dur);
  const g=ctx.createGain();g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  src.connect(flt);flt.connect(g);g.connect(ctx.destination);src.start();src.stop(ctx.currentTime+dur+0.01);
}
export function ntone(freq,dur,vol){
  const ctx=actx(),osc=ctx.createOscillator(),g=ctx.createGain();
  osc.type="sine";osc.frequency.value=freq;
  g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  osc.connect(g);g.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+dur+0.01);
}
export const snd={
  grab:      ()=>nburst(0.04,1800,600,2,0.12),
  friction:  ()=>nburst(0.07,1100,700,1.5,0.07),
  swipeLeft: ()=>{nburst(0.22,1400,260,1,0.35);setTimeout(()=>nburst(0.08,180,null,0.4,0.2),210);},
  swipeRight:()=>{nburst(0.18,900,210,1.5,0.28);setTimeout(()=>nburst(0.08,180,null,0.4,0.18),170);},
  snapBack:  ()=>nburst(0.07,200,null,0.5,0.15),
  reveal:    ()=>{ntone(660,0.15,0.1);setTimeout(()=>ntone(880,0.2,0.08),80);},
};
