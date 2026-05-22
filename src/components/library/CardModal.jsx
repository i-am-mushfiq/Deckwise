import { useState } from 'react';
import { S, F, inpStyle } from '../../theme.js';
import { hap } from '../../audio.js';
import { Modal } from '../ui/Modal.jsx';
import { Field } from '../ui/Field.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';

export function CardModal({card,onSave,onClose}){
  const[title,setTitle]=useState(card?.title||"");
  const[body,setBody]=useState(card?.body||"");
  const[context,setContext]=useState(card?.context||"");
  const[tags,setTags]=useState((card?.tags||[]).join(", "));
  const[diff,setDiff]=useState(card?.difficulty||1);
  const ta={...inpStyle(),height:88,resize:"vertical"};
  return(
    <Modal title={card?.id?"Edit card":"New card"} onClose={onClose} width={560}>
      <Field label="Title"><input style={inpStyle()} value={title} onChange={e=>setTitle(e.target.value)} autoFocus onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <Field label="Body"><textarea style={ta} value={body} onChange={e=>setBody(e.target.value)} onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <Field label="Context (deep dive)"><textarea style={ta} value={context} onChange={e=>setContext(e.target.value)} onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <Field label="Tags (comma separated)"><input style={inpStyle()} value={tags} onChange={e=>setTags(e.target.value)} placeholder="foundational, mechanism" onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <Field label="Difficulty">
        <div style={{display:"flex",gap:8}}>
          {[["Intro",1,S.d1],["Core",2,S.d2],["Advanced",3,S.d3]].map(([l,d,c])=>(
            <button key={d} onClick={()=>{hap.light();setDiff(d);}} style={{flex:1,padding:"10px 0",borderRadius:4,border:`1px solid ${diff===d?c:S.border}`,background:diff===d?`${c}22`:"transparent",color:diff===d?c:S.subdued,cursor:"pointer",fontSize:13,fontFamily:F,fontWeight:700,transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
      </Field>
      <SpotifyBtn fullWidth onClick={()=>{if(!title.trim()||!body.trim())return;hap.success();onSave({title:title.trim(),body:body.trim(),context:context.trim(),tags:tags.split(",").map(t=>t.trim()).filter(Boolean),difficulty:diff});}}>
        {card?.id?"Save changes":"Add card"}
      </SpotifyBtn>
    </Modal>
  );
}
