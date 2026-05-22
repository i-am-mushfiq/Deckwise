import { S, F } from '../theme.js';
import { hap } from '../audio.js';
import { SpotifyBtn } from './ui/SpotifyBtn.jsx';

export function CompletionScreen({topic,revisitCards,confusedCards,starredCards,onHome,onRevisitAll,onStudyFlagged,onStudyStarred}){
  return(
    <div style={{padding:"40px 0 24px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:`${S.green}22`,border:`2px solid ${S.green}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36}}>🎯</div>
      <div style={{fontSize:28,fontWeight:700,color:S.white,fontFamily:F,letterSpacing:"-0.02em",marginBottom:8}}>Done!</div>
      <div style={{fontSize:15,color:S.subdued,fontFamily:F,marginBottom:36}}>{topic.title}</div>
      {revisitCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.danger,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Review queue · {revisitCards.length}</div>
          {revisitCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onRevisitAll();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.danger}`,borderRadius:500,color:S.danger,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Start review →</button>
        </div>
      )}
      {confusedCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.green,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Flagged · {confusedCards.length}</div>
          {confusedCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onStudyFlagged();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.green}`,borderRadius:500,color:S.green,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Study flagged cards →</button>
        </div>
      )}
      {starredCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.star,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Starred · {starredCards.length}</div>
          {starredCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onStudyStarred();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.star}`,borderRadius:500,color:S.star,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Review starred cards →</button>
        </div>
      )}
      <SpotifyBtn fullWidth onClick={()=>{hap.medium();onHome();}}>Back to library</SpotifyBtn>
    </div>
  );
}
