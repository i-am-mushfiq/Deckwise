export const THEMES={
  autumn:{bg:"#1c1208",surface:"#251a0a",elevated:"#2e200e",card:"#3a2912",cardHover:"#43301a",green:"#c8761a",greenHover:"#e08920",white:"#f5e6cc",subdued:"#a88b6a",faint:"#5c4530",danger:"#b83222",border:"rgba(200,118,26,0.18)",d1:"#7daa52",d2:"#c8761a",d3:"#b83222",star:"#e6b84a"},
  midnight:{bg:"#0d0f18",surface:"#141720",elevated:"#1c2030",card:"#222840",cardHover:"#293050",green:"#5b8de8",greenHover:"#6b9df8",white:"#e8eeff",subdued:"#8892b0",faint:"#3a4060",danger:"#e05070",border:"rgba(91,141,232,0.18)",d1:"#7daa52",d2:"#5b8de8",d3:"#e05070",star:"#f0c040"},
  forest:{bg:"#0a1209",surface:"#111a10",elevated:"#182418",card:"#1e2e1c",cardHover:"#253824",green:"#4a9e5c",greenHover:"#5ab86c",white:"#e0f0e0",subdued:"#7aaa80",faint:"#2a4030",danger:"#c04848",border:"rgba(74,158,92,0.18)",d1:"#7daa52",d2:"#4a9e5c",d3:"#c04848",star:"#d4a830"},
  slate:{bg:"#0f1117",surface:"#161b27",elevated:"#1e2436",card:"#252d42",cardHover:"#2d3650",green:"#7c9ef0",greenHover:"#8eaef8",white:"#e8ebf8",subdued:"#8892b8",faint:"#3a4060",danger:"#e07070",border:"rgba(124,158,240,0.18)",d1:"#7daa52",d2:"#7c9ef0",d3:"#e07070",star:"#f0c060"},
  obsidian:{bg:"#000000",surface:"#080808",elevated:"#101010",card:"#181818",cardHover:"#202020",green:"#d4a017",greenHover:"#e8b020",white:"#f0f0f0",subdued:"#808080",faint:"#303030",danger:"#cc3333",border:"rgba(255,255,255,0.10)",d1:"#7daa52",d2:"#d4a017",d3:"#cc3333",star:"#f0c030"},
};
export const THEME_META=[
  {id:"autumn",name:"Rustic Autumn",bg:"#1c1208",accent:"#c8761a"},
  {id:"midnight",name:"Midnight",bg:"#0d0f18",accent:"#5b8de8"},
  {id:"forest",name:"Forest",bg:"#0a1209",accent:"#4a9e5c"},
  {id:"slate",name:"Slate",bg:"#0f1117",accent:"#7c9ef0"},
  {id:"obsidian",name:"Obsidian",bg:"#000000",accent:"#d4a017"},
];
const _t=(()=>{try{const t=JSON.parse(localStorage.getItem("sl-theme"))||"autumn";if(typeof document!=="undefined")document.body.style.background=(THEMES[t]||THEMES.autumn).bg;return t;}catch{return"autumn";}})();
export const S={...(THEMES[_t]||THEMES.autumn)};
export const F = "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'Segoe UI', Helvetica, Arial, sans-serif";
export const inpStyle=()=>({background:S.card,border:`1px solid ${S.border}`,borderRadius:4,color:S.white,fontSize:15,padding:"12px 16px",width:"100%",fontFamily:F,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"});
