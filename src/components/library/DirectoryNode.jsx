import { useState } from 'react';
import { S, F } from '../../theme.js';
import { hap } from '../../audio.js';

export function DirectoryNode({node,depth,onSelect,completionMap,progressMap,confusedIds=[],starredIds=[],onSelectFlagged,onSelectStarred}){
  const[open,setOpen]=useState(depth<2);
  if(node.type==="topic"){
    const done=node.cards.filter(c=>completionMap[c.id]).length;
    const pct=node.cards.length?Math.round(done/node.cards.length*100):0;
    const inProg=(progressMap[node.id]||0)>0&&pct<100;
    const flaggedCount=node.cards.filter(c=>confusedIds.includes(c.id)).length;
    const starredCount=node.cards.filter(c=>starredIds.includes(c.id)).length;
    const chipBtn=(label,color,onClick)=>(
      <button onClick={e=>{e.stopPropagation();hap.light();onClick();}}
        style={{fontSize:11,fontWeight:700,color,background:`${color}18`,border:`1px solid ${color}44`,borderRadius:500,padding:"2px 8px",cursor:"pointer",fontFamily:F,transition:"all 0.15s",lineHeight:1.6}}>
        {label}
      </button>
    );
    return(
      <div onClick={()=>{if(node.cards.length){hap.light();onSelect(node);}}}
        style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderRadius:4,cursor:node.cards.length?"pointer":"default",transition:"background 0.15s",marginBottom:2}}
        onMouseEnter={e=>{if(node.cards.length)e.currentTarget.style.background=S.card;}}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{width:44,height:44,borderRadius:4,background:pct===100?`${S.green}22`:inProg?`${S.d2}22`:S.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
          <span style={{fontSize:20}}>{pct===100?"✅":"📖"}</span>
          {inProg&&<div style={{position:"absolute",bottom:2,right:2,width:8,height:8,borderRadius:"50%",background:S.green,border:`2px solid ${S.surface}`}}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{node.title}</div>
          <div style={{fontSize:12,color:S.subdued,fontFamily:F}}>{node.cards.length} cards{!node.cards.length?" · add cards in library":""}</div>
          {(flaggedCount>0||starredCount>0)&&(
            <div style={{display:"flex",gap:6,marginTop:5}} onClick={e=>e.stopPropagation()}>
              {flaggedCount>0&&chipBtn(`🚩 ${flaggedCount} flagged`,S.green,()=>onSelectFlagged?.(node))}
              {starredCount>0&&chipBtn(`★ ${starredCount} starred`,S.star,()=>onSelectStarred?.(node))}
            </div>
          )}
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,color:pct===100?S.green:inProg?S.white:S.subdued,fontFamily:F}}>{pct}%</div>
          {pct>0&&pct<100&&<div style={{width:40,height:2,background:S.faint,borderRadius:1,marginTop:4,overflow:"hidden",marginLeft:"auto"}}><div style={{width:`${pct}%`,height:"100%",background:S.green,borderRadius:1}}/></div>}
        </div>
      </div>
    );
  }
  return(
    <div style={{marginBottom:2}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:4,cursor:"pointer",transition:"background 0.15s"}}
        onClick={()=>setOpen(!open)}
        onMouseEnter={e=>e.currentTarget.style.background=S.card}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span style={{fontSize:11,color:S.subdued,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0)",width:14}}>▶</span>
        <span style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F,flex:1}}>{node.title}</span>
        <span style={{fontSize:12,color:S.faint,fontFamily:F}}>{(node.children||[]).length} items</span>
      </div>
      {open&&<div style={{paddingLeft:depth>0?16:0}}>{node.children?.map(c=><DirectoryNode key={c.id} node={c} depth={depth+1} onSelect={onSelect} completionMap={completionMap} progressMap={progressMap} confusedIds={confusedIds} starredIds={starredIds} onSelectFlagged={onSelectFlagged} onSelectStarred={onSelectStarred}/>)}</div>}
    </div>
  );
}
