import { S, F } from '../../theme.js';
import { hap } from '../../audio.js';

export function SpotifyBtn({children,onClick,variant="primary",size="md",fullWidth=false}){
  const bg=variant==="primary"?S.green:variant==="secondary"?"transparent":S.elevated;
  const col=variant==="primary"?"#1c1208":S.white;
  const border=variant==="secondary"?`1px solid ${S.border}`:"none";
  const pad=size==="sm"?"8px 16px":"14px 32px";
  const fs=size==="sm"?13:14;
  return(
    <button onMouseDown={()=>hap.medium()} onClick={()=>{onClick&&onClick();}}
      style={{background:bg,color:col,border,borderRadius:500,padding:pad,fontFamily:F,fontSize:fs,fontWeight:700,letterSpacing:"0.05em",cursor:"pointer",width:fullWidth?"100%":"auto",transition:"transform 0.1s,background 0.1s",whiteSpace:"nowrap"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";if(variant==="primary")e.currentTarget.style.background=S.greenHover;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";if(variant==="primary")e.currentTarget.style.background=S.green;}}
    >{children}</button>
  );
}
