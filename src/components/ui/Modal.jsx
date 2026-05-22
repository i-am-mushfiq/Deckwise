import { X } from 'lucide-react';
import { S, F } from '../../theme.js';
import { hap } from '../../audio.js';

export function Modal({title,onClose,children,width=480}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16,overflowY:"auto"}}>
      <div style={{background:S.elevated,borderRadius:8,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 16px 64px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 24px 16px",position:"sticky",top:0,background:S.elevated,zIndex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:S.white,fontFamily:F,letterSpacing:"-0.02em"}}>{title}</div>
          <button aria-label="Close" onClick={()=>{hap.light();onClose();}} style={{background:"transparent",border:"none",color:S.subdued,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}
            onMouseEnter={e=>e.currentTarget.style.color=S.white}
            onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>
            <X size={16}/>
          </button>
        </div>
        <div style={{padding:"0 24px 24px"}}>{children}</div>
      </div>
    </div>
  );
}
