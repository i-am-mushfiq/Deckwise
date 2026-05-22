import { S, F } from '../../theme.js';

export function Field({label,children}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:700,color:S.subdued,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:F}}>{label}</label>
      {children}
    </div>
  );
}
