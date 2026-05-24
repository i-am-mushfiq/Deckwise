import { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { S, F } from '../../theme.js';
import { hap } from '../../audio.js';
import { uid } from '../../lib.js';
import { Modal } from '../ui/Modal.jsx';
import { SpotifyBtn } from '../ui/SpotifyBtn.jsx';
import { CardModal } from './CardModal.jsx';

export function CardSetManager({topic,onSave,onClose}){
  const[cards,setCards]=useState([...topic.cards]);
  const[editing,setEditing]=useState(null);
  const move=(i,dir)=>{const c=[...cards];const j=i+dir;if(j<0||j>=c.length)return;hap.light();[c[i],c[j]]=[c[j],c[i]];setCards(c.map((x,n)=>({...x,order:n+1})));};
  const del=(id)=>{hap.medium();setCards(cards.filter(c=>c.id!==id).map((x,n)=>({...x,order:n+1})));};
  const saveCard=(data)=>{
    if(editing==="new")setCards(p=>[...p,{...data,id:`${topic.id}-${uid()}`,order:p.length+1}]);
    else setCards(p=>p.map(c=>c.id===editing.id?{...c,...data}:c));
    setEditing(null);
  };
  return(
    <>
      <Modal title={topic.title} onClose={onClose} width={600}>
        <div style={{marginBottom:16}}><SpotifyBtn size="sm" onClick={()=>setEditing("new")}>+ Add card</SpotifyBtn></div>
        <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:"min(400px,45dvh)",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          {cards.map((c,i)=>(
            <div key={c.id} style={{background:S.card,borderRadius:4,padding:"10px 10px",display:"flex",gap:8,alignItems:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=S.cardHover}
              onMouseLeave={e=>e.currentTarget.style.background=S.card}>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                <button onClick={()=>move(i,-1)} disabled={i===0} aria-label="Move up" style={{background:"none",border:"none",color:i===0?S.faint:S.subdued,cursor:i===0?"default":"pointer",padding:"2px 4px",lineHeight:1,display:"flex",alignItems:"center",touchAction:"manipulation"}}
                  onMouseEnter={e=>{if(i!==0)e.currentTarget.style.color=S.white;}}
                  onMouseLeave={e=>e.currentTarget.style.color=i===0?S.faint:S.subdued}>
                  <ChevronUp size={14}/>
                </button>
                <button onClick={()=>move(i,1)} disabled={i===cards.length-1} aria-label="Move down" style={{background:"none",border:"none",color:i===cards.length-1?S.faint:S.subdued,cursor:i===cards.length-1?"default":"pointer",padding:"2px 4px",lineHeight:1,display:"flex",alignItems:"center",touchAction:"manipulation"}}
                  onMouseEnter={e=>{if(i!==cards.length-1)e.currentTarget.style.color=S.white;}}
                  onMouseLeave={e=>e.currentTarget.style.color=i===cards.length-1?S.faint:S.subdued}>
                  <ChevronDown size={14}/>
                </button>
              </div>
              <div style={{width:26,height:26,borderRadius:4,background:c.difficulty===1?`${S.d1}22`:c.difficulty===2?`${S.d2}22`:`${S.d3}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.difficulty===1?S.d1:c.difficulty===2?S.d2:S.d3,flexShrink:0}}>{c.order}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:S.white,fontFamily:F,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{fontSize:11,color:S.subdued,fontFamily:F,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.body}</div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <SpotifyBtn size="sm" variant="ghost" onClick={()=>setEditing(c)}>Edit</SpotifyBtn>
                <button onClick={()=>del(c.id)} aria-label="Delete card" style={{background:"none",border:"none",color:S.subdued,cursor:"pointer",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",touchAction:"manipulation"}}
                  onMouseEnter={e=>e.currentTarget.style.color=S.danger}
                  onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>
                  <X size={16}/>
                </button>
              </div>
            </div>
          ))}
          {!cards.length&&<div style={{textAlign:"center",color:S.subdued,fontSize:14,padding:32,fontFamily:F}}>No cards yet</div>}
        </div>
        <div style={{marginTop:20}}><SpotifyBtn fullWidth onClick={()=>{hap.success();onSave({...topic,cards});}}>Save</SpotifyBtn></div>
      </Modal>
      {editing&&<CardModal card={editing==="new"?null:editing} onSave={saveCard} onClose={()=>setEditing(null)}/>}
    </>
  );
}
