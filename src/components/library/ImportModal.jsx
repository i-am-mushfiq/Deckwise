import { useState } from 'react';
import { S, F, inpStyle } from '../../theme.js';
import { hap } from '../../audio.js';
import { Modal } from '../ui/Modal.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';

export function ImportModal({onClose,onImport}){
  const[text,setText]=useState("");
  const[err,setErr]=useState(null);
  return(
    <Modal title="Import JSON" onClose={onClose}>
      <p style={{fontSize:14,color:S.subdued,marginBottom:16,fontFamily:F}}>Paste a topic object with a cards array.</p>
      <textarea value={text} onChange={e=>setText(e.target.value)} style={{...inpStyle(),height:180,resize:"vertical",fontFamily:"monospace",fontSize:12}} onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/>
      {err&&<p style={{color:S.danger,fontSize:13,margin:"8px 0",fontFamily:F}}>{err}</p>}
      <div style={{display:"flex",gap:10,marginTop:16}}>
        <SpotifyBtn variant="ghost" onClick={onClose}>Cancel</SpotifyBtn>
        <SpotifyBtn onClick={()=>{try{const d=JSON.parse(text);hap.success();onImport(d);onClose();}catch{hap.error();setErr("Invalid JSON. Check the format.");}}}>Import</SpotifyBtn>
      </div>
    </Modal>
  );
}
