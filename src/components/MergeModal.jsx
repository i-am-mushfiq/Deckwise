import { S, F } from '../theme.js';
import { hap } from '../audio.js';

export function MergeModal({onKeepLocal,onUseCloud}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:S.elevated,borderRadius:12,width:"100%",maxWidth:360,padding:32,boxShadow:"0 24px 80px rgba(0,0,0,0.8)"}}>
        <div style={{fontSize:20,fontWeight:700,color:S.white,fontFamily:F,marginBottom:8,letterSpacing:"-0.02em"}}>Two sets of data found</div>
        <div style={{fontSize:13,color:S.subdued,fontFamily:F,marginBottom:28,lineHeight:1.6}}>You have local progress on this device and existing cloud data. Which would you like to keep?</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>{hap.success();onKeepLocal();}}
            style={{width:"100%",padding:"13px 0",background:S.green,border:"none",borderRadius:500,color:"#1c1208",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>
            Upload local data → cloud
          </button>
          <button onClick={()=>{hap.medium();onUseCloud();}}
            style={{width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${S.border}`,borderRadius:500,color:S.subdued,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>
            Use cloud data (discard local)
          </button>
        </div>
      </div>
    </div>
  );
}
