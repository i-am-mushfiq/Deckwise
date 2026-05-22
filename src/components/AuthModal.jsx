import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { S, F, inpStyle } from '../theme.js';
import { hap } from '../audio.js';
import { supabase } from '../supabase.js';

const GoogleIcon=()=>(
  <svg width="18" height="18" viewBox="0 0 18 18" style={{flexShrink:0}}>
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
  </svg>
);

export function AuthModal({onClose}){
  const[email,setEmail]=useState("");
  const[sent,setSent]=useState(false);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState(null);

  const signInGoogle=async()=>{
    if(!supabase)return;
    hap.medium();
    await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:window.location.origin}
    });
  };

  const sendMagicLink=async()=>{
    if(!supabase||!email.trim()){return;}
    setLoading(true);setErr(null);
    const{error}=await supabase.auth.signInWithOtp({
      email:email.trim(),
      options:{emailRedirectTo:window.location.origin}
    });
    setLoading(false);
    if(error){hap.error();setErr(error.message);return;}
    hap.success();setSent(true);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:S.elevated,borderRadius:12,width:"100%",maxWidth:380,padding:32,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",position:"relative"}}>
        {/* Close */}
        <button aria-label="Close" onClick={()=>{hap.light();onClose();}} style={{position:"absolute",top:16,right:16,background:"transparent",border:"none",color:S.subdued,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}
          onMouseEnter={e=>e.currentTarget.style.color=S.white}
          onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>
          <X size={16}/>
        </button>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <img src="/icon-192.png" alt="Deckwise" style={{width:36,height:36,borderRadius:8}}/>
          <span style={{fontSize:18,fontWeight:700,color:S.white,fontFamily:F}}>Deckwise</span>
        </div>

        <div style={{fontSize:20,fontWeight:700,color:S.white,fontFamily:F,marginBottom:6,letterSpacing:"-0.02em"}}>Sign in</div>
        <div style={{fontSize:13,color:S.subdued,fontFamily:F,marginBottom:28,lineHeight:1.5}}>Sync your library and progress across all your devices.</div>

        {!sent?(
          <>
            {/* Google */}
            <button onClick={signInGoogle}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"13px 20px",background:"#fff",borderRadius:500,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:"#3c4043",fontFamily:F,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.3)",transition:"transform 0.1s,box-shadow 0.1s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.3)";}}>
              <GoogleIcon/>Sign in with Google
            </button>

            {/* Divider */}
            <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
              <div style={{flex:1,height:1,background:S.border}}/>
              <span style={{fontSize:12,color:S.faint,fontFamily:F}}>or continue with email</span>
              <div style={{flex:1,height:1,background:S.border}}/>
            </div>

            {/* Email */}
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{...inpStyle(),marginBottom:10}}
              onFocus={e=>e.target.style.borderColor=S.white}
              onBlur={e=>e.target.style.borderColor=S.border}
              onKeyDown={e=>{if(e.key==="Enter")sendMagicLink();}}
            />
            {err&&<div style={{fontSize:12,color:S.danger,fontFamily:F,marginBottom:8,lineHeight:1.5}}>{err}</div>}
            <button onClick={sendMagicLink} disabled={loading||!email.trim()}
              style={{width:"100%",padding:"13px 0",background:email.trim()&&!loading?S.green:"transparent",border:`1px solid ${email.trim()&&!loading?S.green:S.border}`,borderRadius:500,color:email.trim()&&!loading?"#1c1208":S.subdued,fontSize:14,fontWeight:700,cursor:email.trim()&&!loading?"pointer":"default",fontFamily:F,transition:"all 0.2s"}}>
              {loading?"Sending…":"Send magic link"}
            </button>
          </>
        ):(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:`${S.green}18`,border:`2px solid ${S.green}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Mail size={32} color={S.green}/>
              </div>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:S.white,fontFamily:F,marginBottom:8}}>Check your inbox</div>
            <div style={{fontSize:13,color:S.subdued,fontFamily:F,lineHeight:1.6}}>We sent a sign-in link to <strong style={{color:S.white}}>{email}</strong>. Tap the link in that email to continue.</div>
            <button onClick={()=>setSent(false)} style={{marginTop:20,background:"transparent",border:"none",color:S.faint,fontSize:13,cursor:"pointer",fontFamily:F,textDecoration:"underline"}}>Use a different email</button>
          </div>
        )}
      </div>
    </div>
  );
}
