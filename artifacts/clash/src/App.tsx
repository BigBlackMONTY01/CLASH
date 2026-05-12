import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { API } from "./lib/api";

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
html,body{height:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;}
body{background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;min-height:100dvh;overflow-x:hidden;display:flex;flex-direction:column;}

body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);}

.app{max-width:780px;margin:0 auto;padding:40px 20px 32px;flex:1;width:100%;}

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
border:none;cursor:pointer;transition:all 0.2s;font-weight:600;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
.btn-primary{background:var(--red);color:#fff;}
.btn-primary:hover{background:#ff4655;transform:translateY(-1px);box-shadow:0 8px 24px rgba(230,57,70,0.4);}
.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border);}
.btn-secondary:hover{border-color:var(--text-dim);transform:translateY(-1px);}
.btn-ghost{background:transparent;color:var(--text-dim);border:1px solid var(--border);}
.btn-ghost:hover{color:var(--text);border-color:var(--text-dim);}
.btn-confirm-forfeit{background:#16a34a;color:#fff;border:none;min-width:120px;}
.btn-confirm-forfeit:hover{background:#15803d;transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,163,74,0.4);}
.btn-forfeit-counting{background:transparent;color:var(--red);border:1px solid var(--red);min-width:60px;font-size:18px;letter-spacing:0;padding:10px 20px;}
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

.arena-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;
background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:16px 20px;margin-bottom:20px;}
.arena-topic{font-size:15px;font-weight:500;flex:1;margin:0 16px;min-width:0;word-break:break-word;}
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
.msg-bubble{max-width:80%;min-width:0;word-break:break-word;overflow-wrap:break-word;}
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
.iq-badge{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;
padding:2px 8px;border-radius:3px;background:rgba(168,85,247,0.12);color:#a855f7;border:1px solid rgba(168,85,247,0.25);white-space:nowrap;animation:fadeIn 0.5s ease;}
.streak-badge{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;
padding:2px 8px;border-radius:3px;background:rgba(251,146,60,0.12);color:#fb923c;border:1px solid rgba(251,146,60,0.3);white-space:nowrap;}
.streak-badge.hot{background:rgba(239,68,68,0.14);color:#ef4444;border-color:rgba(239,68,68,0.35);}

.input-area{position:relative;}
.timer-bar{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
.timer-countdown{font-family:'Bebas Neue',sans-serif;font-size:30px;min-width:44px;text-align:center;transition:color 0.3s;line-height:1;}
.timer-countdown.pulse{animation:timerPulse 0.5s ease infinite alternate;}
@keyframes timerPulse{from{opacity:1;transform:scale(1);}to{opacity:0.6;transform:scale(1.08);}}
.timer-track{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.timer-fill{height:100%;border-radius:2px;transition:width 1s linear,background 0.5s;}
.timer-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.timer-extreme-badge{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a855f7;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);border-radius:3px;padding:2px 7px;white-space:nowrap;}
.debate-input{width:100%;background:var(--surface);border:2px solid var(--border);
border-radius:var(--radius);padding:16px;font-family:'Barlow',sans-serif;font-size:15px;
color:var(--text);resize:none;outline:none;transition:border-color 0.2s;line-height:1.5;}
.debate-input:focus{border-color:var(--blue);}
.debate-input.extreme-urgent{border-color:var(--red) !important;animation:urgentBorder 0.6s ease infinite alternate;}
@keyframes urgentBorder{from{box-shadow:0 0 0 0 rgba(230,57,70,0);}to{box-shadow:0 0 12px 2px rgba(230,57,70,0.35);}}
.debate-input::placeholder{color:var(--text-dim);}
.input-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px;flex-wrap:wrap;}
.char-count{font-size:12px;color:var(--text-dim);transition:color 0.2s;}
.char-count.warn{color:var(--gold);}
.char-count.danger{color:var(--red);}
.char-over{font-size:11px;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;color:var(--red);margin-left:4px;}
.submit-row{display:flex;gap:8px;}

.thinking-row{display:flex;align-items:center;gap:10px;padding:12px 16px;color:var(--text-dim);font-size:14px;}
.thinking-phase{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--red);animation:fadeIn 0.3s ease;}
.dots span{display:inline-block;animation:dot 1.4s infinite;}
.dots span:nth-child(2){animation-delay:0.2s;}
.dots span:nth-child(3){animation-delay:0.4s;}
@keyframes dot{0%,80%,100%{opacity:0;}40%{opacity:1;}}

/* ===== RANK BADGES ===== */
.rank-badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:1px;margin-bottom:6px;}
.rank-S{background:rgba(168,85,247,0.15);border:2px solid #a855f7;color:#a855f7;}
.rank-A{background:rgba(230,57,70,0.15);border:2px solid var(--red);color:var(--red);}
.rank-B{background:rgba(34,197,94,0.12);border:2px solid var(--green);color:var(--green);}
.rank-C{background:rgba(244,197,66,0.12);border:2px solid var(--gold);color:var(--gold);}
.rank-D{background:rgba(153,153,153,0.1);border:2px solid var(--text-dim);color:var(--text-dim);}
.rank-F{background:rgba(230,57,70,0.08);border:2px solid rgba(230,57,70,0.3);color:#ff4655;}

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

.verdict-moments{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}
.verdict-actions{display:flex;gap:10px;flex-wrap:wrap;}

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

.profile-pill{display:flex;align-items:center;gap:5px;cursor:pointer;padding:5px 12px;
border:1px solid var(--border);border-radius:20px;font-family:'Barlow Condensed',sans-serif;
font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-dim);
transition:all 0.2s;background:transparent;line-height:1;}
.profile-pill:hover{border-color:var(--red);color:var(--text);}
.profile-pill.named{color:var(--text);border-color:rgba(255,255,255,0.25);}
.profile-pill .pill-icon{font-size:13px;}

.username-modal{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.8);
backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.username-dialog{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
padding:28px 24px;width:100%;max-width:380px;}
.username-dialog h3{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:3px;
margin:0 0 6px;}
.username-dialog .ud-sub{font-size:13px;color:var(--text-dim);margin:0 0 20px;line-height:1.5;}
.username-field{width:100%;background:var(--surface);border:1.5px solid var(--border);
border-radius:var(--radius);padding:12px 14px;font-family:'Barlow Condensed',sans-serif;
font-size:17px;letter-spacing:3px;text-transform:uppercase;color:var(--text);outline:none;
transition:border-color 0.2s;box-sizing:border-box;}
.username-field:focus{border-color:var(--red);}
.username-err{font-size:12px;color:var(--red);margin:6px 0 0;min-height:16px;}
.username-hint{font-size:11px;color:var(--text-dim);margin:6px 0 18px;
font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;}

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

.rounds-pick{display:flex;gap:8px;margin-bottom:24px;}
.rounds-btn{flex:1;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);
padding:14px 8px;cursor:pointer;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:28px;
color:var(--text-dim);transition:all 0.2s;}
.rounds-btn:hover{border-color:var(--text-dim);color:var(--text);}
.rounds-btn.selected{border-color:var(--red);color:var(--red);background:rgba(230,57,70,0.08);}
.rounds-btn .rounds-sub{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;display:block;margin-top:3px;color:var(--text-dim);}

/* ===== MATCHMAKING SCREEN ===== */
.matchmaking{display:flex;flex-direction:column;align-items:center;justify-content:center;
min-height:60vh;text-align:center;animation:fadeIn 0.4s ease;}
.mf-found{font-family:'Bebas Neue',sans-serif;font-size:clamp(36px,9vw,64px);letter-spacing:6px;
color:var(--text);animation:mfPulse 0.9s ease infinite alternate;margin-bottom:4px;}
@keyframes mfPulse{from{opacity:0.55;text-shadow:0 0 20px rgba(230,57,70,0.2);}
to{opacity:1;text-shadow:0 0 60px rgba(230,57,70,0.85);}}
.mf-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:5px;
text-transform:uppercase;color:var(--red);margin-bottom:36px;}
.mf-vs-card{display:flex;align-items:center;gap:20px;background:var(--surface);
border:1px solid var(--border);border-radius:var(--radius);padding:20px 28px;
margin-bottom:20px;width:100%;}
.mf-player{flex:1;text-align:center;}
.mf-icon{font-size:38px;display:block;margin-bottom:6px;}
.mf-plbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;
text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
.mf-pname{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;}
.mf-sep{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--red);flex-shrink:0;}
.mf-topic{font-size:14px;color:var(--text-mid);font-style:italic;margin-bottom:18px;
max-width:400px;line-height:1.5;}
.mf-stances{display:flex;gap:10px;width:100%;margin-bottom:32px;}
.mf-stance{flex:1;border-radius:var(--radius);padding:11px 14px;text-align:center;}
.mf-stance.for{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.35);}
.mf-stance.against{background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.35);}
.mf-swho{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;
text-transform:uppercase;margin-bottom:3px;}
.mf-stance.for .mf-swho{color:var(--green);}
.mf-stance.against .mf-swho{color:var(--red);}
.mf-sside{font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:2px;}
.mf-stance.for .mf-sside{color:var(--green);}
.mf-stance.against .mf-sside{color:var(--red);}
.mf-countdown{font-family:'Bebas Neue',sans-serif;font-size:96px;line-height:1;color:var(--red);
animation:cdTick 0.45s cubic-bezier(0.34,1.56,0.64,1);}
@keyframes cdTick{from{transform:scale(1.6);opacity:0;}to{transform:scale(1);opacity:1;}}
.mf-waiting{display:flex;align-items:center;gap:10px;font-family:'Barlow Condensed',sans-serif;
font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);}

/* === TOPIC RATINGS === */
.topic-rating{display:inline-flex;align-items:center;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:2px 7px;border-radius:3px;margin-top:6px;}
.rating-casual{background:rgba(34,197,94,0.1);color:var(--green);}
.rating-contested{background:rgba(244,197,66,0.12);color:var(--gold);}
.rating-minefield{background:rgba(230,57,70,0.12);color:var(--red);}

/* === CUSTOM OPPONENT === */
.custom-form{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-top:-12px;margin-bottom:24px;animation:fadeIn 0.3s ease;}
.custom-form-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:7px;display:block;}
.custom-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;font-family:'Barlow',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border-color 0.2s;}
.custom-input:focus{border-color:var(--blue);}
.custom-diff-row{display:flex;gap:6px;}
.custom-diff-opt{flex:1;padding:8px 4px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:var(--radius);border:2px solid var(--border);background:var(--surface2);cursor:pointer;transition:all 0.2s;color:var(--text-dim);text-align:center;}
.custom-diff-opt.sel-easy{border-color:var(--green);color:var(--green);}
.custom-diff-opt.sel-medium{border-color:var(--gold);color:var(--gold);}
.custom-diff-opt.sel-hard{border-color:var(--red);color:var(--red);}
.custom-diff-opt.sel-extreme{border-color:#a855f7;color:#a855f7;}

/* === ADAPTIVE BADGE === */
.adaptive-badge{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:3px;}
.adaptive-up{background:rgba(230,57,70,0.15);color:var(--red);border:1px solid rgba(230,57,70,0.3);animation:fadeIn 0.4s ease;}
.adaptive-dn{background:rgba(34,197,94,0.1);color:var(--green);border:1px solid rgba(34,197,94,0.25);animation:fadeIn 0.4s ease;}

/* === SUDDEN DEATH === */
.sudden-btn{width:100%;background:rgba(230,57,70,0.08);border:2px solid var(--red);border-radius:var(--radius);padding:18px 24px;cursor:pointer;text-align:center;transition:all 0.2s;margin-bottom:12px;animation:suddenGlow 1.8s ease infinite;}
@keyframes suddenGlow{0%,100%{box-shadow:0 0 0 0 rgba(230,57,70,0);}50%{box-shadow:0 0 22px 4px rgba(230,57,70,0.35);}}
.sudden-btn:hover{background:rgba(230,57,70,0.15);}
.sudden-title{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:4px;color:var(--red);display:block;}
.sudden-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);display:block;margin-top:3px;}

/* === SHARE TOAST === */
.share-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--green);border-radius:var(--radius);padding:10px 22px;font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--green);z-index:9999;animation:fadeIn 0.3s ease;}

/* === CHALLENGE BANNER === */
.challenge-banner{background:var(--surface);border:1px solid rgba(168,85,247,0.4);border-radius:var(--radius);padding:18px 20px;margin-bottom:28px;animation:fadeIn 0.4s ease;}
.challenge-header{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a855f7;margin-bottom:10px;}

/* === REPLAY SCREEN === */
.replay-intro{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.replay-verdict-badge{font-family:'Bebas Neue',sans-serif;font-size:28px;}
.replay-round{margin-bottom:16px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.replay-round-hdr{background:var(--surface);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;}
.replay-round-lbl{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);}
.replay-round-score{font-family:'Bebas Neue',sans-serif;font-size:22px;}
.replay-msgs{padding:12px 16px;display:flex;flex-direction:column;gap:10px;}
.replay-msg{padding:10px 14px;border-radius:var(--radius);font-size:14px;line-height:1.55;background:var(--surface2);}
.replay-msg.rmuser{border-left:3px solid var(--blue);}
.replay-msg.rmai{border-left:3px solid var(--red);}
.replay-who{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px;}
.replay-msg.rmuser .replay-who{color:var(--blue);}
.replay-msg.rmai .replay-who{color:var(--red);}
.replay-subs{display:flex;gap:12px;padding:4px 16px 12px;flex-wrap:wrap;}
.replay-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);}
.replay-sub span{color:var(--text);}

/* === TABLET (520-900px) === */
@media (min-width:520px) and (max-width:900px){
  .app{max-width:680px;padding:32px 24px 28px;}
  .featured-card{padding:18px 22px;}
  .featured-topic-text{font-size:16px;}
  .live-feed{gap:7px;}
  .feed-text{font-size:13px;}
  .ai-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}
  .topic-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));}
  .verdict-moments{grid-template-columns:1fr 1fr;}
  .verdict-actions{flex-wrap:wrap;}
  .mf-vs-card{padding:16px 20px;}
}

/* === DESKTOP (>900px) === */
@media (min-width:900px){
  .app{max-width:900px;padding:44px 32px 40px;}
  .home-hero{padding:28px 0 52px;}
  .home-title{font-size:clamp(80px,10vw,112px);}
  .home-cta .btn{font-size:16px;padding:16px 40px;letter-spacing:4px;}
  .gauntlet-btn{font-size:15px;padding:16px 32px;max-width:460px;}
  .featured-card{padding:20px 24px;}
  .featured-topic-text{font-size:16px;}
  .feed-text{font-size:13px;}
  .arena-stat .as-val{font-size:26px;}
  .arena-stat{padding:16px 12px;}
  .home-bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}
  .home-bottom-row .live-feed-wrap{margin-top:0;}
}

/* === MOBILE === */
@media (max-width:520px){
  .app{padding:max(12px,env(safe-area-inset-top,12px)) 14px max(16px,env(safe-area-inset-bottom,16px));display:flex;flex-direction:column;}
  .nav{margin-bottom:16px;}
  .logo{font-size:28px;letter-spacing:3px;}
  .logo::after{font-size:8px;right:-42px;}
  .nav-rank{font-size:11px;}
  .debate-screen{flex:1;display:flex;flex-direction:column;min-height:0;}
  .debate-screen .arena-header{padding:8px 10px;margin-bottom:10px;}
  .debate-screen .messages{flex:1;max-height:none !important;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:10px;}
  .debate-screen .debate-input{font-size:16px;padding:10px 12px;}
  .debate-screen .input-area{flex-shrink:0;}

  .home-screen{flex:1;display:flex;flex-direction:column;}
  .home-hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:8px 0 16px;}
  .home-title{font-size:clamp(52px,15vw,72px);margin-bottom:clamp(8px,1.5vh,14px);}
  .home-cta{gap:10px;}
  .home-cta .btn{flex:1;}
  .gauntlet-btn{max-width:none;}
  .taunt-line{font-size:12px;margin-top:3px;margin-bottom:clamp(14px,2.5vh,20px);}
  .arena-stats{margin-top:0;}
  .gauntlet-sub{margin-top:4px;font-size:9px;}

  .btn{font-size:13px;letter-spacing:2px;padding:12px 20px;}

  .section-label{font-size:10px;letter-spacing:3px;margin-bottom:12px;}

  .ai-grid{grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:24px;}
  .ai-card{padding:14px 10px;}
  .ai-card .ai-icon{font-size:26px;margin-bottom:6px;}
  .ai-card .ai-name{font-size:13px;}
  .ai-card .ai-desc{font-size:11px;}

  .topic-grid{grid-template-columns:1fr;gap:8px;margin-bottom:16px;}
  .topic-card{padding:12px 14px;}
  .topic-card .t-text{font-size:14px;}

  .rounds-pick{gap:6px;}
  .rounds-btn{padding:10px 4px;font-size:22px;}

  .side-pick{gap:8px;margin-bottom:20px;}
  .side-btn{padding:16px 10px;}
  .side-btn .side-icon{font-size:22px;margin-bottom:6px;}
  .side-btn .side-label{font-size:17px;}

  .arena-header{padding:10px 12px;margin-bottom:14px;}
  .arena-topic{font-size:13px;margin:0 8px;}
  .round-badge{font-size:18px;}

  .messages{min-height:100px;max-height:280px;gap:10px;margin-bottom:12px;}
  .msg-bubble{max-width:85%;}
  .msg-text{font-size:14px;padding:10px 12px;}
  .msg-avatar{width:30px;height:30px;font-size:14px;}

  .debate-input{font-size:16px;padding:10px 12px;}
  .timer-countdown{font-size:24px;min-width:36px;}

  .verdict-card{padding:18px 16px;margin-bottom:14px;}
  .verdict-title{font-size:36px;}
  .verdict-header{margin-bottom:18px;}
  .score-breakdown{gap:8px;margin-bottom:16px;}
  .score-pill{padding:10px 8px;}
  .score-pill .sp-val{font-size:28px;}

  .verdict-moments{grid-template-columns:1fr;}
  .verdict-actions{gap:8px;}
  .verdict-actions .btn{flex:1;min-width:calc(50% - 4px);text-align:center;}

  .input-footer{gap:6px;}
  .submit-row{margin-left:auto;}

  .arena-header{padding:10px 12px;gap:6px;}
  .arena-topic{margin:0 4px;font-size:12px;}

  .matchmaking{min-height:50vh;}
  .mf-vs-card{padding:14px 16px;gap:10px;}
  .mf-icon{font-size:28px;}
  .mf-countdown{font-size:72px;}

  .gauntlet-bots{grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:20px;}
  .gauntlet-bot-card{padding:10px 6px;}
  .gauntlet-bot-card .gb-icon{font-size:22px;margin-bottom:4px;}
  .gauntlet-bot-card .gb-name{font-size:11px;}

  .gauntlet-progress{gap:4px;margin-bottom:20px;}
  .gp-bot{padding:8px 4px;}
  .gp-bot .gp-icon{font-size:16px;}
  .gp-bot .gp-score{font-size:13px;}

  .gauntlet-final-grid{grid-template-columns:1fr;gap:8px;}

  .stats-row{gap:8px;margin-bottom:28px;}
  .stat-card{padding:12px 14px;}
  .stat-card .val{font-size:26px;}

  .lb-row{gap:8px;padding:10px 12px;}
  .lb-score{font-size:20px;}
  .lb-name{font-size:14px;}
  .lb-avatar{width:30px;height:30px;font-size:15px;}
  .lb-rank{width:26px;font-size:18px;}

  .share-toast{font-size:11px;padding:8px 16px;bottom:16px;}
  .featured-card{padding:14px 16px;gap:12px;margin-top:16px;}
  .featured-topic-text{font-size:14px;}
  .featured-cta{font-size:12px;}
  .feed-item{padding:8px 12px;}
  .feed-text{font-size:12px;}
  .live-feed-wrap{margin-top:18px;}
  .home-cta .btn{min-height:48px;}
}
@media (max-width:360px){
  .ai-grid{grid-template-columns:1fr 1fr;}
  .gauntlet-bots{grid-template-columns:repeat(2,1fr);}
  .mf-vs-card{padding:10px 12px;}
  .messages{max-height:240px;}
  .featured-topic-text{font-size:13px;}
}

/* === GAUNTLET === */
.gauntlet-bots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px;}
.gauntlet-bot-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 12px;text-align:center;}
.gauntlet-bot-card .gb-num{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.gauntlet-bot-card .gb-icon{font-size:28px;display:block;margin-bottom:6px;}
.gauntlet-bot-card .gb-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;}
.gauntlet-progress{display:flex;gap:6px;margin-bottom:28px;}
.gp-bot{flex:1;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:10px 6px;text-align:center;transition:all 0.3s;}
.gp-bot.done{border-color:var(--green);background:rgba(34,197,94,0.07);}
.gp-bot.current-done{border-color:var(--gold);background:rgba(244,197,66,0.07);}
.gp-bot .gp-icon{font-size:20px;display:block;margin-bottom:4px;}
.gp-bot .gp-score{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--text-dim);}
.gp-bot .gp-rank{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;color:var(--text-dim);}
.gp-bot.done .gp-score{color:var(--green);}
.gp-bot.current-done .gp-score{color:var(--gold);}
.gauntlet-final-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:24px;}
.gf-match{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px;}
.gf-match.won{border-color:rgba(34,197,94,0.4);}
.gf-match.lost{border-color:rgba(230,57,70,0.25);}
.gf-header{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.gf-icon{font-size:22px;}
.gf-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
.gf-topic{font-size:11px;color:var(--text-dim);margin-bottom:8px;line-height:1.3;}
.gf-score-row{display:flex;align-items:center;gap:8px;}
.gf-rank{font-family:'Bebas Neue',sans-serif;font-size:22px;}
.gf-match.won .gf-rank{color:var(--green);}
.gf-match.lost .gf-rank{color:var(--red);}
.gf-bar{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.gf-fill{height:100%;border-radius:2px;}
.gf-score{font-family:'Bebas Neue',sans-serif;font-size:18px;}

/* Glow behind WIN */
@keyframes winGlowPulse{0%,100%{opacity:0.25;transform:scale(1);}50%{opacity:0.65;transform:scale(1.12);}}
.home-title .line2{position:relative;}
.home-title .line2::before{content:'';position:absolute;inset:-40% -15%;background:radial-gradient(ellipse at center,rgba(230,57,70,0.35) 0%,rgba(230,57,70,0.08) 45%,transparent 70%);z-index:-1;pointer-events:none;animation:winGlowPulse 2.8s ease-in-out infinite;}

/* Taunt / Status line */
@keyframes tauntIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
.taunt-line{font-size:13px;color:var(--text-mid);text-align:center;min-height:22px;margin-top:8px;margin-bottom:20px;animation:tauntIn 0.5s ease;font-style:normal;letter-spacing:0.5px;}
.taunt-who{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-right:6px;color:var(--text-dim);}

/* Gauntlet button — upgraded */
@keyframes goldPulse{0%,100%{box-shadow:0 0 0 0 rgba(244,197,66,0);border-color:rgba(244,197,66,0.45);color:rgba(244,197,66,0.8);}50%{box-shadow:0 0 18px 3px rgba(244,197,66,0.18);border-color:rgba(244,197,66,0.75);color:var(--gold);}}
.gauntlet-btn{display:block;background:rgba(244,197,66,0.03);border:1.5px solid rgba(244,197,66,0.45);color:rgba(244,197,66,0.8);border-radius:var(--radius);padding:14px 24px;font-family:'Barlow Condensed',sans-serif;font-size:14px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;width:100%;max-width:400px;transition:all 0.2s;touch-action:manipulation;-webkit-tap-highlight-color:transparent;animation:goldPulse 2.4s ease-in-out infinite;}
.gauntlet-btn:hover{background:rgba(244,197,66,0.07);color:var(--gold);transform:translateY(-1px);}
.gauntlet-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);opacity:0.55;margin-top:6px;}

/* Featured topic card */
@keyframes featuredSlideLeft{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes featuredSlideRight{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}
.featured-wrap{position:relative;margin-top:20px;overflow:hidden;border-radius:var(--radius);}
.featured-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;cursor:pointer;transition:border-color 0.2s,background 0.2s;display:flex;align-items:center;gap:16px;touch-action:pan-y;user-select:none;}
.featured-card:hover{border-color:rgba(230,57,70,0.5);background:rgba(230,57,70,0.04);}
.featured-card.anim-left{animation:featuredSlideLeft 0.38s cubic-bezier(0.25,0.46,0.45,0.94);}
.featured-card.anim-right{animation:featuredSlideRight 0.38s cubic-bezier(0.25,0.46,0.45,0.94);}
.featured-left{flex:1;min-width:0;}
.featured-badge{display:inline-flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--red);background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.2);border-radius:3px;padding:2px 8px;margin-bottom:8px;}
.featured-topic-text{font-size:15px;font-weight:500;line-height:1.4;color:var(--text);}
.featured-cat{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:6px;}
.featured-cta{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--red);white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:4px;}
.featured-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 4px 0;}
.featured-dots{display:flex;gap:5px;align-items:center;}
.featured-dot{width:6px;height:6px;border-radius:50%;background:var(--border);transition:all 0.25s;cursor:pointer;border:none;padding:0;}
.featured-dot.active{background:var(--red);width:16px;border-radius:3px;}
.featured-arrows{display:flex;gap:6px;}
.featured-arrow{background:none;border:1px solid var(--border);color:var(--text-dim);width:26px;height:26px;border-radius:50%;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;padding:0;}
.featured-arrow:hover{border-color:var(--red);color:var(--red);}

/* Live activity feed */
.live-feed-wrap{margin-top:24px;}
.live-feed-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);display:inline-block;margin-right:6px;animation:liveBlink 1.6s ease-in-out infinite;}
@keyframes liveBlink{0%,100%{opacity:1;}50%{opacity:0.3;}}
.live-feed{display:flex;flex-direction:column;gap:6px;}
@keyframes feedItemIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
.feed-item{display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);animation:feedItemIn 0.35s ease;}
.feed-icon{font-size:14px;flex-shrink:0;}
.feed-text{flex:1;font-size:13px;color:var(--text-mid);line-height:1.35;}
.feed-text strong{color:var(--text);font-weight:600;}
.feed-time{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;color:var(--text-dim);white-space:nowrap;flex-shrink:0;}
.feed-badge{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:1px 5px;border-radius:2px;flex-shrink:0;}
.feed-win{background:rgba(34,197,94,0.1);color:var(--green);}
.feed-loss{background:rgba(230,57,70,0.1);color:var(--red);}
.feed-streak{background:rgba(244,197,66,0.1);color:var(--gold);}
.feed-rank{background:rgba(168,85,247,0.1);color:#a855f7;}

/* Arena stats strip */
@keyframes statCount{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.arena-stats{display:flex;justify-content:center;margin-top:24px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.arena-stat{flex:1;text-align:center;padding:13px 8px;}
.arena-stat+.arena-stat{border-left:1px solid var(--border);}
.arena-stat .as-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--text);display:block;animation:statCount 0.6s ease;}
.arena-stat .as-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);opacity:0.55;}

/* LIVE SCOREBOARD */
.live-scoreboard{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:8px 14px;margin-bottom:12px;flex-wrap:wrap;}
.ls-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);white-space:nowrap;}
.ls-you{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--green);line-height:1;}.ls-ai{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--red);line-height:1;}
.ls-sep{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text-dim);margin:0 4px;}.ls-avg{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:var(--text-mid);margin-left:auto;}
.ls-dots{display:flex;gap:4px;align-items:center;}.ls-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
/* TOPIC VOTES */
.topic-vote-btn{background:none;border:1px solid var(--border);border-radius:100px;padding:2px 10px 2px 6px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:var(--text-dim);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px;touch-action:manipulation;margin-top:8px;}
.topic-vote-btn:hover,.topic-vote-btn.voted{border-color:var(--red);color:var(--red);}
.trending-section{margin-bottom:20px;}.trending-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:6px;cursor:pointer;transition:border-color 0.2s;}
.trending-item:hover{border-color:var(--text-dim);}.trending-rank{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--text-dim);width:20px;flex-shrink:0;text-align:center;}
.trending-text{flex:1;font-size:13px;font-weight:500;min-width:0;}.trending-votes{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:var(--red);flex-shrink:0;}
/* ACHIEVEMENTS */
.achievement-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;border:1px solid var(--gold);border-radius:var(--radius);padding:12px 20px;display:flex;align-items:center;gap:12px;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,0.8);animation:toastIn 0.4s ease;max-width:360px;width:calc(100% - 32px);}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,20px);}to{opacity:1;transform:translate(-50%,0);}}
.achievement-toast-icon{font-size:28px;flex-shrink:0;}.achievement-toast-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:4px;}
.achievement-toast-name{font-size:15px;font-weight:600;}.achievement-strip{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.ach-badge{background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:4px 12px 4px 8px;display:flex;align-items:center;gap:6px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;}.ach-badge.gold-ach{border-color:var(--gold);background:rgba(244,197,66,0.08);}
/* SOUND TOGGLE */
.sound-btn{background:none;border:1px solid var(--border);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.18s,color 0.18s,background 0.18s;color:var(--text-dim);-webkit-tap-highlight-color:transparent;flex-shrink:0;}.sound-btn:hover{border-color:var(--text-mid);color:var(--text);background:rgba(255,255,255,0.04);}.sound-btn.muted{color:var(--text-dim);opacity:0.5;}
/* Personal record */
.nemesis-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:10px;}
.nemesis-icon{font-size:26px;flex-shrink:0;}
.nemesis-name{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.nemesis-sub{font-size:12px;color:var(--text-dim);}
.nemesis-rematch{margin-left:auto;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--red);background:none;border:1px solid rgba(230,57,70,0.4);border-radius:var(--radius);padding:6px 12px;cursor:pointer;flex-shrink:0;touch-action:manipulation;}
.nemesis-rematch:hover{border-color:var(--red);background:rgba(230,57,70,0.06);}
/* AUTH MODAL */
.auth-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;}
.auth-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;max-width:400px;width:100%;position:relative;}
.auth-title{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:3px;margin-bottom:4px;}
.auth-sub{font-size:13px;color:var(--text-dim);margin-bottom:20px;}
.auth-tabs{display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--border);}
.auth-tab{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;cursor:pointer;color:var(--text-dim);padding:8px 20px 8px 0;position:relative;transition:color 0.2s;}
.auth-tab.active{color:var(--red);}
.auth-tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--red);}
.auth-field{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:12px 14px;margin-bottom:12px;outline:none;transition:border-color 0.2s;}
.auth-field:focus{border-color:var(--red);}
.auth-err{color:var(--red);font-size:13px;margin-bottom:12px;min-height:18px;}
.auth-close{position:absolute;top:12px;right:14px;background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;padding:4px;}
.auth-close:hover{color:var(--text);}
.auth-pill{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.3);border-radius:100px;padding:4px 12px;cursor:pointer;color:var(--red);transition:all 0.2s;}
.auth-pill:hover{background:rgba(230,57,70,0.2);}
/* 1V1 MODE */
.v1-mode-card{background:linear-gradient(135deg,rgba(0,119,255,0.1),rgba(0,50,150,0.06));border:1px solid rgba(0,119,255,0.3);border-radius:var(--radius);padding:16px 18px;margin-top:12px;cursor:pointer;transition:all 0.22s;display:flex;align-items:center;gap:14px;}
.v1-mode-card:hover{border-color:rgba(0,119,255,0.6);transform:translateY(-1px);}
.v1-icon{font-size:26px;flex-shrink:0;}
.v1-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#60a5fa;margin-bottom:2px;}
.v1-desc{font-size:12px;color:var(--text-dim);}
.v1-arrow{font-size:18px;color:rgba(0,119,255,0.5);flex-shrink:0;}
.lobby-options{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.lobby-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:22px 16px;text-align:center;cursor:pointer;transition:all 0.2s;}
.lobby-card:hover{transform:translateY(-2px);}
.lobby-card.create{border-color:rgba(230,57,70,0.35);}.lobby-card.create:hover{border-color:var(--red);}
.lobby-card.join{border-color:rgba(0,119,255,0.35);}.lobby-card.join:hover{border-color:var(--blue);}
.lobby-card-icon{font-size:30px;margin-bottom:10px;}
.lobby-card-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;}
.lobby-card-sub{font-size:12px;color:var(--text-dim);}
.join-code-input{width:100%;background:var(--surface2);border:2px solid var(--border);border-radius:var(--radius);color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:10px;padding:14px 18px;text-align:center;text-transform:uppercase;outline:none;transition:border-color 0.2s;margin-bottom:12px;}
.join-code-input:focus{border-color:var(--blue);}
.waiting-room{text-align:center;padding:32px 0;}
.room-code-display{font-family:'Bebas Neue',sans-serif;font-size:clamp(52px,14vw,88px);letter-spacing:10px;color:var(--text);margin:12px 0 6px;cursor:pointer;transition:color 0.2s;}
.room-code-display:hover{color:var(--gold);}
.waiting-dots{display:flex;justify-content:center;gap:8px;margin:16px 0;}
.waiting-dot{width:10px;height:10px;border-radius:50%;background:var(--border);animation:dotPulse 1.4s ease-in-out infinite;}
.waiting-dot:nth-child(2){animation-delay:0.2s;}.waiting-dot:nth-child(3){animation-delay:0.4s;}
@keyframes dotPulse{0%,80%,100%{background:var(--border);}40%{background:var(--red);}}
.share-link-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:var(--text-dim);word-break:break-all;cursor:pointer;margin-bottom:14px;transition:border-color 0.2s;}
.share-link-box:hover{border-color:var(--text-dim);}
.v1-arena-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);}
.v1-round-badge{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:var(--gold);}
.v1-vs-bar{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;}
.v1-player-chip{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:100px;border:2px solid;text-transform:uppercase;}
.v1-player-chip.me{background:rgba(230,57,70,0.1);border-color:rgba(230,57,70,0.4);color:var(--red);}
.v1-player-chip.opp{background:rgba(0,119,255,0.1);border-color:rgba(0,119,255,0.4);color:#60a5fa;}
.v1-vs{font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--text-dim);letter-spacing:2px;}
.v1-score-bar{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:16px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);}
.v1-score{font-family:'Bebas Neue',sans-serif;font-size:36px;}.v1-score.me{color:var(--red);}.v1-score.opp{color:#60a5fa;text-align:right;}
.v1-score-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);display:block;}
.v1-args-section{margin-bottom:16px;}
.v1-arg-entry{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:10px;}
.v1-arg-who{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.v1-arg-who.me{color:var(--red);}.v1-arg-who.opp{color:#60a5fa;}
.v1-arg-text{font-size:14px;line-height:1.7;color:var(--text-mid);}
.v1-arg-critique{font-size:12px;color:var(--text-dim);margin-top:8px;font-style:italic;border-top:1px solid var(--border);padding-top:6px;}
.v1-arg-scores{display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;}
.v1-arg-score{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:var(--text-dim);}
.v1-arg-score span{color:var(--text-mid);font-weight:700;}
.v1-waiting-msg{text-align:center;color:var(--text-dim);font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:18px;border:1px dashed var(--border);border-radius:var(--radius);margin-bottom:14px;}
.hl{border-radius:3px;padding:0 2px;}
.hl-strong{background:rgba(34,197,94,0.22);color:#86efac;}
.hl-weak{background:rgba(244,197,66,0.22);color:#fde68a;}
.hl-wrong{background:rgba(230,57,70,0.22);color:#fca5a5;}
.hl-fallacy{background:rgba(251,146,60,0.22);color:#fed7aa;}
.v1-result-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;text-align:center;margin-bottom:20px;}
.v1-winner-banner{font-family:'Bebas Neue',sans-serif;font-size:clamp(42px,10vw,68px);letter-spacing:4px;margin-bottom:8px;}
.v1-iq-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0;}
.v1-iq-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:20px 14px;text-align:center;}
.v1-iq-card.winner{border-color:var(--gold);background:rgba(244,197,66,0.05);}
.v1-iq-val{font-family:'Bebas Neue',sans-serif;font-size:52px;color:var(--text);line-height:1;}
.v1-iq-val.gold{color:var(--gold);}
.v1-iq-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-top:4px;}
.v1-iq-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
.v1-iq-rank{font-family:'Bebas Neue',sans-serif;font-size:28px;}
.v1-iq-desc{font-size:11px;color:var(--text-dim);margin-top:2px;}
.v1-topic-banner{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;font-size:13px;color:var(--text-dim);margin-bottom:14px;}
.v1-topic-banner strong{color:var(--text);font-style:italic;}

/* THEME TOGGLE BUTTON */
.theme-btn{background:none;border:1px solid var(--border);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.18s,color 0.18s,background 0.18s;color:var(--text-dim);-webkit-tap-highlight-color:transparent;flex-shrink:0;}
.theme-btn:hover{border-color:var(--text-mid);color:var(--text);background:rgba(255,255,255,0.05);}

/* LIGHT MODE — iOS 26 Liquid Glass */
[data-theme="light"]{
  --bg:transparent;
  --surface:rgba(255,255,255,0.52);
  --surface2:rgba(255,255,255,0.38);
  --border:rgba(255,255,255,0.58);
  --red:#e0302a;
  --red-dim:rgba(224,48,42,0.14);
  --blue:#0071e3;
  --blue-dim:rgba(0,113,227,0.14);
  --gold:#c77b00;
  --text:#1c1c1e;
  --text-dim:#636366;
  --text-mid:#3a3a3c;
  --green:#1a8c40;
}
[data-theme="light"] body{background:linear-gradient(145deg,#95b8f5 0%,#c2a8f2 28%,#80c8f5 58%,#7de0b8 100%);min-height:100dvh;}
[data-theme="light"] body::after{background:none;}
[data-theme="light"] .nav{position:relative;overflow:hidden;background:rgba(255,255,255,0.58);backdrop-filter:blur(28px) saturate(200%);-webkit-backdrop-filter:blur(28px) saturate(200%);border-bottom:1px solid rgba(255,255,255,0.72);box-shadow:0 1px 0 rgba(0,0,0,0.04),0 4px 24px rgba(0,0,0,0.06);}
[data-theme="light"] .nav::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent);pointer-events:none;}
[data-theme="light"] .featured-card,[data-theme="light"] .stat-card,[data-theme="light"] .ai-card,[data-theme="light"] .topic-card,[data-theme="light"] .lb-row,[data-theme="light"] .round-score,[data-theme="light"] .live-scoreboard,[data-theme="light"] .arena-header,[data-theme="light"] .feed-item,[data-theme="light"] .lobby-card,[data-theme="light"] .v1-result-card,[data-theme="light"] .v1-arg-entry,[data-theme="light"] .v1-arena-header,[data-theme="light"] .nemesis-card,[data-theme="light"] .challenge-banner,[data-theme="light"] .verdict-card,[data-theme="light"] .replay-intro,[data-theme="light"] .replay-round,[data-theme="light"] .trending-item,[data-theme="light"] .v1-history-entry,[data-theme="light"] .gauntlet-bot-card,[data-theme="light"] .gp-bot,[data-theme="light"] .gf-match,[data-theme="light"] .ach-badge,[data-theme="light"] .msg-text,[data-theme="light"] .score-pill,[data-theme="light"] .custom-form,[data-theme="light"] .auth-box,[data-theme="light"] .username-dialog,[data-theme="light"] .v1-iq-card,[data-theme="light"] .v1-score-bar,[data-theme="light"] .share-link-box,[data-theme="light"] .waiting-room,[data-theme="light"] .mf-vs-card{position:relative;overflow:hidden;background:rgba(255,255,255,0.52)!important;backdrop-filter:blur(22px) saturate(200%)!important;-webkit-backdrop-filter:blur(22px) saturate(200%)!important;border:1px solid rgba(255,255,255,0.65)!important;box-shadow:0 8px 32px rgba(0,0,0,0.06)!important;}
[data-theme="light"] .featured-card::before,[data-theme="light"] .stat-card::before,[data-theme="light"] .ai-card::before,[data-theme="light"] .topic-card::before,[data-theme="light"] .lb-row::before,[data-theme="light"] .arena-header::before,[data-theme="light"] .lobby-card::before,[data-theme="light"] .v1-result-card::before,[data-theme="light"] .verdict-card::before,[data-theme="light"] .v1-history-entry::before,[data-theme="light"] .gf-match::before,[data-theme="light"] .auth-box::before,[data-theme="light"] .v1-iq-card::before,[data-theme="light"] .mf-vs-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent);pointer-events:none;z-index:1;}
[data-theme="light"] .v1-mode-card{position:relative;overflow:hidden;background:rgba(170,200,255,0.45)!important;backdrop-filter:blur(22px) saturate(200%)!important;-webkit-backdrop-filter:blur(22px) saturate(200%)!important;border:1px solid rgba(255,255,255,0.68)!important;box-shadow:0 8px 32px rgba(0,0,0,0.06)!important;}
[data-theme="light"] .btn-primary{background:var(--red);box-shadow:0 4px 16px rgba(224,48,42,0.3);}
[data-theme="light"] .btn-secondary{position:relative;overflow:hidden;background:rgba(255,255,255,0.52);backdrop-filter:blur(14px) saturate(180%);-webkit-backdrop-filter:blur(14px) saturate(180%);border:1px solid rgba(255,255,255,0.65);color:var(--text);}
[data-theme="light"] .btn-ghost{background:rgba(255,255,255,0.42);border-color:rgba(255,255,255,0.6);color:var(--text-dim);}
[data-theme="light"] .btn-ghost:hover{background:rgba(255,255,255,0.78);color:var(--text);}
[data-theme="light"] .debate-input,[data-theme="light"] .join-code-input,[data-theme="light"] .auth-field,[data-theme="light"] .username-field,[data-theme="light"] .custom-input{background:rgba(255,255,255,0.82);border-color:rgba(0,0,0,0.1);color:var(--text);}
[data-theme="light"] .tabs,[data-theme="light"] .v1-tab-row{position:relative;overflow:hidden;background:rgba(255,255,255,0.45)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;border-color:rgba(255,255,255,0.62)!important;}
[data-theme="light"] .sound-btn,[data-theme="light"] .theme-btn{background:rgba(255,255,255,0.55);border-color:rgba(255,255,255,0.72);color:var(--text-mid);}
[data-theme="light"] .sound-btn:hover,[data-theme="light"] .theme-btn:hover{background:rgba(255,255,255,0.85);}
[data-theme="light"] .auth-pill{background:rgba(224,48,42,0.1);border-color:rgba(224,48,42,0.3);color:var(--red);}
[data-theme="light"] .profile-pill,[data-theme="light"] .user-chip{background:rgba(255,255,255,0.55);border-color:rgba(255,255,255,0.72);color:var(--text);}
[data-theme="light"] .user-chip:hover{background:rgba(255,255,255,0.82);}
[data-theme="light"] .share-toast{background:rgba(255,255,255,0.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:var(--green);}
[data-theme="light"] .achievement-toast{background:rgba(255,255,255,0.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);}
[data-theme="light"] .mf-stance.for{background:rgba(26,140,64,0.1);}
[data-theme="light"] .mf-stance.against{background:rgba(224,48,42,0.1);}
[data-theme="light"] .error-banner{background:rgba(224,48,42,0.07);}
[data-theme="light"] .v1-player-chip.me{background:rgba(224,48,42,0.1);border-color:rgba(224,48,42,0.3);}
[data-theme="light"] .v1-player-chip.opp{background:rgba(0,113,227,0.1);border-color:rgba(0,113,227,0.25);}
[data-theme="light"] .arena-stats{border-color:rgba(255,255,255,0.5);}
[data-theme="light"] .arena-stat+.arena-stat{border-color:rgba(255,255,255,0.5);}
[data-theme="light"] .logo::after{background:var(--red);}
[data-theme="light"] .sudden-btn{background:rgba(224,48,42,0.07);}
[data-theme="light"] .best-arg{background:rgba(26,140,64,0.09);border-color:rgba(26,140,64,0.2);}
[data-theme="light"] .worst-arg{background:rgba(224,48,42,0.07);border-color:rgba(224,48,42,0.2);}
[data-theme="light"] .profile-panel{position:relative;overflow:hidden;background:rgba(255,255,255,0.72)!important;backdrop-filter:blur(32px) saturate(200%)!important;-webkit-backdrop-filter:blur(32px) saturate(200%)!important;border:1px solid rgba(255,255,255,0.78)!important;box-shadow:0 16px 48px rgba(0,0,0,0.1)!important;}
[data-theme="light"] .pp-username-field{background:rgba(255,255,255,0.82);border-color:rgba(0,0,0,0.1);}

/* 1V1 LOBBY TABS */
.v1-tab-row{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:4px;margin-bottom:20px;}
.v1-tab{flex:1;padding:10px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer;border:none;background:transparent;color:var(--text-dim);transition:all 0.2s;}
.v1-tab.active{background:var(--red);color:#fff;}

/* 1V1 MATCH HISTORY */
.v1-history-entry{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;animation:fadeIn 0.3s ease;}
.v1-hist-result{font-family:'Bebas Neue',sans-serif;font-size:15px;width:52px;flex-shrink:0;text-align:center;border-radius:var(--radius);padding:5px 0;letter-spacing:1px;}
.v1-hist-result.win{color:var(--green);background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.22);}
.v1-hist-result.loss{color:var(--red);background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.2);}
.v1-hist-info{flex:1;min-width:0;}
.v1-hist-topic{font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
.v1-hist-meta{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:var(--text-dim);}
.v1-hist-rank{font-family:'Bebas Neue',sans-serif;font-size:26px;flex-shrink:0;}

/* SEASONAL BADGES */
.seasonal-section{margin-top:24px;}
.seasonal-badge-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}
.seasonal-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px 5px 9px;border-radius:100px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;cursor:default;}
.seasonal-badge.gold{background:rgba(244,197,66,0.12);border:1px solid rgba(244,197,66,0.4);color:var(--gold);}
.seasonal-badge.silver{background:rgba(180,180,190,0.1);border:1px solid rgba(180,180,190,0.35);color:#ababbb;}
.seasonal-badge.bronze{background:rgba(180,110,50,0.1);border:1px solid rgba(180,110,50,0.35);color:#b87333;}
.seasonal-badge.blue{background:rgba(0,119,255,0.1);border:1px solid rgba(0,119,255,0.28);color:#60a5fa;}

/* USER CHIP & PROFILE PANEL */
.user-chip{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border:1px solid var(--border);border-radius:100px;background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--text);transition:all 0.18s;-webkit-tap-highlight-color:transparent;flex-shrink:0;max-width:140px;}
.user-chip:hover{border-color:var(--red);background:rgba(255,255,255,0.05);}
.user-chip-av{width:22px;height:22px;border-radius:50%;background:var(--red-dim);border:1.5px solid rgba(230,57,70,0.4);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--red);flex-shrink:0;line-height:1;font-family:'Barlow Condensed',sans-serif;}
.user-chip-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.profile-overlay{position:fixed;inset:0;z-index:8000;}
.profile-panel{position:fixed;top:62px;right:16px;z-index:8001;width:268px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.45),0 4px 16px rgba(0,0,0,0.2);animation:ppIn 0.18s cubic-bezier(0.34,1.2,0.64,1);}
@keyframes ppIn{from{opacity:0;transform:scale(0.95) translateY(-8px);}to{opacity:1;transform:scale(1) translateY(0);}}
.pp-header{padding:16px 16px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;}
.pp-avatar{width:40px;height:40px;border-radius:50%;background:var(--red-dim);border:2px solid rgba(230,57,70,0.35);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--red);flex-shrink:0;font-family:'Barlow Condensed',sans-serif;line-height:1;}
.pp-name{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pp-email{font-size:10px;color:var(--text-dim);margin-top:2px;font-family:'Barlow',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;}
.pp-stats{display:flex;border-bottom:1px solid var(--border);}
.pp-stat{flex:1;text-align:center;padding:10px 8px;border-right:1px solid var(--border);}
.pp-stat:last-child{border-right:none;}
.pp-stat-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--text);display:block;line-height:1;}
.pp-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:1px;}
.pp-section{padding:10px 14px;border-bottom:1px solid var(--border);}
.pp-section-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.pp-username-row{display:flex;gap:6px;align-items:center;}
.pp-username-field{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px 9px;font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--text);outline:none;transition:border-color 0.2s;}
.pp-username-field:focus{border-color:var(--blue);}
.pp-save-btn{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:6px 11px;background:var(--red);color:#fff;border:none;border-radius:6px;cursor:pointer;white-space:nowrap;transition:background 0.18s;}
.pp-save-btn:hover{background:#ff4655;}
.pp-logout{display:block;width:100%;padding:12px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);background:none;border:none;cursor:pointer;transition:color 0.18s,background 0.18s;}
.pp-logout:hover{color:var(--red);background:rgba(230,57,70,0.06);}
`;

function getTopicRating(text: string): "Casual" | "Contested" | "Minefield" {
  const t = text.toLowerCase();
  const minefields = ["death penalty", "billionaires", "euthanasia", "designer babies", "facial recognition", "cancel culture", "animal experiments", "ends justify", "prisoners", "capital punishment", "assisted dying", "consciousness survives"];
  const casuals = ["pineapple", "mornings vs", "cats ", " cats", "cats vs", "winter", "coffee", "board games", "leftovers", "museums", "breakfast", "metaverse", "nostalgia", "remakes", "marvel", "award show", "fan fiction", "gap year", "podcasts", "fast food", "naps", "money can buy", "luck vs", "failure is", "perfection", "beauty is", "intelligence matters", "reading", "sports boring", "cooking"];
  if (minefields.some((m) => t.includes(m))) return "Minefield";
  if (casuals.some((c) => t.includes(c))) return "Casual";
  return "Contested";
}

const TOURNAMENT_BOT_ORDER = ["troll", "professor", "politician", "prosecutor", "philosopher", "debunker"];

const AI_OPPONENTS = [
  { id: "professor", icon: "🎓", name: "The Professor", desc: "Calm, methodical. Dismantles logic with academic precision.", diff: "medium", diffLabel: "Medium", timer: 180, personality: "You are a calm, highly intelligent academic debater. You cite logic and reasoning, speak in measured tones, and systematically dismantle weak arguments. You never get emotional. You are polite but devastating." },
  { id: "politician", icon: "🏛️", name: "The Politician", desc: "Dodges, pivots, and spins. Never directly admits fault.", diff: "medium", diffLabel: "Medium", timer: 180, personality: "You are a slippery politician-style debater. You deflect, reframe questions, use emotional rhetoric, appeal to broad audiences, and never directly admit you're wrong. You pivot masterfully." },
  { id: "prosecutor", icon: "⚖️", name: "The Prosecutor", desc: "Aggressive cross-examiner. Destroys weak logic ruthlessly.", diff: "hard", diffLabel: "Hard", timer: 135, personality: "You are an aggressive, relentless prosecutor. You find the weakest point in every argument and hammer it. You ask piercing rhetorical questions and never let weak logic slide. You are intense and relentless." },
  { id: "philosopher", icon: "🔮", name: "The Philosopher", desc: "Questions your assumptions. Makes you doubt everything.", diff: "hard", diffLabel: "Hard", timer: 135, personality: "You are a Socratic philosopher debater. You question the user's fundamental assumptions, expose logical fallacies, and make them doubt their own premises. You answer questions with questions. You are unsettling and deep." },
  { id: "troll", icon: "😈", name: "The Devil", desc: "Chaotic. Takes the most extreme opposing position always.", diff: "easy", diffLabel: "Easy", timer: 270, personality: "You are a chaotic devil's advocate who takes the most extreme, provocative opposing position possible. You are intentionally over-the-top but make surprisingly sharp points. You are fun but hard to pin down." },
  { id: "debunker", icon: "🔬", name: "The Debunker", desc: "Data obsessed. Demands evidence. Fact-checks everything.", diff: "extreme", diffLabel: "Extreme", timer: 45, personality: "You are a rigorous fact-checker and debunker. You demand sources, cite statistics, and dismantle arguments that lack evidence. You are skeptical of everything and can spot unsupported claims instantly. You are surgical and unforgiving." },
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

const ACHIEVEMENTS = [
  { id: "first-win",          icon: "🏆", name: "First Blood",          desc: "Win your first debate" },
  { id: "debunker-slayer",    icon: "🔬", name: "Fact Checked",          desc: "Beat The Debunker" },
  { id: "streak-3",           icon: "🔥", name: "On Fire",               desc: "Win 3 in a row" },
  { id: "gauntlet-complete",  icon: "⚔️", name: "Gauntlet Champion",     desc: "Complete all 6 opponents" },
  { id: "score-90",           icon: "💎", name: "Diamond Tongue",         desc: "Score 90+ in a debate" },
  { id: "philosopher-slayer", icon: "🔮", name: "Deep Thinker",           desc: "Beat The Philosopher" },
  { id: "share-it",           icon: "🔗", name: "Challenger",             desc: "Share a result" },
  { id: "veteran",            icon: "📊", name: "Veteran",                desc: "Complete 10 debates" },
  { id: "prosecutor-slayer",  icon: "⚖️", name: "Cross Examined",         desc: "Beat The Prosecutor" },
  { id: "perfect-round",      icon: "⭐", name: "Flawless",               desc: "Score 95+ in a round" },
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


const TAUNTS = [
  { icon: "⚖️", text: "The Prosecutor is waiting." },
  { icon: "💀", text: "87 players lost today. You're next." },
  { icon: "📊", text: "Your logic rating is unranked." },
  { icon: "🔥", text: "3 players are in Gauntlet Mode right now." },
  { icon: "🎓", text: "The Professor hasn't lost in 11 debates." },
  { icon: "⚡", text: "Last match lasted 4 rounds." },
  { icon: "🔬", text: "The Debunker demands evidence." },
  { icon: "🏛️", text: "The Politician is ready to reframe your point." },
  { icon: "🎯", text: "KINGDEBATE just hit rank #1." },
  { icon: "🔮", text: "The Philosopher questioned someone's entire worldview." },
];

const FEATURED_TOPICS = [
  { cat: "Ethics", text: "Billionaires should not exist", heat: "Minefield" },
  { cat: "Society", text: "The four-day work week should be standard", heat: "Contested" },
  { cat: "Tech", text: "AI will do more good than harm to humanity", heat: "Contested" },
  { cat: "Philosophy", text: "Free will is an illusion", heat: "Contested" },
  { cat: "Society", text: "Cancel culture has gone too far", heat: "Minefield" },
  { cat: "Tech", text: "AI-generated art is not real art", heat: "Contested" },
  { cat: "Ethics", text: "The death penalty should be abolished worldwide", heat: "Minefield" },
  { cat: "Philosophy", text: "Money can buy happiness", heat: "Casual" },
];

interface FeedItem { icon: string; text: string; time: string; badge: string; badgeClass: string; }

function buildFeedItems(): FeedItem[] {
  const ghostPlayers = ["LOGICWOLF", "FOXFIRE99", "SHARPTAKE", "VOLTIX", "BLAZELOGIC", "BIGBRAIN47", "GHOSTLOGIC", "IRONMIND", "SHADOWTAKE", "REDCLASH"];
  const opponents = ["The Prosecutor", "The Professor", "The Philosopher", "The Debunker", "The Politician", "The Devil"];
  const topics = ["Free will is an illusion", "AI will do more good than harm", "Cancel culture has gone too far", "Billionaires should not exist", "The death penalty should be abolished"];
  const sparseTimeLabels = ["34m ago", "47m ago", "1h ago", "1h 12m ago", "1h 28m ago", "1h 45m ago", "2h ago", "2h 20m ago"];
  const pool: FeedItem[] = [
    { icon: "🏆", text: `<strong>${ghostPlayers[0]}</strong> won against ${opponents[0]} · 91 pts`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "WIN", badgeClass: "feed-win" },
    { icon: "💀", text: `<strong>${ghostPlayers[1]}</strong> lost a Gauntlet run at opponent 4`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "LOSS", badgeClass: "feed-loss" },
    { icon: "⚡", text: `<strong>${ghostPlayers[2]}</strong> hit a 5-win streak`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "STREAK", badgeClass: "feed-streak" },
    { icon: "🏆", text: `<strong>${ghostPlayers[4]}</strong> defeated ${opponents[1]} · scored 88`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "WIN", badgeClass: "feed-win" },
    { icon: "⚔️", text: `<strong>${ghostPlayers[5]}</strong> completed a full Gauntlet run`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "GAUNTLET", badgeClass: "feed-streak" },
    { icon: "💀", text: `<strong>${ghostPlayers[6]}</strong> lost to ${opponents[2]} · "${topics[0]}"`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "LOSS", badgeClass: "feed-loss" },
    { icon: "🏆", text: `<strong>${ghostPlayers[7]}</strong> won against ${opponents[3]} · 96 pts`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "WIN", badgeClass: "feed-win" },
    { icon: "⚡", text: `<strong>${ghostPlayers[9]}</strong> is on a 3-win streak`, time: sparseTimeLabels[Math.floor(Math.random() * sparseTimeLabels.length)], badge: "STREAK", badgeClass: "feed-streak" },
  ];
  return pool.sort(() => Math.random() - 0.5).slice(0, 2);
}

function getScoreColor(s: number) {
  if (s >= 80) return "var(--green)";
  if (s >= 60) return "var(--gold)";
  return "var(--red)";
}

function getRankColorHex(rank: string): string {
  switch (rank) {
    case "S": return "#a855f7";
    case "A": return "#e63946";
    case "B": return "#22c55e";
    case "C": return "#f4c542";
    case "F": return "#ff4655";
    default:  return "#666666";
  }
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, curY);
      line = word + " ";
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, curY);
}

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

function generateShareCard(params: {
  won: boolean;
  rank: string;
  avgScore: number;
  avgLogic: number;
  avgPersuasion: number;
  avgIq?: number;
  iqLabel?: string;
  topic: string;
  opponentName: string;
  opponentIcon: string;
  judgeText: string;
  playerName: string | null;
}): string {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const PAD = 68;
  const rankColor = getRankColorHex(params.rank);
  const resultColor = params.won ? "#22c55e" : "#e63946";
  const glowRgb = params.won ? "34,197,94" : "230,57,70";

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // — Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // — Top glow
  const glow = ctx.createRadialGradient(W / 2, 360, 0, W / 2, 360, 640);
  glow.addColorStop(0, `rgba(${glowRgb},0.22)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // — Bottom glow
  const glow2 = ctx.createRadialGradient(W / 2, H - 180, 0, W / 2, H - 180, 380);
  glow2.addColorStop(0, `rgba(${glowRgb},0.07)`);
  glow2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── HEADER ──────────────────────────────────────────────────────────────
  // CLASH logo
  ctx.font = "bold 66px Impact, 'Arial Black', sans-serif";
  ctx.fillStyle = "#f0f0f0";
  const clW = ctx.measureText("CL").width;
  const aW  = ctx.measureText("A").width;
  ctx.fillText("CL", PAD, 96);
  ctx.fillStyle = "#e63946";
  ctx.fillText("A", PAD + clW, 96);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillText("SH", PAD + clW + aW, 96);

  // Player name top-right
  if (params.playerName) {
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillStyle = "#555";
    ctx.textAlign = "right";
    ctx.fillText(params.playerName.toUpperCase(), W - PAD, 96);
  }

  // Colored accent line under header
  ctx.fillStyle = resultColor;
  ctx.fillRect(PAD, 118, W - PAD * 2, 4);

  // ── RANK ────────────────────────────────────────────────────────────────
  // "RANK" micro-label
  ctx.font = "bold 19px Arial, sans-serif";
  ctx.fillStyle = "#383838";
  ctx.textAlign = "center";
  ctx.fillText("RANK", W / 2, 190);

  // Rank letter — 180px so it doesn't bleed into the result text below
  ctx.font = "bold 190px Impact, 'Arial Black', sans-serif";
  ctx.fillStyle = rankColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(params.rank, W / 2, 316);
  ctx.textBaseline = "alphabetic";

  // Thin rank-colored divider between rank and result
  ctx.fillStyle = rankColor + "44";
  ctx.fillRect(W / 2 - 60, 420, 120, 2);

  // ── RESULT ──────────────────────────────────────────────────────────────
  ctx.font = "bold 118px Impact, 'Arial Black', sans-serif";
  ctx.fillStyle = resultColor;
  ctx.textAlign = "center";
  ctx.fillText(params.won ? "VICTORY" : "DEFEATED", W / 2, 562);

  // Underline accent bar (matches width of text)
  const vTextW = ctx.measureText(params.won ? "VICTORY" : "DEFEATED").width;
  ctx.fillStyle = resultColor + "55";
  ctx.fillRect((W - vTextW) / 2, 575, vTextW, 5);

  // ── VS + TOPIC ──────────────────────────────────────────────────────────
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillStyle = "#888";
  ctx.textAlign = "center";
  ctx.fillText(`vs  ${params.opponentIcon}  ${params.opponentName}`, W / 2, 640);

  // Topic — wrap if long
  const topicMaxW = W - PAD * 2.4;
  ctx.font = "italic 31px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#505050";
  ctx.textAlign = "center";
  wrapCanvasText(ctx, `"${params.topic}"`, W / 2, 695, topicMaxW, 42);

  // ── SCORES ──────────────────────────────────────────────────────────────
  // Separator
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(PAD, 768, W - PAD * 2, 1);

  const cols: { label: string; val: number; color?: string }[] = [
    { label: "OVERALL",    val: params.avgScore },
    { label: "LOGIC",      val: params.avgLogic },
    { label: "PERSUASION", val: params.avgPersuasion },
    ...(params.avgIq ? [{ label: params.iqLabel ?? "IQ", val: params.avgIq, color: "#a855f7" }] : []),
  ];
  const colW = (W - PAD * 2) / cols.length;
  cols.forEach((col, i) => {
    const sx = PAD + colW * i + colW / 2;
    const sColor = col.color ?? (col.val >= 80 ? "#22c55e" : col.val >= 60 ? "#f4c542" : "#e63946");
    ctx.font = `bold ${cols.length === 4 ? 96 : 112}px Impact, 'Arial Black', sans-serif`;
    ctx.fillStyle = sColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(col.val), sx, 900);
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillStyle = col.color ? col.color + "99" : "#3a3a3a";
    ctx.fillText(col.label, sx, 934);
  });

  // ── JUDGE QUOTE ─────────────────────────────────────────────────────────
  // Separator
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(PAD, 964, W - PAD * 2, 1);

  // "JUDGE'S VERDICT" label
  ctx.font = "bold 17px Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText("JUDGE'S VERDICT", W / 2, 1012);

  // Decorative large opening quote mark
  ctx.font = `bold 100px Georgia, serif`;
  ctx.fillStyle = resultColor + "33";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", PAD - 8, 1110);

  // Quote — full text, word-wrapped, up to ~220 chars
  const judgeStr = truncateAtWord(params.judgeText, 220);
  ctx.font = "italic 31px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#888";
  ctx.textAlign = "center";
  wrapCanvasText(ctx, `\u201C${judgeStr}\u201D`, W / 2, 1060, W - PAD * 2.2, 44);

  // ── FOOTER ──────────────────────────────────────────────────────────────
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(PAD, 1288, W - PAD * 2, 1);

  ctx.font = "bold 23px Arial, sans-serif";
  ctx.fillStyle = "#2c2c2c";
  ctx.textAlign = "center";
  ctx.fillText(window.location.hostname.replace(/^www\./, "").toUpperCase(), W / 2, 1326);

  return canvas.toDataURL("image/png");
}

async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API}/api${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error(`[CLASH] POST ${url} — network error:`, networkErr);
    throw new Error(`Network error: ${(networkErr as Error).message}`);
  }
  const data = await parseResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    console.error(`[CLASH] POST ${url} — HTTP ${res.status}:`, data);
    throw new Error((data.error as string) || (data._raw as string) || `HTTP ${res.status}`);
  }
  return data as T;
}

async function apiGet<T>(path: string): Promise<T> {
  const url = `${API}/api${path}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error(`[CLASH] GET ${url} — network error:`, networkErr);
    throw new Error(`Network error: ${(networkErr as Error).message}`);
  }
  const data = await parseResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    console.error(`[CLASH] GET ${url} — HTTP ${res.status}:`, data);
    throw new Error((data.error as string) || (data._raw as string) || `HTTP ${res.status}`);
  }
  return data as T;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-device-id": getOrCreateDeviceId(),
  };
  try {
    const token = localStorage.getItem("clash-auth-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API}/api${path}`;
  const res = await fetch(url, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(body) });
  const data = await parseResponse(res) as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) || `HTTP ${res.status}`);
  return data as T;
}

async function apiAuthGet<T>(path: string): Promise<T> {
  const url = `${API}/api${path}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  const data = await parseResponse(res) as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) || `HTTP ${res.status}`);
  return data as T;
}

function renderWithHighlights(text: string, highlights: RoomHighlight[]) {
  if (!highlights || highlights.length === 0) return <>{text}</>;
  const positioned = highlights
    .map(h => ({ ...h, idx: text.indexOf(h.text) }))
    .filter(h => h.idx >= 0 && h.text.length > 0)
    .sort((a, b) => a.idx - b.idx);
  const result: React.ReactNode[] = [];
  let pos = 0;
  for (const hl of positioned) {
    if (hl.idx < pos) continue;
    if (hl.idx > pos) result.push(<span key={`t${pos}`}>{text.slice(pos, hl.idx)}</span>);
    result.push(<span key={`h${hl.idx}`} className={`hl hl-${hl.type}`} title={hl.note}>{hl.text}</span>);
    pos = hl.idx + hl.text.length;
  }
  if (pos < text.length) result.push(<span key="tend">{text.slice(pos)}</span>);
  return <>{result}</>;
}

function iqLabel(iq: number): string {
  if (iq >= 145) return "GENIUS";
  if (iq >= 130) return "GIFTED";
  if (iq >= 120) return "SUPERIOR";
  if (iq >= 110) return "HIGH AVG";
  if (iq >= 90) return "AVERAGE";
  return "BELOW AVG";
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const url = `${API}/api${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error(`[CLASH] PATCH ${url} — network error:`, networkErr);
    throw new Error(`Network error: ${(networkErr as Error).message}`);
  }
  const data = await parseResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    console.error(`[CLASH] PATCH ${url} — HTTP ${res.status}:`, data);
    throw new Error((data.error as string) || (data._raw as string) || `HTTP ${res.status}`);
  }
  return data as T;
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("clash-device-id");
  if (!id) {
    id = "d_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("clash-device-id", id);
  }
  return id;
}

interface PlayerProfile {
  id: number;
  deviceId: string;
  username: string | null;
  stats: { debates: number; wins: number; bestScore: number; avgScore: number; currentStreak: number; bestStreak: number; opponentHistory: Record<string, { wins: number; losses: number }> };
}
interface LbEntry { id: number; username: string | null; deviceId: string; wins: number; totalDebates: number; bestScore: number; score: number; currentStreak: number; bestStreak: number; }
interface GlobalStats { totalDebates: number; globalWinRate: number; uniqueTopics: number; activePlayers: number; }
interface RecentActivity { username: string | null; deviceId: string; opponentName: string; topic: string; avgScore: number; won: boolean; isGauntlet: boolean; rank: string; createdAt: string; }

function buildRealFeedItems(activity: RecentActivity[]): FeedItem[] {
  if (activity.length === 0) return buildFeedItems();
  const realItems = activity.slice(0, 8).map((a) => {
    const name = a.username || ("GUEST#" + a.deviceId.slice(-4).toUpperCase());
    const opp = a.opponentName.replace("The ", "");
    const topic = a.topic.length > 30 ? a.topic.slice(0, 30) + "…" : a.topic;
    const minsAgo = Math.max(1, Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60000));
    const timeStr = minsAgo < 60 ? `${minsAgo}m ago` : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` : `${Math.floor(minsAgo / 1440)}d ago`;
    if (a.isGauntlet) {
      return { icon: "⚔️", text: `<strong>${name}</strong> ran Gauntlet vs ${opp}`, badge: a.won ? "WON" : "LOST", badgeClass: a.won ? "feed-win" : "feed-loss", time: timeStr };
    }
    if (a.won) {
      return { icon: "🏆", text: `<strong>${name}</strong> defeated ${opp} — "${topic}"`, badge: a.rank, badgeClass: "feed-rank", time: timeStr };
    }
    return { icon: "💀", text: `<strong>${name}</strong> lost to ${opp} — "${topic}"`, badge: a.rank, badgeClass: "feed-loss", time: timeStr };
  });
  if (realItems.length < 3) {
    const fakeBackfill = buildFeedItems().slice(0, 2 - realItems.length);
    return [...realItems, ...fakeBackfill];
  }
  return realItems;
}

interface Message { role: "user" | "ai"; text: string; }
interface RoundScore { round: number; score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; iq?: number; iqLabel?: string; }
interface Verdict { won: boolean; avgScore: number; avgLogic: number; avgPersuasion: number; avgDelivery: number; judgeText: string; improve: string; bestArg: string; weakArg: string; rank: string; outcome: string; }
interface Stats { wins: number; debates: number; bestScore: number; currentStreak: number; bestStreak: number; opponentHistory: Record<string, { wins: number; losses: number }>; }
interface RoomHighlight { text: string; type: "strong" | "weak" | "wrong" | "fallacy"; note: string; }
interface RoomArgument { id: number; roomId: number; roundNum: number; playerNum: number; argumentText: string; score: number | null; logic: number | null; persuasion: number | null; delivery: number | null; rank: string | null; critique: string | null; highlights: string; }
interface RoomState { id: number; code: string; topicText: string; topicCat: string; player1Id: number; player2Id: number | null; player1Side: string | null; player2Side: string | null; player1Ready: boolean; player2Ready: boolean; status: string; totalRounds: number; currentRound: number; winnerPlayerNum: number | null; player1Score: number | null; player2Score: number | null; player1Rank: string | null; player2Rank: string | null; player1Name: string; player2Name: string | null; arguments: RoomArgument[]; playerNum: 1 | 2 | null; iq1: number | null; iq2: number | null; }
interface V1HistoryEntry { code: string; topic: string; opponentName: string; myScore: number | null; oppScore: number | null; won: boolean; date: string; myRank: string; myIQ: number | null; }

type Screen = "home" | "setup" | "matchmaking" | "debate" | "verdict" | "leaderboard" | "replay" | "gauntlet-intro" | "gauntlet-between" | "gauntlet-final" | "multiplayer-lobby" | "multiplayer-waiting" | "multiplayer-debate" | "multiplayer-results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
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
  const [stats, setStats] = useState<Stats>({ wins: 0, debates: 0, bestScore: 0, currentStreak: 0, bestStreak: 0, opponentHistory: {} });
  const [selectedRounds, setSelectedRounds] = useState(3);
  const [displayTopics, setDisplayTopics] = useState(() => pickTopics());
  const [timerStarted, setTimerStarted] = useState(false);
  const [lbTab, setLbTab] = useState("global");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [matchCountdown, setMatchCountdown] = useState(3);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const [customOpponent, setCustomOpponent] = useState({ name: "", personality: "", diff: "medium" as "easy" | "medium" | "hard" | "extreme", icon: "🎭" });
  const [adaptiveLevel, setAdaptiveLevel] = useState(0);
  const [consecutiveHigh, setConsecutiveHigh] = useState(0);
  const [consecutiveLow, setConsecutiveLow] = useState(0);
  const [suddenDeathAvailable, setSuddenDeathAvailable] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [sharedResult, setSharedResult] = useState<{ topic: string; opponentId: string; opponent: string; side: string; score: number; rank: string; outcome: string; judge: string; rounds: number; } | null>(null);
  const [tournamentMode, setTournamentMode] = useState(false);
  const [tournamentBotIndex, setTournamentBotIndex] = useState(0);
  const [tournamentTopics, setTournamentTopics] = useState<{ cat: string; text: string }[]>([]);
  const [tournamentMatchScores, setTournamentMatchScores] = useState<{ score: number; rank: string; won: boolean; botId: string; botName: string; botIcon: string; topic: string }[]>([]);
  const [gauntletNextSide, setGauntletNextSide] = useState<"for" | "against" | null>(null);
  const [forfeitCountdown, setForfeitCountdown] = useState<number | null>(null);
  const forfeitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tauntIndex, setTauntIndex] = useState(0);
  const [tauntKey, setTauntKey] = useState(0);
  const [arenaDisplay, setArenaDisplay] = useState({ debates: 0, winRate: 0, topics: 0 });
  const [featuredIdx, setFeaturedIdx] = useState(() => Math.floor(Math.random() * FEATURED_TOPICS.length));
  const [featuredKey, setFeaturedKey] = useState(0);
  const [featuredDir, setFeaturedDir] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => buildFeedItems());
  const [feedKey, setFeedKey] = useState(0);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [lbData, setLbData] = useState<LbEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => { try { return localStorage.getItem("clash-sound") !== "off"; } catch { return true; } });
  const [topicVotes, setTopicVotes] = useState<Record<string,number>>(() => { try { return JSON.parse(localStorage.getItem("clash-votes")||"{}"); } catch { return {}; } });
  const [votedTopics, setVotedTopics] = useState<Set<string>>(() => { try { return new Set<string>(JSON.parse(localStorage.getItem("clash-voted")||"[]")); } catch { return new Set<string>(); } });
  const [unlockedAchs, setUnlockedAchs] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("clash-achievements")||"[]"); } catch { return []; } });
  const [achToast, setAchToast] = useState<{id:string;name:string;icon:string}|null>(null);

  // Auth state
  const [authUser, setAuthUser] = useState<{email: string; playerId: number} | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [regUsername, setRegUsername] = useState("");

  // Multiplayer room state
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);
  const [roomPlayerNum, setRoomPlayerNum] = useState<1 | 2 | null>(null);
  const [roomArgInput, setRoomArgInput] = useState("");
  const [roomSubmitting, setRoomSubmitting] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomJoinCode, setRoomJoinCode] = useState("");
  const [v1SubScreen, setV1SubScreen] = useState<"" | "join">("");
  const [v1Tab, setV1Tab] = useState<"play" | "history">("play");
  const [v1History, setV1History] = useState<V1HistoryEntry[]>(() => { try { return JSON.parse(localStorage.getItem("clash-1v1-history") || "[]"); } catch { return []; } });
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => { try { return (localStorage.getItem("clash-theme") as "dark" | "light") || "dark"; } catch { return "dark"; } });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingVerdictRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // Swallow unhandled promise rejections so the Replit runtime-error overlay
  // never triggers a page reload from async errors we already handle in-app.
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => { e.preventDefault(); };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Auto-focus input after AI finishes replying
  useEffect(() => {
    if (!thinking && screen === "debate") {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [thinking, screen]);

  // Cycle thinking phase labels for tension
  useEffect(() => {
    if (!thinking) { setThinkingPhase(0); return; }
    const iv = setInterval(() => setThinkingPhase((p) => (p + 1) % 5), 1300);
    return () => clearInterval(iv);
  }, [thinking]);

  // Restore auth session on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("clash-auth-token");
      if (!token) return;
      (async () => {
        try {
          const me = await apiAuthGet<{userId: number; playerId: number; email: string}>("/auth/me");
          setAuthUser({ email: me.email, playerId: me.playerId });
        } catch {
          localStorage.removeItem("clash-auth-token");
        }
      })();
    } catch {}
  }, []);

  // Load shared result from URL on mount; also handle ?room= join links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get("share");
    if (share) {
      try {
        const d = JSON.parse(atob(share));
        setSharedResult({ topic: d.t, opponentId: d.oid, opponent: d.o, side: d.s, score: d.sc, rank: d.r, outcome: d.out, judge: d.j, rounds: d.rounds });
      } catch { /* ignore malformed share params */ }
    }
    const roomParam = params.get("room");
    if (roomParam && roomParam.length === 6) {
      setRoomJoinCode(roomParam.toUpperCase());
      setV1SubScreen("join");
      setScreen("multiplayer-lobby");
    }
  }, []);

  // Save v1 match to history when results screen opens
  useEffect(() => {
    if (screen !== "multiplayer-results" || !currentRoom || currentRoom.status !== "complete") return;
    const myScore = roomPlayerNum === 1 ? currentRoom.player1Score : currentRoom.player2Score;
    const oppScore = roomPlayerNum === 1 ? currentRoom.player2Score : currentRoom.player1Score;
    const myRank = (roomPlayerNum === 1 ? currentRoom.player1Rank : currentRoom.player2Rank) || "C";
    const myIQ = roomPlayerNum === 1 ? currentRoom.iq1 : currentRoom.iq2;
    const oppName = roomPlayerNum === 1 ? (currentRoom.player2Name || "Opponent") : currentRoom.player1Name;
    const iWon = currentRoom.winnerPlayerNum === roomPlayerNum;
    setV1History(prev => {
      if (prev.find(e => e.code === currentRoom.code)) return prev;
      const entry: V1HistoryEntry = {
        code: currentRoom.code,
        topic: currentRoom.topicText,
        opponentName: oppName,
        myScore,
        oppScore,
        won: iWon,
        date: new Date().toISOString(),
        myRank,
        myIQ,
      };
      const next = [entry, ...prev].slice(0, 50);
      try { localStorage.setItem("clash-1v1-history", JSON.stringify(next)); } catch {}
      return next;
    });
  }, [screen, currentRoom, roomPlayerNum]);

  // Poll room state every 2 seconds when in multiplayer screens
  useEffect(() => {
    const multiScreens: Screen[] = ["multiplayer-waiting", "multiplayer-debate", "multiplayer-results"];
    if (!multiScreens.includes(screen) || !currentRoom?.code) return;
    const poll = async () => {
      try {
        const room = await apiAuthGet<RoomState>(`/rooms/${currentRoom.code}`);
        setCurrentRoom(room);
        if (room.status === "debating" && screen === "multiplayer-waiting") setScreen("multiplayer-debate");
        if (room.status === "complete" && screen !== "multiplayer-results") setScreen("multiplayer-results");
      } catch { /* silent poll fail */ }
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [screen, currentRoom?.code]);

  // Matchmaking countdown animation
  useEffect(() => {
    if (screen !== "matchmaking") return;
    setMatchCountdown(3);
    const t1 = setTimeout(() => setMatchCountdown(2), 1000);
    const t2 = setTimeout(() => setMatchCountdown(1), 2000);
    const t3 = setTimeout(() => setMatchCountdown(0), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [screen]);

  // Persist stats to localStorage (offline fallback)
  useEffect(() => {
    try { localStorage.setItem("clash-stats", JSON.stringify(stats)); } catch {}
  }, [stats]);

  // Load player profile from DB on mount; fall back to localStorage
  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    (async () => {
      try {
        await apiPost("/players/register", { deviceId });
        const profile = await apiGet<PlayerProfile>(`/players/${deviceId}`);
        setPlayer(profile);
        if (profile.stats.debates > 0) {
          setStats({
            wins: profile.stats.wins,
            debates: profile.stats.debates,
            bestScore: profile.stats.bestScore,
            currentStreak: profile.stats.currentStreak ?? 0,
            bestStreak: profile.stats.bestStreak ?? 0,
            opponentHistory: profile.stats.opponentHistory,
          });
        } else {
          try {
            const saved = localStorage.getItem("clash-stats");
            if (saved) setStats((prev) => ({ ...prev, ...JSON.parse(saved) }));
          } catch {}
        }
      } catch {
        try {
          const saved = localStorage.getItem("clash-stats");
          if (saved) setStats((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch {}
      }
    })();
  }, []);

  // Rotate status taunts every 4s on home screen
  useEffect(() => {
    if (screen !== "home") return;
    const iv = setInterval(() => {
      setTauntIndex((i) => (i + 1) % TAUNTS.length);
      setTauntKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(iv);
  }, [screen]);

  const navigateFeatured = useCallback((dir: 1 | -1) => {
    setFeaturedDir(dir);
    setFeaturedIdx((i) => (i + dir + FEATURED_TOPICS.length) % FEATURED_TOPICS.length);
    setFeaturedKey((k) => k + 1);
  }, []);

  // Cycle featured topic every 9s on home screen
  useEffect(() => {
    if (screen !== "home") return;
    const iv = setInterval(() => navigateFeatured(1), 9000);
    return () => clearInterval(iv);
  }, [screen, navigateFeatured]);

  // Refresh live feed with real data every 5 minutes on home screen
  useEffect(() => {
    if (screen !== "home") return;
    const iv = setInterval(async () => {
      try {
        const activity = await apiGet<RecentActivity[]>("/activity/recent");
        setFeedItems(buildRealFeedItems(activity));
      } catch {
        // keep existing feed items on error
      }
      setFeedKey((k) => k + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [screen]);

  // Load real global stats + real activity feed on home screen; animate counters
  useEffect(() => {
    if (screen !== "home") return;
    let cancelled = false;

    (async () => {
      let target = { debates: 0, winRate: 0, topics: 0 };
      try {
        const gs = await apiGet<GlobalStats>("/stats/global");
        if (!cancelled) {
          target = {
            debates: gs.totalDebates,
            winRate: gs.globalWinRate || 0,
            topics: gs.uniqueTopics,
          };
        }
      } catch {}
      if (cancelled) return;
      const steps = 40;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        const ease = 1 - Math.pow(1 - step / steps, 3);
        setArenaDisplay({
          debates: Math.round(target.debates * ease),
          winRate: Math.round(target.winRate * ease),
          topics: Math.round(target.topics * ease),
        });
        if (step >= steps) clearInterval(iv);
      }, 20);
    })();

    (async () => {
      try {
        const activity = await apiGet<RecentActivity[]>("/activity/recent");
        if (!cancelled && activity.length > 0) {
          setFeedItems(buildRealFeedItems(activity));
          setFeedKey((k) => k + 1);
        }
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [screen]);

  // Load leaderboard when that screen opens or when tab switches
  useEffect(() => {
    if (screen !== "leaderboard") return;
    setLbLoading(true);
    const qs = lbTab === "weekly" ? "?period=weekly" : "";
    apiGet<LbEntry[]>(`/leaderboard${qs}`)
      .then((data) => { setLbData(data); setLbLoading(false); })
      .catch(() => setLbLoading(false));
  }, [screen, lbTab]);

  const playSound = useCallback((type: "round-win"|"round-loss"|"victory"|"defeat"|"tick"|"submit") => {
    if (!soundEnabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new AudioCtx();
      const play = (freq: number, dur: number, delay = 0, waveType: OscillatorType = "sine", vol = 0.25) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = waveType; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.05);
      };
      if (type === "round-win")  { play(523,0.12); play(659,0.12,0.13); play(784,0.2,0.26); }
      else if (type === "round-loss") { play(240,0.18,0,"triangle",0.2); play(190,0.25,0.2,"triangle",0.15); }
      else if (type === "victory") { play(523,0.1); play(659,0.1,0.1); play(784,0.1,0.2); play(1047,0.35,0.32,"sine",0.22); }
      else if (type === "defeat") { play(380,0.15); play(290,0.18,0.16); play(200,0.3,0.35,"triangle",0.2); }
      else if (type === "tick")   { play(1400,0.04,0,"square",0.06); }
      else if (type === "submit") { play(440,0.08,0,"sine",0.12); }
      setTimeout(() => { try { ctx.close(); } catch {} }, 2000);
    } catch {}
  }, [soundEnabled]);

  const unlockAch = useCallback((id: string) => {
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;
    setUnlockedAchs(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem("clash-achievements", JSON.stringify(next)); } catch {}
      setAchToast({ id: def.id, name: def.name, icon: def.icon });
      setTimeout(() => setAchToast(null), 4000);
      return next;
    });
  }, []);

  const voteForTopic = useCallback((text: string) => {
    if (votedTopics.has(text)) return;
    const newVotes: Record<string,number> = { ...topicVotes, [text]: (topicVotes[text] || 0) + 1 };
    const newVoted = new Set<string>([...votedTopics, text]);
    setTopicVotes(newVotes);
    setVotedTopics(newVoted);
    try {
      localStorage.setItem("clash-votes", JSON.stringify(newVotes));
      localStorage.setItem("clash-voted", JSON.stringify([...newVoted]));
    } catch {}
  }, [votedTopics, topicVotes]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem("clash-sound", next ? "on" : "off"); } catch {}
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem("clash-theme", next); } catch {}
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const ai = selectedAI === "custom"
    ? { id: "custom", icon: customOpponent.icon || "🎭", name: customOpponent.name || "Custom Opponent", diff: customOpponent.diff, diffLabel: customOpponent.diff.charAt(0).toUpperCase() + customOpponent.diff.slice(1), timer: 120, desc: "Your custom opponent.", personality: customOpponent.personality }
    : AI_OPPONENTS.find((a) => a.id === selectedAI);
  const currentRound = Math.min(roundScores.length + 1, selectedRounds);
  const roundTimerDuration = ai?.diff === "extreme" ? 45 : ai?.timer ?? 60;
  const charLimit = ai?.diff === "easy" ? 1000 : ai?.diff === "extreme" ? 600 : ai?.diff === "hard" ? 750 : 850;
  const isExtreme = ai?.diff === "extreme";

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(null);
  }, []);

  // Reset timerStarted on new round
  useEffect(() => {
    if (!thinking) setTimerStarted(false);
  }, [thinking, roundScores.length]);

  // Run timer when started
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

  // Launch matchmaking + fetch AI opening in parallel with 3.5s min display
  // Accepts overrides so tournament mode can pass explicit values without waiting for state to settle
  const launchMatchmaking = useCallback(async (sideOverride?: "for" | "against", aiIdOverride?: string, topicOverride?: { cat: string; text: string }, roundsOverride?: number) => {
    if (pendingVerdictRef.current) { clearTimeout(pendingVerdictRef.current); pendingVerdictRef.current = null; }

    const side = sideOverride ?? selectedSide;
    const aiId = aiIdOverride ?? selectedAI ?? "";
    const topic = topicOverride ?? selectedTopic;
    const rounds = roundsOverride ?? selectedRounds;

    // Apply any overrides to state so debate screen renders correctly
    if (sideOverride !== undefined) setSelectedSide(sideOverride);
    if (aiIdOverride !== undefined) setSelectedAI(aiIdOverride);
    if (topicOverride !== undefined) setSelectedTopic(topicOverride);
    if (roundsOverride !== undefined) setSelectedRounds(roundsOverride);

    const currentAI = aiId === "custom"
      ? { id: "custom", icon: customOpponent.icon || "🎭", name: customOpponent.name || "Custom Opponent", diff: customOpponent.diff, diffLabel: customOpponent.diff.charAt(0).toUpperCase() + customOpponent.diff.slice(1), timer: 120, desc: "Your custom opponent.", personality: customOpponent.personality }
      : AI_OPPONENTS.find((a) => a.id === aiId);
    if (!currentAI || !currentAI.personality || !topic || !side) return;

    setMessages([]);
    setRoundScores([]);
    setAdaptiveLevel(0);
    setConsecutiveHigh(0);
    setConsecutiveLow(0);
    setSuddenDeathAvailable(false);
    setIsOvertime(false);
    setError("");
    setInputText("");
    setVerdict(null);
    setScreen("matchmaking");

    const sideLabel = side === "for" ? "FOR" : "AGAINST";
    const oppSide = side === "for" ? "AGAINST" : "FOR";

    try {
      const [result] = await Promise.all([
        apiPost<{ text: string }>("/debate/start", {
          personality: currentAI.personality,
          topic: topic.text,
          userSide: sideLabel,
          oppSide,
          totalRounds: rounds,
          difficulty: currentAI.diff,
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 3500)),
      ] as [Promise<{ text: string }>, Promise<void>]);

      setMessages([{ role: "ai", text: result.text }]);
      setScreen("debate");
    } catch (e) {
      console.error("[CLASH] debate/start failed:", e);
      const raw = e instanceof Error ? e.message : "Something went wrong";
      const isRate = raw.includes("429") || raw.toLowerCase().includes("quota") || raw.toLowerCase().includes("rate");
      setError(isRate
        ? "The AI is rate-limited right now. Wait a moment, then tap Retry."
        : `Couldn't reach the AI: ${raw}`);
    }
  }, [selectedAI, selectedTopic, selectedSide, selectedRounds]);

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
      const thinkStart = Date.now();
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
        adaptiveLevel,
        isOvertime,
      });

      // Enforce 4-6s minimum thinking time to build tension
      const minThink = 4000 + Math.random() * 2000;
      const elapsed = Date.now() - thinkStart;
      if (elapsed < minThink) {
        await new Promise<void>((r) => setTimeout(r, minThink - elapsed));
      }

      // Adaptive difficulty tracking
      const sc = roundScore.score;
      const newConsecHigh = sc > 78 ? consecutiveHigh + 1 : 0;
      const newConsecLow = sc < 42 ? consecutiveLow + 1 : 0;
      let newAdaptLevel = adaptiveLevel;
      if (newConsecHigh >= 2) newAdaptLevel = Math.min(2, adaptiveLevel + 1);
      else if (newConsecLow >= 2) newAdaptLevel = Math.max(-1, adaptiveLevel - 1);
      setConsecutiveHigh(newConsecHigh);
      setConsecutiveLow(newConsecLow);
      setAdaptiveLevel(newAdaptLevel);

      const newRoundScores: RoundScore[] = [...roundScores, { round: roundNumber, ...roundScore }];
      setRoundScores(newRoundScores);
      playSound(roundScore.score >= 60 ? "round-win" : "round-loss");
      if (roundScore.score >= 95) unlockAch("perfect-round");
      setMessages([...newMessages, { role: "ai", text: aiText }]);

      if (isLastRound) {
        if (pendingVerdictRef.current) clearTimeout(pendingVerdictRef.current);
        pendingVerdictRef.current = setTimeout(async () => {
          pendingVerdictRef.current = null;
          try { await generateVerdict(newRoundScores, newMessages); } catch { /* handled inside generateVerdict */ }
        }, 4000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setThinking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, thinking, ai, selectedTopic, selectedSide, roundScores, messages, stopTimer, adaptiveLevel, consecutiveHigh, consecutiveLow, isOvertime]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeLeft === 0 && screen === "debate" && !thinking && roundScores.length < selectedRounds) {
      const fallback = inputText.trim() || "I concede this round.";
      submitArgument(fallback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const generateVerdict = async (scores: RoundScore[], _msgs: Message[]) => {
    const safeNum = (v: number, fallback = 50) => (Number.isFinite(v) ? v : fallback);
    const safeAvg = (vals: number[]) => {
      if (vals.length === 0) return 50;
      const sum = vals.reduce((s, v) => s + safeNum(v), 0);
      return Math.round(sum / vals.length);
    };
    const avgScore = safeAvg(scores.map((r) => r.score));
    const avgLogic = safeAvg(scores.map((r) => r.logic));
    const avgPersuasion = safeAvg(scores.map((r) => r.persuasion));
    const avgDelivery = safeAvg(scores.map((r) => r.delivery));
    const won = avgScore >= 65;

    try {
      const userArguments = _msgs.filter((m) => m.role === "user").map((m) => m.text);
      const safeTopic = selectedTopic?.text?.trim() || "General debate";
      const judgeVerdict = await apiPost<{ verdict: string; improve: string; rank: string; outcome: string }>("/debate/verdict", {
        topic: safeTopic,
        avgScore, avgLogic, avgPersuasion, avgDelivery,
        roundScores: scores,
      });

      const allBest = scores.map((s) => s.best).filter(Boolean);
      const allWeak = scores.map((s) => s.weak).filter(Boolean);

      setSuddenDeathAvailable(!isOvertime && avgScore >= 58 && avgScore <= 72);

      setVerdict({
        won, avgScore, avgLogic, avgPersuasion, avgDelivery,
        judgeText: judgeVerdict.verdict,
        improve: judgeVerdict.improve,
        bestArg: allBest[allBest.length - 1] || "Strong rebuttal.",
        weakArg: allWeak[allWeak.length - 1] || "Opening argument needed more evidence.",
        rank: judgeVerdict.rank || (won ? "B" : "D"),
        outcome: judgeVerdict.outcome || (won ? "clear win" : "clear loss"),
      });

      const finalRank = judgeVerdict.rank || (won ? "B" : "D");

      const nextStreak = won ? (stats.currentStreak ?? 0) + 1 : 0;
      const nextDebates = stats.debates + 1;
      setStats((prev) => {
        const oppHistory = { ...(prev.opponentHistory || {}) };
        const oppId = selectedAI || "";
        if (oppId) {
          oppHistory[oppId] = {
            wins: (oppHistory[oppId]?.wins || 0) + (won ? 1 : 0),
            losses: (oppHistory[oppId]?.losses || 0) + (won ? 0 : 1),
          };
        }
        const newStreak = won ? (prev.currentStreak ?? 0) + 1 : 0;
        return {
          wins: prev.wins + (won ? 1 : 0),
          debates: prev.debates + 1,
          bestScore: Math.max(prev.bestScore, avgScore),
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak ?? 0, newStreak),
          opponentHistory: oppHistory,
        };
      });
      playSound(won ? "victory" : "defeat");
      if (won) {
        unlockAch("first-win");
        if (nextStreak >= 3) unlockAch("streak-3");
        if (selectedAI === "debunker")    unlockAch("debunker-slayer");
        if (selectedAI === "philosopher") unlockAch("philosopher-slayer");
        if (selectedAI === "prosecutor")  unlockAch("prosecutor-slayer");
      }
      if (avgScore >= 90) unlockAch("score-90");
      if (nextDebates >= 10) unlockAch("veteran");
      if (tournamentMode && tournamentBotIndex >= 5 && won) unlockAch("gauntlet-complete");

      // Save debate to DB in background (non-blocking)
      {
        const deviceId = getOrCreateDeviceId();
        apiPost("/debates/save", {
          deviceId,
          opponentId: selectedAI || "unknown",
          opponentName: ai?.name || "AI",
          topic: selectedTopic?.text || "",
          topicCat: selectedTopic?.cat || "General",
          side: selectedSide || "for",
          rounds: scores.length,
          avgScore, avgLogic, avgPersuasion, avgDelivery,
          rank: finalRank,
          won,
          isGauntlet: tournamentMode,
        }).then(() => {
          apiGet<PlayerProfile>(`/players/${deviceId}`)
            .then((p) => setPlayer(p))
            .catch(() => {});
        }).catch(() => {});
      }

      if (tournamentMode) {
        const matchResult = {
          score: avgScore,
          rank: judgeVerdict.rank || (won ? "B" : "D"),
          won,
          botId: selectedAI || "",
          botName: ai?.name || "",
          botIcon: ai?.icon || "",
          topic: selectedTopic?.text || "",
        };
        setTournamentMatchScores((prev) => [...prev, matchResult]);
        if (tournamentBotIndex >= 5) {
          setScreen("gauntlet-final");
        } else {
          setScreen("gauntlet-between");
        }
      } else {
        setScreen("verdict");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const startForfeit = () => {
    if (forfeitIntervalRef.current) return;
    setForfeitCountdown(3);
    let count = 3;
    forfeitIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(forfeitIntervalRef.current!);
        forfeitIntervalRef.current = null;
        setForfeitCountdown(0);
      } else {
        setForfeitCountdown(count);
      }
    }, 1000);
  };

  const reset = () => {
    stopTimer();
    if (pendingVerdictRef.current) { clearTimeout(pendingVerdictRef.current); pendingVerdictRef.current = null; }
    if (forfeitIntervalRef.current) { clearInterval(forfeitIntervalRef.current); forfeitIntervalRef.current = null; }
    setForfeitCountdown(null);
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
    setAdaptiveLevel(0);
    setConsecutiveHigh(0);
    setConsecutiveLow(0);
    setSuddenDeathAvailable(false);
    setIsOvertime(false);
    setCustomOpponent({ name: "", personality: "", diff: "medium", icon: "🎭" });
    setTournamentMode(false);
    setTournamentBotIndex(0);
    setTournamentTopics([]);
    setTournamentMatchScores([]);
    setGauntletNextSide(null);
    setCurrentRoom(null);
    setRoomPlayerNum(null);
    setRoomArgInput("");
    setRoomError("");
    setRoomLoading(false);
    setRoomJoinCode("");
    setV1SubScreen("");
    setV1Tab("play");
  };

  const loginFn = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const data = await apiAuthPost<{token: string; email: string; playerId: number}>("/auth/login", { email: authEmail, password: authPassword, deviceId: getOrCreateDeviceId() });
      localStorage.setItem("clash-auth-token", data.token);
      setAuthUser({ email: data.email, playerId: data.playerId });
      setShowAuthModal(false);
      setAuthEmail(""); setAuthPassword("");
    } catch (e) { setAuthError((e as Error).message); }
    finally { setAuthLoading(false); }
  };

  const registerFn = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const data = await apiAuthPost<{token: string; email: string; playerId: number}>("/auth/register", { email: authEmail, password: authPassword, deviceId: getOrCreateDeviceId() });
      localStorage.setItem("clash-auth-token", data.token);
      setAuthUser({ email: data.email, playerId: data.playerId });
      const clean = regUsername.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 20);
      if (clean.length >= 2) {
        try {
          await apiPatch("/players/username", { deviceId: getOrCreateDeviceId(), username: clean });
          const profile = await apiGet<PlayerProfile>(`/players/${getOrCreateDeviceId()}`);
          setPlayer(profile);
        } catch {}
      }
      setShowAuthModal(false);
      setAuthEmail(""); setAuthPassword(""); setRegUsername("");
    } catch (e) { setAuthError((e as Error).message); }
    finally { setAuthLoading(false); }
  };

  const logoutFn = () => {
    localStorage.removeItem("clash-auth-token");
    setAuthUser(null);
    setShowAuthModal(false);
    setShowProfilePanel(false);
  };

  const createRoom = async () => {
    setRoomLoading(true); setRoomError("");
    try {
      const data = await apiAuthPost<{code: string}>("/rooms/create", { totalRounds: 3 });
      const room = await apiAuthGet<RoomState>(`/rooms/${data.code}`);
      setCurrentRoom(room);
      setRoomPlayerNum(1);
      setScreen("multiplayer-waiting");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomLoading(false); }
  };

  const joinRoom = async () => {
    if (!roomJoinCode || roomJoinCode.length !== 6) return;
    setRoomLoading(true); setRoomError("");
    try {
      const data = await apiAuthPost<{code: string; playerNum: number}>("/rooms/join", { code: roomJoinCode });
      const room = await apiAuthGet<RoomState>(`/rooms/${data.code}`);
      setCurrentRoom(room);
      setRoomPlayerNum(data.playerNum as 1 | 2);
      setScreen(room.status === "debating" ? "multiplayer-debate" : "multiplayer-waiting");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomLoading(false); }
  };

  const setRoomSide = async (side: "for" | "against") => {
    if (!currentRoom) return;
    try {
      await apiAuthPost(`/rooms/${currentRoom.code}/sides`, { side });
      const opp: "for" | "against" = side === "for" ? "against" : "for";
      setCurrentRoom(prev => prev ? { ...prev, player1Side: side, player2Side: opp } : prev);
    } catch (e) { setRoomError((e as Error).message); }
  };

  const markReady = async () => {
    if (!currentRoom) return;
    try { await apiAuthPost(`/rooms/${currentRoom.code}/ready`, {}); }
    catch (e) { setRoomError((e as Error).message); }
  };

  const submitRoomArg = async () => {
    if (!currentRoom || !roomArgInput.trim() || roomSubmitting) return;
    setRoomSubmitting(true);
    try {
      await apiAuthPost(`/rooms/${currentRoom.code}/argue`, { argumentText: roomArgInput.trim() });
      setRoomArgInput("");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomSubmitting(false); }
  };

  const forfeitRoom = async () => {
    if (!currentRoom) return;
    try {
      await apiAuthPost(`/rooms/${currentRoom.code}/forfeit`, {});
      const room = await apiAuthGet<RoomState>(`/rooms/${currentRoom.code}`);
      setCurrentRoom(room);
      setScreen("multiplayer-results");
    } catch (e) { setRoomError((e as Error).message); }
  };

  const beginGauntlet = (side: "for" | "against") => {
    const topics: { cat: string; text: string }[] = [];
    const pool = [...TOPIC_POOL];
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      topics.push(pool.splice(idx, 1)[0]);
    }
    setTournamentMode(true);
    setTournamentBotIndex(0);
    setTournamentTopics(topics);
    setTournamentMatchScores([]);
    setGauntletNextSide(null);
    launchMatchmaking(side, TOURNAMENT_BOT_ORDER[0], topics[0], 3);
  };

  const continueGauntlet = (side: "for" | "against") => {
    const nextIndex = tournamentBotIndex + 1;
    const nextBotId = TOURNAMENT_BOT_ORDER[nextIndex];
    const nextTopic = tournamentTopics[nextIndex];
    setTournamentBotIndex(nextIndex);
    setGauntletNextSide(null);
    setVerdict(null);
    launchMatchmaking(side, nextBotId, nextTopic, 3);
  };

  const instantRematch = () => {
    stopTimer();
    launchMatchmaking();
  };

  const swapSidesRematch = () => {
    stopTimer();
    const newSide: "for" | "against" = selectedSide === "for" ? "against" : "for";
    setSelectedSide(newSide);
    launchMatchmaking(newSide);
  };

  const launchSuddenDeath = () => {
    stopTimer();
    setSuddenDeathAvailable(false);
    setIsOvertime(true);
    setSelectedRounds((prev) => prev + 1);
    setVerdict(null);
    setScreen("debate");
  };

  const handleSetUsername = async () => {
  const deviceId = getOrCreateDeviceId();
  const trimmed = usernameInput.trim();
  if (trimmed.length < 2) { 
    setUsernameError("Must be at least 2 characters."); 
    return; 
  }
  
  setUsernameError("");
  
  try {
    await apiPost("/players/register", { deviceId });
    await apiPatch("/players/username", { deviceId, username: trimmed });
    
    setPlayer((prev) => prev ? { ...prev, username: trimmed } : prev);
    setShowUsernameModal(false);
    setUsernameInput("");
    setUsernameError("");
  } catch (err: unknown) {
    const msg = (err as Error).message || "Something went wrong";
    setUsernameError(msg);
  }
};

  const shareResult = () => {
    if (!verdict || !selectedTopic || !ai) return;
    const data = {
      t: selectedTopic.text,
      o: ai.name,
      oid: selectedAI ?? "",
      s: selectedSide ?? "",
      sc: verdict.avgScore,
      r: verdict.rank,
      out: verdict.outcome,
      j: verdict.judgeText.slice(0, 120),
      rounds: selectedRounds,
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast("Link copied!");
    unlockAch("share-it");
    setTimeout(() => setShareToast(""), 3000);
  };

  const shareImage = useCallback(async () => {
    if (!verdict || !ai || !selectedTopic) return;
    const iqScores = roundScores.map(r => r.iq).filter((v): v is number => v != null);
    const avgIq = iqScores.length ? Math.round(iqScores.reduce((a, b) => a + b, 0) / iqScores.length) : undefined;
    const iqLabel = avgIq == null ? undefined :
      avgIq >= 145 ? "GENIUS" :
      avgIq >= 130 ? "V.SUPERIOR" :
      avgIq >= 120 ? "SUPERIOR" :
      avgIq >= 110 ? "HIGH AVG" :
      avgIq >= 90  ? "AVERAGE" :
      avgIq >= 80  ? "LOW AVG" : "BELOW AVG";
    const dataUrl = generateShareCard({
      won: verdict.won,
      rank: verdict.rank,
      avgScore: verdict.avgScore,
      avgLogic: verdict.avgLogic,
      avgPersuasion: verdict.avgPersuasion,
      avgIq,
      iqLabel,
      topic: selectedTopic.text,
      opponentName: ai.name,
      opponentIcon: ai.icon,
      judgeText: verdict.judgeText,
      playerName: player?.username ?? null,
    });

    if (typeof navigator.canShare === "function") {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "clash-result.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `CLASH — Rank ${verdict.rank} ${verdict.won ? "Victory" : "Defeat"}`,
            text: `I scored ${verdict.avgScore}/100 (Rank ${verdict.rank}) vs ${ai.name} on CLASH`,
          });
          return;
        }
      } catch { /* user cancelled or unsupported — fall through to download */ }
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `clash-${verdict.rank}-${verdict.avgScore}.png`;
    link.click();
    setShareToast("Image saved!");
    setTimeout(() => setShareToast(""), 3000);
  }, [verdict, ai, selectedTopic, player]);

  const acceptChallenge = () => {
    if (!sharedResult) return;
    setSelectedAI(sharedResult.opponentId);
    setSelectedTopic({ cat: "Challenge", text: sharedResult.topic });
    setSelectedRounds(sharedResult.rounds || 3);
    setSharedResult(null);
    setSetupStep(2);
    setScreen("setup");
  };

  const nemesisBot = useMemo(() => {
    const hist = stats.opponentHistory;
    if (!hist || Object.keys(hist).length === 0) return null;
    let maxLosses = 0;
    let nemesisId: string | null = null;
    for (const [id, rec] of Object.entries(hist)) {
      if (rec.losses > maxLosses) { maxLosses = rec.losses; nemesisId = id; }
    }
    if (!nemesisId || maxLosses === 0) return null;
    const bot = AI_OPPONENTS.find((a) => a.id === nemesisId);
    return bot ? { ...bot, losses: maxLosses } : null;
  }, [stats.opponentHistory]);

  return (
    <>
    <div className="app">
      <nav className="nav">
        <div className="logo">CL<span>A</span>SH</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button className={`sound-btn${soundEnabled ? "" : " muted"}`} onClick={toggleSound} title={soundEnabled ? "Mute" : "Unmute"}>
            {soundEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            )}
          </button>
          <button className="theme-btn" onClick={toggleTheme} title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {themeMode === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {authUser ? (
            <button
              className="user-chip"
              onClick={() => { setUsernameInput(player?.username || ""); setUsernameError(""); setShowProfilePanel(p => !p); }}
            >
              <span className="user-chip-av">{(player?.username || authUser.email)[0].toUpperCase()}</span>
              <span className="user-chip-name">{player?.username || authUser.email.split("@")[0]}</span>
            </button>
          ) : (
            <button className="auth-pill" onClick={() => { setAuthError(""); setAuthMode("login"); setShowAuthModal(true); }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div className="screen home-screen">
          {sharedResult && (
            <div className="challenge-banner">
              <div className="challenge-header">⚡ Challenge Received</div>
              <div style={{ fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>"{sharedResult.topic}"</div>
              <div style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "14px" }}>
                vs {sharedResult.opponent} · {sharedResult.rounds} rounds · Rank {sharedResult.rank} · {sharedResult.score}/100
                <br />Judge: "{sharedResult.judge}"
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-primary" onClick={acceptChallenge}>⚡ Accept Challenge</button>
                <button className="btn btn-ghost" onClick={() => setSharedResult(null)}>Dismiss</button>
              </div>
            </div>
          )}

          {/* HERO */}
          <div className="home-hero">
            <h1 className="home-title">ARGUE.<span className="line2">WIN.</span></h1>
            <p key={tauntKey} className="taunt-line">
              <span className="taunt-who">{TAUNTS[tauntIndex].icon}</span>
              {TAUNTS[tauntIndex].text}
            </p>
            <div className="home-cta">
              <button className="btn btn-primary" onClick={() => { setDisplayTopics(pickTopics()); setSetupStep(0); setScreen("setup"); }}>
                vs AI
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen("leaderboard")}>
                Leaderboard
              </button>
            </div>
            <button className="btn btn-secondary" style={{ width: "100%", marginTop: "12px" }} onClick={() => { setV1SubScreen(""); setV1Tab("play"); setRoomError(""); setRoomJoinCode(""); setScreen("multiplayer-lobby"); }}>
              ⚔ 1V1 vs Human
            </button>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button className="gauntlet-btn" onClick={() => { setGauntletNextSide(null); setScreen("gauntlet-intro"); }}>
                ⚔ Gauntlet Mode
              </button>
              <p className="gauntlet-sub">6 Opponents. 1 Run. No Excuses.</p>
            </div>
          </div>

          {/* TODAY'S CLASH — swipeable featured topic card */}
          <div>
            <p className="section-label" style={{ marginBottom: "0" }}>Today's Clash</p>
            <div className="featured-wrap">
              <div
                key={featuredKey}
                className={`featured-card${featuredDir === 1 ? " anim-left" : " anim-right"}`}
                onClick={() => {
                  const t = FEATURED_TOPICS[featuredIdx];
                  setSelectedTopic({ cat: t.cat, text: t.text });
                  setDisplayTopics(pickTopics());
                  setSetupStep(0);
                  setScreen("setup");
                }}
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  touchStartX.current = null;
                  if (Math.abs(dx) < 30) return;
                  navigateFeatured(dx < 0 ? 1 : -1);
                }}
              >
                <div className="featured-left">
                  <div className="featured-badge">🔥 Hot Topic</div>
                  <div className="featured-topic-text">"{FEATURED_TOPICS[featuredIdx].text}"</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px" }}>
                    <span className="featured-cat">{FEATURED_TOPICS[featuredIdx].cat}</span>
                    <span className={`topic-rating rating-${FEATURED_TOPICS[featuredIdx].heat.toLowerCase()}`}>{FEATURED_TOPICS[featuredIdx].heat}</span>
                  </div>
                </div>
                <div className="featured-cta">Play This →</div>
              </div>
              <div className="featured-nav">
                <div className="featured-dots">
                  {FEATURED_TOPICS.map((_, i) => (
                    <button
                      key={i}
                      className={`featured-dot${i === featuredIdx ? " active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); if (i === featuredIdx) return; setFeaturedDir(i > featuredIdx ? 1 : -1); setFeaturedIdx(i); setFeaturedKey((k) => k + 1); }}
                    />
                  ))}
                </div>
                <div className="featured-arrows">
                  <button className="featured-arrow" onClick={() => navigateFeatured(-1)}>‹</button>
                  <button className="featured-arrow" onClick={() => navigateFeatured(1)}>›</button>
                </div>
              </div>
            </div>
          </div>

          {/* ARENA STATS STRIP */}
          <div className="arena-stats">
            <div className="arena-stat">
              <span key={arenaDisplay.debates} className="as-val">{arenaDisplay.debates.toLocaleString()}</span>
              <span className="as-lbl">Debates fought</span>
            </div>
            <div className="arena-stat">
              <span key={arenaDisplay.winRate} className="as-val">{arenaDisplay.winRate}%</span>
              <span className="as-lbl">Global win rate</span>
            </div>
            <div className="arena-stat">
              <span key={arenaDisplay.topics} className="as-val">{arenaDisplay.topics}</span>
              <span className="as-lbl">Topics</span>
            </div>
          </div>

          {/* BOTTOM ROW — live feed + personal stats side by side on desktop */}
          <div className="home-bottom-row">
            {/* LIVE ACTIVITY FEED */}
            <div className="live-feed-wrap">
              <div className="live-feed-header">
                <p className="section-label" style={{ marginBottom: 0 }}>
                  <span className="live-dot" />
                  Live Activity
                </p>
              </div>
              <div key={feedKey} className="live-feed">
                {feedItems.map((item, i) => (
                  <div key={i} className="feed-item" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="feed-icon">{item.icon}</span>
                    <span className="feed-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                    <span className={`feed-badge ${item.badgeClass}`}>{item.badge}</span>
                    <span className="feed-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PERSONAL STATS */}
            {stats.debates > 0 && (
              <div style={{ marginTop: "24px" }}>
                <p className="section-label">Your record</p>
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
                    <span className="lbl">MASTEDEBATOR!</span>
                  </div>
                  <div className="stat-card">
                    <span className="val">{Math.round((stats.wins / stats.debates) * 100)}%</span>
                    <span className="lbl">Win Rate</span>
                  </div>
                  {(stats.currentStreak ?? 0) >= 1 && (
                    <div className="stat-card">
                      <span className="val" style={{ color: (stats.currentStreak ?? 0) >= 5 ? "#ef4444" : "#fb923c" }}>
                        🔥{stats.currentStreak}
                      </span>
                      <span className="lbl">Streak</span>
                    </div>
                  )}
                </div>
                {nemesisBot && (
                  <div className="nemesis-card">
                    <div className="nemesis-icon">{nemesisBot.icon}</div>
                    <div>
                      <div className="nemesis-name">{nemesisBot.name}</div>
                      <div className="nemesis-sub">{nemesisBot.losses} loss{nemesisBot.losses !== 1 ? "es" : ""} · Unfinished business</div>
                    </div>
                    <button className="nemesis-rematch" onClick={() => { setSelectedAI(nemesisBot.id); setSetupStep(1); setScreen("setup"); }}>
                      Rematch →
                    </button>
                  </div>
                )}
              </div>
            )}
            {unlockedAchs.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <p className="section-label">Achievements</p>
                <div className="achievement-strip">
                  {unlockedAchs.map(id => {
                    const def = ACHIEVEMENTS.find(a => a.id === id);
                    if (!def) return null;
                    return (
                      <div key={id} className="ach-badge gold-ach" title={def.desc}>
                        <span>{def.icon}</span>
                        <span>{def.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
                <div className={`ai-card ${selectedAI === "custom" ? "selected" : ""}`} onClick={() => setSelectedAI("custom")}>
                  <span className="ai-icon">🎭</span>
                  <div className="ai-name">Build Your Own</div>
                  <div className="ai-desc">Design a custom AI opponent with any personality and style.</div>
                  <span className="ai-diff" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>Custom</span>
                </div>
              </div>
              {selectedAI === "custom" && (
                <div className="custom-form">
                  <label className="custom-form-lbl">Opponent name</label>
                  <input
                    className="custom-input"
                    type="text"
                    placeholder='e.g. "The Cynic" or "The Optimist"'
                    maxLength={30}
                    value={customOpponent.name}
                    onChange={(e) => setCustomOpponent((p) => ({ ...p, name: e.target.value }))}
                    style={{ marginBottom: "14px" }}
                  />
                  <label className="custom-form-lbl">Personality & debate style</label>
                  <textarea
                    className="custom-input"
                    rows={3}
                    placeholder="e.g. You are a cold, data-driven scientist who dismisses anything anecdotal and demands peer-reviewed evidence for every claim..."
                    maxLength={400}
                    value={customOpponent.personality}
                    onChange={(e) => setCustomOpponent((p) => ({ ...p, personality: e.target.value }))}
                    style={{ resize: "none", marginBottom: "14px" }}
                  />
                  <label className="custom-form-lbl">Difficulty</label>
                  <div className="custom-diff-row">
                    {(["easy", "medium", "hard", "extreme"] as const).map((d) => (
                      <button
                        key={d}
                        className={`custom-diff-opt${customOpponent.diff === d ? ` sel-${d}` : ""}`}
                        onClick={() => setCustomOpponent((p) => ({ ...p, diff: d }))}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="btn btn-primary"
                disabled={!selectedAI || (selectedAI === "custom" && (!customOpponent.name.trim() || !customOpponent.personality.trim()))}
                onClick={() => setSetupStep(selectedTopic ? 2 : 1)}
              >
                {selectedTopic ? "Next: Pick Side →" : "Next: Pick Topic →"}
              </button>
            </>
          )}

          {setupStep === 1 && (
            <>
              <p className="section-label">Pick a topic</p>
              {Object.keys(topicVotes).length > 0 && (() => {
                const sorted = Object.entries(topicVotes).sort((a, b) => b[1] - a[1]).slice(0, 3);
                return (
                  <div className="trending-section">
                    <p className="section-label" style={{ marginBottom: "8px" }}>🔥 Trending</p>
                    {sorted.map(([text, votes]) => (
                      <div key={text} className="trending-item" onClick={() => setSelectedTopic({ cat: "Hot Take", text })}>
                        <span className="trending-text">{text}</span>
                        <span className="trending-votes">{votes} vote{votes !== 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="topic-grid">
                {displayTopics.map((t, i) => {
                  const rating = getTopicRating(t.text);
                  return (
                    <div key={i} className={`topic-card ${selectedTopic?.text === t.text ? "selected" : ""}`} onClick={() => setSelectedTopic(t)}>
                      <div className="t-cat">{t.cat}</div>
                      <div className="t-text">{t.text}</div>
                      <div className={`topic-rating rating-${rating.toLowerCase()}`}>{rating}</div>
                      <button
                        className={`topic-vote-btn${votedTopics.has(t.text) ? " voted" : ""}`}
                        onClick={(e) => { e.stopPropagation(); voteForTopic(t.text); }}
                      >
                        🔥 {topicVotes[t.text] ? `${topicVotes[t.text]} vote${topicVotes[t.text] !== 1 ? "s" : ""}` : "Vote"}
                      </button>
                    </div>
                  );
                })}
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
                {[1, 3, 5, 10].map((r) => (
                  <button key={r} className={`rounds-btn ${selectedRounds === r ? "selected" : ""}`} onClick={() => setSelectedRounds(r)}>
                    {r}
                    <span className="rounds-sub">{r === 1 ? "Quick" : r === 3 ? "Standard" : r === 5 ? "Marathon" : "Endurance"}</span>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                <button className="btn btn-primary" style={{ width: "100%" }} disabled={!selectedSide} onClick={() => launchMatchmaking()}>
                  ⚡ Start Clash
                </button>
                <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setSetupStep(1)}>← Back</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MATCHMAKING */}
      {screen === "matchmaking" && ai && selectedTopic && selectedSide && (
        <div className="matchmaking">
          <div className="mf-found">MATCH FOUND</div>
          <div className="mf-sub">Entering the arena</div>

          <div className="mf-vs-card">
            <div className="mf-player">
              <span className="mf-icon">👤</span>
              <div className="mf-plbl">You</div>
              <div className="mf-pname">CHALLENGER</div>
            </div>
            <div className="mf-sep">VS</div>
            <div className="mf-player">
              <span className="mf-icon">{ai.icon}</span>
              <div className="mf-plbl">Opponent</div>
              <div className="mf-pname">{ai.name.replace("The ", "").toUpperCase()}</div>
            </div>
          </div>

          <div className="mf-topic">"{selectedTopic.text}"</div>

          <div className="mf-stances">
            <div className={`mf-stance ${selectedSide === "for" ? "for" : "against"}`}>
              <div className="mf-swho">Your Side</div>
              <div className="mf-sside">{selectedSide === "for" ? "FOR" : "AGAINST"}</div>
            </div>
            <div className={`mf-stance ${selectedSide === "for" ? "against" : "for"}`}>
              <div className="mf-swho">{ai.name}</div>
              <div className="mf-sside">{selectedSide === "for" ? "AGAINST" : "FOR"}</div>
            </div>
          </div>

          {error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", marginTop: "8px", width: "100%", maxWidth: "400px" }}>
              <div className="error-banner" style={{ width: "100%", textAlign: "center" }}>{error}</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-primary" onClick={() => { setError(""); launchMatchmaking(); }}>⟳ Retry</button>
                <button className="btn btn-ghost" onClick={() => { setError(""); setScreen("setup"); setSetupStep(2); }}>← Back</button>
              </div>
            </div>
          ) : matchCountdown > 0 ? (
            <div key={matchCountdown} className="mf-countdown">{matchCountdown}</div>
          ) : (
            <div className="mf-waiting">
              <div className="dots"><span>●</span><span>●</span><span>●</span></div>
              Preparing opponent
            </div>
          )}
        </div>
      )}

      {/* DEBATE */}
      {screen === "debate" && (
        <div className="screen debate-screen">
          <div className="arena-header">
            <div className="round-badge">
              RD {currentRound}/{selectedRounds}
              {isOvertime && <span style={{ display: "block", fontFamily: "'Barlow Condensed'", fontSize: "9px", letterSpacing: "2px", color: "var(--red)", textTransform: "uppercase", marginTop: "2px" }}>OVERTIME</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div className="arena-topic">{selectedTopic?.text}</div>
              {adaptiveLevel !== 0 && (
                <div className={`adaptive-badge ${adaptiveLevel > 0 ? "adaptive-up" : "adaptive-dn"}`}>
                  {adaptiveLevel > 0 ? "⬆ AI Escalating" : "⬇ AI Easing"}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px" }}>{ai?.icon}</div>
              <div className="vs-badge">{ai?.name}</div>
            </div>
          </div>

          {roundScores.length > 0 && (() => {
            const roundsWon = roundScores.filter(r => r.score >= 60).length;
            const roundsLost = roundScores.length - roundsWon;
            const avg = Math.round(roundScores.reduce((s, r) => s + r.score, 0) / roundScores.length);
            return (
              <div className="live-scoreboard">
                <span className="ls-label">Live</span>
                <div className="ls-dots">
                  {roundScores.map((r, i) => (
                    <div key={i} className="ls-dot" style={{ background: r.score >= 60 ? "var(--green)" : "var(--red)" }} />
                  ))}
                  {Array.from({ length: Math.max(0, selectedRounds - roundScores.length) }).map((_, i) => (
                    <div key={`e${i}`} className="ls-dot" style={{ background: "var(--border)" }} />
                  ))}
                </div>
                <span className="ls-you">{roundsWon}W</span>
                <span className="ls-sep">:</span>
                <span className="ls-ai">{roundsLost}L</span>
                <span className="ls-avg">Avg {avg}</span>
              </div>
            );
          })()}
          {roundScores.map((rs, i) => (
            <div key={i} className="round-score">
              <span className="rs-round">Rd {rs.round}</span>
              <div className="rs-bar">
                <div className="rs-fill" style={{ width: `${rs.score}%`, background: getScoreColor(rs.score) }} />
              </div>
              <span className="rs-score" style={{ color: getScoreColor(rs.score) }}>{rs.score}</span>
              {rs.iq && (
                <span className="iq-badge">IQ {rs.iq} · {rs.iqLabel}</span>
              )}
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
                    <span key={thinkingPhase} className="thinking-phase">
                      {["Reading your argument","Finding weaknesses","Calculating counter","Preparing response","Sharpening rebuttal"][thinkingPhase]}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!thinking && roundScores.length < selectedRounds && (
            <div className="input-area">
              {timerStarted && timeLeft !== null && (() => {
                const pct = (timeLeft / roundTimerDuration) * 100;
                const isUrgent = timeLeft <= 15;
                const isCritical = timeLeft <= 7;
                const color = isCritical
                  ? "var(--red)"
                  : isUrgent
                  ? "var(--gold)"
                  : "var(--green)";
                return (
                  <div className="timer-bar">
                    <span className={`timer-countdown${isCritical ? " pulse" : ""}`} style={{ color }}>{timeLeft}</span>
                    <div className="timer-track">
                      <div className="timer-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    {isExtreme
                      ? <span className="timer-extreme-badge">{isCritical ? "⚠ SUBMIT NOW" : isUrgent ? "EXTREME" : "EXTREME"}</span>
                      : <span className="timer-label">{ai?.diffLabel}</span>
                    }
                  </div>
                );
              })()}
              <textarea
                ref={inputRef}
                className={`debate-input${isExtreme && timerStarted && timeLeft !== null && timeLeft <= 10 ? " extreme-urgent" : ""}`}
                rows={4}
                value={inputText}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputText(val);
                  if (!timerStarted && val.length > 0) startResponseTimer();
                }}
                placeholder={
                  isExtreme
                    ? `Round ${currentRound}: Argue — 45 seconds after you start typing`
                    : `Round ${currentRound}: Make your argument… (timer starts when you type)`
                }
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submitArgument(); }}
              />
              <div className="input-footer">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {(() => {
                    const overLimit = inputText.length > charLimit;
                    const nearLimit = inputText.length >= Math.floor(charLimit * 0.85);
                    return (
                      <span className={`char-count${overLimit ? " danger" : nearLimit ? " warn" : ""}`}>
                        {inputText.length}/{charLimit}
                        {overLimit && (
                          <span className="char-over">· {inputText.length - charLimit} over</span>
                        )}
                        {!overLimit && nearLimit && (
                          <span style={{ marginLeft: "4px", fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "1px" }}>
                            · near limit
                          </span>
                        )}
                      </span>
                    );
                  })()}
                  {!timerStarted && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-dim)",
                        font: "inherit",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "11px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={startResponseTimer}
                    >
                      ▶ Start Clock
                    </button>
                  )}
                </div>
                <div className="submit-row">
                  {forfeitCountdown === null ? (
                    <button className="btn btn-ghost" onClick={startForfeit}>Forfeit</button>
                  ) : forfeitCountdown > 0 ? (
                    <button className="btn btn-forfeit-counting" disabled>{forfeitCountdown}</button>
                  ) : (
                    <button className="btn btn-confirm-forfeit" onClick={reset}>✓ Confirm</button>
                  )}
                  <button
                    className="btn btn-primary"
                    disabled={!inputText.trim() || inputText.length > charLimit}
                    onClick={() => submitArgument()}
                  >
                    Submit →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VERDICT */}
      {screen === "verdict" && verdict && (
        <div className="screen">
          <div className="verdict-card">
            <div className="verdict-header">
              <div className={`rank-badge rank-${verdict.rank}`}>{verdict.rank}</div>
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

            <div style={{
              background: "var(--surface2)",
              borderLeft: `3px solid ${verdict.won ? "var(--green)" : "var(--red)"}`,
              borderRadius: "0 var(--radius) var(--radius) 0",
              padding: "12px 16px",
              marginBottom: "12px",
            }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: verdict.won ? "var(--green)" : "var(--red)", marginBottom: "6px" }}>
                Judge's Call
              </div>
              <p style={{ fontSize: "15px", lineHeight: 1.5, color: "var(--text-mid)", margin: 0 }}>{verdict.judgeText}</p>
            </div>

            <div className="verdict-moments">
              <div className="best-arg">
                <div className="arg-label best">✓ Best Moment</div>
                <div style={{ fontSize: "13px", color: "var(--text-mid)" }}>{verdict.bestArg}</div>
              </div>
              <div className="worst-arg">
                <div className="arg-label worst">✗ Fatal Flaw</div>
                <div style={{ fontSize: "13px", color: "var(--text-mid)" }}>{verdict.weakArg}</div>
              </div>
            </div>

            <div style={{
              background: "rgba(0,119,255,0.07)",
              border: "1px solid rgba(0,119,255,0.2)",
              borderRadius: "var(--radius)",
              padding: "10px 14px",
              display: "flex",
              gap: "10px",
              alignItems: "baseline",
            }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--blue)", whiteSpace: "nowrap" }}>IMPROVE</span>
              <span style={{ fontSize: "14px", color: "var(--text-mid)" }}>{verdict.improve}</span>
            </div>
          </div>

          {suddenDeathAvailable && (
            <button className="sudden-btn" onClick={launchSuddenDeath}>
              <span className="sudden-title">⚡ SUDDEN DEATH</span>
              <span className="sudden-sub">Score is close — one overtime round decides everything</span>
            </button>
          )}

          <div className="verdict-actions">
            <button className="btn btn-primary" onClick={instantRematch}>⚡ Instant Rematch</button>
            <button className="btn btn-secondary" onClick={swapSidesRematch}>↕ Swap Sides</button>
            <button className="btn btn-secondary" onClick={() => setScreen("replay")}>📋 Replay</button>
            <button className="btn btn-secondary" onClick={shareResult}>🔗 Share</button>
            <button className="btn btn-secondary" onClick={shareImage}>📸 Share Card</button>
            <button className="btn btn-ghost" onClick={() => { setSetupStep(0); setScreen("setup"); setMessages([]); setRoundScores([]); setVerdict(null); }}>New Match</button>
            <button className="btn btn-ghost" onClick={reset}>Home</button>
          </div>
        </div>
      )}

      {/* MULTIPLAYER LOBBY */}
      {screen === "multiplayer-lobby" && (() => {
        const seasonWins = v1History.filter(e => {
          const d = new Date(e.date);
          return e.won && d >= new Date("2026-03-01") && d <= new Date("2026-05-31");
        }).length;
        const seasonMatches = v1History.filter(e => {
          const d = new Date(e.date);
          return d >= new Date("2026-03-01") && d <= new Date("2026-05-31");
        }).length;
        const badges: { label: string; icon: string; tier: "gold" | "silver" | "bronze" | "blue" }[] = [];
        if (seasonMatches >= 1) badges.push({ label: "First Match", icon: "⚔", tier: "blue" });
        if (seasonMatches >= 5) badges.push({ label: "Veteran", icon: "🛡", tier: "bronze" });
        if (seasonWins >= 1) badges.push({ label: "First Win", icon: "✓", tier: "blue" });
        if (seasonWins >= 3) badges.push({ label: "Champion", icon: "🏆", tier: "silver" });
        if (seasonWins >= 5) badges.push({ label: "Dominator", icon: "👑", tier: "gold" });
        if (v1History.length > 0 && v1History.filter(e => e.won).length / v1History.length >= 0.7 && v1History.length >= 5)
          badges.push({ label: "70%+ Win Rate", icon: "⚡", tier: "gold" });
        return (
          <div className="screen">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <button className="btn btn-ghost" onClick={reset}>← Home</button>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "32px", letterSpacing: "3px", margin: 0 }}>1v1 CHALLENGE</h2>
            </div>

            <div className="v1-tab-row">
              <button className={`v1-tab${v1Tab === "play" ? " active" : ""}`} onClick={() => setV1Tab("play")}>Play</button>
              <button className={`v1-tab${v1Tab === "history" ? " active" : ""}`} onClick={() => setV1Tab("history")}>
                History {v1History.length > 0 && `(${v1History.length})`}
              </button>
            </div>

            {v1Tab === "play" && (
              <>
                {!v1SubScreen ? (
                  <div className="lobby-options">
                    <div className="lobby-card create" onClick={createRoom}>
                      <div className="lobby-card-icon">⚔</div>
                      <div className="lobby-card-title">Create Room</div>
                      <div className="lobby-card-sub">Get a code · Share with a friend</div>
                    </div>
                    <div className="lobby-card join" onClick={() => setV1SubScreen("join")}>
                      <div className="lobby-card-icon">🔗</div>
                      <div className="lobby-card-title">Join Room</div>
                      <div className="lobby-card-sub">Enter a code from a friend</div>
                    </div>
                  </div>
                ) : (
                  <div className="join-form">
                    <p className="section-label">Enter room code</p>
                    <input
                      className="join-code-input"
                      maxLength={6}
                      value={roomJoinCode}
                      onChange={(e) => setRoomJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder="ABC123"
                      onKeyDown={(e) => { if (e.key === "Enter" && roomJoinCode.length === 6) joinRoom(); }}
                      autoFocus
                    />
                    {roomError && <div className="auth-err" style={{ marginBottom: "12px" }}>{roomError}</div>}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btn btn-ghost" onClick={() => { setV1SubScreen(""); setRoomError(""); }}>← Back</button>
                      <button className="btn btn-primary" onClick={joinRoom} disabled={roomJoinCode.length !== 6 || roomLoading}>
                        {roomLoading ? "Joining..." : "Join →"}
                      </button>
                    </div>
                  </div>
                )}
                {roomError && !v1SubScreen && <div className="auth-err" style={{ marginTop: "12px" }}>{roomError}</div>}
                {roomLoading && !v1SubScreen && (
                  <div style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "16px", fontFamily: "'Barlow Condensed'", letterSpacing: "2px", fontSize: "13px" }}>
                    Creating room...
                  </div>
                )}
              </>
            )}

            {v1Tab === "history" && (
              <>
                {badges.length > 0 && (
                  <div className="seasonal-section">
                    <p className="section-label" style={{ marginBottom: "6px" }}>Spring 2026 Badges</p>
                    <div className="seasonal-badge-row">
                      {badges.map(b => (
                        <span key={b.label} className={`seasonal-badge ${b.tier}`}>
                          <span>{b.icon}</span>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {v1History.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-dim)" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "2px", marginBottom: "8px" }}>NO MATCHES YET</div>
                    <div style={{ fontSize: "13px" }}>Play your first 1v1 match to start your history.</div>
                    <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => setV1Tab("play")}>Play Now →</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px", marginTop: badges.length > 0 ? "20px" : 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "var(--text)" }}>{v1History.length}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>Played</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "var(--green)" }}>{v1History.filter(e => e.won).length}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>Wins</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "var(--red)" }}>{v1History.filter(e => !e.won).length}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>Losses</div>
                      </div>
                      {v1History.length >= 2 && (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "var(--gold)" }}>
                            {Math.round((v1History.filter(e => e.won).length / v1History.length) * 100)}%
                          </div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>Win Rate</div>
                        </div>
                      )}
                    </div>
                    {v1History.map((entry, i) => {
                      const ago = (() => {
                        const ms = Date.now() - new Date(entry.date).getTime();
                        const m = Math.floor(ms / 60000);
                        if (m < 60) return `${Math.max(1, m)}m ago`;
                        if (m < 1440) return `${Math.floor(m / 60)}h ago`;
                        return `${Math.floor(m / 1440)}d ago`;
                      })();
                      return (
                        <div key={i} className="v1-history-entry">
                          <div className={`v1-hist-result ${entry.won ? "win" : "loss"}`}>
                            {entry.won ? "WIN" : "LOSS"}
                          </div>
                          <div className="v1-hist-info">
                            <div className="v1-hist-topic" title={entry.topic}>"{entry.topic}"</div>
                            <div className="v1-hist-meta">
                              vs {entry.opponentName} · {entry.myScore ?? "—"}/100
                              {entry.myIQ ? ` · IQ ${entry.myIQ}` : ""} · {ago}
                            </div>
                          </div>
                          <div className={`v1-hist-rank rank-${entry.myRank}`}>{entry.myRank}</div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* MULTIPLAYER WAITING ROOM */}
      {screen === "multiplayer-waiting" && currentRoom && (
        <div className="screen">
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <button className="btn btn-ghost" onClick={reset}>← Leave</button>
          </div>

          <div className="waiting-room">
            <p className="section-label" style={{ marginBottom: "4px" }}>Your room code</p>
            <div
              className="room-code-display"
              title="Click to copy code"
              onClick={() => { navigator.clipboard.writeText(currentRoom.code).catch(() => {}); setShareToast("Code copied!"); setTimeout(() => setShareToast(""), 2500); }}
            >
              {currentRoom.code}
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "12px", marginBottom: "16px" }}>Click code to copy · Share with opponent</p>

            <div
              className="share-link-box"
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}?room=${currentRoom.code}`;
                navigator.clipboard.writeText(url).catch(() => {});
                setShareToast("Link copied!");
                setTimeout(() => setShareToast(""), 2500);
              }}
            >
              🔗 {window.location.origin}?room={currentRoom.code}
            </div>

            {currentRoom.player2Name ? (
              <div style={{ color: "var(--green)", fontFamily: "'Barlow Condensed'", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
                ✓ {currentRoom.player2Name} joined!
              </div>
            ) : (
              <>
                <div style={{ color: "var(--text-dim)", fontFamily: "'Barlow Condensed'", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Waiting for opponent
                </div>
                <div className="waiting-dots">
                  <div className="waiting-dot" />
                  <div className="waiting-dot" />
                  <div className="waiting-dot" />
                </div>
              </>
            )}

            {currentRoom.status !== "waiting" && (
              <div className="v1-topic-banner" style={{ marginTop: "20px" }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Topic · {currentRoom.topicCat}
                </span>
                <br />
                <strong>"{currentRoom.topicText}"</strong>
              </div>
            )}

            {currentRoom.status === "choosing" && roomPlayerNum === 1 && !currentRoom.player1Side && (
              <div style={{ marginTop: "20px" }}>
                <p className="section-label">Pick your side</p>
                <div className="side-pick">
                  <button className="side-btn for" onClick={() => setRoomSide("for")}>
                    <span className="side-icon">✅</span>
                    <div className="side-label">For</div>
                    <div className="side-sub">I agree with this</div>
                  </button>
                  <button className="side-btn against" onClick={() => setRoomSide("against")}>
                    <span className="side-icon">❌</span>
                    <div className="side-label">Against</div>
                    <div className="side-sub">I disagree</div>
                  </button>
                </div>
              </div>
            )}

            {currentRoom.status === "choosing" && currentRoom.player1Side && (
              <div style={{ marginTop: "16px", fontFamily: "'Barlow Condensed'", fontSize: "13px", letterSpacing: "1px" }}>
                <span style={{ color: "var(--red)" }}>{currentRoom.player1Name}</span>: {(currentRoom.player1Side || "").toUpperCase()}
                {currentRoom.player2Name && (
                  <> &nbsp;·&nbsp; <span style={{ color: "#60a5fa" }}>{currentRoom.player2Name}</span>: {(currentRoom.player2Side || "").toUpperCase()}</>
                )}
              </div>
            )}

            {currentRoom.status === "choosing" &&
              ((roomPlayerNum === 1 && currentRoom.player1Side) || roomPlayerNum === 2) &&
              !((roomPlayerNum === 1 && currentRoom.player1Ready) || (roomPlayerNum === 2 && currentRoom.player2Ready)) && (
                <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={markReady}>
                  ✓ I'm Ready
                </button>
              )}

            {roomError && <div className="auth-err" style={{ marginTop: "12px" }}>{roomError}</div>}
          </div>
        </div>
      )}

      {/* MULTIPLAYER DEBATE */}
      {screen === "multiplayer-debate" && currentRoom && (() => {
        const myArgs = currentRoom.arguments.filter(a => a.playerNum === roomPlayerNum);
        const oppArgs = currentRoom.arguments.filter(a => a.playerNum !== roomPlayerNum && a.playerNum !== null);
        const myRoundArg = myArgs.find(a => a.roundNum === currentRoom.currentRound);
        const oppRoundArg = oppArgs.find(a => a.roundNum === currentRoom.currentRound);
        const myAvgScore = myArgs.length ? Math.round(myArgs.reduce((s, a) => s + (a.score || 0), 0) / myArgs.length) : null;
        const oppAvgScore = oppArgs.length ? Math.round(oppArgs.reduce((s, a) => s + (a.score || 0), 0) / oppArgs.length) : null;
        const mySide = roomPlayerNum === 1 ? currentRoom.player1Side : currentRoom.player2Side;
        const oppSide = roomPlayerNum === 1 ? currentRoom.player2Side : currentRoom.player1Side;
        const myName = roomPlayerNum === 1 ? currentRoom.player1Name : (currentRoom.player2Name || "You");
        const oppName = roomPlayerNum === 1 ? (currentRoom.player2Name || "Opponent") : currentRoom.player1Name;
        const completedRounds: number[] = [];
        for (let r = 1; r < currentRoom.currentRound; r++) {
          if (myArgs.find(a => a.roundNum === r) && oppArgs.find(a => a.roundNum === r)) completedRounds.push(r);
        }
        return (
          <div className="screen">
            <div className="v1-arena-header">
              <div>
                <div className="v1-round-badge">Round {currentRoom.currentRound}/{currentRoom.totalRounds}</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "11px", letterSpacing: "2px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  {currentRoom.topicCat}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 14px" }} onClick={() => setScreen("multiplayer-waiting")}>
                Room Info
              </button>
            </div>

            <div className="v1-topic-banner">
              <strong>"{currentRoom.topicText}"</strong>
            </div>

            {(myAvgScore !== null || oppAvgScore !== null) ? (
              <div className="v1-score-bar">
                <div>
                  <div className="v1-score me">{myAvgScore ?? "—"}</div>
                  <div className="v1-score-label">{myName} ({mySide?.toUpperCase()})</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: "18px", color: "var(--text-dim)", letterSpacing: "2px" }}>VS</div>
                <div style={{ textAlign: "right" }}>
                  <div className="v1-score opp">{oppAvgScore ?? "—"}</div>
                  <div className="v1-score-label" style={{ textAlign: "right" }}>{oppName} ({oppSide?.toUpperCase()})</div>
                </div>
              </div>
            ) : (
              <div className="v1-vs-bar">
                <div className="v1-player-chip me">{mySide?.toUpperCase() || "FOR"} · {myName}</div>
                <div className="v1-vs">VS</div>
                <div className="v1-player-chip opp">{oppSide?.toUpperCase() || "AGAINST"} · {oppName}</div>
              </div>
            )}

            {completedRounds.length > 0 && (
              <div className="v1-args-section">
                {completedRounds.map(r => {
                  const myR = myArgs.find(a => a.roundNum === r)!;
                  const oppR = oppArgs.find(a => a.roundNum === r)!;
                  const myHL: RoomHighlight[] = (() => { try { return JSON.parse(myR.highlights || "[]"); } catch { return []; } })();
                  const oppHL: RoomHighlight[] = (() => { try { return JSON.parse(oppR.highlights || "[]"); } catch { return []; } })();
                  return (
                    <div key={r}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "8px" }}>
                        Round {r} Results
                      </div>
                      <div className="v1-arg-entry">
                        <div className="v1-arg-who me">You ({mySide?.toUpperCase()}) · Rank {myR.rank} · {myR.score}/100</div>
                        <div className="v1-arg-text">{renderWithHighlights(myR.argumentText, myHL)}</div>
                        {myR.critique && <div className="v1-arg-critique">{myR.critique}</div>}
                        <div className="v1-arg-scores">
                          <span className="v1-arg-score">Logic <span>{myR.logic}</span></span>
                          <span className="v1-arg-score">Persuasion <span>{myR.persuasion}</span></span>
                          <span className="v1-arg-score">Delivery <span>{myR.delivery}</span></span>
                        </div>
                      </div>
                      <div className="v1-arg-entry">
                        <div className="v1-arg-who opp">{oppName} ({oppSide?.toUpperCase()}) · Rank {oppR.rank} · {oppR.score}/100</div>
                        <div className="v1-arg-text">{renderWithHighlights(oppR.argumentText, oppHL)}</div>
                        {oppR.critique && <div className="v1-arg-critique">{oppR.critique}</div>}
                        <div className="v1-arg-scores">
                          <span className="v1-arg-score">Logic <span>{oppR.logic}</span></span>
                          <span className="v1-arg-score">Persuasion <span>{oppR.persuasion}</span></span>
                          <span className="v1-arg-score">Delivery <span>{oppR.delivery}</span></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentRoom.status === "debating" && (
              myRoundArg ? (
                <div>
                  <div className="v1-arg-entry">
                    <div className="v1-arg-who me">
                      Your argument · Round {currentRoom.currentRound}
                      {myRoundArg.score ? ` · Rank ${myRoundArg.rank} · ${myRoundArg.score}/100` : " · Judged ✓"}
                    </div>
                    <div className="v1-arg-text">
                      {myRoundArg.score
                        ? renderWithHighlights(myRoundArg.argumentText, (() => { try { return JSON.parse(myRoundArg.highlights || "[]"); } catch { return []; } })())
                        : myRoundArg.argumentText}
                    </div>
                    {myRoundArg.critique && <div className="v1-arg-critique">{myRoundArg.critique}</div>}
                  </div>
                  {!oppRoundArg && (
                    <div className="v1-waiting-msg">
                      <div className="waiting-dots" style={{ marginBottom: "8px" }}>
                        <div className="waiting-dot" /><div className="waiting-dot" /><div className="waiting-dot" />
                      </div>
                      Waiting for {oppName}...
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="section-label">Round {currentRoom.currentRound} — Argue {mySide?.toUpperCase()}</p>
                  <textarea
                    className="debate-input"
                    rows={5}
                    value={roomArgInput}
                    onChange={(e) => setRoomArgInput(e.target.value)}
                    placeholder={`Make your argument ${mySide?.toUpperCase() || ""}…`}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submitRoomArg(); }}
                  />
                  <div className="input-footer">
                    <span className={`char-count${roomArgInput.length > 600 ? " danger" : roomArgInput.length > 500 ? " warn" : ""}`}>
                      {roomArgInput.length}/600
                    </span>
                    <div className="submit-row">
                      <button className="btn btn-ghost" onClick={() => { if (window.confirm("Give up? Your opponent wins this match.")) forfeitRoom(); }}>
                        Give Up
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={!roomArgInput.trim() || roomArgInput.length > 600 || roomSubmitting}
                        onClick={submitRoomArg}
                      >
                        {roomSubmitting ? "Judging..." : "Submit →"}
                      </button>
                    </div>
                  </div>
                  {roomError && <div className="auth-err" style={{ marginTop: "8px" }}>{roomError}</div>}
                </div>
              )
            )}

            {currentRoom.status === "complete" && (
              <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => setScreen("multiplayer-results")}>
                See Results →
              </button>
            )}
          </div>
        );
      })()}

      {/* MULTIPLAYER RESULTS */}
      {screen === "multiplayer-results" && currentRoom && (() => {
        const myScore = roomPlayerNum === 1 ? currentRoom.player1Score : currentRoom.player2Score;
        const oppScore = roomPlayerNum === 1 ? currentRoom.player2Score : currentRoom.player1Score;
        const myRank = (roomPlayerNum === 1 ? currentRoom.player1Rank : currentRoom.player2Rank) || "C";
        const oppRank = (roomPlayerNum === 1 ? currentRoom.player2Rank : currentRoom.player1Rank) || "C";
        const myIQ = roomPlayerNum === 1 ? currentRoom.iq1 : currentRoom.iq2;
        const oppIQ = roomPlayerNum === 1 ? currentRoom.iq2 : currentRoom.iq1;
        const myName = roomPlayerNum === 1 ? currentRoom.player1Name : (currentRoom.player2Name || "You");
        const oppName = roomPlayerNum === 1 ? (currentRoom.player2Name || "Opponent") : currentRoom.player1Name;
        const iWon = currentRoom.winnerPlayerNum === roomPlayerNum;
        return (
          <div className="screen">
            <div className="v1-result-card">
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "8px" }}>
                1v1 Match Result
              </div>
              <div className="v1-winner-banner" style={{ color: iWon ? "var(--green)" : "var(--red)" }}>
                {iWon ? "VICTORY" : "DEFEATED"}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "13px", color: "var(--text-dim)" }}>
                "{currentRoom.topicText}"
              </div>

              <div className="v1-iq-grid">
                <div className={`v1-iq-card${iWon ? " winner" : ""}`}>
                  <div className="v1-iq-name" style={{ color: "var(--red)" }}>{myName} (You)</div>
                  <div className={`v1-iq-val${iWon ? " gold" : ""}`}>{myIQ ?? "—"}</div>
                  <div className="v1-iq-label">Debate IQ</div>
                  <div className="v1-iq-rank" style={{ color: iWon ? "var(--gold)" : "var(--text-dim)" }}>{myRank}</div>
                  {myIQ && <div className="v1-iq-desc">{iqLabel(myIQ)}</div>}
                  <div style={{ marginTop: "8px", fontFamily: "'Barlow Condensed'", fontSize: "11px", color: "var(--text-dim)" }}>
                    Avg: {myScore ?? 0}/100
                  </div>
                </div>
                <div className={`v1-iq-card${!iWon ? " winner" : ""}`}>
                  <div className="v1-iq-name" style={{ color: "#60a5fa" }}>{oppName}</div>
                  <div className={`v1-iq-val${!iWon ? " gold" : ""}`}>{oppIQ ?? "—"}</div>
                  <div className="v1-iq-label">Debate IQ</div>
                  <div className="v1-iq-rank" style={{ color: !iWon ? "var(--gold)" : "var(--text-dim)" }}>{oppRank}</div>
                  {oppIQ && <div className="v1-iq-desc">{iqLabel(oppIQ)}</div>}
                  <div style={{ marginTop: "8px", fontFamily: "'Barlow Condensed'", fontSize: "11px", color: "var(--text-dim)" }}>
                    Avg: {oppScore ?? 0}/100
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => { setCurrentRoom(null); setRoomPlayerNum(null); setRoomArgInput(""); setRoomError(""); setV1SubScreen(""); setV1Tab("play"); setScreen("multiplayer-lobby"); }}>⚔ Rematch</button>
              <button className="btn btn-secondary" onClick={() => setScreen("multiplayer-debate")}>📋 View Arguments</button>
              <button className="btn btn-ghost" onClick={reset}>Home</button>
            </div>
          </div>
        );
      })()}

      {/* REPLAY */}
      {screen === "replay" && verdict && (
        <div className="screen">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", letterSpacing: "3px" }}>REPLAY</h2>
            <button className="btn btn-ghost" onClick={() => setScreen("verdict")}>← Back</button>
          </div>

          <div className="replay-intro">
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
                {ai?.name} · {selectedRounds} Round{selectedRounds !== 1 ? "s" : ""} · {selectedTopic?.text}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[["Logic", verdict.avgLogic], ["Persuasion", verdict.avgPersuasion], ["Delivery", verdict.avgDelivery]].map(([lbl, val]) => (
                  <span key={lbl as string} className="replay-sub">{lbl} <span>{val}</span></span>
                ))}
              </div>
            </div>
            <div className="replay-verdict-badge" style={{ color: verdict.won ? "var(--green)" : "var(--red)" }}>
              {verdict.won ? "WIN" : "LOSS"} · {verdict.rank}
            </div>
          </div>

          {messages[0] && (
            <div className="replay-round">
              <div className="replay-round-hdr">
                <span className="replay-round-lbl">Opening Statement</span>
                <span style={{ fontSize: "18px" }}>{ai?.icon}</span>
              </div>
              <div className="replay-msgs">
                <div className="replay-msg rmai">
                  <div className="replay-who">{ai?.name}</div>
                  {messages[0].text}
                </div>
              </div>
            </div>
          )}

          {roundScores.map((rs, i) => {
            const userMsg = messages[1 + i * 2];
            const aiMsg = messages[2 + i * 2];
            return (
              <div key={i} className="replay-round">
                <div className="replay-round-hdr">
                  <span className="replay-round-lbl">Round {rs.round}{rs.round > (selectedRounds - (isOvertime ? 1 : 0)) ? " · OVERTIME" : ""}</span>
                  <span className="replay-round-score" style={{ color: getScoreColor(rs.score) }}>{rs.score}</span>
                </div>
                {userMsg && (
                  <div className="replay-msgs">
                    <div className="replay-msg rmuser">
                      <div className="replay-who">You</div>
                      {userMsg.text}
                    </div>
                  </div>
                )}
                <div className="replay-subs">
                  <span className="replay-sub">Logic <span>{rs.logic}</span></span>
                  <span className="replay-sub">Persuasion <span>{rs.persuasion}</span></span>
                  <span className="replay-sub">Delivery <span>{rs.delivery}</span></span>
                  {rs.best && <span className="replay-sub">✓ Best: <span>"{rs.best}"</span></span>}
                  {rs.weak && <span className="replay-sub">✗ Weak: <span>"{rs.weak}"</span></span>}
                </div>
                {aiMsg && (
                  <div className="replay-msgs" style={{ paddingTop: 0 }}>
                    <div className="replay-msg rmai">
                      <div className="replay-who">{ai?.name}</div>
                      {aiMsg.text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* GAUNTLET INTRO */}
      {screen === "gauntlet-intro" && (
        <div className="screen">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "8px" }}>Challenge Mode</div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,12vw,72px)", letterSpacing: "4px", lineHeight: 1, margin: 0 }}>⚔ THE GAUNTLET</h2>
            <p style={{ color: "var(--text-dim)", marginTop: "10px", fontSize: "15px" }}>
              Face all 6 opponents back-to-back. 3 rounds each. No respawn.
            </p>
          </div>

          <p className="section-label">Your opponents — in order</p>
          <div className="gauntlet-bots">
            {TOURNAMENT_BOT_ORDER.map((id, i) => {
              const bot = AI_OPPONENTS.find((a) => a.id === id)!;
              return (
                <div className="gauntlet-bot-card" key={id}>
                  <div className="gb-num">#{i + 1}</div>
                  <span className="gb-icon">{bot.icon}</span>
                  <div className="gb-name">{bot.name}</div>
                  <span className={`ai-diff diff-${bot.diff}`}>{bot.diffLabel}</span>
                </div>
              );
            })}
          </div>

          <p className="section-label">Pick your side for the first match</p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--text-dim)" }}>
            Topic 1: <span style={{ color: "var(--text)", fontStyle: "italic" }}>"{tournamentTopics[0]?.text || "Topics are picked when you begin"}"</span>
          </div>
          <div className="side-pick" style={{ marginBottom: "24px" }}>
            <button className={`side-btn for ${gauntletNextSide === "for" ? "selected" : ""}`} onClick={() => setGauntletNextSide("for")}>
              <span className="side-icon">✅</span>
              <div className="side-label">For</div>
              <div className="side-sub">I agree with this</div>
            </button>
            <button className={`side-btn against ${gauntletNextSide === "against" ? "selected" : ""}`} onClick={() => setGauntletNextSide("against")}>
              <span className="side-icon">❌</span>
              <div className="side-label">Against</div>
              <div className="side-sub">I disagree with this</div>
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" onClick={reset}>← Back</button>
            <button
              className="btn btn-primary"
              disabled={!gauntletNextSide}
              onClick={() => gauntletNextSide && beginGauntlet(gauntletNextSide)}
            >
              ⚔ Begin Gauntlet
            </button>
          </div>
        </div>
      )}

      {/* GAUNTLET BETWEEN */}
      {screen === "gauntlet-between" && verdict && (
        <div className="screen">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>
              Match {tournamentBotIndex + 1} of 6 Complete
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,10vw,60px)", color: verdict.won ? "var(--green)" : "var(--red)", letterSpacing: "3px", lineHeight: 1 }}>
              {verdict.won ? "VICTORY" : "DEFEATED"}
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-dim)", marginTop: "6px" }}>
              {tournamentMatchScores[tournamentMatchScores.length - 1]?.botIcon}{" "}
              {tournamentMatchScores[tournamentMatchScores.length - 1]?.botName} · Score: <span style={{ color: "var(--text)" }}>{verdict.avgScore}</span> · Rank <span className={`rank-badge rank-${verdict.rank}`} style={{ display: "inline-block", fontSize: "13px", padding: "1px 6px" }}>{verdict.rank}</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-dim)", marginTop: "4px", fontStyle: "italic" }}>
              "{verdict.judgeText.slice(0, 100)}{verdict.judgeText.length > 100 ? "…" : ""}"
            </div>
          </div>

          <p className="section-label">Gauntlet Progress</p>
          <div className="gauntlet-progress">
            {TOURNAMENT_BOT_ORDER.map((id, i) => {
              const bot = AI_OPPONENTS.find((a) => a.id === id)!;
              const matchScore = tournamentMatchScores[i];
              const isDone = i < tournamentBotIndex;
              const isCurrentDone = i === tournamentBotIndex;
              return (
                <div key={id} className={`gp-bot ${isDone ? "done" : ""} ${isCurrentDone ? "current-done" : ""}`}>
                  <span className="gp-icon">{bot.icon}</span>
                  {(isDone || isCurrentDone) && matchScore ? (
                    <>
                      <div className="gp-score" style={{ color: matchScore.won ? (isDone ? "var(--green)" : "var(--gold)") : "var(--red)" }}>{matchScore.score}</div>
                      <div className="gp-rank">{matchScore.rank}</div>
                    </>
                  ) : (
                    <div className="gp-score">—</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "10px" }}>
              Next — Opponent {tournamentBotIndex + 2} of 6
            </div>
            {(() => {
              const nextBot = AI_OPPONENTS.find((a) => a.id === TOURNAMENT_BOT_ORDER[tournamentBotIndex + 1])!;
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "36px" }}>{nextBot.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "17px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{nextBot.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "4px" }}>{nextBot.desc}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)", fontStyle: "italic" }}>
                      Topic: "{tournamentTopics[tournamentBotIndex + 1]?.text}"
                    </div>
                  </div>
                  <span className={`ai-diff diff-${nextBot.diff}`}>{nextBot.diffLabel}</span>
                </div>
              );
            })()}
          </div>

          <p className="section-label">Pick your side for the next match</p>
          <div className="side-pick" style={{ marginBottom: "20px" }}>
            <button className={`side-btn for ${gauntletNextSide === "for" ? "selected" : ""}`} onClick={() => setGauntletNextSide("for")}>
              <span className="side-icon">✅</span>
              <div className="side-label">For</div>
            </button>
            <button className={`side-btn against ${gauntletNextSide === "against" ? "selected" : ""}`} onClick={() => setGauntletNextSide("against")}>
              <span className="side-icon">❌</span>
              <div className="side-label">Against</div>
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" onClick={reset}>Abandon Gauntlet</button>
            <button
              className="btn btn-primary"
              disabled={!gauntletNextSide}
              onClick={() => gauntletNextSide && continueGauntlet(gauntletNextSide)}
            >
              Continue → Match {tournamentBotIndex + 2}
            </button>
          </div>
        </div>
      )}

      {/* GAUNTLET FINAL */}
      {screen === "gauntlet-final" && (() => {
        const totalAvg = tournamentMatchScores.length > 0 ? Math.round(tournamentMatchScores.reduce((s, m) => s + m.score, 0) / tournamentMatchScores.length) : 0;
        const wins = tournamentMatchScores.filter((m) => m.won).length;
        const overallRank = totalAvg >= 85 ? "S" : totalAvg >= 75 ? "A" : totalAvg >= 62 ? "B" : totalAvg >= 48 ? "C" : totalAvg >= 35 ? "D" : "F";
        return (
          <div className="screen">
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "8px" }}>Gauntlet Complete</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,12vw,80px)", letterSpacing: "4px", lineHeight: 1 }}>⚔ GAUNTLET</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,12vw,80px)", color: "var(--gold)", letterSpacing: "4px", lineHeight: 1, marginBottom: "16px" }}>COMPLETE</div>
              <div className={`rank-badge rank-${overallRank}`} style={{ margin: "0 auto 12px", fontSize: "28px", width: "64px", height: "64px", lineHeight: "64px" }}>{overallRank}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", letterSpacing: "2px", color: "var(--text-mid)" }}>
                {wins}/6 Wins · Avg Score {totalAvg}
              </div>
            </div>

            <p className="section-label">All Match Results</p>
            <div className="gauntlet-final-grid">
              {tournamentMatchScores.map((m, i) => (
                <div key={i} className={`gf-match ${m.won ? "won" : "lost"}`}>
                  <div className="gf-header">
                    <span className="gf-icon">{m.botIcon}</span>
                    <span className="gf-name">{m.botName.replace("The ", "")}</span>
                  </div>
                  <div className="gf-topic">"{m.topic}"</div>
                  <div className="gf-score-row">
                    <span className="gf-rank">{m.rank}</span>
                    <div className="gf-bar">
                      <div className="gf-fill" style={{ width: `${m.score}%`, background: getScoreColor(m.score) }} />
                    </div>
                    <span className="gf-score" style={{ color: getScoreColor(m.score) }}>{m.score}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => { setGauntletNextSide(null); setScreen("gauntlet-intro"); }}>⚔ Run Again</button>
              <button className="btn btn-ghost" onClick={reset}>Home</button>
            </div>
          </div>
        );
      })()}

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
            <div className="stat-card"><span className="val gold">{stats.bestScore || "—"}</span><span className="lbl">MASTEDEBATOR!</span></div>
          </div>

          <div className="tabs">
            <button className={`tab ${lbTab === "global" ? "active" : ""}`} onClick={() => setLbTab("global")}>Global</button>
            <button className={`tab ${lbTab === "weekly" ? "active" : ""}`} onClick={() => setLbTab("weekly")}>This Week</button>
          </div>

          {lbLoading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "3px", fontSize: "13px" }}>
              LOADING...
            </div>
          )}
          {!lbLoading && lbData.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-dim)" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", letterSpacing: "2px", marginBottom: "8px" }}>
                {lbTab === "weekly" ? "NO DEBATES THIS WEEK" : "NO PLAYERS YET"}
              </div>
              <div style={{ fontSize: "13px" }}>
                {lbTab === "weekly" ? "Be the first to debate this week and claim #1." : "Finish a debate to appear on the leaderboard."}
              </div>
            </div>
          )}
          {lbData.map((p, i) => {
            const isMe = player?.deviceId === p.deviceId;
            const AVATARS = ["🦁","🐺","🦊","🎯","⚡","🔥","🧠","🏆","👊","💎","🌊","🎭","🗡","🛡","🔬","⚖️","🐉","🦅","🎪","🌟"];
            const emoji = AVATARS[p.id % AVATARS.length];
            const displayName = p.username || ("GUEST#" + p.deviceId.slice(-4).toUpperCase());
            return (
              <div key={p.id} className={`lb-row${isMe ? " you" : ""}`}>
                <div className={`lb-rank${i < 3 ? " top" : ""}`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
                <div className="lb-avatar">{emoji}</div>
                <div className="lb-info">
                  <div className="lb-name">{displayName}{isMe ? " ◀ YOU" : ""}</div>
                  <div className="lb-meta" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span>{p.wins} win{p.wins !== 1 ? "s" : ""} · {p.totalDebates} debate{p.totalDebates !== 1 ? "s" : ""}</span>
                    {p.currentStreak >= 2 && (
                      <span className={`streak-badge${p.currentStreak >= 5 ? " hot" : ""}`}>
                        🔥 {p.currentStreak} streak
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="lb-score">{p.score.toLocaleString()}</div>
                  <div className="lb-wins">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    {shareToast && <div className="share-toast">{shareToast}</div>}
    {achToast && (
      <div className="achievement-toast">
        <span className="achievement-toast-icon">{achToast.icon}</span>
        <div>
          <div className="achievement-toast-label">Achievement Unlocked</div>
          <div className="achievement-toast-name">{achToast.name}</div>
        </div>
      </div>
    )}

    {showAuthModal && !authUser && (
      <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
        <div className="auth-box" onClick={(e) => e.stopPropagation()}>
          <button className="auth-close" onClick={() => setShowAuthModal(false)}>✕</button>
          <div className="auth-title">CLASH</div>
          <div className="auth-sub">Save your progress · Climb the leaderboard</div>
          <div className="auth-tabs">
            <button className={`auth-tab${authMode === "login" ? " active" : ""}`} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Login</button>
            <button className={`auth-tab${authMode === "register" ? " active" : ""}`} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Register</button>
          </div>
          <input
            className="auth-field"
            type="email"
            placeholder="email@example.com"
            value={authEmail}
            onChange={(e) => { setAuthEmail(e.target.value); setAuthError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") authMode === "login" ? loginFn() : registerFn(); }}
            autoFocus
          />
          <input
            className="auth-field"
            type="password"
            placeholder={authMode === "register" ? "Password (6+ chars)" : "Password"}
            value={authPassword}
            onChange={(e) => { setAuthPassword(e.target.value); setAuthError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") authMode === "login" ? loginFn() : registerFn(); }}
          />
          {authMode === "register" && (
            <input
              className="auth-field"
              type="text"
              placeholder="Username (optional)"
              maxLength={20}
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") registerFn(); }}
            />
          )}
          {authError && <div className="auth-err">{authError}</div>}
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "12px" }}
            disabled={authLoading}
            onClick={authMode === "login" ? loginFn : registerFn}
          >
            {authLoading ? "..." : authMode === "login" ? "Sign In →" : "Create Account →"}
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", fontSize: "12px", letterSpacing: "1px" }} onClick={() => setShowAuthModal(false)}>
            Continue as Guest
          </button>
        </div>
      </div>
    )}

    {showProfilePanel && authUser && (
      <>
        <div className="profile-overlay" onClick={() => setShowProfilePanel(false)} />
        <div className="profile-panel">
          <div className="pp-header">
            <div className="pp-avatar">{(player?.username || authUser.email)[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pp-name">{player?.username || authUser.email.split("@")[0]}</div>
              <div className="pp-email">{authUser.email}</div>
            </div>
          </div>
          <div className="pp-stats">
            <div className="pp-stat">
              <span className="pp-stat-val">{stats.debates}</span>
              <div className="pp-stat-lbl">Debates</div>
            </div>
            <div className="pp-stat">
              <span className="pp-stat-val" style={{ color: "var(--green)" }}>{stats.wins}</span>
              <div className="pp-stat-lbl">Wins</div>
            </div>
            <div className="pp-stat">
              <span className="pp-stat-val" style={{ color: "var(--gold)" }}>{stats.bestScore || "—"}</span>
              <div className="pp-stat-lbl">Best</div>
            </div>
          </div>
          <div className="pp-section">
            <div className="pp-section-lbl">Display Name</div>
            <div className="pp-username-row">
              <input
                className="pp-username-field"
                placeholder="YOURNAME"
                maxLength={20}
                value={usernameInput}
                onChange={(e) => { setUsernameInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "")); setUsernameError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSetUsername(); }}
              />
              <button className="pp-save-btn" onClick={handleSetUsername}>Save</button>
            </div>
            {usernameError && <div style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px" }}>{usernameError}</div>}
          </div>
          <button className="pp-logout" onClick={logoutFn}>Log Out</button>
        </div>
      </>
    )}

    {showUsernameModal && (
      <div className="username-modal" onClick={() => setShowUsernameModal(false)}>
        <div className="username-dialog" onClick={(e) => e.stopPropagation()}>
          <h3>SET YOUR NAME</h3>
          <p className="ud-sub">Claim your identity on the leaderboard. Appears next to all your results.</p>
          <input
            className="username-field"
            placeholder="YOURNAME"
            maxLength={20}
            value={usernameInput}
            onChange={(e) => { setUsernameInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "")); setUsernameError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSetUsername(); }}
            autoFocus
          />
          <div className="username-err">{usernameError}</div>
          <div className="username-hint">2–20 CHARS · LETTERS, NUMBERS, UNDERSCORES</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={handleSetUsername}>
              {player?.username ? "Update" : "Set Name"}
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowUsernameModal(false); setUsernameError(""); }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
