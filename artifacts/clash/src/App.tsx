import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:ital,wght@0,400;0,500;1,400&display=swap');`;

const css = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0a0a0a;
  --surface:#111;
  --surface2:#1a1a1a;
  --border:#222;
  --red:#e63946;
  --red-dim:#7a1a20;
  --blue:#0077ff;
  --blue-dim:#00388a;
  --gold:#f4c542;
  --text:#f0f0f0;
  --text-dim:#666;
  --text-mid:#999;
  --green:#22c55e;
  --radius:8px;
}
body{background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh;overflow-x:hidden;}

body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);}

.app{max-width:780px;margin:0 auto;padding:40px 20px 80px;}

.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;}
.logo{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:4px;color:var(--text);position:relative;}
.logo span{color:var(--red);}
.logo::after{content:'BETA';font-family:'Barlow Condensed',sans-serif;font-size:10px;
letter-spacing:2px;background:var(--red);color:#fff;padding:2px 6px;border-radius:3px;
position:absolute;top:-4px;right:-46px;}
.nav-rank{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;
color:var(--text-dim);text-transform:uppercase;}
.nav-rank span{color:var(--gold);font-size:18px;font-weight:700;}

.screen{animation:fadeIn 0.3s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

.home-hero{text-align:center;padding:20px 0 48px;}
.home-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,12vw,96px);line-height:0.9;letter-spacing:2px;margin-bottom:16px;}
.home-title .line2{color:var(--red);display:block;}
.home-sub{font-size:18px;color:var(--text-mid);font-style:italic;margin-bottom:40px;}
.home-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

.btn{font-family:'Barlow Condensed',sans-serif;font-size:15px;letter-spacing:3px;
text-transform:uppercase;padding:14px 32px;border-radius:var(--radius);
border:none;cursor:pointer;transition:all 0.2s;font-weight:600;}
.btn-primary{background:var(--red);color:#fff;}
.btn-primary:hover{background:#ff4655;transform:translateY(-1px);box-shadow:0 8px 24px rgba(230,57,70,0.4);}
.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border);}
.btn-secondary:hover{border-color:var(--text-dim);transform:translateY(-1px);}
.btn-ghost{background:transparent;color:var(--text-dim);border:1px solid var(--border);}
.btn-ghost:hover{color:var(--text);border-color:var(--text-dim);}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none !important;box-shadow:none !important;}

.section-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;
text-transform:uppercase;color:var(--text-dim);margin-bottom:16px;}

.stats-row{display:flex;gap:12px;margin-bottom:40px;flex-wrap:wrap;}
.stat-card{flex:1;min-width:100px;background:var(--surface);border:1px solid var(--border);
border-radius:var(--radius);padding:16px 20px;}
.stat-card .val{font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--text);display:block;}
.stat-card .val.red{color:var(--red);}
.stat-card .val.gold{color:var(--gold);}
.stat-card .val.green{color:var(--green);}
.stat-card .lbl{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;
text-transform:uppercase;color:var(--text-dim);}

.ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:32px;}
.ai-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
padding:20px 16px;cursor:pointer;transition:all 0.2s;text-align:center;}
.ai-card:hover{border-color:var(--text-dim);transform:translateY(-2px);}
.ai-card.selected{border-color:var(--red);background:rgba(230,57,70,0.08);}
.ai-card .ai-icon{font-size:32px;margin-bottom:10px;display:block;}
.ai-card .ai-name{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;
letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
.ai-card .ai-desc{font-size:12px;color:var(--text-dim);line-height:1.4;}
.ai-card .ai-diff{display:inline-block;margin-top:8px;font-family:'Barlow Condensed',sans-serif;
font-size:11px;letter-spacing:2px;padding:2px 8px;border-radius:3px;text-transform:uppercase;}
.diff-easy{background:rgba(34,197,94,0.15);color:var(--green);}
.diff-medium{background:rgba(244,197,66,0.15);color:var(--gold);}
.diff-hard{background:rgba(230,57,70,0.15);color:var(--red);}
.diff-extreme{background:rgba(168,85,247,0.15);color:#a855f7;}

.topic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:24px;}
.topic-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
padding:16px;cursor:pointer;transition:all 0.2s;}
.topic-card:hover{border-color:var(--text-dim);}
.topic-card.selected{border-color:var(--red);background:rgba(230,57,70,0.08);}
.topic-card .t-cat{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;
text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.topic-card .t-text{font-size:15px;font-weight:500;line-height:1.4;}

.side-pick{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px;}
.side-btn{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
padding:24px 16px;cursor:pointer;transition:all 0.2s;text-align:center;font-family:'Barlow Condensed',sans-serif;}
.side-btn:hover{transform:translateY(-2px);}
.side-btn.for.selected{border-color:var(--green);background:rgba(34,197,94,0.08);}
.side-btn.against.selected{border-color:var(--red);background:rgba(230,57,70,0.08);}
.side-btn .side-icon{font-size:28px;display:block;margin-bottom:8px;}
.side-btn .side-label{font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;}
.side-btn .side-sub{font-size:12px;color:var(--text-dim);margin-top:4px;}

.arena-header{display:flex;align-items:center;justify-content:space-between;
background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:16px 20px;margin-bottom:20px;}
.arena-topic{font-size:15px;font-weight:500;flex:1;margin:0 16px;}
.round-badge{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--red);white-space:nowrap;}
.vs-badge{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;
color:var(--text-dim);text-transform:uppercase;}

.messages{display:flex;flex-direction:column;gap:16px;margin-bottom:20px;
min-height:300px;max-height:420px;overflow-y:auto;padding-right:4px;}
.messages::-webkit-scrollbar{width:4px;}
.messages::-webkit-scrollbar-track{background:transparent;}
.messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}

.msg{display:flex;gap:12px;animation:msgIn 0.3s ease;}
@keyframes msgIn{from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);}}
.msg.ai-msg{flex-direction:row-reverse;animation:msgInR 0.3s ease;}
@keyframes msgInR{from{opacity:0;transform:translateX(8px);}to{opacity:1;transform:translateX(0);}}
.msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
justify-content:center;font-size:16px;flex-shrink:0;margin-top:2px;}
.msg-avatar.user-av{background:var(--blue-dim);border:1px solid var(--blue);}
.msg-avatar.ai-av{background:var(--red-dim);border:1px solid var(--red);}
.msg-bubble{max-width:80%;}
.msg-name{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;
text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.msg-text{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);
padding:12px 16px;font-size:15px;line-height:1.6;}
.msg.ai-msg .msg-text{border-color:var(--red-dim);}

.round-score{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;animation:fadeIn 0.4s ease;}
.rs-round{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;
text-transform:uppercase;color:var(--text-dim);white-space:nowrap;}
.rs-bar{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
.rs-fill{height:100%;border-radius:3px;transition:width 0.8s ease;}
.rs-score{font-family:'Bebas Neue',sans-serif;font-size:20px;white-space:nowrap;}

.input-area{position:relative;}
.debate-input{width:100%;background:var(--surface);border:2px solid var(--border);
border-radius:var(--radius);padding:16px;font-family:'Barlow',sans-serif;font-size:15px;
color:var(--text);resize:none;outline:none;transition:border-color 0.2s;line-height:1.5;}
.debate-input:focus{border-color:var(--blue);}
.debate-input::placeholder{color:var(--text-dim);}
.input-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;}
.char-count{font-size:12px;color:var(--text-dim);}
.submit-row{display:flex;gap:8px;}

.thinking-row{display:flex;align-items:center;gap:8px;padding:12px 16px;color:var(--text-dim);
font-style:italic;font-size:14px;}
.dots span{display:inline-block;animation:dot 1.4s infinite;}
.dots span:nth-child(2){animation-delay:0.2s;}
.dots span:nth-child(3){animation-delay:0.4s;}
@keyframes dot{0%,80%,100%{opacity:0;}40%{opacity:1;}}

.verdict-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:28px;margin-bottom:20px;}
.verdict-header{text-align:center;margin-bottom:28px;}
.verdict-title{font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:3px;}
.verdict-title.win{color:var(--green);}
.verdict-title.lose{color:var(--red);}
.verdict-sub{font-size:14px;color:var(--text-dim);margin-top:4px;}
.score-breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
.score-pill{background:var(--surface2);border-radius:var(--radius);padding:14px;text-align:center;}
.score-pill .sp-val{font-family:'Bebas Neue',sans-serif;font-size:36px;display:block;}
.score-pill .sp-lbl{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;
text-transform:uppercase;color:var(--text-dim);}
.feedback-box{background:var(--surface2);border-left:3px solid var(--gold);
border-radius:0 var(--radius) var(--radius) 0;padding:16px 20px;margin-bottom:16px;}
.feedback-box .fb-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;
text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.feedback-box p{font-size:15px;line-height:1.6;color:var(--text-mid);}
.best-arg{background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);
border-radius:var(--radius);padding:14px 16px;margin-bottom:8px;}
.worst-arg{background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.2);
border-radius:var(--radius);padding:14px 16px;}
.arg-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;
text-transform:uppercase;margin-bottom:6px;}
.arg-label.best{color:var(--green);}
.arg-label.worst{color:var(--red);}

.lb-row{display:flex;align-items:center;gap:16px;padding:14px 16px;
background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
margin-bottom:8px;transition:border-color 0.2s;}
.lb-row:hover{border-color:var(--text-dim);}
.lb-row.you{border-color:var(--red);}
.lb-rank{font-family:'Bebas Neue',sans-serif;font-size:22px;width:32px;text-align:center;color:var(--text-dim);}
.lb-rank.top{color:var(--gold);}
.lb-avatar{width:36px;height:36px;border-radius:50%;background:var(--surface2);
border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px;}
.lb-info{flex:1;}
.lb-name{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;
letter-spacing:1px;text-transform:uppercase;}
.lb-meta{font-size:12px;color:var(--text-dim);}
.lb-score{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--gold);}
.lb-wins{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;
color:var(--text-dim);text-align:right;}

.tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);
border-radius:var(--radius);padding:4px;margin-bottom:24px;}
.tab{flex:1;padding:10px;text-align:center;font-family:'Barlow Condensed',sans-serif;
font-size:13px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;
cursor:pointer;border:none;background:transparent;color:var(--text-dim);transition:all 0.2s;}
.tab.active{background:var(--red);color:#fff;}

.error-banner{background:rgba(230,57,70,0.1);border:1px solid var(--red-dim);
border-radius:var(--radius);padding:12px 16px;color:#ff6b6b;font-size:14px;
margin-bottom:16px;white-space:pre-wrap;word-break:break-all;}

.divider{height:1px;background:var(--border);margin:32px 0;}

.timer-bar{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
.timer-countdown{font-family:'Bebas Neue',sans-serif;font-size:30px;min-width:44px;text-align:center;transition:color 0.3s;line-height:1;}
.timer-track{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.timer-fill{height:100%;border-radius:2px;transition:width 1s linear,background 0.5s;}
.timer-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.rounds-pick{display:flex;gap:8px;margin-bottom:24px;}
.rounds-btn{flex:1;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
padding:14px 8px;cursor:pointer;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:28px;
color:var(--text-dim);transition:all 0.2s;}
.rounds-btn:hover{border-color:var(--text-dim);color:var(--text);}
.rounds-btn.selected{border-color:var(--red);color:var(--red);background:rgba(230,57,70,0.08);}
.rounds-btn .rounds-sub{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;display:block;margin-top:3px;color:var(--text-dim);}
`;

const AI_OPPONENTS = [
  { id: "professor", icon: "🎓", name: "The Professor", desc: "Calm, methodical. Dismantles logic with academic precision.", diff: "medium", diffLabel: "Medium", timer: 180, personality: "You are a calm, highly intelligent academic debater. You cite logic and reasoning, speak in measured tones, and systematically dismantle weak arguments. You never get emotional. You are polite but devastating." },
  { id: "politician", icon: "🏛️", name: "The Politician", desc: "Dodges, pivots, and spins. Never directly admits fault.", diff: "medium", diffLabel: "Medium", timer: 180, personality: "You are a slippery politician-style debater. You deflect, reframe questions, use emotional rhetoric, appeal to broad audiences, and never directly admit you're wrong. You pivot masterfully." },
  { id: "prosecutor", icon: "⚖️", name: "The Prosecutor", desc: "Aggressive cross-examiner. Destroys weak logic ruthlessly.", diff: "hard", diffLabel: "Hard", timer: 135, personality: "You are an aggressive, relentless prosecutor. You find the weakest point in every argument and hammer it. You ask piercing rhetorical questions and never let weak logic slide. You are intense and relentless." },
  { id: "philosopher", icon: "🔮", name: "The Philosopher", desc: "Questions your assumptions. Makes you doubt everything.", diff: "hard", diffLabel: "Hard", timer: 135, personality: "You are a Socratic philosopher debater. You question the user's fundamental assumptions, expose logical fallacies, and make them doubt their own premises. You answer questions with questions. You are unsettling and deep." },
  { id: "troll", icon: "😈", name: "The Devil", desc: "Chaotic. Takes the most extreme opposing position always.", diff: "easy", diffLabel: "Easy", timer: 270, personality: "You are a chaotic devil's advocate who takes the most extreme, provocative opposing position possible. You are intentionally over-the-top but make surprisingly sharp points. You are fun but hard to pin down." },
  { id: "debunker", icon: "🔬", name: "The Debunker", desc: "Data obsessed. Demands evidence. Fact-checks everything.", diff: "extreme", diffLabel: "Extreme", timer: 60, personality: "You are a rigorous fact-checker and debunker. You demand sources, cite statistics, and dismantle arguments that lack evidence. You are skeptical of everything and can spot unsupported claims instantly. You are surgical and unforgiving." },
];

const TOPIC_POOL = [
  { cat: "Hot Take", text: "Pineapple belongs on pizza" },
  { cat: "Hot Take", text: "Mornings are better than nights" },
  { cat: "Hot Take", text: "Cats are better than dogs" },
  { cat: "Hot Take", text: "The ocean is scarier than outer space" },
  { cat: "Hot Take", text: "Winter is the best season" },
  { cat: "Hot Take", text: "Coffee is overrated" },
  { cat: "Hot Take", text: "Reading books is better than watching movies" },
  { cat: "Hot Take", text: "Fast food is genuinely good food" },
  { cat: "Hot Take", text: "Naps should be mandatory at work" },
  { cat: "Hot Take", text: "Board games beat video games for fun" },
  { cat: "Hot Take", text: "Leftovers taste better the next day" },
  { cat: "Hot Take", text: "Sports are boring to watch" },
  { cat: "Hot Take", text: "Everyone should learn to cook" },
  { cat: "Hot Take", text: "Museums are overrated" },
  { cat: "Hot Take", text: "Tattoos should be accepted in all workplaces" },
  { cat: "Hot Take", text: "Online friendships are as real as offline ones" },
  { cat: "Hot Take", text: "Celebrities should stay out of politics" },
  { cat: "Hot Take", text: "Social media is not real life" },
  { cat: "Hot Take", text: "Owning a car in a city is a waste of money" },
  { cat: "Hot Take", text: "Breakfast is the most important meal of the day" },
  { cat: "Ethics", text: "Lying is sometimes morally justified" },
  { cat: "Ethics", text: "Social media does more harm than good" },
  { cat: "Ethics", text: "The death penalty should be abolished worldwide" },
  { cat: "Ethics", text: "Zoos are ethical" },
  { cat: "Ethics", text: "It is ethical to eat meat" },
  { cat: "Ethics", text: "Anonymous whistleblowing is always justified" },
  { cat: "Ethics", text: "Billionaires should not exist" },
  { cat: "Ethics", text: "Paparazzi culture violates basic human rights" },
  { cat: "Ethics", text: "Medical experiments on animals are justified" },
  { cat: "Ethics", text: "Prisoners should have the right to vote" },
  { cat: "Ethics", text: "Everyone has a moral duty to vote" },
  { cat: "Ethics", text: "Civil disobedience is sometimes necessary" },
  { cat: "Ethics", text: "Designer babies are ethically acceptable" },
  { cat: "Ethics", text: "Euthanasia should be legal everywhere" },
  { cat: "Ethics", text: "Charity begins at home" },
  { cat: "Philosophy", text: "Free will is an illusion" },
  { cat: "Philosophy", text: "Money can buy happiness" },
  { cat: "Philosophy", text: "Life has inherent meaning" },
  { cat: "Philosophy", text: "Absolute truth does not exist" },
  { cat: "Philosophy", text: "Humans are inherently selfish" },
  { cat: "Philosophy", text: "Beauty is entirely subjective" },
  { cat: "Philosophy", text: "Intelligence matters more than emotional intelligence" },
  { cat: "Philosophy", text: "The ends justify the means" },
  { cat: "Philosophy", text: "Luck matters more than talent" },
  { cat: "Philosophy", text: "Failure is necessary for growth" },
  { cat: "Philosophy", text: "Perfection is the enemy of good" },
  { cat: "Philosophy", text: "Happiness is a choice" },
  { cat: "Philosophy", text: "Morality is objective not subjective" },
  { cat: "Philosophy", text: "Privacy is a human right not a privilege" },
  { cat: "Philosophy", text: "Consciousness survives death" },
  { cat: "Pop Culture", text: "Streaming killed the music industry" },
  { cat: "Pop Culture", text: "Video games are a valid art form" },
  { cat: "Pop Culture", text: "Marvel movies have ruined cinema" },
  { cat: "Pop Culture", text: "Reality TV is harmful to society" },
  { cat: "Pop Culture", text: "Social media influencers deserve their income" },
  { cat: "Pop Culture", text: "Hollywood has run out of original ideas" },
  { cat: "Pop Culture", text: "Sports stars are paid too much" },
  { cat: "Pop Culture", text: "Award shows are irrelevant today" },
  { cat: "Pop Culture", text: "Fan fiction is a legitimate art form" },
  { cat: "Pop Culture", text: "Comedy has become too safe" },
  { cat: "Pop Culture", text: "Nostalgia is killing creativity in entertainment" },
  { cat: "Pop Culture", text: "Podcasts are the new radio" },
  { cat: "Pop Culture", text: "Esports deserve Olympic recognition" },
  { cat: "Pop Culture", text: "Books will always beat their movie adaptations" },
  { cat: "Pop Culture", text: "Remakes are never as good as the originals" },
  { cat: "Society", text: "Remote work is better than office work" },
  { cat: "Society", text: "Cancel culture has gone too far" },
  { cat: "Society", text: "Universal basic income would help society" },
  { cat: "Society", text: "Mandatory voting should be law" },
  { cat: "Society", text: "Graffiti is art not vandalism" },
  { cat: "Society", text: "The four-day work week should be standard" },
  { cat: "Society", text: "Marriage as an institution is outdated" },
  { cat: "Society", text: "Homework does more harm than good" },
  { cat: "Society", text: "Gap years should be encouraged for all students" },
  { cat: "Society", text: "Cities should be designed for pedestrians not cars" },
  { cat: "Society", text: "Term limits should apply to all elected officials" },
  { cat: "Society", text: "Public transport should always be free" },
  { cat: "Society", text: "Prisons should focus on rehabilitation not punishment" },
  { cat: "Society", text: "Zoning laws harm cities more than they help" },
  { cat: "Society", text: "Standardized testing is useless" },
  { cat: "Tech", text: "AI will do more good than harm to humanity" },
  { cat: "Tech", text: "Privacy is more important than convenience" },
  { cat: "Tech", text: "Social media companies are too powerful" },
  { cat: "Tech", text: "Smartphones have made humans less social" },
  { cat: "Tech", text: "The metaverse will fail" },
  { cat: "Tech", text: "Cryptocurrency is the future of money" },
  { cat: "Tech", text: "Self-driving cars will save more lives than they risk" },
  { cat: "Tech", text: "Tech companies should pay far more taxes" },
  { cat: "Tech", text: "Screen time limits for children should be enforced by law" },
  { cat: "Tech", text: "Open source software is the future" },
  { cat: "Tech", text: "Algorithms are making us more polarized" },
  { cat: "Tech", text: "Everyone should learn to code" },
  { cat: "Tech", text: "Facial recognition in public spaces should be banned" },
  { cat: "Tech", text: "Space exploration is worth the money" },
  { cat: "Tech", text: "AI-generated art is not real art" },
  { cat: "Tech", text: "Automation will create more jobs than it destroys" },
  { cat: "Tech", text: "The internet has made the world more democratic" },
  { cat: "Tech", text: "Big tech giants should be broken up by governments" },
  { cat: "Tech", text: "Nuclear energy is safer than fossil fuels" },
  { cat: "Tech", text: "Video game addiction is a real medical condition" },
];

function pickTopics() {
  const pool = [...TOPIC_POOL];
  const picked: typeof TOPIC_POOL = [];
  while (picked.length < 5 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

const FAKE_LEADERBOARD = [
  { rank: 1, emoji: "🦁", name: "KINGDEBATE", wins: 47, score: 9840 },
  { rank: 2, emoji: "🐺", name: "LOGICWOLF", wins: 41, score: 8720 },
  { rank: 3, emoji: "🦊", name: "FOXFIRE99", wins: 38, score: 8100 },
  { rank: 4, emoji: "🎯", name: "SHARPTAKE", wins: 33, score: 7450 },
  { rank: 5, emoji: "⚡", name: "VOLTIX", wins: 29, score: 6800 },
  { rank: 6, emoji: "🔥", name: "BLAZELOGIC", wins: 24, score: 5920 },
  { rank: 7, emoji: "🧠", name: "BIGBRAIN47", wins: 21, score: 5100 },
];

function getScoreColor(s: number) {
  if (s >= 80) return "var(--green)";
  if (s >= 60) return "var(--gold)";
  return "var(--red)";
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

interface Message { role: "user" | "ai"; text: string; }
interface RoundScore { round: number; score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; }
interface Verdict { won: boolean; avgScore: number; avgLogic: number; avgPersuasion: number; avgDelivery: number; judgeText: string; improve: string; bestArg: string; weakArg: string; userSummary: string; }
interface Stats { wins: number; debates: number; bestScore: number; }

export default function App() {
  const [screen, setScreen] = useState<"home" | "setup" | "debate" | "verdict" | "leaderboard">("home");
  const [setupStep, setSetupStep] = useState(0);
  const [selectedAI, setSelectedAI] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{ cat: string; text: string } | null>(null);
  const [selectedSide, setSelectedSide] = useState<"for" | "against" | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [stats, setStats] = useState<Stats>({ wins: 0, debates: 0, bestScore: 0 });
  const [selectedRounds, setSelectedRounds] = useState(3);
  const [displayTopics, setDisplayTopics] = useState(() => pickTopics());
  const [timerStarted, setTimerStarted] = useState(false);
  const [lbTab, setLbTab] = useState("global");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const ai = AI_OPPONENTS.find((a) => a.id === selectedAI);

  // Derive current round from completed scores — always accurate, never stale
  const currentRound = Math.min(roundScores.length + 1, selectedRounds);
  const roundTimerDuration = ai?.timer ?? 60;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(null);
  }, []);

  // Reset timerStarted whenever AI finishes responding (new round begins)
  useEffect(() => {
    if (!thinking) setTimerStarted(false);
  }, [thinking, roundScores.length]);

  // Start countdown only after user explicitly kicks off their response
  useEffect(() => {
    const shouldRun = screen === "debate" && !thinking && roundScores.length < selectedRounds && timerStarted;
    if (shouldRun) {
      stopTimer();
      setTimeLeft(roundTimerDuration);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null || t <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (!timerStarted) {
      stopTimer();
    }
    return () => stopTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerStarted, thinking, screen, roundScores.length]);

  const startResponseTimer = useCallback(() => {
    if (!timerStarted) setTimerStarted(true);
  }, [timerStarted]);

  const startDebate = async () => {
    if (!ai || !selectedTopic || !selectedSide) return;
    setScreen("debate");
    setMessages([]);
    setRoundScores([]);
    setError("");
    setThinking(true);

    const sideLabel = selectedSide === "for" ? "FOR" : "AGAINST";
    const oppSide = selectedSide === "for" ? "AGAINST" : "FOR";

    try {
      const { text } = await apiPost<{ text: string }>("/debate/start", {
        personality: ai.personality,
        topic: selectedTopic.text,
        userSide: sideLabel,
        oppSide,
        totalRounds: selectedRounds,
        difficulty: ai.diff,
      });
      setMessages([{ role: "ai", text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setThinking(false);
    }
  };

  const submitArgument = useCallback(async (forcedText?: string) => {
    const userMsg = (forcedText ?? inputText).trim();
    if (!userMsg || thinking || !ai || !selectedTopic || !selectedSide) return;
    stopTimer();
    setInputText("");
    setError("");

    const completedRounds = roundScores.length;
    const roundNumber = completedRounds + 1;
    const isLastRound = roundNumber >= selectedRounds;

    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setThinking(true);

    const sideLabel = selectedSide === "for" ? "FOR" : "AGAINST";
    const oppSide = selectedSide === "for" ? "AGAINST" : "FOR";

    try {
      const { aiText, roundScore } = await apiPost<{
        aiText: string;
        roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string };
      }>("/debate/round", {
        personality: ai.personality,
        topic: selectedTopic.text,
        userSide: sideLabel,
        oppSide,
        messages: newMessages.slice(0, -1),
        userArgument: userMsg,
        round: roundNumber,
        totalRounds: selectedRounds,
        difficulty: ai.diff,
        isLastRound,
      });

      const newRoundScores: RoundScore[] = [...roundScores, { round: roundNumber, ...roundScore }];
      setRoundScores(newRoundScores);
      setMessages([...newMessages, { role: "ai", text: aiText }]);

      if (isLastRound) {
        setTimeout(() => generateVerdict(newRoundScores, newMessages), 4000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setThinking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, thinking, ai, selectedTopic, selectedSide, roundScores, messages, stopTimer]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeLeft === 0 && screen === "debate" && !thinking && roundScores.length < selectedRounds) {
      const fallback = inputText.trim() || "I concede this round.";
      submitArgument(fallback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const generateVerdict = async (scores: RoundScore[], _msgs: Message[]) => {
    const avgScore = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length);
    const avgLogic = Math.round(scores.reduce((s, r) => s + r.logic, 0) / scores.length);
    const avgPersuasion = Math.round(scores.reduce((s, r) => s + r.persuasion, 0) / scores.length);
    const avgDelivery = Math.round(scores.reduce((s, r) => s + r.delivery, 0) / scores.length);
    const won = avgScore >= 65;

    try {
      const userArguments = _msgs.filter((m) => m.role === "user").map((m) => m.text);
      const judgeVerdict = await apiPost<{ verdict: string; improve: string; userSummary: string }>("/debate/verdict", {
        topic: selectedTopic?.text ?? "",
        avgScore, avgLogic, avgPersuasion, avgDelivery,
        userArguments,
      });

      const allBest = scores.map((s) => s.best).filter(Boolean);
      const allWeak = scores.map((s) => s.weak).filter(Boolean);

      setVerdict({
        won, avgScore, avgLogic, avgPersuasion, avgDelivery,
        judgeText: judgeVerdict.verdict,
        improve: judgeVerdict.improve,
        bestArg: allBest[allBest.length - 1] || "Strong rebuttal.",
        weakArg: allWeak[allWeak.length - 1] || "Opening argument needed more evidence.",
        userSummary: judgeVerdict.userSummary || "",
      });

      setStats((prev) => ({
        wins: prev.wins + (won ? 1 : 0),
        debates: prev.debates + 1,
        bestScore: Math.max(prev.bestScore, avgScore),
      }));

      setScreen("verdict");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const reset = () => {
    stopTimer();
    setScreen("home");
    setSetupStep(0);
    setSelectedAI(null);
    setSelectedTopic(null);
    setSelectedSide(null);
    setSelectedRounds(3);
    setMessages([]);
    setRoundScores([]);
    setVerdict(null);
    setError("");
    setInputText("");
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo">CL<span>A</span>SH</div>
        <div className="nav-rank">
          Rank <span>#{Math.max(1, 8 - stats.wins)}</span> · {stats.wins}W {stats.debates - stats.wins}L
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div className="screen">
          <div className="home-hero">
            <h1 className="home-title">ARGUE.<span className="line2">WIN.</span></h1>
            <p className="home-sub">Solo debate. AI opponent. Real judgment.</p>
            <div className="home-cta">
              <button className="btn btn-primary" onClick={() => { setDisplayTopics(pickTopics()); setSetupStep(0); setScreen("setup"); }}>
                Start Debate
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen("leaderboard")}>
                Leaderboard
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "40px", flexWrap: "wrap" }}>
            {AI_OPPONENTS.map((a) => (
              <div key={a.id} style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "28px" }} title={a.name}>
                {a.icon}
              </div>
            ))}
          </div>

          {stats.debates > 0 && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="val red">{stats.debates}</span>
                <span className="lbl">Debates</span>
              </div>
              <div className="stat-card">
                <span className="val green">{stats.wins}</span>
                <span className="lbl">Wins</span>
              </div>
              <div className="stat-card">
                <span className="val gold">{stats.bestScore || "—"}</span>
                <span className="lbl">Best Score</span>
              </div>
              <div className="stat-card">
                <span className="val">{Math.round((stats.wins / stats.debates) * 100)}%</span>
                <span className="lbl">Win Rate</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SETUP */}
      {screen === "setup" && (
        <div className="screen">
          {setupStep === 0 && (
            <>
              <p className="section-label">Choose your opponent</p>
              <div className="ai-grid">
                {AI_OPPONENTS.map((a) => (
                  <div key={a.id} className={`ai-card ${selectedAI === a.id ? "selected" : ""}`} onClick={() => setSelectedAI(a.id)}>
                    <span className="ai-icon">{a.icon}</span>
                    <div className="ai-name">{a.name}</div>
                    <div className="ai-desc">{a.desc}</div>
                    <span className={`ai-diff diff-${a.diff}`}>{a.diffLabel}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" disabled={!selectedAI} onClick={() => setSetupStep(1)}>
                Next: Pick Topic →
              </button>
            </>
          )}

          {setupStep === 1 && (
            <>
              <p className="section-label">Pick a topic</p>
              <div className="topic-grid">
                {displayTopics.map((t, i) => (
                  <div key={i} className={`topic-card ${selectedTopic?.text === t.text ? "selected" : ""}`} onClick={() => setSelectedTopic(t)}>
                    <div className="t-cat">{t.cat}</div>
                    <div className="t-text">{t.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "24px" }}>
                <p className="section-label" style={{ marginBottom: "10px" }}>Or write your own</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. Cats are better than dogs"
                    maxLength={120}
                    style={{
                      flex: 1,
                      background: "var(--surface)",
                      border: `2px solid ${selectedTopic?.cat === "Custom" ? "var(--red)" : "var(--border)"}`,
                      borderRadius: "var(--radius)",
                      padding: "12px 16px",
                      fontFamily: "'Barlow', sans-serif",
                      fontSize: "15px",
                      color: "var(--text)",
                      outline: "none",
                    }}
                    value={selectedTopic?.cat === "Custom" ? selectedTopic.text : ""}
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        setSelectedTopic({ cat: "Custom", text: e.target.value });
                      } else {
                        setSelectedTopic(null);
                      }
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-ghost" onClick={() => setSetupStep(0)}>← Back</button>
                <button className="btn btn-primary" disabled={!selectedTopic} onClick={() => setSetupStep(2)}>
                  Next: Pick Side →
                </button>
              </div>
            </>
          )}

          {setupStep === 2 && (
            <>
              <p className="section-label">How many rounds?</p>
              <div className="rounds-pick">
                {[1, 3, 5].map((r) => (
                  <button key={r} className={`rounds-btn ${selectedRounds === r ? "selected" : ""}`} onClick={() => setSelectedRounds(r)}>
                    {r}
                    <span className="rounds-sub">{r === 1 ? "Quick" : r === 3 ? "Standard" : "Marathon"}</span>
                  </button>
                ))}
              </div>
              <p className="section-label">Pick your side</p>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: "24px" }}>
                <div style={{ fontSize: "18px", fontWeight: 500 }}>{selectedTopic?.text}</div>
              </div>
              <div className="side-pick">
                <button className={`side-btn for ${selectedSide === "for" ? "selected" : ""}`} onClick={() => setSelectedSide("for")}>
                  <span className="side-icon">✅</span>
                  <div className="side-label">For</div>
                  <div className="side-sub">I agree with this</div>
                </button>
                <button className={`side-btn against ${selectedSide === "against" ? "selected" : ""}`} onClick={() => setSelectedSide("against")}>
                  <span className="side-icon">❌</span>
                  <div className="side-label">Against</div>
                  <div className="side-sub">I disagree with this</div>
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-ghost" onClick={() => setSetupStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!selectedSide} onClick={startDebate}>
                  ⚡ Start Clash
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* DEBATE */}
      {screen === "debate" && (
        <div className="screen">
          <div className="arena-header">
            <div className="round-badge">RD {currentRound}/{selectedRounds}</div>
            <div className="arena-topic">{selectedTopic?.text}</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px" }}>{ai?.icon}</div>
              <div className="vs-badge">{ai?.name}</div>
            </div>
          </div>

          {roundScores.map((rs, i) => (
            <div key={i} className="round-score">
              <span className="rs-round">Rd {rs.round}</span>
              <div className="rs-bar">
                <div className="rs-fill" style={{ width: `${rs.score}%`, background: getScoreColor(rs.score) }} />
              </div>
              <span className="rs-score" style={{ color: getScoreColor(rs.score) }}>{rs.score}</span>
            </div>
          ))}

          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "ai" ? "ai-msg" : ""}`}>
                <div className={`msg-avatar ${m.role === "ai" ? "ai-av" : "user-av"}`}>
                  {m.role === "ai" ? ai?.icon : "👤"}
                </div>
                <div className="msg-bubble">
                  <div className="msg-name">{m.role === "ai" ? ai?.name : "You"}</div>
                  <div className="msg-text">{m.text}</div>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="msg ai-msg">
                <div className="msg-avatar ai-av">{ai?.icon}</div>
                <div className="msg-bubble">
                  <div className="msg-name">{ai?.name}</div>
                  <div className="msg-text thinking-row">
                    <div className="dots"><span>●</span><span>●</span><span>●</span></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!thinking && roundScores.length < selectedRounds && (
            <div className="input-area">
              {!timerStarted ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={startResponseTimer}
                  >
                    ▶ Start Response
                  </button>
                  <button className="btn btn-ghost" onClick={reset}>Forfeit</button>
                </div>
              ) : (
                <>
                  {timeLeft !== null && (() => {
                    const pct = (timeLeft / roundTimerDuration) * 100;
                    const color = timeLeft > roundTimerDuration * 0.5
                      ? "var(--green)"
                      : timeLeft > roundTimerDuration * 0.25
                      ? "var(--gold)"
                      : "var(--red)";
                    return (
                      <div className="timer-bar">
                        <span className="timer-countdown" style={{ color }}>{timeLeft}</span>
                        <div className="timer-track">
                          <div className="timer-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="timer-label">{ai?.diffLabel}</span>
                      </div>
                    );
                  })()}
                  <textarea
                    className="debate-input"
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Round ${currentRound}: Make your argument…`}
                    maxLength={500}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submitArgument(); }}
                  />
                  <div className="input-footer">
                    <span className="char-count">{inputText.length}/500 · Ctrl+Enter to submit</span>
                    <div className="submit-row">
                      <button className="btn btn-ghost" onClick={reset}>Forfeit</button>
                      <button className="btn btn-primary" disabled={!inputText.trim()} onClick={() => submitArgument()}>
                        Submit Argument →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* VERDICT */}
      {screen === "verdict" && verdict && (
        <div className="screen">
          <div className="verdict-card">
            <div className="verdict-header">
              <div className={`verdict-title ${verdict.won ? "win" : "lose"}`}>
                {verdict.won ? "VICTORY" : "DEFEATED"}
              </div>
              <div className="verdict-sub">vs {ai?.icon} {ai?.name} · "{selectedTopic?.text}"</div>
            </div>

            <div className="score-breakdown">
              <div className="score-pill">
                <span className="sp-val" style={{ color: getScoreColor(verdict.avgScore) }}>{verdict.avgScore}</span>
                <span className="sp-lbl">Overall</span>
              </div>
              <div className="score-pill">
                <span className="sp-val" style={{ color: getScoreColor(verdict.avgLogic) }}>{verdict.avgLogic}</span>
                <span className="sp-lbl">Logic</span>
              </div>
              <div className="score-pill">
                <span className="sp-val" style={{ color: getScoreColor(verdict.avgPersuasion) }}>{verdict.avgPersuasion}</span>
                <span className="sp-lbl">Persuasion</span>
              </div>
            </div>

            <div className="feedback-box">
              <div className="fb-label">Judge's Verdict</div>
              <p>{verdict.judgeText}</p>
            </div>

            {verdict.userSummary && (
              <div className="feedback-box" style={{ borderColor: "var(--text-dim)", marginBottom: "16px" }}>
                <div className="fb-label" style={{ color: "var(--text-mid)" }}>Your Argument</div>
                <p>{verdict.userSummary}</p>
              </div>
            )}

            <div className="best-arg">
              <div className="arg-label best">✓ Strongest Point</div>
              <div style={{ fontSize: "14px", color: "var(--text-mid)" }}>{verdict.bestArg}</div>
            </div>
            <div className="worst-arg" style={{ marginTop: "8px" }}>
              <div className="arg-label worst">✗ Weakest Point</div>
              <div style={{ fontSize: "14px", color: "var(--text-mid)" }}>{verdict.weakArg}</div>
            </div>

            <div className="divider" />

            <div className="feedback-box" style={{ borderColor: "var(--blue)" }}>
              <div className="fb-label" style={{ color: "var(--blue)" }}>How to Improve</div>
              <p>{verdict.improve}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => { setSetupStep(0); setScreen("setup"); setMessages([]); setRoundScores([]); setVerdict(null); }}>
              Rematch →
            </button>
            <button className="btn btn-secondary" onClick={() => setScreen("leaderboard")}>Leaderboard</button>
            <button className="btn btn-ghost" onClick={reset}>Home</button>
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {screen === "leaderboard" && (
        <div className="screen">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", letterSpacing: "3px" }}>LEADERBOARD</h2>
            <button className="btn btn-ghost" onClick={reset}>← Home</button>
          </div>

          <div className="stats-row">
            <div className="stat-card"><span className="val red">{stats.debates}</span><span className="lbl">Your Debates</span></div>
            <div className="stat-card"><span className="val green">{stats.wins}</span><span className="lbl">Your Wins</span></div>
            <div className="stat-card"><span className="val gold">{stats.bestScore || "—"}</span><span className="lbl">Best Score</span></div>
          </div>

          <div className="tabs">
            <button className={`tab ${lbTab === "global" ? "active" : ""}`} onClick={() => setLbTab("global")}>Global</button>
            <button className={`tab ${lbTab === "weekly" ? "active" : ""}`} onClick={() => setLbTab("weekly")}>This Week</button>
          </div>

          {FAKE_LEADERBOARD.map((p, i) => (
            <div key={i} className="lb-row">
              <div className={`lb-rank ${i < 3 ? "top" : ""}`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : p.rank}</div>
              <div className="lb-avatar">{p.emoji}</div>
              <div className="lb-info">
                <div className="lb-name">{p.name}</div>
                <div className="lb-meta">{p.wins} wins this season</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="lb-score">{p.score.toLocaleString()}</div>
                <div className="lb-wins">pts</div>
              </div>
            </div>
          ))}

          {stats.debates > 0 && (
            <div className="lb-row you" style={{ marginTop: "16px" }}>
              <div className="lb-rank">YOU</div>
              <div className="lb-avatar">⚡</div>
              <div className="lb-info">
                <div className="lb-name">YOU</div>
                <div className="lb-meta">{stats.wins} wins · {stats.debates} debates</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="lb-score">{stats.wins * 200 + stats.bestScore * 10}</div>
                <div className="lb-wins">pts</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
