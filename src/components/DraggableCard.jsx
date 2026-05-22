import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, RotateCcw, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { S, F } from '../theme.js';
import { hap, snd } from '../audio.js';

export function DraggableCard({card,onSwipe,stackIndex,isTop,confused,onConfused,starred,onStarred}){
  const ref=useRef(null);
  const[pos,setPos]=useState({x:0,y:0,rot:0});
  const[flyOut,setFlyOut]=useState(null);
  const[showCtx,setShowCtx]=useState(false);
  const drag=useRef({active:false,startX:0,startY:0});
  const done=useRef(false);
  const THRESH=85;

  const fire=useCallback((dir,dx,dy)=>{
    if(done.current)return;
    done.current=true;
    if(dir==="left"){hap.success();snd.swipeLeft();}else{hap.error();snd.swipeRight();}
    setFlyOut(dir==="left"?{x:-700,y:(dy||0)*0.3,rot:-18}:{x:700,y:(dy||0)*0.3,rot:18});
    setTimeout(()=>onSwipe(dir),280);
  },[onSwipe]);

  useEffect(()=>{
    if(!isTop)return;
    const el=ref.current;if(!el)return;
    const pt=e=>e.touches?[e.touches[0].clientX,e.touches[0].clientY]:[e.clientX,e.clientY];
    const down=e=>{const[x,y]=pt(e);drag.current={active:true,startX:x,startY:y,lastFrictDist:0};snd.grab();};
    const move=e=>{
      if(!drag.current.active)return;
      const[x,y]=pt(e);const dx=x-drag.current.startX,dy=y-drag.current.startY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist>12&&Math.abs(dist-drag.current.lastFrictDist)>28){snd.friction();drag.current.lastFrictDist=dist;}
      setPos({x:dx,y:0,rot:dx*0.05});
    };
    const up=()=>{
      if(!drag.current.active)return;
      drag.current.active=false;
      setPos(p=>{
        if(p.x<-THRESH)fire("left",p.x,p.y);
        else if(p.x>THRESH)fire("right",p.x,p.y);
        else{hap.light();snd.snapBack();return{x:0,y:0,rot:0};}
        return p;
      });
    };
    el.addEventListener("mousedown",down);
    window.addEventListener("mousemove",move);
    window.addEventListener("mouseup",up);
    el.addEventListener("touchstart",down,{passive:true});
    window.addEventListener("touchmove",move,{passive:true});
    window.addEventListener("touchend",up);
    return()=>{
      el.removeEventListener("mousedown",down);window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up);
      el.removeEventListener("touchstart",down);window.removeEventListener("touchmove",move);window.removeEventListener("touchend",up);
    };
  },[isTop,fire]);

  const tx=flyOut?`translate(${flyOut.x}px,${flyOut.y}px) rotate(${flyOut.rot}deg)`:isTop?`translate(${pos.x}px,${pos.y}px) rotate(${pos.rot}deg)`:`scale(${1-stackIndex*0.03}) translateY(${stackIndex*14}px)`;
  const tr=flyOut?"transform 0.28s ease-in":drag.current?.active?"none":"transform 0.3s cubic-bezier(0.34,1.4,0.64,1)";
  const lOp=Math.min(1,Math.max(0,-pos.x/70));
  const rOp=Math.min(1,Math.max(0,pos.x/70));
  const dc=card.difficulty===1?S.d1:card.difficulty===2?S.d2:S.d3;
  const dl=card.difficulty===1?"Intro":card.difficulty===2?"Core":"Advanced";

  return(
    <div ref={ref} data-testid={isTop?"active-card":"background-card"} style={{position:"absolute",width:"100%",maxWidth:440,left:"50%",top:0,transform:`translateX(-50%) ${tx}`,transition:tr,cursor:isTop?"grab":"default",userSelect:"none",zIndex:10-stackIndex,touchAction:"none",filter:stackIndex>0?`brightness(${1-stackIndex*0.15})`:"none"}}>
      <div style={{background:S.card,borderRadius:8,overflow:"hidden",position:"relative",boxShadow:isTop?"0 8px 40px rgba(0,0,0,0.6)":"0 2px 12px rgba(0,0,0,0.4)"}}>
        <div style={{height:3,background:dc,width:"100%"}}/>
        {isTop&&lOp>0.08&&(
          <div style={{position:"absolute",top:20,left:16,opacity:lOp,transform:"rotate(-8deg)",zIndex:10,border:`2px solid ${S.green}`,borderRadius:4,padding:"4px 14px",color:S.green,fontWeight:700,fontSize:18,fontFamily:F,pointerEvents:"none",display:"flex",alignItems:"center",gap:6}}>
            Got it <Check size={18}/>
          </div>
        )}
        {isTop&&rOp>0.08&&(
          <div style={{position:"absolute",top:20,right:16,opacity:rOp,transform:"rotate(8deg)",zIndex:10,border:`2px solid ${S.danger}`,borderRadius:4,padding:"4px 14px",color:S.danger,fontWeight:700,fontSize:18,fontFamily:F,pointerEvents:"none",display:"flex",alignItems:"center",gap:6}}>
            Again <RotateCcw size={16}/>
          </div>
        )}
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,paddingRight:12}}>
            <div style={{fontSize:11,fontWeight:700,color:S.subdued,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,fontFamily:F}}>{card.topicTitle}</div>
            <div style={{fontSize:20,fontWeight:700,color:S.white,lineHeight:1.25,fontFamily:F,letterSpacing:"-0.01em"}}>{card.title}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:700,color:dc,fontFamily:F,letterSpacing:"0.05em"}}>{dl}</span>
            <span style={{fontSize:11,color:S.faint,fontFamily:F}}>#{card.order}</span>
          </div>
        </div>
        <div style={{margin:"16px 20px",height:1,background:S.border}}/>
        <div style={{padding:"0 20px",fontSize:15,lineHeight:1.75,color:`${S.white}cc`,fontFamily:F,minHeight:108}}>{card.body}</div>
        {showCtx&&(
          <div style={{margin:"14px 14px 0",background:S.elevated,borderRadius:6,padding:"14px 16px",borderLeft:`2px solid ${S.green}`}}>
            <div style={{fontSize:11,fontWeight:700,color:S.green,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,fontFamily:F}}>Deep dive</div>
            <div style={{fontSize:13,lineHeight:1.75,color:S.subdued,fontFamily:F}}>{card.context}</div>
          </div>
        )}
        <div style={{padding:"14px 20px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {!showCtx
            ?<button aria-label="Expand" onClick={()=>{hap.light();snd.reveal();setShowCtx(true);}} style={{fontSize:12,fontWeight:700,color:S.white,background:"transparent",border:`1px solid ${S.border}`,borderRadius:500,padding:"6px 16px",cursor:"pointer",fontFamily:F,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:5}} onMouseEnter={e=>e.currentTarget.style.borderColor=S.white} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}><ChevronUp size={14}/>Expand</button>
            :<button aria-label="Collapse" onClick={()=>{hap.light();setShowCtx(false);}} style={{fontSize:12,fontWeight:700,color:S.subdued,background:"transparent",border:`1px solid ${S.border}`,borderRadius:500,padding:"6px 16px",cursor:"pointer",fontFamily:F,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:5}} onMouseEnter={e=>e.currentTarget.style.borderColor=S.subdued} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}><ChevronDown size={14}/>Collapse</button>
          }
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button aria-label={starred?"Starred":"Star"} onClick={()=>{hap.light();onStarred();}} style={{color:starred?S.star:S.subdued,background:starred?`${S.star}18`:"transparent",border:`1px solid ${starred?S.star:S.border}`,borderRadius:500,padding:"6px 14px",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Star size={15} color={starred?S.star:S.subdued} fill={starred?S.star:"none"}/>
            </button>
            <button onClick={()=>{hap.medium();onConfused();}} style={{fontSize:12,fontWeight:700,color:confused?S.green:S.subdued,background:confused?`${S.green}18`:"transparent",border:`1px solid ${confused?S.green:S.border}`,borderRadius:500,padding:"6px 14px",cursor:"pointer",fontFamily:F,transition:"all 0.15s"}}>
              {confused?"Flagged":"Flag"}
            </button>
          </div>
        </div>
        <div style={{paddingBottom:18,paddingLeft:20,display:"flex",gap:6,flexWrap:"wrap"}}>
          {card.tags.map(t=><span key={t} style={{fontSize:11,fontWeight:700,color:S.subdued,background:S.elevated,borderRadius:500,padding:"3px 10px",fontFamily:F,letterSpacing:"0.04em"}}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
