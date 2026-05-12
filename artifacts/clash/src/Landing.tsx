import { useEffect, useRef, useState } from "react";
import { API } from "./lib/api";

interface GlobalStats {
  totalDebates: number;
  globalWinRate: number;
  activePlayers: number;
}

interface LbEntry {
  id: number;
  username: string | null;
  deviceId: string;
  wins: number;
  totalDebates: number;
  bestScore: number;
  score: number;
}

const APP_URL = "/play";

const MARQUEE_ITEMS = [
  { cat: "ethics", catLabel: "Ethics",      text: "Lying is sometimes morally justified" },
  { cat: "hot",    catLabel: "Hot Take",    text: "Pineapple belongs on pizza" },
  { cat: "phil",   catLabel: "Philosophy",  text: "Free will is an illusion" },
  { cat: "tech",   catLabel: "Tech",        text: "AI will do more good than harm" },
  { cat: "pop",    catLabel: "Pop Culture", text: "Streaming killed the music industry" },
  { cat: "ethics", catLabel: "Ethics",      text: "Cancel culture has gone too far" },
  { cat: "phil",   catLabel: "Philosophy",  text: "Money can buy happiness" },
  { cat: "tech",   catLabel: "Tech",        text: "Privacy beats convenience" },
  { cat: "hot",    catLabel: "Hot Take",    text: "Mornings are better than nights" },
];

const HOW_STEPS = [
  { title: "Pick Your Battle",  body: "Choose from 12 topics across Ethics, Philosophy, Hot Takes, Tech, and Pop Culture. Or jump straight into Today's Clash." },
  { title: "Choose Your Side",  body: "FOR or AGAINST. Pick your opponent — from a calm professor to a relentless prosecutor. Then argue your case round by round." },
  { title: "Get Judged",        body: "An AI judge scores every round on Logic, Persuasion, and Delivery. Get a rank from S to F — plus an IQ rating for every argument you make." },
];

const OPPONENTS = [
  { icon: "🎓", name: "The Professor",  desc: "Calm, methodical, academic. Dismantles your logic with precision. Polite but devastating.",                          style: "Your premise contains a fundamental assumption you haven't justified.", diff: "medium",  diffLabel: "Medium"  },
  { icon: "🏛️", name: "The Politician", desc: "Dodges, pivots, and spins. Never admits fault. Masters emotional rhetoric.",                                          style: "What people really want to know is…",                                  diff: "medium",  diffLabel: "Medium"  },
  { icon: "⚖️", name: "The Prosecutor", desc: "Aggressive, relentless. Finds your weakest point and hammers it until you break.",                                    style: "You said X. But earlier you claimed Y. Which is it?",                  diff: "hard",    diffLabel: "Hard"    },
  { icon: "🔮", name: "The Philosopher",desc: "Questions your fundamental assumptions. Makes you doubt everything you thought you knew.",                             style: "But what do you mean by 'better'?",                                    diff: "hard",    diffLabel: "Hard"    },
  { icon: "😈", name: "The Devil",      desc: "Chaotic. Takes the most extreme opposing position. Unpredictable but sharper than you expect.",                       style: "Actually, the opposite is obviously true and here's why…",             diff: "easy",    diffLabel: "Easy"    },
  { icon: "🔬", name: "The Debunker",   desc: "Data-obsessed. Demands sources. Fact-checks everything in real time. Unforgiving.",                                  style: "That statistic is from 2011 and the methodology was flawed.",           diff: "extreme", diffLabel: "Extreme" },
];

const VERDICT_SCORES: [string, string, string][] = [
  ["82", "var(--lp-green)", "Overall"],
  ["78", "var(--lp-gold)",  "Logic"],
  ["86", "var(--lp-green)", "Persuasion"],
  ["84", "var(--lp-green)", "Delivery"],
];

const LP_CSS = `
:root {
  --lp-bg:#080808; --lp-surface:#111; --lp-surface2:#181818;
  --lp-red:#e63946; --lp-red2:#ff4655; --lp-gold:#f4c542;
  --lp-text:#f0f0f0; --lp-dim:#555; --lp-mid:#888;
  --lp-border:#1e1e1e; --lp-green:#22c55e;
}

.lp-cursor {
  position:fixed; width:10px; height:10px;
  background:var(--lp-red); border-radius:50%;
  pointer-events:none; z-index:99999;
  transform:translate(-50%,-50%);
  transition:width 0.2s,height 0.2s,background 0.2s;
}
.lp-cursor-ring {
  position:fixed; width:32px; height:32px;
  border:1px solid rgba(230,57,70,0.5); border-radius:50%;
  pointer-events:none; z-index:99998;
  transform:translate(-50%,-50%);
  transition:width 0.3s,height 0.3s;
}
.lp-cursor.lp-cursor-big { width:18px; height:18px; background:var(--lp-red2); }
.lp-cursor-ring.lp-ring-big { width:48px; height:48px; }

.lp-grain {
  position:fixed; inset:0; pointer-events:none; z-index:9998;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

.lp-wrap {
  background:var(--lp-bg); color:var(--lp-text);
  font-family:'Barlow',sans-serif; overflow-x:hidden; cursor:none;
  min-height:100vh;
}
html { scroll-behavior:smooth; }

/* NAV */
.lp-nav {
  position:fixed; top:0; left:0; right:0; z-index:1000;
  padding:20px 40px; display:flex; align-items:center; justify-content:space-between;
  background:linear-gradient(to bottom,rgba(8,8,8,0.95),transparent);
  backdrop-filter:blur(8px);
}
.lp-nav-logo {
  font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:4px; color:var(--lp-text);
}
.lp-nav-logo span { color:var(--lp-red); }
.lp-nav-links { display:flex; gap:32px; align-items:center; }
.lp-nav-links a {
  font-family:'Barlow Condensed',sans-serif; font-size:13px;
  letter-spacing:3px; text-transform:uppercase; color:var(--lp-mid);
  text-decoration:none; transition:color 0.2s;
}
.lp-nav-links a:hover { color:var(--lp-text); }
.lp-nav-cta {
  font-family:'Barlow Condensed',sans-serif; font-size:13px;
  letter-spacing:3px; text-transform:uppercase;
  background:var(--lp-red); color:#fff; padding:10px 24px;
  border-radius:6px; text-decoration:none; transition:all 0.2s;
}
.lp-nav-cta:hover { background:var(--lp-red2); box-shadow:0 0 30px rgba(230,57,70,0.4); }

/* HERO */
.lp-hero {
  min-height:100vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; text-align:center;
  padding:120px 24px 80px; position:relative; overflow:hidden;
}
.lp-hero-bg {
  position:absolute; inset:0;
  background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(230,57,70,0.12) 0%,transparent 70%);
  pointer-events:none;
}
.lp-hero-lines {
  position:absolute; inset:0; pointer-events:none;
  background:repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(255,255,255,0.015) 80px,rgba(255,255,255,0.015) 81px);
}
.lp-hero-eyebrow {
  font-family:'Barlow Condensed',sans-serif; font-size:12px;
  letter-spacing:5px; text-transform:uppercase; color:var(--lp-red);
  margin-bottom:24px; opacity:0; animation:lp-up 0.7s ease 0.2s forwards;
  display:flex; align-items:center; gap:12px; position:relative; z-index:1;
}
.lp-hero-eyebrow::before,.lp-hero-eyebrow::after {
  content:''; width:32px; height:1px; background:var(--lp-red); opacity:0.5;
}
.lp-hero-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(80px,18vw,200px); line-height:0.85; letter-spacing:-2px;
  margin-bottom:0; opacity:0; animation:lp-up 0.8s ease 0.3s forwards; position:relative; z-index:1;
}
.lp-hero-title .t1 { display:block; color:var(--lp-text); }
.lp-hero-title .t2 { display:block; color:transparent; -webkit-text-stroke:2px var(--lp-red); }
.lp-hero-sub {
  font-size:clamp(16px,2.5vw,20px); color:var(--lp-mid); max-width:520px;
  line-height:1.6; margin:28px auto 48px;
  opacity:0; animation:lp-up 0.8s ease 0.5s forwards; position:relative; z-index:1;
}
.lp-hero-sub strong { color:var(--lp-text); }
.lp-hero-btns {
  display:flex; gap:14px; justify-content:center; flex-wrap:wrap;
  opacity:0; animation:lp-up 0.8s ease 0.6s forwards; margin-bottom:64px; position:relative; z-index:1;
}
.lp-btn {
  font-family:'Barlow Condensed',sans-serif; font-size:15px; letter-spacing:4px;
  text-transform:uppercase; padding:18px 40px; border-radius:8px;
  border:none; transition:all 0.25s; text-decoration:none; display:inline-block; font-weight:700;
}
.lp-btn-red { background:var(--lp-red); color:#fff; }
.lp-btn-red:hover { background:var(--lp-red2); transform:translateY(-2px); box-shadow:0 12px 40px rgba(230,57,70,0.4); }
.lp-btn-outline { background:transparent; color:var(--lp-text); border:1px solid var(--lp-border); }
.lp-btn-outline:hover { border-color:var(--lp-mid); transform:translateY(-2px); }
.lp-ticker {
  position:relative; z-index:2; opacity:0; animation:lp-up 0.8s ease 0.8s forwards;
}
.lp-ticker-inner {
  display:inline-flex; align-items:center; gap:10px;
  background:var(--lp-surface); border:1px solid var(--lp-border);
  border-radius:100px; padding:10px 20px;
  font-family:'Barlow Condensed',sans-serif; font-size:13px;
  letter-spacing:2px; text-transform:uppercase; color:var(--lp-mid);
}
.lp-ticker-inner strong { color:var(--lp-text); }
.lp-live-dot {
  width:8px; height:8px; border-radius:50%; background:var(--lp-green);
  display:inline-block; animation:lp-pulse 2s infinite; flex-shrink:0;
}

/* PHONE MOCKUP */
.lp-preview {
  padding:80px 24px; display:flex; justify-content:center; position:relative; overflow:hidden;
}
.lp-preview-wrap { position:relative; max-width:340px; width:100%; }
.lp-preview-glow {
  position:absolute; width:300px; height:300px;
  background:radial-gradient(circle,rgba(230,57,70,0.2),transparent 70%);
  border-radius:50%; top:50%; left:50%; transform:translate(-50%,-50%);
  pointer-events:none; z-index:-1; animation:lp-float 4s ease-in-out infinite;
}
.lp-phone-frame {
  background:var(--lp-surface); border:2px solid #222; border-radius:40px; overflow:hidden;
  box-shadow:0 0 0 8px #111,0 0 0 10px #1a1a1a,0 80px 120px rgba(0,0,0,0.8),0 0 80px rgba(230,57,70,0.1);
  animation:lp-float 4s ease-in-out infinite;
}
.lp-phone-screen { background:var(--lp-bg); padding:28px 20px 20px; font-family:'Bebas Neue',sans-serif; }
.lp-ps-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
.lp-ps-logo { font-size:22px; letter-spacing:3px; }
.lp-ps-logo span { color:var(--lp-red); }
.lp-ps-badge {
  background:var(--lp-red); color:#fff; font-family:'Barlow Condensed',sans-serif;
  font-size:9px; letter-spacing:2px; padding:2px 7px; border-radius:3px; margin-left:6px;
}
.lp-ps-user {
  background:var(--lp-surface2); border:1px solid var(--lp-border); border-radius:20px;
  padding:4px 12px 4px 8px; display:flex; align-items:center; gap:6px;
  font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:1px; color:var(--lp-mid);
}
.lp-ps-title { text-align:center; margin-bottom:24px; }
.lp-ps-t1 { font-size:52px; display:block; line-height:0.9; }
.lp-ps-t2 { font-size:52px; color:var(--lp-red); display:block; line-height:0.9; }
.lp-ps-live { text-align:center; font-family:'Barlow',sans-serif; font-size:12px; color:var(--lp-mid); margin-bottom:20px; }
.lp-ps-btn-red { background:var(--lp-red); border-radius:8px; padding:14px; text-align:center; font-size:14px; letter-spacing:3px; margin-bottom:10px; }
.lp-ps-btn-dark { background:var(--lp-surface2); border:1px solid var(--lp-border); border-radius:8px; padding:14px; text-align:center; font-size:14px; letter-spacing:3px; margin-bottom:10px; }
.lp-ps-btn-gold { background:transparent; border:1px solid var(--lp-gold); border-radius:8px; padding:14px; text-align:center; font-size:14px; letter-spacing:3px; color:var(--lp-gold); }
.lp-ps-card { background:var(--lp-surface2); border:1px solid var(--lp-border); border-radius:10px; padding:14px; margin-top:16px; }
.lp-ps-card-label { font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:3px; color:var(--lp-red); margin-bottom:8px; text-transform:uppercase; }
.lp-ps-card-topic { font-family:'Barlow',sans-serif; font-size:13px; font-weight:500; color:var(--lp-text); line-height:1.4; }
.lp-ps-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--lp-border); margin-top:16px; border-radius:8px; overflow:hidden; }
.lp-ps-stat { background:var(--lp-surface); padding:10px 8px; text-align:center; }
.lp-ps-stat-v { font-size:20px; color:var(--lp-text); display:block; }
.lp-ps-stat-l { font-family:'Barlow Condensed',sans-serif; font-size:8px; letter-spacing:1px; color:var(--lp-dim); text-transform:uppercase; }

/* MARQUEE */
.lp-marquee-section {
  padding:40px 0; overflow:hidden;
  border-top:1px solid var(--lp-border); border-bottom:1px solid var(--lp-border);
  margin:40px 0;
}
.lp-marquee-track {
  display:flex; gap:24px; animation:lp-marquee 30s linear infinite; white-space:nowrap;
}
.lp-marquee-track:hover { animation-play-state:paused; }
.lp-marquee-item {
  background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:8px;
  padding:10px 20px; font-family:'Barlow Condensed',sans-serif; font-size:14px;
  letter-spacing:1px; white-space:nowrap; flex-shrink:0; display:flex; align-items:center; gap:10px;
}
.lp-marquee-cat { font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:2px 8px; border-radius:3px; }
.lp-cat-ethics { background:rgba(230,57,70,0.15); color:var(--lp-red); }
.lp-cat-hot    { background:rgba(255,100,0,0.15);  color:#ff6400; }
.lp-cat-phil   { background:rgba(168,85,247,0.15); color:#a855f7; }
.lp-cat-tech   { background:rgba(0,119,255,0.15);  color:#0077ff; }
.lp-cat-pop    { background:rgba(244,197,66,0.15); color:var(--lp-gold); }

/* SECTIONS */
.lp-section { padding:100px 24px; max-width:1000px; margin:0 auto; }
.lp-section-label {
  font-family:'Barlow Condensed',sans-serif; font-size:11px;
  letter-spacing:5px; text-transform:uppercase; color:var(--lp-red); margin-bottom:20px;
  display:flex; align-items:center; gap:12px;
}
.lp-section-label::after { content:''; flex:1; max-width:60px; height:1px; background:var(--lp-red); opacity:0.4; }
.lp-section-title {
  font-family:'Bebas Neue',sans-serif; font-size:clamp(40px,7vw,72px);
  line-height:0.9; letter-spacing:1px; margin-bottom:20px;
}
.lp-section-sub { font-size:17px; color:var(--lp-mid); max-width:480px; line-height:1.7; margin-bottom:56px; }

/* HOW IT WORKS */
.lp-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:2px; background:var(--lp-border); border-radius:12px; overflow:hidden; }
.lp-step { background:var(--lp-surface); padding:40px 32px; transition:background 0.3s; }
.lp-step:hover { background:var(--lp-surface2); }
.lp-step-num { font-family:'Bebas Neue',sans-serif; font-size:72px; color:var(--lp-border); line-height:1; margin-bottom:16px; transition:color 0.3s; }
.lp-step:hover .lp-step-num { color:var(--lp-red); }
.lp-step-title { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
.lp-step-body { font-size:15px; color:var(--lp-mid); line-height:1.6; }

/* OPPONENTS */
.lp-opp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:2px; background:var(--lp-border); border-radius:12px; overflow:hidden; }
.lp-opp-card { background:var(--lp-surface); padding:32px; transition:background 0.3s; position:relative; overflow:hidden; }
.lp-opp-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(230,57,70,0.06),transparent); opacity:0; transition:opacity 0.3s; }
.lp-opp-card:hover { background:var(--lp-surface2); }
.lp-opp-card:hover::before { opacity:1; }
.lp-opp-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
.lp-opp-icon { font-size:36px; }
.lp-opp-diff { font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:3px 10px; border-radius:4px; }
.lp-d-easy    { background:rgba(34,197,94,0.12);  color:var(--lp-green); }
.lp-d-medium  { background:rgba(244,197,66,0.12); color:var(--lp-gold); }
.lp-d-hard    { background:rgba(230,57,70,0.12);  color:var(--lp-red); }
.lp-d-extreme { background:rgba(168,85,247,0.12); color:#a855f7; }
.lp-opp-name  { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
.lp-opp-desc  { font-size:14px; color:var(--lp-mid); line-height:1.5; }
.lp-opp-style { margin-top:14px; padding-top:14px; border-top:1px solid var(--lp-border); font-size:13px; font-style:italic; color:var(--lp-dim); }

/* VERDICT */
.lp-verdict-preview {
  background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:12px;
  padding:40px; position:relative; overflow:hidden;
}
.lp-verdict-preview::after {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,var(--lp-red),var(--lp-gold),var(--lp-green));
}
.lp-vp-outcome { font-family:'Bebas Neue',sans-serif; font-size:72px; letter-spacing:3px; color:var(--lp-green); display:block; margin-bottom:4px; }
.lp-vp-meta { font-family:'Barlow Condensed',sans-serif; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:var(--lp-dim); margin-bottom:32px; }
.lp-vp-scores { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
.lp-vp-score { background:var(--lp-surface2); border-radius:8px; padding:20px 12px; text-align:center; }
.lp-vp-score-val { font-family:'Bebas Neue',sans-serif; font-size:40px; display:block; margin-bottom:4px; }
.lp-vp-score-lbl { font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--lp-dim); }
.lp-vp-feedback { background:var(--lp-surface2); border-left:3px solid var(--lp-gold); border-radius:0 8px 8px 0; padding:16px 20px; margin-bottom:12px; }
.lp-vp-fb-label { font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:var(--lp-gold); margin-bottom:8px; }
.lp-vp-fb-text { font-size:15px; color:var(--lp-mid); line-height:1.6; }
.lp-vp-best { background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.15); border-radius:8px; padding:14px 16px; margin-bottom:8px; }
.lp-vp-flaw { background:rgba(230,57,70,0.07); border:1px solid rgba(230,57,70,0.15); border-radius:8px; padding:14px 16px; }
.lp-vp-tag { font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:6px; }
.lp-vp-tag.best { color:var(--lp-green); }
.lp-vp-tag.flaw { color:var(--lp-red); }
.lp-vp-tag-text { font-size:14px; color:var(--lp-mid); }

/* GAUNTLET */
.lp-gauntlet-section {
  background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:12px;
  padding:64px 40px; text-align:center; position:relative; overflow:hidden;
}
.lp-gauntlet-section::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(244,197,66,0.08),transparent);
  pointer-events:none;
}
.lp-gauntlet-icon { font-size:48px; display:block; margin-bottom:20px; position:relative; z-index:1; }
.lp-gauntlet-title {
  font-family:'Bebas Neue',sans-serif; font-size:clamp(48px,10vw,96px);
  letter-spacing:4px; color:var(--lp-gold);
  text-shadow:0 0 60px rgba(244,197,66,0.3); display:block; margin-bottom:8px; position:relative; z-index:1;
}
.lp-gauntlet-sub { font-family:'Barlow Condensed',sans-serif; font-size:14px; letter-spacing:6px; text-transform:uppercase; color:var(--lp-dim); margin-bottom:24px; position:relative; z-index:1; }
.lp-gauntlet-desc { font-size:17px; color:var(--lp-mid); max-width:480px; margin:0 auto 40px; line-height:1.7; position:relative; z-index:1; }
.lp-gauntlet-opponents { display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:40px; position:relative; z-index:1; }
.lp-go-chip {
  background:var(--lp-surface2); border:1px solid var(--lp-border); border-radius:100px;
  padding:8px 16px; font-family:'Barlow Condensed',sans-serif; font-size:13px;
  letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center; gap:8px;
  transition:border-color 0.2s;
}
.lp-go-chip:hover { border-color:var(--lp-gold); }
.lp-btn-gold {
  font-family:'Barlow Condensed',sans-serif; font-size:15px; letter-spacing:4px;
  text-transform:uppercase; background:transparent; color:var(--lp-gold);
  border:1px solid var(--lp-gold); padding:18px 48px; border-radius:8px;
  transition:all 0.25s; text-decoration:none; display:inline-block; font-weight:700;
  position:relative; z-index:1;
}
.lp-btn-gold:hover { background:rgba(244,197,66,0.1); box-shadow:0 0 40px rgba(244,197,66,0.2); transform:translateY(-2px); }

/* FINAL CTA */
.lp-final-cta { text-align:center; padding:120px 24px; position:relative; overflow:hidden; }
.lp-final-cta::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(230,57,70,0.1),transparent 70%);
}
.lp-final-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(56px,12vw,120px); line-height:0.85; letter-spacing:2px; margin-bottom:24px; position:relative; z-index:1; }
.lp-final-sub { font-size:18px; color:var(--lp-mid); margin-bottom:48px; position:relative; z-index:1; }
.lp-final-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }

/* FOOTER */
.lp-footer {
  border-top:1px solid var(--lp-border); padding:32px 40px;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;
}
.lp-footer-logo { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:4px; }
.lp-footer-logo span { color:var(--lp-red); }
.lp-footer-text { font-size:13px; color:var(--lp-dim); }

/* SCROLL REVEAL */
.lp-reveal { opacity:0; transform:translateY(30px); transition:opacity 0.7s ease,transform 0.7s ease; }
.lp-reveal.lp-visible { opacity:1; transform:translateY(0); }
.lp-rd-1 { transition-delay:0.1s; }
.lp-rd-2 { transition-delay:0.2s; }
.lp-rd-3 { transition-delay:0.3s; }
.lp-rd-4 { transition-delay:0.4s; }

/* KEYFRAMES */
@keyframes lp-up { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
@keyframes lp-float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);} }
@keyframes lp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);}50%{box-shadow:0 0 0 6px rgba(34,197,94,0);} }
@keyframes lp-marquee { from{transform:translateX(0);}to{transform:translateX(-50%);} }

/* LEADERBOARD SECTION */
.lp-lb-table { display:flex; flex-direction:column; gap:2px; }
.lp-lb-row {
  display:flex; align-items:center; gap:16px;
  background:var(--lp-surface); border:1px solid var(--lp-border);
  border-radius:10px; padding:14px 20px; transition:border-color 0.2s;
}
.lp-lb-row:hover { border-color:#333; }
.lp-lb-rank {
  font-family:'Bebas Neue',sans-serif; font-size:22px; width:32px;
  text-align:center; color:var(--lp-dim); flex-shrink:0;
}
.lp-lb-rank.lp-lb-top { color:var(--lp-gold); }
.lp-lb-avatar {
  width:36px; height:36px; border-radius:50%;
  background:var(--lp-surface2); border:1px solid var(--lp-border);
  display:flex; align-items:center; justify-content:center;
  font-size:18px; flex-shrink:0;
}
.lp-lb-info { flex:1; min-width:0; }
.lp-lb-name {
  font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700;
  letter-spacing:1px; text-transform:uppercase;
}
.lp-lb-meta { font-size:12px; color:var(--lp-dim); margin-top:2px; }
.lp-lb-score-col { text-align:right; flex-shrink:0; }
.lp-lb-pts { font-family:'Bebas Neue',sans-serif; font-size:26px; color:var(--lp-gold); line-height:1; }
.lp-lb-pts-lbl { font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:1px; color:var(--lp-dim); }
.lp-lb-empty {
  text-align:center; padding:40px 20px; color:var(--lp-dim);
  font-family:'Barlow Condensed',sans-serif; font-size:14px; letter-spacing:2px; text-transform:uppercase;
  background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:10px;
}
.lp-lb-cta {
  margin-top:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
}
.lp-lb-cta-text { font-size:14px; color:var(--lp-dim); }
.lp-lb-cta-text strong { color:var(--lp-text); }

/* IQ FEATURE STRIP */
.lp-iq-strip {
  background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:12px;
  padding:32px 40px; display:flex; align-items:center; gap:40px; flex-wrap:wrap;
}
.lp-iq-left { flex:1; min-width:220px; }
.lp-iq-label {
  font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:5px;
  text-transform:uppercase; color:#a855f7; margin-bottom:12px;
  display:flex; align-items:center; gap:10px;
}
.lp-iq-label::after { content:''; flex:1; max-width:40px; height:1px; background:#a855f7; opacity:0.4; }
.lp-iq-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,6vw,56px); letter-spacing:2px; line-height:0.95; margin-bottom:12px; }
.lp-iq-body { font-size:15px; color:var(--lp-mid); line-height:1.6; }
.lp-iq-right { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.lp-iq-pill {
  background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.25);
  border-radius:8px; padding:10px 16px; text-align:center; min-width:80px;
}
.lp-iq-pill-val { font-family:'Bebas Neue',sans-serif; font-size:28px; color:#a855f7; display:block; line-height:1; }
.lp-iq-pill-lbl { font-family:'Barlow Condensed',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--lp-dim); margin-top:4px; }

/* RESPONSIVE — tablet */
@media(min-width:641px) and (max-width:900px){
  .lp-nav{padding:16px 28px;}
  .lp-nav-links{gap:20px;}
  .lp-section{padding:80px 28px;}
  .lp-verdict-preview{padding:28px;}
  .lp-vp-scores{grid-template-columns:repeat(2,1fr);}
}

/* RESPONSIVE — mobile */
@media(max-width:640px){
  .lp-nav{padding:14px 16px;}
  .lp-nav-links{display:none;}
  .lp-nav-cta{padding:8px 16px;font-size:12px;letter-spacing:2px;}
  .lp-section{padding:60px 16px;}
  .lp-step{padding:28px 20px;}
  .lp-opp-card{padding:24px 20px;}
  .lp-verdict-preview{padding:20px 16px;}
  .lp-vp-scores{grid-template-columns:repeat(2,1fr);}
  .lp-gauntlet-section{padding:40px 16px;}
  .lp-gauntlet-opponents{gap:6px;}
  .lp-go-chip{padding:6px 12px;font-size:12px;}
  .lp-btn{padding:14px 24px;font-size:13px;letter-spacing:3px;}
  .lp-btn-gold{padding:14px 32px;font-size:13px;}
  .lp-footer{flex-direction:column;text-align:center;padding:24px 16px;}
  .lp-iq-strip{padding:20px 16px;gap:20px;}
  .lp-lb-row{gap:10px;padding:12px 14px;}
  .lp-lb-meta{display:none;}
  .lp-hero{padding:100px 16px 60px;}
  .lp-hero-btns{flex-direction:column;align-items:center;}
  .lp-hero-btns .lp-btn{width:100%;max-width:320px;text-align:center;}
  .lp-final-cta{padding:80px 16px;}
  .lp-final-btns{flex-direction:column;align-items:center;}
  .lp-final-btns .lp-btn{width:100%;max-width:320px;text-align:center;}
}
`;

export function Landing() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const ringX  = useRef(0);
  const ringY  = useRef(0);
  const rafRef = useRef<number>(0);

  const [stats, setStats] = useState<GlobalStats>({
    totalDebates: 0,
    globalWinRate: 0,
    activePlayers: 0,
  });
  const [lbData, setLbData] = useState<LbEntry[]>([]);

  useEffect(() => {
    fetch(`${API}/api/stats/global`)
      .then(r => r.ok ? r.json() : null)
      .then((data: GlobalStats | null) => { if (data) setStats(data); })
      .catch(() => {});
    fetch(`${API}/api/leaderboard`)
      .then(r => r.ok ? r.json() : null)
      .then((data: LbEntry[] | null) => { if (data) setLbData(data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = ""; };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor || !ring) return;

    const onMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      cursor.style.left = e.clientX + "px";
      cursor.style.top  = e.clientY + "px";
    };

    const animate = () => {
      ringX.current += (mouseX.current - ringX.current) * 0.12;
      ringY.current += (mouseY.current - ringY.current) * 0.12;
      ring.style.left = ringX.current + "px";
      ring.style.top  = ringY.current + "px";
      rafRef.current = requestAnimationFrame(animate);
    };

    const onEnterInteractive = () => {
      cursor.classList.add("lp-cursor-big");
      ring.classList.add("lp-ring-big");
    };
    const onLeaveInteractive = () => {
      cursor.classList.remove("lp-cursor-big");
      ring.classList.remove("lp-ring-big");
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a,button,.lp-step,.lp-opp-card,.lp-go-chip").forEach(el => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const reveals  = document.querySelectorAll(".lp-reveal");
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("lp-visible"); }),
      { threshold: 0.1 }
    );
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const allMarqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <>
      <style>{LP_CSS}</style>
      <div className="lp-grain" />
      <div ref={cursorRef} className="lp-cursor" />
      <div ref={ringRef}   className="lp-cursor-ring" />

      <div className="lp-wrap">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-nav-logo">CL<span>A</span>SH</div>
          <div className="lp-nav-links">
            <a href="#how">How It Works</a>
            <a href="#opponents">Opponents</a>
            <a href="#gauntlet">Gauntlet</a>
            <a href="#leaderboard">Leaderboard</a>
          </div>
          <a href={APP_URL} className="lp-nav-cta">Play Free</a>
        </nav>

        {/* HERO */}
        <div className="lp-hero">
          <div className="lp-hero-bg" />
          <div className="lp-hero-lines" />
          <div className="lp-hero-eyebrow">The AI Debate Arena</div>
          <h1 className="lp-hero-title">
            <span className="t1">ARGUE.</span>
            <span className="t2">WIN.</span>
          </h1>
          <p className="lp-hero-sub">
            Go head-to-head against <strong>6 AI opponents</strong> with distinct personalities.
            Get scored on logic, persuasion, and delivery. Climb the ranks.
          </p>
          <div className="lp-hero-btns">
            <a href={APP_URL} className="lp-btn lp-btn-red">Start Your First Debate</a>
            <a href="#how"   className="lp-btn lp-btn-outline">See How It Works</a>
          </div>
          <div className="lp-ticker">
            <div className="lp-ticker-inner">
              <span className="lp-live-dot" />
              <strong>{stats.totalDebates.toLocaleString()}</strong>&nbsp;debates
              <span style={{ color: "var(--lp-border)", margin: "0 6px" }}>·</span>
              <strong>{stats.globalWinRate}%</strong>&nbsp;win rate
              {stats.activePlayers > 0 && (
                <>
                  <span style={{ color: "var(--lp-border)", margin: "0 6px" }}>·</span>
                  <strong>{stats.activePlayers.toLocaleString()}</strong>&nbsp;players
                </>
              )}
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP */}
        <div className="lp-preview">
          <div className="lp-preview-wrap">
            <div className="lp-preview-glow" />
            <div className="lp-phone-frame">
              <div className="lp-phone-screen">
                <div className="lp-ps-nav">
                  <div className="lp-ps-logo">CL<span>A</span>SH<span className="lp-ps-badge">BETA</span></div>
                  <div className="lp-ps-user">👤 YOU</div>
                </div>
                <div className="lp-ps-title">
                  <span className="lp-ps-t1">ARGUE.</span>
                  <span className="lp-ps-t2">WIN.</span>
                </div>
                <div className="lp-ps-live">🔥 3 players in Gauntlet Mode</div>
                <div className="lp-ps-btn-red">START DEBATE</div>
                <div className="lp-ps-btn-dark">LEADERBOARD</div>
                <div className="lp-ps-btn-gold">⚔ GAUNTLET MODE</div>
                <div className="lp-ps-card">
                  <div className="lp-ps-card-label">🔥 Hot Topic</div>
                  <div className="lp-ps-card-topic">"The death penalty should be abolished worldwide"</div>
                </div>
                <div className="lp-ps-stats">
                  <div className="lp-ps-stat"><span className="lp-ps-stat-v">4</span><span className="lp-ps-stat-l">Debates</span></div>
                  <div className="lp-ps-stat"><span className="lp-ps-stat-v">75%</span><span className="lp-ps-stat-l">Win Rate</span></div>
                  <div className="lp-ps-stat"><span className="lp-ps-stat-v">12</span><span className="lp-ps-stat-l">Topics</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MARQUEE */}
        <div className="lp-marquee-section">
          <div className="lp-marquee-track">
            {allMarqueeItems.map((item, i) => (
              <div key={i} className="lp-marquee-item">
                <span className={`lp-marquee-cat lp-cat-${item.cat}`}>{item.catLabel}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how" className="lp-section">
          <div className="lp-reveal"><div className="lp-section-label">How It Works</div></div>
          <div className="lp-reveal lp-rd-1"><h2 className="lp-section-title">THREE STEPS.<br />ZERO MERCY.</h2></div>
          <div className="lp-reveal lp-rd-2"><p className="lp-section-sub">No prep needed. Pick a topic, take a side, and argue your case. The AI judge decides who wins.</p></div>
          <div className="lp-steps lp-reveal lp-rd-3">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">0{i + 1}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-body">{s.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OPPONENTS */}
        <section id="opponents" className="lp-section">
          <div className="lp-reveal"><div className="lp-section-label">The Opponents</div></div>
          <div className="lp-reveal lp-rd-1"><h2 className="lp-section-title">SIX MINDS.<br />ALL WANT YOU TO FAIL.</h2></div>
          <div className="lp-reveal lp-rd-2"><p className="lp-section-sub">Each AI has a distinct debate style, personality, and difficulty. Start easy. Work your way up.</p></div>
          <div className="lp-opp-grid lp-reveal lp-rd-3">
            {OPPONENTS.map((o, i) => (
              <div key={i} className="lp-opp-card">
                <div className="lp-opp-top">
                  <span className="lp-opp-icon">{o.icon}</span>
                  <span className={`lp-opp-diff lp-d-${o.diff}`}>{o.diffLabel}</span>
                </div>
                <div className="lp-opp-name">{o.name}</div>
                <div className="lp-opp-desc">{o.desc}</div>
                <div className="lp-opp-style">"{o.style}"</div>
              </div>
            ))}
          </div>
        </section>

        {/* VERDICT PREVIEW */}
        <section className="lp-section">
          <div className="lp-reveal"><div className="lp-section-label">The Verdict</div></div>
          <div className="lp-reveal lp-rd-1"><h2 className="lp-section-title">KNOW EXACTLY<br />WHERE YOU LOST.</h2></div>
          <div className="lp-reveal lp-rd-2"><p className="lp-section-sub">Not just a score. A full breakdown of your strongest moment, your fatal flaw, and how to do better next time.</p></div>
          <div className="lp-verdict-preview lp-reveal lp-rd-3">
            <span className="lp-vp-outcome">VICTORY</span>
            <div className="lp-vp-meta">vs 🔮 The Philosopher · "Free will is an illusion" · FOR</div>
            <div className="lp-vp-scores">
              {VERDICT_SCORES.map(([val, color, lbl]) => (
                <div key={lbl} className="lp-vp-score">
                  <span className="lp-vp-score-val" style={{ color }}>{val}</span>
                  <span className="lp-vp-score-lbl">{lbl}</span>
                </div>
              ))}
            </div>
            <div className="lp-vp-feedback">
              <div className="lp-vp-fb-label">Judge's Verdict</div>
              <div className="lp-vp-fb-text">A commanding performance. You stayed on the offensive throughout and effectively neutralized the philosophical counterarguments with concrete real-world examples. Your closing round was decisive.</div>
            </div>
            <div className="lp-vp-best">
              <div className="lp-vp-tag best">✓ Best Moment</div>
              <div className="lp-vp-tag-text">Citing neuroscience to counter the determinism argument — clean, specific, hard to refute.</div>
            </div>
            <div className="lp-vp-flaw">
              <div className="lp-vp-tag flaw">✗ Fatal Flaw</div>
              <div className="lp-vp-tag-text">Round 2 relied too heavily on intuition without evidence — nearly cost you the debate.</div>
            </div>
          </div>
        </section>

        {/* GAUNTLET */}
        <section id="gauntlet" className="lp-section">
          <div className="lp-gauntlet-section lp-reveal">
            <span className="lp-gauntlet-icon">⚔️</span>
            <span className="lp-gauntlet-title">GAUNTLET</span>
            <div className="lp-gauntlet-sub">Mode</div>
            <p className="lp-gauntlet-desc">Six opponents. One continuous run. No breaks, no second chances. Lose once and it's over. For those who think they're actually good.</p>
            <div className="lp-gauntlet-opponents">
              {OPPONENTS.map((o, i) => (
                <div key={i} className="lp-go-chip">{o.icon} {o.name}</div>
              ))}
            </div>
            <a href={APP_URL} className="lp-btn-gold">Enter the Gauntlet</a>
          </div>
        </section>

        {/* IQ FEATURE */}
        <section className="lp-section">
          <div className="lp-iq-strip lp-reveal">
            <div className="lp-iq-left">
              <div className="lp-iq-label">New Feature</div>
              <div className="lp-iq-title">YOUR ARGUMENT<br />HAS AN IQ.</div>
              <p className="lp-iq-body">After every round, the AI judge calculates an IQ rating for your argument — from <strong>Below Average</strong> to <strong>Genius</strong>. Find out how your reasoning stacks up.</p>
            </div>
            <div className="lp-iq-right">
              {[["145", "Genius"], ["127", "Superior"], ["103", "Average"], ["88", "Low Avg"], ["71", "Below Avg"]].map(([val, lbl]) => (
                <div key={lbl} className="lp-iq-pill">
                  <span className="lp-iq-pill-val">{val}</span>
                  <span className="lp-iq-pill-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="lp-section">
          <div className="lp-reveal"><div className="lp-section-label">Rankings</div></div>
          <div className="lp-reveal lp-rd-1"><h2 className="lp-section-title">WHO'S THE<br />BEST DEBATER?</h2></div>
          <div className="lp-reveal lp-rd-2"><p className="lp-section-sub">Win debates, climb the board. Points are earned by wins and peak score. Only the sharpest make it to the top.</p></div>
          <div className="lp-reveal lp-rd-3">
            {lbData.length === 0 ? (
              <div className="lp-lb-empty">Be the first on the board — start a debate now.</div>
            ) : (
              <div className="lp-lb-table">
                {lbData.map((p, i) => {
                  const AVATARS = ["🦁","🐺","🦊","🎯","⚡","🔥","🧠","🏆","👊","💎"];
                  const emoji = AVATARS[p.id % AVATARS.length];
                  const name = p.username || ("GUEST#" + p.deviceId.slice(-4).toUpperCase());
                  return (
                    <div key={p.id} className="lp-lb-row">
                      <div className={`lp-lb-rank${i < 3 ? " lp-lb-top" : ""}`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
                      <div className="lp-lb-avatar">{emoji}</div>
                      <div className="lp-lb-info">
                        <div className="lp-lb-name">{name}</div>
                        <div className="lp-lb-meta">{p.wins} win{p.wins !== 1 ? "s" : ""} · {p.totalDebates} debate{p.totalDebates !== 1 ? "s" : ""} · Best {p.bestScore}</div>
                      </div>
                      <div className="lp-lb-score-col">
                        <div className="lp-lb-pts">{p.score.toLocaleString()}</div>
                        <div className="lp-lb-pts-lbl">pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="lp-lb-cta">
              <p className="lp-lb-cta-text">Full rankings in the app. <strong>Win to earn points.</strong></p>
              <a href={APP_URL} className="lp-btn lp-btn-red">Climb the Board</a>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="lp-final-cta">
          <h2 className="lp-final-title lp-reveal">READY TO<br /><span style={{ color: "var(--lp-red)" }}>CLASH?</span></h2>
          <p className="lp-final-sub lp-reveal lp-rd-1">Free to play. No signup. Just you and the AI.</p>
          <div className="lp-final-btns lp-reveal lp-rd-2">
            <a href={APP_URL}      className="lp-btn lp-btn-red">Start Debating Now</a>
            <a href="#opponents"  className="lp-btn lp-btn-outline">Meet the Opponents</a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">CL<span>A</span>SH</div>
          <div className="lp-footer-text">Built different. Argue better.</div>
        </footer>

      </div>
    </>
  );
}
