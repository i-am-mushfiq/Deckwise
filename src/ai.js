// ── Tier config — extend here when subscriptions are added ───────────────────
export const AI_TIERS = {
  free: { dailyLimit: 1000, label: 'Free' },
  // pro: { dailyLimit: Infinity, label: 'Pro' },
};

export function todayGMT() {
  return new Date().toISOString().slice(0, 10);
}

export async function generateCards(prompt, jwt=null){
  const headers={"Content-Type":"application/json"};
  if(jwt)headers["Authorization"]=`Bearer ${jwt}`;
  const res=await fetch("/api/generate",{
    method:"POST",
    headers,
    body:JSON.stringify({prompt})
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||`Error ${res.status}`);
  return data;
}
