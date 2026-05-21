import { useState, useRef, useEffect, useCallback } from "react";

const DEMO_DATA = {
  id:"root",title:"My Library",type:"directory",
  children:[{
    id:"demo",title:"Demo Deck",type:"topic",path:[],cards:[
      {id:"d-1",order:1,title:"What Critical Thinking Actually Is",body:"Critical thinking is the disciplined practice of evaluating information before accepting it. It means asking whether evidence supports a claim, who is making it, and what might be missing from the picture.",context:"Most people think they think critically — but critical thinking is a skill, not a personality trait. It requires deliberate effort and specific techniques, not just a skeptical attitude.",tags:["foundational"],difficulty:1},
      {id:"d-2",order:2,title:"Confirmation Bias",body:"The brain naturally seeks information that confirms what it already believes and dismisses what contradicts it. This happens automatically — you don't decide to do it.",context:"Confirmation bias is the most documented cognitive bias in psychology. It affects experts as much as novices. Awareness helps, but the only real counter is actively seeking disconfirming evidence.",tags:["bias","foundational"],difficulty:1},
      {id:"d-3",order:3,title:"The Difference Between Opinion and Argument",body:"An opinion is a position. An argument is a position supported by reasons and evidence. Saying 'I think X' is an opinion. Saying 'X is true because of Y and Z' is the beginning of an argument.",context:"Many debates stall because people treat disagreement as a clash of preferences rather than a question to be reasoned through. Upgrading from opinion to argument is the first step in productive disagreement.",tags:["foundational","communication"],difficulty:1},
      {id:"d-4",order:4,title:"Evidence vs. Anecdote",body:"Anecdotes are individual stories. Evidence is systematically collected data across many cases. One person's experience is real but not representative — it may be the exception, not the rule.",context:"'My grandfather smoked all his life and lived to 95' is an anecdote. It doesn't challenge the statistical evidence on smoking. Human memory is better at storing stories than patterns, which is why anecdotes feel so compelling.",tags:["evidence","mechanism"],difficulty:1},
      {id:"d-5",order:5,title:"Correlation vs. Causation",body:"Two things can move together without one causing the other. Ice cream sales and drowning rates both rise in summer — not because ice cream causes drowning, but because heat causes both.",context:"Establishing causation requires ruling out confounding variables, ideally through controlled experiments. Observational data shows correlation; randomised controlled trials are the gold standard for causation.",tags:["mechanism","evidence"],difficulty:2},
      {id:"d-6",order:6,title:"The Straw Man Fallacy",body:"A straw man misrepresents someone's argument to make it easier to attack. Instead of engaging with what they actually said, you argue against a weaker version of their position.",context:"Straw manning often happens unintentionally — we paraphrase badly or assume the worst version of an opponent's view. The test: would they recognise their position in your description of it?",tags:["fallacy","communication"],difficulty:2},
      {id:"d-7",order:7,title:"The Steel Man",body:"The steel man is the opposite of the straw man: engage with the strongest possible version of an opposing argument, not the weakest. If you can defeat the best version, your own position is much stronger.",context:"Steel manning is rare because it's uncomfortable — it requires genuinely understanding why intelligent people disagree with you. It's also the most effective form of intellectual preparation.",tags:["technique","communication"],difficulty:2},
      {id:"d-8",order:8,title:"Ad Hominem: Attacking the Person",body:"An ad hominem attacks the person making an argument rather than the argument itself. Even if the person is wrong about other things, unlikable, or biased — that doesn't make their specific claim false.",context:"Ad hominem is a fallacy because the truth of a claim is independent of who makes it. A corrupt politician can cite accurate statistics. Evaluate the argument, not the speaker.",tags:["fallacy"],difficulty:2},
      {id:"d-9",order:9,title:"Asking Better Questions",body:"The quality of your thinking is largely determined by the quality of your questions. 'Is this true?' is weaker than 'What would have to be true for this to be false?' — the second forces concrete thinking.",context:"Good questions expose hidden assumptions, clarify vague terms, and identify what evidence would actually settle a dispute. 'What do you mean by X?' is one of the most powerful questions in any discussion.",tags:["technique","foundational"],difficulty:2},
      {id:"d-10",order:10,title:"Intellectual Humility",body:"Intellectual humility is holding your beliefs proportionally to the evidence — and being genuinely willing to change your mind when evidence demands it. It is not the same as being uncertain about everything.",context:"Strong reasoners update beliefs incrementally as evidence accumulates. They distinguish between 'I haven't seen evidence for X' and 'X is false'. Overconfidence is a bigger epistemic risk than under-confidence for most people.",tags:["mindset","foundational"],difficulty:2},
      {id:"d-11",order:11,title:"The Socratic Method",body:"The Socratic method uses targeted questions to expose contradictions in a person's reasoning, helping them arrive at clearer thinking through dialogue rather than being told the answer.",context:"Socrates claimed to know nothing — but his questions dismantled the certainty of everyone he spoke to. The method works because people defend conclusions they reached themselves far more than conclusions handed to them.",tags:["technique","advanced"],difficulty:3},
      {id:"d-12",order:12,title:"Applying It Every Day",body:"Critical thinking isn't reserved for debates or essays. Every time you read a headline, receive advice, or form an opinion, you can ask: What's the evidence? Who benefits from me believing this? What am I not seeing?",context:"The goal isn't paralysis or perpetual scepticism — it's calibrated belief. You act on the best available evidence while staying open to revision. That combination is what separates good reasoning from both gullibility and cynicism.",tags:["application","foundational"],difficulty:1},
    ]
  },{
    id:"learn",title:"How to Learn Anything",type:"topic",path:[],cards:[
      {id:"l-1",order:1,title:"Why Most Studying Fails",body:"Rereading, highlighting, and passive review feel productive but produce little retention. The brain strengthens memories through retrieval, not exposure. Effort during recall is the signal for long-term storage.",context:"The 'fluency illusion' tricks you — familiar material feels learned because it's easy to read, not because it's encoded. Recognising a concept is far easier than recalling it from scratch.",tags:["foundational"],difficulty:1},
      {id:"l-2",order:2,title:"Active Recall",body:"Active recall means retrieving information from memory before looking it up. Closing your notes and answering questions from scratch is more effective than re-reading the same page three times.",context:"Each retrieval attempt strengthens the memory trace and identifies gaps. The harder the retrieval, the stronger the encoding — this is called the 'desirable difficulty' principle.",tags:["foundational","technique"],difficulty:1},
      {id:"l-3",order:3,title:"The Forgetting Curve",body:"Without review, you forget roughly 70% of new information within 24 hours. The curve is steep initially, then flattens. Each review resets it — and raises the floor slightly higher.",context:"Hermann Ebbinghaus mapped this in 1885 by memorising nonsense syllables. The curve shape is consistent across subjects and people, though the slope varies with meaningfulness of material.",tags:["mechanism"],difficulty:1},
      {id:"l-4",order:4,title:"Spaced Repetition",body:"Spacing reviews out over increasing intervals dramatically slows forgetting. Instead of cramming once, you review after 1 day, then 3 days, then a week, then a month.",context:"Spaced repetition exploits the forgetting curve deliberately — you review just before you would forget. Apps like Anki calculate these intervals automatically using the SM-2 algorithm.",tags:["technique","foundational"],difficulty:1},
      {id:"l-5",order:5,title:"Interleaving",body:"Mixing different topics or problem types in a single study session improves long-term retention, even though it feels harder and slower than blocking one topic at a time.",context:"Blocked practice builds fluency within a session. Interleaved practice builds discrimination — the ability to choose the right approach. This gap matters in real-world application.",tags:["technique"],difficulty:2},
      {id:"l-6",order:6,title:"The Feynman Technique",body:"To test real understanding, explain a concept as if teaching it to someone with no background. Where you stumble or use jargon is where your understanding has gaps.",context:"Named after physicist Richard Feynman, who credited his insight to his inability to understand something until he could explain it simply. 'If you can't explain it simply, you don't understand it well enough.'",tags:["technique","self-testing"],difficulty:1},
      {id:"l-7",order:7,title:"Chunking",body:"Chunking groups individual pieces of information into meaningful units. Experts see chess positions as patterns, not individual pieces — this is chunking in action.",context:"Working memory holds roughly 4 items at once. Chunking compresses information so a single 'slot' holds a rich concept. Mastery in any domain is largely the accumulation of useful chunks.",tags:["mechanism","foundational"],difficulty:2},
      {id:"l-8",order:8,title:"Elaborative Interrogation",body:"Asking 'why is this true?' and 'how does this connect to what I already know?' deepens encoding. Shallow processing stores isolated facts; deep processing builds connected knowledge.",context:"Elaboration forces you to construct meaning rather than copy it. The more connections a memory has to existing knowledge, the more retrieval paths exist — making it harder to forget.",tags:["technique"],difficulty:2},
      {id:"l-9",order:9,title:"The Illusion of Competence",body:"Familiarity masquerades as knowledge. If you can follow an explanation without confusion, you may feel you understand it — but following is passive, not generative.",context:"Testing yourself breaks the illusion. If you can't produce the explanation unprompted, you don't own the knowledge yet. This is why worked examples should always be followed by independent attempts.",tags:["pitfall","self-testing"],difficulty:2},
      {id:"l-10",order:10,title:"Metacognition",body:"Metacognition is thinking about your own thinking — monitoring whether you actually understand something versus just feeling like you do. Strong learners constantly audit their own comprehension.",context:"Poor metacognition is why students often study the wrong things before exams. Calibration — accurately sensing what you know and don't know — is a trainable skill, not a fixed trait.",tags:["foundational","self-testing"],difficulty:2},
      {id:"l-11",order:11,title:"Transfer: The Real Goal",body:"Transfer is applying knowledge in new contexts — the ultimate test of understanding. Most studying optimises for recognition on familiar problems, not transfer to novel ones.",context:"Near transfer (similar context) is easier than far transfer (different domain). Building abstract principles, not just specific examples, is what enables far transfer. Ask 'what general rule does this illustrate?'",tags:["advanced","mechanism"],difficulty:3},
      {id:"l-12",order:12,title:"Building the Learning Habit",body:"Consistency beats intensity. Thirty minutes of daily deliberate practice outperforms a weekend cram. The key variable is not total hours but regularity of retrieval and review.",context:"Habits reduce the decision cost of starting. Anchor study sessions to existing routines — after coffee, before dinner — and keep the session short enough to start without resistance. The session length expands naturally.",tags:["habit","foundational"],difficulty:1},
    ]
  }]
};

const THEMES={
  autumn:{bg:"#1c1208",surface:"#251a0a",elevated:"#2e200e",card:"#3a2912",cardHover:"#43301a",green:"#c8761a",greenHover:"#e08920",white:"#f5e6cc",subdued:"#a88b6a",faint:"#5c4530",danger:"#b83222",border:"rgba(200,118,26,0.18)",d1:"#7daa52",d2:"#c8761a",d3:"#b83222",star:"#e6b84a"},
  midnight:{bg:"#0d0f18",surface:"#141720",elevated:"#1c2030",card:"#222840",cardHover:"#293050",green:"#5b8de8",greenHover:"#6b9df8",white:"#e8eeff",subdued:"#8892b0",faint:"#3a4060",danger:"#e05070",border:"rgba(91,141,232,0.18)",d1:"#7daa52",d2:"#5b8de8",d3:"#e05070",star:"#f0c040"},
  forest:{bg:"#0a1209",surface:"#111a10",elevated:"#182418",card:"#1e2e1c",cardHover:"#253824",green:"#4a9e5c",greenHover:"#5ab86c",white:"#e0f0e0",subdued:"#7aaa80",faint:"#2a4030",danger:"#c04848",border:"rgba(74,158,92,0.18)",d1:"#7daa52",d2:"#4a9e5c",d3:"#c04848",star:"#d4a830"},
  slate:{bg:"#0f1117",surface:"#161b27",elevated:"#1e2436",card:"#252d42",cardHover:"#2d3650",green:"#7c9ef0",greenHover:"#8eaef8",white:"#e8ebf8",subdued:"#8892b8",faint:"#3a4060",danger:"#e07070",border:"rgba(124,158,240,0.18)",d1:"#7daa52",d2:"#7c9ef0",d3:"#e07070",star:"#f0c060"},
  obsidian:{bg:"#000000",surface:"#080808",elevated:"#101010",card:"#181818",cardHover:"#202020",green:"#d4a017",greenHover:"#e8b020",white:"#f0f0f0",subdued:"#808080",faint:"#303030",danger:"#cc3333",border:"rgba(255,255,255,0.10)",d1:"#7daa52",d2:"#d4a017",d3:"#cc3333",star:"#f0c030"},
};
const THEME_META=[
  {id:"autumn",name:"Rustic Autumn",bg:"#1c1208",accent:"#c8761a"},
  {id:"midnight",name:"Midnight",bg:"#0d0f18",accent:"#5b8de8"},
  {id:"forest",name:"Forest",bg:"#0a1209",accent:"#4a9e5c"},
  {id:"slate",name:"Slate",bg:"#0f1117",accent:"#7c9ef0"},
  {id:"obsidian",name:"Obsidian",bg:"#000000",accent:"#d4a017"},
];
const _t=(()=>{try{const t=JSON.parse(localStorage.getItem("sl-theme"))||"autumn";if(typeof document!=="undefined")document.body.style.background=(THEMES[t]||THEMES.autumn).bg;return t;}catch{return"autumn";}})();
const S={...(THEMES[_t]||THEMES.autumn)};
const F = "-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'Segoe UI', Helvetica, Arial, sans-serif";

const uid = () => Math.random().toString(36).slice(2,9);

function flattenTopics(node,path=[]){const o=[];if(node.type==="topic")o.push({...node,path:node.path||path});else if(node.children)node.children.forEach(c=>o.push(...flattenTopics(c,[...path,node.title])));return o;}
function rebuildPaths(node,path=[]){if(node.type==="topic")return{...node,path};return{...node,children:(node.children||[]).map(c=>rebuildPaths(c,[...path,node.title]))};}
function findAndUpdate(node,id,upd){if(node.id===id)return upd(node);if(!node.children)return node;return{...node,children:node.children.map(c=>findAndUpdate(c,id,upd))};}
function findAndDelete(node,id){if(!node.children)return node;return{...node,children:node.children.filter(c=>c.id!==id).map(c=>findAndDelete(c,id))};}
function insertInto(node,pid,child){if(node.id===pid)return{...node,children:[...(node.children||[]),child]};if(!node.children)return node;return{...node,children:node.children.map(c=>insertInto(c,pid,child))};}

// ── STORAGE — localStorage for real browser ───────────────────────────────────
const KEYS={completion:"sl-comp",revisit:"sl-rev",confused:"sl-conf",starred:"sl-star",progress:"sl-prog",library:"sl-lib"};
function lsLoad(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

// ── COMMUNITY DECKS — curated decks users can add to their library ────────────
const COMMUNITY_DECKS=[
  {
    id:"community-stoicism",title:"Stoic Philosophy",
    description:"Ancient wisdom for modern life — control, resilience, and living well.",
    type:"topic",path:[],
    cards:[
      {id:"cs-1",order:1,title:"What Is Stoicism?",body:"Stoicism is a philosophy founded in ancient Greece that teaches we cannot control external events, only our responses to them. The goal is to live according to reason and virtue, regardless of circumstance.",context:"Stoicism was founded by Zeno of Citium around 300 BC and later developed by Epictetus, Marcus Aurelius, and Seneca. It wasn't originally an academic philosophy — it was a practical guide for living.",tags:["foundational"],difficulty:1},
      {id:"cs-2",order:2,title:"The Dichotomy of Control",body:"Everything falls into two categories: what is 'up to us' (our judgments, desires, actions) and what is not (our body, reputation, wealth, others' opinions). Wisdom begins with knowing the difference.",context:"Epictetus — a former slave — made this the foundation of his teaching. His point: misery comes from wanting control over things you don't have. Freedom comes from focusing only on what you do have.",tags:["foundational","mechanism"],difficulty:1},
      {id:"cs-3",order:3,title:"Negative Visualisation",body:"Periodically imagine losing the things you value — your health, relationships, possessions. This isn't pessimism; it's a technique for appreciating what you have before it's gone.",context:"The Stoics called this premeditatio malorum — premeditation of evils. Modern psychology confirms it: people who contemplate loss experience significantly more gratitude than those who simply list blessings.",tags:["technique"],difficulty:1},
      {id:"cs-4",order:4,title:"Amor Fati — Love of Fate",body:"Amor fati means 'love of fate'. Not merely accepting what happens, but actively willing it — treating every obstacle as something to be desired, not merely endured.",context:"Marcus Aurelius: 'The impediment to action advances action. What stands in the way becomes the way.' This reframe doesn't change events; it changes what those events mean to you, which changes everything.",tags:["mindset","mechanism"],difficulty:2},
      {id:"cs-5",order:5,title:"Memento Mori",body:"Memento mori — 'remember you will die' — is a Stoic practice of regularly contemplating mortality. Not morbidly, but as a device for prioritisation and presence.",context:"Roman generals returning from victory were followed by a slave whispering 'memento mori' to prevent arrogance. Confronting death clarifies what actually matters. Many people report that awareness of mortality focuses their attention and reduces trivial anxiety.",tags:["technique","mindset"],difficulty:2},
      {id:"cs-6",order:6,title:"The Four Virtues",body:"The Stoics held that virtue is the only true good. The four cardinal virtues are: wisdom (knowing what is good), courage (acting rightly under adversity), justice (treating others fairly), and temperance (self-discipline).",context:"Crucially, the Stoics believed virtue is sufficient for happiness — external goods like wealth and health are 'preferred indifferents', nice to have but not necessary. This is a radical claim that most people find either liberating or frustrating.",tags:["foundational","values"],difficulty:2},
      {id:"cs-7",order:7,title:"The View from Above",body:"Imagine looking down at your life from a great height — your city, your country, the planet. Your problems shrink to their actual size. This perspective exercise dissolves petty grievances instantly.",context:"Marcus Aurelius used this frequently in Meditations. Modern variations include the 'overview effect' reported by astronauts who say seeing Earth from space permanently changed their sense of proportion. The technique works even as a brief mental exercise.",tags:["technique","advanced"],difficulty:3},
    ]
  },
  {
    id:"community-finance",title:"Financial Literacy 101",
    description:"Core money concepts every adult should understand — no jargon.",
    type:"topic",path:[],
    cards:[
      {id:"cf-1",order:1,title:"Income vs Wealth",body:"Income is money flowing in each period. Wealth is accumulated assets minus liabilities. High income doesn't create wealth; the gap between what you earn and what you spend does.",context:"Many high earners remain financially fragile because they increase spending with every pay rise. Wealth is built by repeatedly choosing not to spend a portion of income — regardless of the amount.",tags:["foundational"],difficulty:1},
      {id:"cf-2",order:2,title:"Compound Interest",body:"Compound interest is interest earned on interest. 10,000 growing at 10% per year becomes 25,937 in 10 years — not 20,000 — because each year's gains are added to the base.",context:"Einstein allegedly called compound interest the eighth wonder of the world. The key insight is the exponential curve: returns feel slow at first and then accelerate dramatically. Starting 10 years earlier roughly doubles the end result.",tags:["mechanism","foundational"],difficulty:1},
      {id:"cf-3",order:3,title:"Assets vs Liabilities",body:"An asset puts money into your pocket. A liability takes money out. A house you live in costs you money every month — it's a liability until sold at a profit. A rental property that generates income is an asset.",context:"Robert Kiyosaki's framing from Rich Dad Poor Dad is blunt but useful: rich people buy assets; others buy liabilities they think are assets. The car, the boat, the designer clothing — all liabilities. Income-generating things — assets.",tags:["foundational","mechanism"],difficulty:1},
      {id:"cf-4",order:4,title:"Inflation",body:"Inflation is the general rise in prices over time. At 6% annual inflation, money loses half its purchasing power in about 12 years. Cash sitting in a low-interest account loses real value every year.",context:"The 'Rule of 72' estimates how long it takes to halve purchasing power: divide 72 by the inflation rate. At 6%, about 12 years. This is why holding large amounts of cash long-term is a form of losing money slowly.",tags:["mechanism","foundational"],difficulty:1},
      {id:"cf-5",order:5,title:"Opportunity Cost",body:"Every financial decision has an opportunity cost — what you give up by not choosing the alternative. Buying a car for a large sum isn't just spending that money; it's also not investing that amount for 20 years.",context:"Opportunity cost is invisible, which makes it easy to ignore. But wealth-building requires making it visible. The question is never just 'can I afford this?' It's 'what am I giving up by spending this?'",tags:["concept","mechanism"],difficulty:2},
      {id:"cf-6",order:6,title:"Diversification",body:"Diversification means spreading investments across different assets so poor performance in one doesn't devastate the whole. 'Don't put all your eggs in one basket' is the oldest financial advice for a reason.",context:"Diversification reduces risk without necessarily reducing expected returns — which is why economists call it 'the only free lunch in finance'. A mix of stocks, bonds, and other assets historically produces smoother returns than any single asset.",tags:["strategy","mechanism"],difficulty:2},
      {id:"cf-7",order:7,title:"Emergency Fund",body:"An emergency fund is 3–6 months of living expenses held in liquid, accessible savings. Its purpose is to absorb shocks — job loss, medical bills, major repairs — without forced selling of investments.",context:"Most financial stress is liquidity stress, not wealth stress. People with adequate emergency funds make calmer decisions. Without one, a single unexpected expense can trigger a spiral: credit card debt → high interest → harder to save → no fund → more vulnerability.",tags:["foundational","strategy"],difficulty:1},
      {id:"cf-8",order:8,title:"Time Value of Money",body:"A unit of money today is worth more than the same unit tomorrow because today's money can be invested and grow. This principle underpins all of finance — loans, investments, valuations, retirement planning.",context:"The time value of money explains why paying off high-interest debt early is so powerful, why starting to invest young matters so much, and why buying on credit costs more than paying cash. Every delayed decision has a calculable cost.",tags:["foundational","mechanism"],difficulty:2},
    ]
  },
  {
    id:"community-publicspeaking",title:"The Art of Public Speaking",
    description:"Speak clearly, connect with any audience, and handle the nerves.",
    type:"topic",path:[],
    cards:[
      {id:"cp-1",order:1,title:"Why It Matters More Than You Think",body:"Public speaking is consistently ranked as one of the top skills for career advancement and leadership. The ability to communicate ideas clearly in front of others amplifies everything else you know how to do.",context:"Warren Buffett has said that the best investment he ever made was a Dale Carnegie public speaking course at age 20. Communication is a force multiplier — it makes your expertise visible and actionable to others.",tags:["foundational"],difficulty:1},
      {id:"cp-2",order:2,title:"Anxiety Is Normal — Use It",body:"Speaking anxiety affects approximately 75% of people. The physical symptoms — racing heart, dry mouth, shaky hands — are identical to excitement. Reframing 'I'm nervous' as 'I'm excited' measurably improves performance.",context:"Research by Alison Wood Brooks at Harvard found that telling yourself 'I am excited' before a high-stakes situation outperforms 'I am calm' on objective performance measures. Anxiety can't be turned off; it can be redirected.",tags:["mindset","foundational"],difficulty:1},
      {id:"cp-3",order:3,title:"Know Your Audience",body:"Every speech is a gift to the audience, not a performance for yourself. Before preparing content, ask: what does this audience already know? What do they need? What will make them care?",context:"The most common mistake in presentations is failing to translate expertise into audience-relevant terms. An engineer presenting to executives needs a different structure than one presenting to peers. Audience analysis is the first step, not the last.",tags:["foundational","technique"],difficulty:1},
      {id:"cp-4",order:4,title:"The Rule of Three",body:"Information delivered in threes is significantly more memorable than any other grouping. 'Life, liberty, and the pursuit of happiness.' Three points create rhythm, completeness, and retention.",context:"The rule of three works because the human brain naturally groups information in patterns. Three is the minimum for pattern recognition and the maximum that can be held comfortably without notes. Most great speeches have three main ideas.",tags:["technique","mechanism"],difficulty:1},
      {id:"cp-5",order:5,title:"The Power of the Pause",body:"Strategic silence is one of the most underused tools in speaking. Pausing before a key point creates anticipation. Pausing after creates space for the idea to land. Most speakers fill silence with 'um' and 'uh' out of discomfort.",context:"Research shows audiences perceive speakers who pause as more competent and confident, not less. The pause feels long only to the speaker — the audience experiences it as gravitas. Practice by rehearsing with a deliberate one-second gap after every sentence.",tags:["technique"],difficulty:2},
      {id:"cp-6",order:6,title:"Eye Contact That Connects",body:"Effective eye contact means holding a genuine connection with one person for a complete thought (3–5 seconds) before moving to another. Rapid scanning or staring at slides signals disengagement and reduces trust.",context:"One-person-per-thought eye contact transforms a speech into a series of individual conversations. The person you're looking at feels personally addressed. The audience around them feel it too — it creates a sense of intimacy even in large rooms.",tags:["technique"],difficulty:2},
      {id:"cp-7",order:7,title:"Handling Questions",body:"Repeat or paraphrase every question before answering — it buys thinking time, ensures accuracy, and ensures the whole audience heard it. Answer the question asked, not the question you wish they'd asked.",context:"The phrase 'That's a great question' is now widely recognised as a stalling tactic. Instead: repeat the question, take a brief pause, then answer directly. If you don't know, say so — it builds more credibility than a vague answer.",tags:["technique","advanced"],difficulty:3},
    ]
  },
];

// ── HAPTICS — real iOS haptics via navigator.vibrate ──────────────────────────
const hap={
  light:()=>{try{navigator.vibrate?.(25);}catch{}},
  medium:()=>{try{navigator.vibrate?.(50);}catch{}},
  success:()=>{try{navigator.vibrate?.([30,20,30]);}catch{}},
  error:()=>{try{navigator.vibrate?.([60,30,60]);}catch{}}
};

// ── AUDIO ENGINE — all sounds synthesized, no files required ──────────────────
let _actx=null;
const actx=()=>{
  if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();
  if(_actx.state==="suspended")_actx.resume();
  return _actx;
};
function nburst(dur,f0,f1,q,vol){
  const ctx=actx(),n=Math.ceil(ctx.sampleRate*dur),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const src=ctx.createBufferSource();src.buffer=buf;
  const flt=ctx.createBiquadFilter();flt.type="bandpass";flt.Q.value=q;
  flt.frequency.setValueAtTime(f0,ctx.currentTime);
  if(f1)flt.frequency.exponentialRampToValueAtTime(f1,ctx.currentTime+dur);
  const g=ctx.createGain();g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  src.connect(flt);flt.connect(g);g.connect(ctx.destination);src.start();src.stop(ctx.currentTime+dur+0.01);
}
function ntone(freq,dur,vol){
  const ctx=actx(),osc=ctx.createOscillator(),g=ctx.createGain();
  osc.type="sine";osc.frequency.value=freq;
  g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  osc.connect(g);g.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+dur+0.01);
}
const snd={
  grab:      ()=>nburst(0.04,1800,600,2,0.12),
  friction:  ()=>nburst(0.07,1100,700,1.5,0.07),
  swipeLeft: ()=>{nburst(0.22,1400,260,1,0.35);setTimeout(()=>nburst(0.08,180,null,0.4,0.2),210);},
  swipeRight:()=>{nburst(0.18,900,210,1.5,0.28);setTimeout(()=>nburst(0.08,180,null,0.4,0.18),170);},
  snapBack:  ()=>nburst(0.07,200,null,0.5,0.15),
  reveal:    ()=>{ntone(660,0.15,0.1);setTimeout(()=>ntone(880,0.2,0.08),80);},
};

// ── AI GENERATION — proxied through /api/generate (key never touches client) ──
async function generateCards(prompt){
  const res=await fetch("/api/generate",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({prompt})
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||`Error ${res.status}`);
  return data;
}

function SpotifyBtn({children,onClick,variant="primary",size="md",fullWidth=false}){
  const bg=variant==="primary"?S.green:variant==="secondary"?"transparent":S.elevated;
  const col=variant==="primary"?"#1c1208":S.white;
  const border=variant==="secondary"?`1px solid ${S.border}`:"none";
  const pad=size==="sm"?"8px 16px":"14px 32px";
  const fs=size==="sm"?13:14;
  return(
    <button onMouseDown={()=>hap.medium()} onClick={()=>{onClick&&onClick();}}
      style={{background:bg,color:col,border,borderRadius:500,padding:pad,fontFamily:F,fontSize:fs,fontWeight:700,letterSpacing:"0.05em",cursor:"pointer",width:fullWidth?"100%":"auto",transition:"transform 0.1s,background 0.1s",whiteSpace:"nowrap"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";if(variant==="primary")e.currentTarget.style.background=S.greenHover;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";if(variant==="primary")e.currentTarget.style.background=S.green;}}
    >{children}</button>
  );
}

function Modal({title,onClose,children,width=480}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16,overflowY:"auto"}}>
      <div style={{background:S.elevated,borderRadius:8,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 16px 64px rgba(0,0,0,0.8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 24px 16px",position:"sticky",top:0,background:S.elevated,zIndex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:S.white,fontFamily:F,letterSpacing:"-0.02em"}}>{title}</div>
          <button onClick={()=>{hap.light();onClose();}} style={{background:"transparent",border:"none",color:S.subdued,fontSize:22,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}>✕</button>
        </div>
        <div style={{padding:"0 24px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

function Field({label,children}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:700,color:S.subdued,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:F}}>{label}</label>
      {children}
    </div>
  );
}

const inpStyle=()=>({background:S.card,border:`1px solid ${S.border}`,borderRadius:4,color:S.white,fontSize:15,padding:"12px 16px",width:"100%",fontFamily:F,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"});

function DirectoryModal({existing,onSave,onClose}){
  const[t,setT]=useState(existing?.title||"");
  return(
    <Modal title={existing?"Edit folder":"New folder"} onClose={onClose}>
      <Field label="Folder name"><input style={inpStyle()} value={t} onChange={e=>setT(e.target.value)} autoFocus onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <SpotifyBtn fullWidth onClick={()=>{if(t.trim()){hap.success();onSave(t.trim());}}}>{existing?"Save":"Create"}</SpotifyBtn>
    </Modal>
  );
}

function TopicModal({existing,onSave,onClose}){
  const[t,setT]=useState(existing?.title||"");
  return(
    <Modal title={existing?"Edit topic":"New topic"} onClose={onClose}>
      <Field label="Topic name"><input style={inpStyle()} value={t} onChange={e=>setT(e.target.value)} autoFocus onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/></Field>
      <SpotifyBtn fullWidth onClick={()=>{if(t.trim()){hap.success();onSave(t.trim());}}}>{existing?"Save":"Create"}</SpotifyBtn>
    </Modal>
  );
}

function CardModal({card,onSave,onClose}){
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

function ImportModal({onClose,onImport}){
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

function PromptContent({inline=false,onImport}){
  const[topic,setTopic]=useState("");
  const[audience,setAudience]=useState("");
  const[difficulty,setDifficulty]=useState(null);
  const[cardCount,setCardCount]=useState(30);
  const[copied,setCopied]=useState(null);
  const[generating,setGenerating]=useState(false);
  const[genResult,setGenResult]=useState(null);
  const[genError,setGenError]=useState(null);

  const generate=async()=>{
    if(!topic.trim()){setGenError("Enter a topic first.");return;}
    setGenerating(true);setGenError(null);setGenResult(null);
    try{
      const result=await generateCards(buildMaster());
      hap.success();snd.reveal();
      setGenResult(result);
    }catch(e){hap.error();setGenError(e.message);}
    finally{setGenerating(false);}
  };

  const diffNote={
    beginner:"Focus on difficulty 1 (Intro) cards. Use everyday language and analogies. Define every term you introduce.",
    intermediate:"Mix of difficulty 1–2. Assume basic domain familiarity but no deep expertise.",
    expert:"Difficulty 2–3. Skip the basics. Go deep on mechanisms, tradeoffs, and edge cases.",
  };

  const buildMaster=()=>{
    const t=topic.trim()||"[YOUR TOPIC]";
    const a=audience.trim()?`\nAUDIENCE: ${audience.trim()}`:"";
    const d=difficulty?`\nDIFFICULTY: ${difficulty} — ${diffNote[difficulty]}`:"";
    return `You are an expert curriculum designer creating content for a sequential card-based learning app.

TOPIC: ${t}${a}${d}
CARD COUNT: Generate exactly ${cardCount} cards.

Design a carefully sequenced set of learning cards. The order IS the curriculum — later cards assume the user understood earlier ones.

CARD RULES:
- One atomic idea per card. If you want to say two things, make two cards.
- body: 2–4 sentences. Plain language. Define any jargon you introduce.
- context: The deeper "so what" — why it matters, how it connects, the underlying mechanism.
- Cards must build on each other. Never reference a concept before introducing it.
- tags: reflect concept type e.g. "foundational", "mechanism", "tradeoff", "example".
- difficulty: 1 = Intro, 2 = Core, 3 = Advanced.

OUTPUT: Raw JSON only. No markdown, no code fences, no explanation before or after.

{
  "id": "topic-abc123",
  "title": "${t}",
  "type": "topic",
  "path": [],
  "cards": [
    {
      "id": "card-1",
      "order": 1,
      "title": "Concept name (short noun-phrase)",
      "body": "2–4 sentences. One idea only. Plain language.",
      "context": "Deeper why or how. What a practitioner would add.",
      "tags": ["foundational"],
      "difficulty": 1
    }
  ]
}`;
  };

  const buildSimple=()=>{
    const t=topic.trim()||"[YOUR TOPIC]";
    const a=audience.trim()?` for ${audience.trim()}`:"";
    const d=difficulty?` Difficulty focus: ${difficulty}.`:"";
    return `You are a curriculum designer. Break "${t}"${a} into a sequential card set of exactly ${cardCount} cards.${d}
Output ONLY valid JSON: { "id": "topic-abc", "title": "${t}", "type": "topic", "path": [], "cards": [{ "id": "card-1", "order": 1, "title": "...", "body": "2–4 sentences, one idea only.", "context": "deeper why/how", "tags": ["foundational"], "difficulty": 1 }] }
Rules: one idea per card, each card builds on the last, difficulty 1=Intro 2=Core 3=Advanced. No markdown. Raw JSON only.`;
  };

  const copy=(type)=>{
    const text=type==="master"?buildMaster():buildSimple();
    navigator.clipboard.writeText(text).then(()=>{hap.success();snd.reveal();setCopied(type);setTimeout(()=>setCopied(null),2200);}).catch(()=>{hap.error();});
  };

  const aiSteps=[
    ["1","Enter a topic above (audience and difficulty are optional)"],
    ["2","Click Generate with AI and wait a few seconds"],
    ["3","Review the cards then tap Add to Library"],
  ];

  return(
    <>
      <Field label="Topic">
        <input style={inpStyle()} value={topic} onChange={e=>setTopic(e.target.value)} placeholder='e.g. How transformers work' autoFocus={!inline} onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/>
      </Field>
      <Field label="Audience (optional)">
        <input style={inpStyle()} value={audience} onChange={e=>setAudience(e.target.value)} placeholder='e.g. software engineers with no ML background' onFocus={e=>e.target.style.borderColor=S.white} onBlur={e=>e.target.style.borderColor=S.border}/>
      </Field>
      <Field label="Difficulty (optional)">
        <div style={{display:"flex",gap:8}}>
          {[["Beginner","beginner",S.d1],["Intermediate","intermediate",S.d2],["Expert","expert",S.d3]].map(([label,val,color])=>(
            <button key={val} onClick={()=>{hap.light();setDifficulty(difficulty===val?null:val);}}
              style={{flex:1,padding:"10px 0",borderRadius:4,border:`1px solid ${difficulty===val?color:S.border}`,background:difficulty===val?`${color}22`:"transparent",color:difficulty===val?color:S.subdued,cursor:"pointer",fontSize:13,fontFamily:F,fontWeight:700,transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Field label={`Number of cards — ${cardCount}`}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:S.faint,fontFamily:F,flexShrink:0}}>1</span>
          <div style={{flex:1,position:"relative"}}>
            <style>{`
              .sl-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:linear-gradient(to right,${S.green} ${cardCount}%,${S.faint} ${cardCount}%);outline:none;cursor:pointer;}
              .sl-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:${S.green};cursor:pointer;box-shadow:0 0 0 3px ${S.card},0 0 0 5px ${S.green}44;}
              .sl-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${S.green};cursor:pointer;border:none;box-shadow:0 0 0 3px ${S.card},0 0 0 5px ${S.green}44;}
            `}</style>
            <input
              type="range" min={1} max={100} value={cardCount}
              onChange={e=>setCardCount(Number(e.target.value))}
              className="sl-slider"
            />
          </div>
          <span style={{fontSize:12,color:S.faint,fontFamily:F,flexShrink:0}}>100</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:S.faint,fontFamily:F}}>
          <span>Quick overview</span>
          <span>Deep dive</span>
        </div>
      </Field>

      {/* ── Action buttons ── */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
        {!generating&&!genResult&&(
          <SpotifyBtn fullWidth onClick={generate}>Generate with AI ✦</SpotifyBtn>
        )}
        {generating&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px",background:S.elevated,border:`1px solid ${S.border}`,borderRadius:500}}>
            <div style={{width:14,height:14,border:`2px solid ${S.green}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
            <span style={{fontSize:14,fontWeight:700,color:S.subdued,fontFamily:F}}>Generating cards…</span>
          </div>
        )}
        {!generating&&(
          <>
            <SpotifyBtn fullWidth variant="secondary" onClick={()=>copy("master")}>
              {copied==="master"?"Copied ✓":"Copy Master Prompt"}
            </SpotifyBtn>
            <SpotifyBtn fullWidth variant="secondary" onClick={()=>copy("simple")}>
              {copied==="simple"?"Copied ✓":"Copy Simple Prompt"}
            </SpotifyBtn>
          </>
        )}
      </div>

      {/* ── Error ── */}
      {genError&&(
        <div style={{marginTop:12,padding:"10px 14px",background:`${S.danger}15`,border:`1px solid ${S.danger}44`,borderRadius:6,fontSize:13,color:S.danger,fontFamily:F,lineHeight:1.5}}>
          {genError}
        </div>
      )}

      {/* ── Generation result preview ── */}
      {genResult&&(
        <div style={{marginTop:16,background:S.card,borderRadius:6,padding:"16px 18px"}}>
          <div style={{fontSize:11,fontWeight:700,color:S.green,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,fontFamily:F}}>Generated ✓</div>
          <div style={{fontSize:15,fontWeight:700,color:S.white,fontFamily:F,marginBottom:4}}>{genResult.title||topic}</div>
          <div style={{fontSize:12,color:S.subdued,fontFamily:F,marginBottom:12}}>{genResult.cards.length} cards</div>
          {genResult.cards.slice(0,4).map(c=>(
            <div key={c.id||c.order} style={{fontSize:12,color:S.faint,fontFamily:F,padding:"4px 0",borderBottom:`1px solid ${S.border}`}}>#{c.order} {c.title}</div>
          ))}
          {genResult.cards.length>4&&<div style={{fontSize:12,color:S.faint,fontFamily:F,marginTop:6}}>+{genResult.cards.length-4} more</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:14}}>
            {onImport&&(
              <SpotifyBtn fullWidth onClick={()=>{onImport(genResult);setGenResult(null);}}>Add to Library</SpotifyBtn>
            )}
            <SpotifyBtn fullWidth variant="secondary" onClick={()=>{setGenResult(null);generate();}}>Regenerate</SpotifyBtn>
            <SpotifyBtn fullWidth variant="ghost" onClick={()=>setGenResult(null)}>Discard</SpotifyBtn>
          </div>
        </div>
      )}

      {/* ── How to use ── */}
      {!genResult&&(
        <div style={{marginTop:20,background:S.card,borderRadius:6,padding:"16px 18px"}}>
          <div style={{fontSize:11,fontWeight:700,color:S.subdued,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontFamily:F}}>How to use</div>
          {aiSteps.map(([n,text])=>(
            <div key={n} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:S.elevated,border:`1px solid ${S.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:S.green,flexShrink:0,fontFamily:F,marginTop:1}}>{n}</div>
              <div style={{fontSize:13,color:S.subdued,fontFamily:F,lineHeight:1.6}}>{text}</div>
            </div>
          ))}
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${S.border}`,fontSize:12,color:S.faint,fontFamily:F,lineHeight:1.6}}>
            Prefer your own LLM? Copy a prompt above and paste into any AI — then use Import JSON.
          </div>
        </div>
      )}
    </>
  );
}

function PromptModal({onClose,onImport}){
  return(
    <Modal title="Generate with AI" onClose={onClose} width={560}>
      <PromptContent inline={false} onImport={onImport}/>
    </Modal>
  );
}

function CardSetManager({topic,onSave,onClose}){
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
        <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:420,overflowY:"auto"}}>
          {cards.map((c,i)=>(
            <div key={c.id} style={{background:S.card,borderRadius:4,padding:"12px 14px",display:"flex",gap:10,alignItems:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=S.cardHover}
              onMouseLeave={e=>e.currentTarget.style.background=S.card}>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                <button onClick={()=>move(i,-1)} disabled={i===0} style={{background:"none",border:"none",color:i===0?S.faint:S.subdued,cursor:i===0?"default":"pointer",fontSize:12,padding:"1px 4px",lineHeight:1}}>▲</button>
                <button onClick={()=>move(i,1)} disabled={i===cards.length-1} style={{background:"none",border:"none",color:i===cards.length-1?S.faint:S.subdued,cursor:i===cards.length-1?"default":"pointer",fontSize:12,padding:"1px 4px",lineHeight:1}}>▼</button>
              </div>
              <div style={{width:28,height:28,borderRadius:4,background:c.difficulty===1?`${S.d1}22`:c.difficulty===2?`${S.d2}22`:`${S.d3}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.difficulty===1?S.d1:c.difficulty===2?S.d2:S.d3,flexShrink:0}}>{c.order}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{fontSize:12,color:S.subdued,fontFamily:F,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.body}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <SpotifyBtn size="sm" variant="ghost" onClick={()=>setEditing(c)}>Edit</SpotifyBtn>
                <button onClick={()=>del(c.id)} style={{background:"none",border:"none",color:S.subdued,cursor:"pointer",fontSize:18,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}
                  onMouseEnter={e=>e.currentTarget.style.color=S.danger}
                  onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>✕</button>
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

function EditorTree({node,depth=0,isRoot,onAddDir,onAddTopic,onEdit,onDelete,onCards}){
  const[open,setOpen]=useState(true);
  const pad=depth*20;
  const DelBtn=({id})=>(
    <button onClick={e=>{e.stopPropagation();hap.error();onDelete(id);}}
      style={{background:"none",border:"none",color:S.subdued,cursor:"pointer",fontSize:18,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",flexShrink:0}}
      onMouseEnter={e=>e.currentTarget.style.color=S.danger}
      onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>✕</button>
  );
  if(node.type==="topic"){
    return(
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",marginLeft:pad,marginBottom:2,borderRadius:4,transition:"background 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.background=S.card}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{width:36,height:36,borderRadius:4,background:S.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📄</div>
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
        <span style={{fontSize:12,color:S.subdued,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(90deg)":"rotate(0deg)",width:16}}>▶</span>
        <span style={{fontSize:16,flexShrink:0}}>📁</span>
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

function LibraryEditor({library,onSave,onClose}){
  const[tree,setTree]=useState(library);
  const[modal,setModal]=useState(null);
  const addDir=(pid,t)=>{setTree(p=>rebuildPaths(insertInto(p,pid,{id:`dir-${uid()}`,title:t,type:"directory",children:[]})));setModal(null);};
  const addTopic=(pid,t)=>{setTree(p=>rebuildPaths(insertInto(p,pid,{id:`topic-${uid()}`,title:t,type:"topic",path:[],cards:[]})));setModal(null);};
  const renameNode=(id,t)=>{setTree(p=>rebuildPaths(findAndUpdate(p,id,n=>({...n,title:t}))));setModal(null);};
  const deleteNode=(id)=>{setTree(p=>rebuildPaths(findAndDelete(p,id)));};
  const saveCards=(topic)=>{setTree(p=>rebuildPaths(findAndUpdate(p,topic.id,()=>topic)));setModal(null);};
  const handleImport=(data)=>{setTree(p=>rebuildPaths(insertInto(p,"root",{...data,id:data.id||`topic-${uid()}`,type:"topic",path:data.path||[]})));setModal(null);};
  return(
    <>
      <Modal title="Your Library" onClose={onClose} width={640}>
        <EditorTree node={tree} isRoot onAddDir={id=>setModal({type:"dir",pid:id})} onAddTopic={id=>setModal({type:"topic",pid:id})} onEdit={n=>setModal({type:n.type==="directory"?"dir":"topic",node:n})} onDelete={deleteNode} onCards={n=>setModal({type:"cards",node:n})}/>
        <div style={{display:"flex",gap:10,marginTop:24,paddingTop:16,borderTop:`1px solid ${S.border}`,flexWrap:"wrap"}}>
          <SpotifyBtn variant="ghost" onClick={()=>setModal({type:"prompt"})}>Generate prompt</SpotifyBtn>
          <SpotifyBtn variant="ghost" onClick={()=>setModal({type:"import"})}>Import JSON</SpotifyBtn>
          <SpotifyBtn onClick={()=>{hap.success();onSave(tree);onClose();}}>Save library</SpotifyBtn>
        </div>
      </Modal>
      {modal?.type==="dir"&&!modal.node&&<DirectoryModal onSave={t=>addDir(modal.pid,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="dir"&&modal.node&&<DirectoryModal existing={modal.node} onSave={t=>renameNode(modal.node.id,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="topic"&&!modal.node&&<TopicModal onSave={t=>addTopic(modal.pid,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="topic"&&modal.node&&<TopicModal existing={modal.node} onSave={t=>renameNode(modal.node.id,t)} onClose={()=>setModal(null)}/>}
      {modal?.type==="cards"&&<CardSetManager topic={modal.node} onSave={saveCards} onClose={()=>setModal(null)}/>}
      {modal?.type==="import"&&<ImportModal onClose={()=>setModal(null)} onImport={handleImport}/>}
      {modal?.type==="prompt"&&<PromptModal onClose={()=>setModal(null)} onImport={handleImport}/>}
    </>
  );
}

function Sidebar({open,onClose,themeName,onTheme,library,onAddDeck}){
  const addedIds=new Set(flattenTopics(library||{id:"root",type:"directory",children:[]}).map(t=>t.id));
  return(
    <>
      {/* Backdrop */}
      <div onClick={()=>{hap.light();onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,pointerEvents:open?"auto":"none",opacity:open?1:0,transition:"opacity 0.28s"}}/>
      {/* Panel */}
      <div style={{position:"fixed",top:0,left:0,height:"100%",width:272,background:S.surface,borderRight:`1px solid ${S.border}`,zIndex:301,transform:open?"translateX(0)":"translateX(-280px)",transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 16px 16px",borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
          <img src="/icon-192.png" alt="Deckwise" style={{width:28,height:28,borderRadius:6}}/>
          <span style={{fontSize:16,fontWeight:700,color:S.white,fontFamily:F,flex:1,letterSpacing:"-0.01em"}}>Deckwise</span>
          <button onClick={()=>{hap.light();onClose();}} style={{background:"transparent",border:"none",color:S.subdued,fontSize:20,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",flexShrink:0}}
            onMouseEnter={e=>e.currentTarget.style.color=S.white}
            onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>✕</button>
        </div>

        {/* ── Color Profiles ── */}
        <div style={{padding:"20px 16px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:S.subdued,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontFamily:F}}>Color Profiles</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {THEME_META.map(tm=>{
              const active=themeName===tm.id;
              return(
                <button key={tm.id} onClick={()=>{onTheme(tm.id);}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:6,background:active?`${tm.accent}18`:"transparent",border:`1px solid ${active?tm.accent:S.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s",width:"100%"}}>
                  {/* Swatch */}
                  <div style={{width:32,height:32,borderRadius:7,background:tm.bg,border:`2px solid ${tm.accent}`,flexShrink:0,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",bottom:0,right:0,width:"52%",height:"52%",background:tm.accent,borderTopLeftRadius:5}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:active?S.white:S.subdued,fontFamily:F,flex:1,transition:"color 0.15s"}}>{tm.name}</span>
                  {active&&<span style={{color:tm.accent,fontSize:15,flexShrink:0}}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:S.border,margin:"0 16px"}}/>

        {/* ── Community Decks ── */}
        <div style={{padding:"20px 16px",flex:1}}>
          <div style={{fontSize:11,fontWeight:700,color:S.subdued,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,fontFamily:F}}>Community Decks</div>
          <div style={{fontSize:12,color:S.faint,fontFamily:F,marginBottom:16,lineHeight:1.5}}>Curated decks you can add to your library</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {COMMUNITY_DECKS.map(deck=>{
              const added=addedIds.has(deck.id);
              return(
                <div key={deck.id} style={{background:S.elevated,borderRadius:8,padding:"14px",border:`1px solid ${S.border}`}}>
                  <div style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F,marginBottom:3}}>{deck.title}</div>
                  <div style={{fontSize:12,color:S.subdued,fontFamily:F,marginBottom:2,lineHeight:1.5}}>{deck.description}</div>
                  <div style={{fontSize:11,color:S.faint,fontFamily:F,marginBottom:12}}>{deck.cards.length} cards</div>
                  <button
                    onClick={()=>{if(!added){hap.success();snd.reveal();onAddDeck(deck);}}}
                    style={{width:"100%",padding:"8px 0",borderRadius:500,background:added?`${S.green}18`:"transparent",border:`1px solid ${added?S.green:S.border}`,color:added?S.green:S.subdued,cursor:added?"default":"pointer",fontSize:12,fontWeight:700,fontFamily:F,transition:"all 0.15s"}}
                    onMouseEnter={e=>{if(!added){e.currentTarget.style.borderColor=S.subdued;e.currentTarget.style.color=S.white;}}}
                    onMouseLeave={e=>{if(!added){e.currentTarget.style.borderColor=S.border;e.currentTarget.style.color=S.subdued;}}}>
                    {added?"Added ✓":"Add to Library"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function DraggableCard({card,onSwipe,stackIndex,isTop,confused,onConfused,starred,onStarred}){
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
    <div ref={ref} style={{position:"absolute",width:"100%",maxWidth:440,left:"50%",top:0,transform:`translateX(-50%) ${tx}`,transition:tr,cursor:isTop?"grab":"default",userSelect:"none",zIndex:10-stackIndex,touchAction:"none",filter:stackIndex>0?`brightness(${1-stackIndex*0.15})`:"none"}}>
      <div style={{background:S.card,borderRadius:8,overflow:"hidden",position:"relative",boxShadow:isTop?"0 8px 40px rgba(0,0,0,0.6)":"0 2px 12px rgba(0,0,0,0.4)"}}>
        <div style={{height:3,background:dc,width:"100%"}}/>
        {isTop&&lOp>0.08&&<div style={{position:"absolute",top:20,left:16,opacity:lOp,transform:"rotate(-8deg)",zIndex:10,border:`2px solid ${S.green}`,borderRadius:4,padding:"4px 14px",color:S.green,fontWeight:700,fontSize:18,fontFamily:F,pointerEvents:"none"}}>Got it ✓</div>}
        {isTop&&rOp>0.08&&<div style={{position:"absolute",top:20,right:16,opacity:rOp,transform:"rotate(8deg)",zIndex:10,border:`2px solid ${S.danger}`,borderRadius:4,padding:"4px 14px",color:S.danger,fontWeight:700,fontSize:18,fontFamily:F,pointerEvents:"none"}}>Again ↺</div>}
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
            ?<button onClick={()=>{hap.light();snd.reveal();setShowCtx(true);}} style={{fontSize:12,fontWeight:700,color:S.white,background:"transparent",border:`1px solid ${S.border}`,borderRadius:500,padding:"6px 16px",cursor:"pointer",fontFamily:F,letterSpacing:"0.04em"}} onMouseEnter={e=>e.currentTarget.style.borderColor=S.white} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>↑ Expand</button>
            :<button onClick={()=>{hap.light();setShowCtx(false);}} style={{fontSize:12,fontWeight:700,color:S.subdued,background:"transparent",border:`1px solid ${S.border}`,borderRadius:500,padding:"6px 16px",cursor:"pointer",fontFamily:F,letterSpacing:"0.04em"}} onMouseEnter={e=>e.currentTarget.style.borderColor=S.subdued} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>↓ Collapse</button>
          }
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button onClick={()=>{hap.light();onStarred();}} style={{fontSize:14,fontWeight:700,color:starred?S.star:S.subdued,background:starred?`${S.star}18`:"transparent",border:`1px solid ${starred?S.star:S.border}`,borderRadius:500,padding:"6px 14px",cursor:"pointer",fontFamily:F,transition:"all 0.15s",lineHeight:1}}>
              {starred?"★":"☆"}
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

function ActionBar({onLeft,onRight,onBack,canBack}){
  return(
    <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center",padding:"20px 0 8px"}}>
      <button onClick={()=>{if(canBack){hap.light();onBack();}}}
        style={{width:46,height:46,borderRadius:"50%",background:S.elevated,border:`1px solid ${S.border}`,color:S.subdued,fontSize:20,cursor:canBack?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s,opacity 0.2s",opacity:canBack?1:0.3}}
        onMouseEnter={e=>{if(canBack){e.currentTarget.style.background=S.card;e.currentTarget.style.transform="scale(1.08)";}}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.elevated;e.currentTarget.style.transform="scale(1)";}}>↩</button>
      <button onClick={()=>{hap.error();snd.swipeRight();onRight();}} style={{width:56,height:56,borderRadius:"50%",background:S.elevated,border:`1px solid ${S.border}`,color:S.danger,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.background=S.card;e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.elevated;e.currentTarget.style.transform="scale(1)";}}>↺</button>
      <button onClick={()=>{hap.success();snd.swipeLeft();onLeft();}} style={{width:56,height:56,borderRadius:"50%",background:S.green,border:"none",color:S.bg,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s,background 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.background=S.greenHover;e.currentTarget.style.transform="scale(1.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=S.green;e.currentTarget.style.transform="scale(1)";}}>✓</button>
    </div>
  );
}

function ProgressBar({current,total,revisitCount,confusedCount}){
  const pct=total?Math.round(current/total*100):0;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12,fontFamily:F}}>
        <span style={{color:S.subdued,fontWeight:700}}>{current} / {total}</span>
        <span style={{display:"flex",gap:12}}>
          {revisitCount>0&&<span style={{color:S.danger,fontWeight:700}}>↺ {revisitCount}</span>}
          {confusedCount>0&&<span style={{color:S.green,fontWeight:700}}>{confusedCount} flagged</span>}
          <span style={{color:S.white,fontWeight:700}}>{pct}%</span>
        </span>
      </div>
      <div style={{height:4,background:S.faint,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:S.green,borderRadius:2,transition:"width 0.4s"}}/>
      </div>
    </div>
  );
}

function DirectoryNode({node,depth,onSelect,completionMap,progressMap,confusedIds=[],starredIds=[],onSelectFlagged,onSelectStarred}){
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

function CompletionScreen({topic,revisitCards,confusedCards,starredCards,onHome,onRevisitAll,onStudyFlagged,onStudyStarred}){
  return(
    <div style={{padding:"40px 0 24px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:`${S.green}22`,border:`2px solid ${S.green}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36}}>🎯</div>
      <div style={{fontSize:28,fontWeight:700,color:S.white,fontFamily:F,letterSpacing:"-0.02em",marginBottom:8}}>Done!</div>
      <div style={{fontSize:15,color:S.subdued,fontFamily:F,marginBottom:36}}>{topic.title}</div>
      {revisitCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.danger,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Review queue · {revisitCards.length}</div>
          {revisitCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onRevisitAll();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.danger}`,borderRadius:500,color:S.danger,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Start review →</button>
        </div>
      )}
      {confusedCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.green,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Flagged · {confusedCards.length}</div>
          {confusedCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onStudyFlagged();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.green}`,borderRadius:500,color:S.green,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Study flagged cards →</button>
        </div>
      )}
      {starredCards.length>0&&(
        <div style={{background:S.card,borderRadius:8,padding:"16px 20px",marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:S.star,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:F}}>Starred · {starredCards.length}</div>
          {starredCards.map(c=><div key={c.id} style={{fontSize:13,color:S.subdued,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontFamily:F}}>{c.title}</div>)}
          <button onClick={()=>{hap.medium();onStudyStarred();}} style={{marginTop:14,width:"100%",padding:"11px 0",background:"transparent",border:`1px solid ${S.star}`,borderRadius:500,color:S.star,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:F}}>Review starred cards →</button>
        </div>
      )}
      <SpotifyBtn fullWidth onClick={()=>{hap.medium();onHome();}}>Back to library</SpotifyBtn>
    </div>
  );
}

export default function App(){
  const[ready,setReady]=useState(false);
  const[library,setLibrary]=useState(null);
  const[completionMap,setCompletionMap]=useState({});
  const[revisitIds,setRevisitIds]=useState([]);
  const[confusedIds,setConfusedIds]=useState([]);
  const[starredIds,setStarredIds]=useState([]);
  const[progressMap,setProgressMap]=useState({});
  const[screen,setScreen]=useState("home");
  const[activeTopic,setActiveTopic]=useState(null);
  const[cardIndex,setCardIndex]=useState(0);
  const[activeQueue,setActiveQueue]=useState([]);
  const[showEditor,setShowEditor]=useState(false);
  const[showPromptPanel,setShowPromptPanel]=useState(false);
  const[showQuickGenerate,setShowQuickGenerate]=useState(false);
  const[sidebarOpen,setSidebarOpen]=useState(false);
  const[themeName,setThemeName]=useState(_t);
  const[cardHistory,setCardHistory]=useState([]);

  // ── load from localStorage on boot ─────────────────────────────────────────
  useEffect(()=>{
    setCompletionMap(lsLoad(KEYS.completion,{}));
    setRevisitIds(lsLoad(KEYS.revisit,[]));
    setConfusedIds(lsLoad(KEYS.confused,[]));
    setStarredIds(lsLoad(KEYS.starred,[]));
    setProgressMap(lsLoad(KEYS.progress,{}));
    setLibrary(lsLoad(KEYS.library,null)||DEMO_DATA);
    setReady(true);
  },[]);

  const switchTheme=useCallback((name)=>{
    Object.assign(S,THEMES[name]||THEMES.autumn);
    document.body.style.background=S.bg;
    document.documentElement.style.background=S.bg;
    setThemeName(name);
    lsSave("sl-theme",name);
  },[]);

  const saveLibrary=useCallback((tree)=>{setLibrary(tree);lsSave(KEYS.library,tree);},[]);
  const handleDirectImport=useCallback((data)=>{
    setLibrary(prev=>{
      const updated=rebuildPaths(insertInto(prev,"root",{...data,id:data.id||`topic-${uid()}`,type:"topic",path:data.path||[]}));
      lsSave(KEYS.library,updated);
      return updated;
    });
  },[]);
  const topics=library?flattenTopics(library):[];
  const currentCard=activeQueue[cardIndex];
  const totalCards=topics.reduce((s,t)=>s+t.cards.length,0);
  const doneCards=topics.reduce((s,t)=>s+t.cards.filter(c=>completionMap[c.id]).length,0);
  const pct=totalCards?Math.round(doneCards/totalCards*100):0;

  const startTopic=(topic,mode="normal")=>{
    let cards;
    if(mode==="revisit")cards=topic.cards.filter(c=>revisitIds.includes(c.id));
    else if(mode==="flagged")cards=topic.cards.filter(c=>confusedIds.includes(c.id));
    else if(mode==="starred")cards=topic.cards.filter(c=>starredIds.includes(c.id));
    else cards=topic.cards;
    const queue=cards.map(c=>({...c,topicId:topic.id,topicTitle:topic.title}));
    const saved=mode==="normal"&&progressMap[topic.id]?progressMap[topic.id]:0;
    setCardHistory([]);
    setActiveTopic(topic);setActiveQueue(queue);setCardIndex(Math.min(saved,Math.max(0,queue.length-1)));setScreen("learn");
  };

  const advance=useCallback((dir)=>{
    const card=activeQueue[cardIndex];if(!card)return;
    setCardHistory(h=>[...h,{cardId:card.id,dir}]);
    if(dir==="left"){
      const nc={...completionMap,[card.id]:true};const nr=revisitIds.filter(id=>id!==card.id);
      setCompletionMap(nc);setRevisitIds(nr);lsSave(KEYS.completion,nc);lsSave(KEYS.revisit,nr);
    }else if(dir==="right"&&!revisitIds.includes(card.id)){
      const nr=[...revisitIds,card.id];setRevisitIds(nr);lsSave(KEYS.revisit,nr);
    }
    const next=cardIndex+1;
    if(next>=activeQueue.length){
      const np={...progressMap,[card.topicId]:0};setProgressMap(np);lsSave(KEYS.progress,np);setScreen("complete");
    }else{
      const np={...progressMap,[card.topicId]:next};setProgressMap(np);lsSave(KEYS.progress,np);setCardIndex(next);
    }
  },[activeQueue,cardIndex,completionMap,revisitIds,progressMap]);

  const goBack=useCallback(()=>{
    if(!cardHistory.length)return;
    const prev=cardHistory[cardHistory.length-1];
    setCardHistory(h=>h.slice(0,-1));
    if(prev.dir==="left"){
      const nc={...completionMap};delete nc[prev.cardId];
      setCompletionMap(nc);lsSave(KEYS.completion,nc);
    }else if(prev.dir==="right"){
      const nr=revisitIds.filter(id=>id!==prev.cardId);
      setRevisitIds(nr);lsSave(KEYS.revisit,nr);
    }
    const prevIndex=cardIndex-1;
    const prevCard=activeQueue[prevIndex];
    if(prevCard){const np={...progressMap,[prevCard.topicId]:prevIndex};setProgressMap(np);lsSave(KEYS.progress,np);}
    setCardIndex(prevIndex);
  },[cardHistory,cardIndex,completionMap,revisitIds,progressMap,activeQueue]);

  const toggleConfused=useCallback((id)=>{
    const next=confusedIds.includes(id)?confusedIds.filter(x=>x!==id):[...confusedIds,id];
    setConfusedIds(next);lsSave(KEYS.confused,next);
  },[confusedIds]);

  const toggleStarred=useCallback((id)=>{
    const next=starredIds.includes(id)?starredIds.filter(x=>x!==id):[...starredIds,id];
    setStarredIds(next);lsSave(KEYS.starred,next);
  },[starredIds]);

  const handleReset=()=>{
    hap.error();
    setCompletionMap({});setRevisitIds([]);setConfusedIds([]);setProgressMap({});
    [KEYS.completion,KEYS.revisit,KEYS.confused,KEYS.progress].forEach(k=>lsSave(k,k===KEYS.revisit||k===KEYS.confused?[]:{}) );
    setScreen("home");
  };

  const revisitCards=activeTopic?activeTopic.cards.filter(c=>revisitIds.includes(c.id)):[];
  const confusedCards=activeTopic?activeTopic.cards.filter(c=>confusedIds.includes(c.id)):[];
  const starredCards=activeTopic?activeTopic.cards.filter(c=>starredIds.includes(c.id)):[];

  if(!ready)return(
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:40,height:40,border:`3px solid ${S.green}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:F,color:S.white}}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}button{font-family:${F};}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${S.faint};border-radius:2px;}`}</style>

      {screen==="home"&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showPromptPanel?16:28}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>{hap.light();setSidebarOpen(true);}} style={{background:"transparent",border:"none",color:S.subdued,fontSize:20,cursor:"pointer",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color=S.white}
                onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>☰</button>
              <img src="/icon-192.png" alt="Deckwise" style={{width:36,height:36,borderRadius:8}}/>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>{hap.light();setShowPromptPanel(p=>!p);}} style={{background:showPromptPanel?`${S.green}18`:"transparent",border:`1px solid ${showPromptPanel?S.green:S.border}`,color:showPromptPanel?S.green:S.subdued,borderRadius:500,padding:"7px 14px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F,transition:"all 0.15s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{if(!showPromptPanel){e.currentTarget.style.borderColor=S.subdued;e.currentTarget.style.color=S.white;}}}
                onMouseLeave={e=>{if(!showPromptPanel){e.currentTarget.style.borderColor=S.border;e.currentTarget.style.color=S.subdued;}}}>
                {showPromptPanel?"✕ Close":"AI Prompt"}
              </button>
              <SpotifyBtn size="sm" onClick={()=>setShowEditor(true)}>Edit library</SpotifyBtn>
              <button onClick={handleReset} style={{background:"transparent",border:"none",color:S.faint,fontSize:13,cursor:"pointer",fontFamily:F,padding:"4px 8px"}}
                onMouseEnter={e=>e.currentTarget.style.color=S.subdued}
                onMouseLeave={e=>e.currentTarget.style.color=S.faint}>Reset</button>
            </div>
          </div>
          {showPromptPanel&&(
            <div style={{background:S.elevated,border:`1px solid ${S.border}`,borderRadius:8,padding:"20px",marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:S.green,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:16,fontFamily:F}}>Generate with AI</div>
              <PromptContent inline onImport={handleDirectImport}/>
            </div>
          )}
          <div style={{background:S.card,borderRadius:8,padding:"20px",marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:14}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:S.subdued,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>Overall progress</div>
                <div style={{fontSize:13,color:S.subdued,fontFamily:F}}>{doneCards} of {totalCards} cards</div>
              </div>
              <div style={{fontSize:32,fontWeight:700,color:S.green}}>{pct}<span style={{fontSize:18,color:S.subdued}}>%</span></div>
            </div>
            <div style={{height:4,background:S.faint,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:S.green,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            {(revisitIds.length>0||confusedIds.length>0)&&(
              <div style={{display:"flex",gap:16,marginTop:14}}>
                {revisitIds.length>0&&<span style={{fontSize:13,color:S.danger,fontWeight:700}}>↺ {revisitIds.length} to review</span>}
                {confusedIds.length>0&&<span style={{fontSize:13,color:S.green,fontWeight:700}}>{confusedIds.length} flagged</span>}
              </div>
            )}
          </div>
          {library&&<DirectoryNode node={library} depth={0} onSelect={startTopic} completionMap={completionMap} progressMap={progressMap} confusedIds={confusedIds} starredIds={starredIds} onSelectFlagged={t=>startTopic(t,"flagged")} onSelectStarred={t=>startTopic(t,"starred")}/>}
          <div style={{marginTop:20,padding:"20px",background:S.elevated,borderRadius:8,border:`1px solid ${S.border}`,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:S.white,fontFamily:F,marginBottom:4}}>Generate a topic with AI</div>
            <div style={{fontSize:13,color:S.subdued,fontFamily:F,marginBottom:16}}>Turn any subject into a ready-to-swipe card deck</div>
            <SpotifyBtn fullWidth onClick={()=>{hap.medium();setShowQuickGenerate(true);}}>Generate with AI ✦</SpotifyBtn>
          </div>
          <div style={{marginTop:12,background:S.card,borderRadius:8,padding:"16px 20px"}}>
            <div style={{fontSize:13,fontWeight:700,color:S.subdued,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:14}}>How to swipe</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["← Left","Got it ✓",S.green],["→ Right","Review ↺",S.danger],["↑ Up","Deep dive",S.white],["Flag btn","Research",S.subdued]].map(([k,v,c])=>(
                <div key={k}><div style={{fontSize:13,fontWeight:700,color:c,marginBottom:2}}>{k}</div><div style={{fontSize:12,color:S.faint}}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{marginTop:10,textAlign:"center",fontSize:12,color:S.faint}}>All progress saved automatically</div>
        </div>
      )}

      {screen==="learn"&&currentCard&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"16px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>{hap.light();setScreen("home");}} style={{background:"transparent",border:"none",color:S.subdued,fontSize:22,cursor:"pointer",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}
              onMouseEnter={e=>e.currentTarget.style.color=S.white}
              onMouseLeave={e=>e.currentTarget.style.color=S.subdued}>‹</button>
            <div style={{flex:1,fontSize:15,fontWeight:700,color:S.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeTopic?.title}</div>
          </div>
          <ProgressBar current={cardIndex} total={activeQueue.length} revisitCount={revisitIds.filter(id=>activeQueue.some(c=>c.id===id)).length} confusedCount={confusedIds.filter(id=>activeQueue.some(c=>c.id===id)).length}/>
          <div style={{position:"relative",height:500,marginTop:20}}>
            {[2,1,0].map(offset=>{const c=activeQueue[cardIndex+offset];if(!c)return null;return <DraggableCard key={`${c.id}-${cardIndex}`} card={c} isTop={offset===0} stackIndex={offset} confused={confusedIds.includes(c.id)} onConfused={()=>toggleConfused(c.id)} starred={starredIds.includes(c.id)} onStarred={()=>toggleStarred(c.id)} onSwipe={advance}/>;}).filter(Boolean)}
          </div>
          <ActionBar onLeft={()=>advance("left")} onRight={()=>advance("right")} onBack={goBack} canBack={cardHistory.length>0}/>
          <div style={{textAlign:"center",fontSize:12,color:S.faint,marginTop:8}}>Drag or tap · progress saved</div>
        </div>
      )}

      {screen==="complete"&&activeTopic&&(
        <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}}>
          <CompletionScreen topic={activeTopic} revisitCards={revisitCards} confusedCards={confusedCards} starredCards={starredCards} onHome={()=>setScreen("home")} onRevisitAll={()=>startTopic(activeTopic,"revisit")} onStudyFlagged={()=>startTopic(activeTopic,"flagged")} onStudyStarred={()=>startTopic(activeTopic,"starred")}/>
        </div>
      )}

      {showEditor&&library&&<LibraryEditor library={library} onSave={saveLibrary} onClose={()=>setShowEditor(false)}/>}
      {showQuickGenerate&&<PromptModal onClose={()=>setShowQuickGenerate(false)} onImport={handleDirectImport}/>}
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} themeName={themeName} onTheme={switchTheme} library={library||{id:"root",type:"directory",children:[]}} onAddDeck={handleDirectImport}/>
    </div>
  );
}