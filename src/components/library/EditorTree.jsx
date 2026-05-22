import { useState } from 'react';
import { X, ChevronRight, FileText, Folder } from 'lucide-react';
import { S, F } from '../../theme.js';
import { hap } from '../../audio.js';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';

export function EditorTree({node,depth=0,isRoot,onAddDir,onAddTopic,onEdit,onDelete,onCards}){
  const[open,setOpen]=useState(true);
  const pad=depth*20;
  const DelBtn=({id})=>(
    <button onClick={e=>{e.stopPropagation();hap.error();onDelete(id);}}
      style={{background:"none",border:"none",color:S.subdued,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",flexShrink:0}}
      onMouseEnter={e=>e.currentTarget.style.color=S.danger}
      onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>
      <X size={16}/>
    </button>
  );
  if(node.type==="topic"){
    return(
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",marginLeft:pad,marginBottom:2,borderRadius:4,transition:"background 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.background=S.card}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{width:36,height:36,borderRadius:4,background:S.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <FileText size={16} color={S.subdued}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F}}>{node.title}</div>
          <div style={{fontSize:12,color:S.subdued,fontFamily:F}}>{node.cards.length} cards</div>
        </div>
        <SpotifyBtn size="sm" variant="ghost" onClick={()=>onCards(node)}>Cards</SpotifyBtn>
        <SpotifyBtn size="sm" variant="ghost" onClick={()=>onEdit(node)}>Rename</SpotifyBtn>
        <DelBtn id={node.id}/>
      </div>
    );
  }
  return(
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",marginLeft:pad,borderRadius:4,cursor:"pointer",transition:"background 0.15s"}}
        onClick={()=>setOpen(!open)}
        onMouseEnter={e=>e.currentTarget.style.background=S.card}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <ChevronRight size={14} color={S.subdued} style={{transition:"transform 0.2s",transform:open?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}/>
        <Folder size={16} color={S.subdued} style={{flexShrink:0}}/>
        <span style={{fontSize:14,fontWeight:700,color:S.white,flex:1,fontFamily:F}}>{node.title}</span>
        {!isRoot&&<>
          <SpotifyBtn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();onEdit(node);}}>Rename</SpotifyBtn>
          <DelBtn id={node.id}/>
        </>}
      </div>
      {open&&<>
        {node.children?.map(c=><EditorTree key={c.id} node={c} depth={depth+1} onAddDir={onAddDir} onAddTopic={onAddTopic} onEdit={onEdit} onDelete={onDelete} onCards={onCards}/>)}
        <div style={{display:"flex",gap:8,marginLeft:pad+36,marginTop:4,marginBottom:8}}>
          <SpotifyBtn size="sm" variant="ghost" onClick={()=>onAddDir(node.id)}>+ Folder</SpotifyBtn>
          <SpotifyBtn size="sm" variant="ghost" onClick={()=>onAddTopic(node.id)}>+ Topic</SpotifyBtn>
        </div>
      </>}
    </div>
  );
}
