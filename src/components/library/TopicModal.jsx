import { useState } from 'react';
import { S } from '../../theme.js';
import { inpStyle } from '../../theme.js';
import { hap } from '../../audio.js';
import { Modal } from '../ui/Modal.jsx';
import { Field } from '../ui/Field.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';

export function TopicModal({existing,onSave,onClose}){
  const[t,setT]=useState(existing?.title||"");
  return(
    <Modal title={existing?"Edit topic":"New topic"} onClose={onClose}>
      <Field label="Topic name"><input style={inpStyle()} value={t} onChange={e=>setT(e.target.value)} autoFocus onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <SpotifyBtn fullWidth onClick={()=>{if(t.trim()){hap.success();onSave(t.trim());}}}>{existing?"Save":"Create"}</SpotifyBtn>
    </Modal>
  );
}
