import { S, F } from '../theme.js';
import { hap, snd } from '../audio.js';

export function ActionBar({onLeft,onRight,onBack,canBack}){
  return(
    <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center",padding:"20px 0 8px"}}>
      <button onClick={()=>{if(canBack){hap.light();onBack();}}}
        style={{width:46,height:46,borderRadius:"50%",background:S.elevated,border:`1px solid ${S.border}`,color:S.subdued,fontSize:20,cursor:canBack?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s,opacity 0.2s",opacity:canBack?1:0.3}}
        onMouseEnter={e=>{if(canBack){e.currentTarget.style.background=S.card;e.currentTarget.style.transform="scale(1.08)";}}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.elevated;e.currentTarget.style.transform="scale(1)";}}>↩</button>
      <button onClick={()=>{hap.error();snd.swipeRight();onRight();}} style={{width:56,height:56,borderRadius:"50%",background:S.elevated,border:`1px solid ${S.border}`,color:S.danger,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.background=S.card;e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.elevated;e.currentTarget.style.transform="scale(1)";}}>↺</button>
      <button onClick={()=>{hap.success();snd.swipeLeft();onLeft();}} style={{width:56,height:56,borderRadius:"50%",background:S.green,border:"none",color:S.bg,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.background=S.greenHover;e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.green;e.currentTarget.style.transform="scale(1)";}}>✓</button>
    </div>
  );
}
