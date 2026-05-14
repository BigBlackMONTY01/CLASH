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

.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;padding-bottom:20px;border-bottom:1px solid var(--border);}
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
.btn-gold{background:var(--gold);color:#0a0a0a;font-weight:700;}
.btn-gold:hover{background:#f7d060;transform:translateY(-1px);box-shadow:0 8px 24px rgba(244,197,66,0.4);}
.btn-danger{background:#7a1a20;color:#fff;border:1px solid #991b1b;}
.btn-danger:hover{background:#991b1b;transform:translateY(-1px);}

.section-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;
text-transform:uppercase;color:var(--red);margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.section-label::after{content:'';flex:1;max-width:48px;height:1px;background:var(--red);opacity:0.35;}

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
padding:28px;margin-bottom:20px;overflow:hidden;position:relative;}
.verdict-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.verdict-card.win-card::before{background:var(--green);}
.verdict-card.lose-card::before{background:var(--red);}
.verdict-header{text-align:center;margin-bottom:28px;}
.verdict-title{font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:3px;}
.verdict-title.win{color:var(--green);}
.verdict-title.lose{color:var(--red);}
.verdict-sub{font-size:14px;color:var(--text-dim);margin-top:4px;}
.score-breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
.score-pill{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;text-align:center;}
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
.verdict-actions{display:flex;flex-direction:column;gap:8px;margin-top:4px;}
.verdict-actions-primary{display:flex;gap:8px;}
.verdict-actions-primary .btn{flex:1;font-size:13px;letter-spacing:2px;}
.verdict-actions-secondary{display:flex;gap:8px;}
.verdict-actions-secondary .btn{flex:1;font-size:11px;padding:9px 14px;letter-spacing:1.5px;}

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
  .verdict-actions-primary{flex-direction:row;}
  .verdict-actions-secondary .btn{flex:1;}

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
  .home-modes{gap:8px;}
  .home-mode-btn{padding:13px 8px 11px;}
  .home-mode-icon{font-size:18px;margin-bottom:5px;}
  .home-mode-title{font-size:11px;letter-spacing:1.5px;}
  .home-mode-sub{font-size:8px;}
  .setup-steps{margin-bottom:20px;}

  .forge-page{padding-bottom:24px;}
  .forge-page-title{font-size:24px;letter-spacing:3px;}
  .forge-section{margin-bottom:14px;}
  .forge-tone-grid{grid-template-columns:1fr 1fr;gap:7px;}
  .forge-tone-opt{padding:10px 14px;}
  .forge-tone-name{font-size:14px;}
  .forge-tone-desc{font-size:12px;}
  .forge-slider-lbl{width:68px;font-size:11px;}
  .forge-diff-opt{font-size:11px;padding:10px 2px;}
  .forge-memory-title{font-size:13px;}
  .forge-memory-desc{font-size:11px;}
}
@media (max-width:360px){
  .ai-grid{grid-template-columns:1fr 1fr;}
  .gauntlet-bots{grid-template-columns:repeat(2,1fr);}
  .home-modes{grid-template-columns:repeat(3,1fr);}
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

/* 1V1 BUTTON (legacy, kept for any residual use) */
.v1-glow-btn{position:relative;display:block;width:100%;max-width:400px;margin:0 auto;cursor:pointer;background:transparent;border:none;border-top:1.5px solid rgba(230,57,70,0.5);border-bottom:1.5px solid rgba(230,57,70,0.5);border-radius:0;padding:15px 32px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:all 0.2s;overflow:hidden;}
.v1-glow-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(230,57,70,0.08) 50%,transparent);transform:translateX(-120%);transition:transform 0.55s ease;}
.v1-glow-btn:hover::before{transform:translateX(120%);}
.v1-glow-btn:hover{border-color:rgba(230,57,70,0.85);}
.v1-glow-btn:active{transform:scale(0.98);}
.v1-text{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:14px;color:#fff;display:inline-block;}

/* HOME MODES GRID */
.home-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;margin-bottom:8px;}
.home-mode-btn{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 10px 14px;cursor:pointer;transition:all 0.2s;text-align:center;font-family:'Barlow Condensed',sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;}
.home-mode-btn:hover:not(:disabled){transform:translateY(-2px);}
.home-mode-btn.red{border-color:rgba(230,57,70,0.3);}
.home-mode-btn.red:hover{border-color:var(--red);background:rgba(230,57,70,0.05);}
.home-mode-btn.gold{border-color:rgba(244,197,66,0.25);}
.home-mode-btn.gold:hover{border-color:rgba(244,197,66,0.6);background:rgba(244,197,66,0.04);}
.home-mode-btn.purple{border-color:rgba(168,85,247,0.2);}
.home-mode-btn.purple:hover:not(:disabled){border-color:rgba(168,85,247,0.5);background:rgba(168,85,247,0.04);}
.home-mode-btn:disabled{opacity:0.38;cursor:not-allowed;}
.home-mode-icon{font-size:20px;margin-bottom:7px;line-height:1;}
.home-mode-title{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text);margin-bottom:3px;line-height:1;}
.home-mode-title.red{color:var(--red);}
.home-mode-title.gold{color:var(--gold);}
.home-mode-title.purple{color:#a855f7;}
.home-mode-sub{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);line-height:1.3;}

/* SETUP STEP INDICATOR */
.setup-steps{display:flex;align-items:center;margin-bottom:28px;gap:0;}
.setup-step-seg{flex:1;height:2px;background:var(--border);transition:background 0.3s;}
.setup-step-seg.done,.setup-step-seg.active{background:var(--red);}
.setup-step-node{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:1px;color:var(--text-dim);flex-shrink:0;transition:all 0.3s;}
.setup-step-node.done{border-color:var(--red);background:var(--red);color:#fff;}
.setup-step-node.active{border-color:var(--red);color:var(--red);}
.setup-step-label{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:4px;white-space:nowrap;}

/* Featured topic card */
@keyframes featuredSlideLeft{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes featuredSlideRight{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}
.featured-wrap{position:relative;margin-top:10px;overflow:hidden;border-radius:var(--radius);}
.featured-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;display:flex;align-items:center;gap:12px;touch-action:pan-y;user-select:none;}
.featured-card:hover{border-color:rgba(230,57,70,0.5);background:rgba(230,57,70,0.04);}
.featured-card.anim-left{animation:featuredSlideLeft 0.38s cubic-bezier(0.25,0.46,0.45,0.94);}
.featured-card.anim-right{animation:featuredSlideRight 0.38s cubic-bezier(0.25,0.46,0.45,0.94);}
.featured-left{flex:1;min-width:0;}
.featured-badge{display:inline-flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--red);background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.2);border-radius:3px;padding:2px 8px;margin-bottom:8px;}
.featured-topic-text{font-size:15px;font-weight:500;line-height:1.4;color:var(--text);}
.featured-cat{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.featured-meta-row{display:flex;align-items:center;gap:8px;margin-top:7px;}
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
.sound-btn{background:none;border:none;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color 0.18s,opacity 0.18s;color:var(--text-dim);-webkit-tap-highlight-color:transparent;flex-shrink:0;}.sound-btn:hover{color:var(--text);}.sound-btn.muted{color:var(--text-dim);opacity:0.4;}
/* Personal record */
.nemesis-card{background:var(--surface);border:1px solid rgba(230,57,70,0.3);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:10px;transition:border-color 0.2s;}
.nemesis-card:hover{border-color:rgba(230,57,70,0.6);}
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
.waiting-room{text-align:center;padding:8px 0;}
.v1-lobby-footer{display:flex;gap:8px;margin-top:28px;padding-top:16px;border-top:1px solid var(--border);}
.v1-lobby-footer .btn{flex:1;font-size:12px;padding:11px 8px;}
.v1-lobby-footer .btn-home{background:none;border:1px solid var(--border);color:var(--text-dim);}
.v1-lobby-footer .btn-home:hover{border-color:var(--text-mid);color:var(--text);}
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



/* 1V1 LOBBY TABS */
.v1-tab-row{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:4px;margin-bottom:20px;}
.v1-tab{flex:1;padding:10px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer;border:none;background:transparent;color:var(--text-dim);transition:all 0.2s;}
.v1-history-stats{display:flex;gap:16px;margin-bottom:16px;}
.v1-history-stat{text-align:center;}
.v1-history-stat-val{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--text);display:block;line-height:1;}
.v1-history-stat-val.green{color:var(--green);}
.v1-history-stat-val.red{color:var(--red);}
.v1-history-stat-val.gold{color:var(--gold);}
.v1-history-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:2px;}
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
.profile-panel{position:fixed;top:62px;right:16px;z-index:8001;width:280px;background:rgba(14,14,14,0.84);backdrop-filter:blur(28px) saturate(160%);-webkit-backdrop-filter:blur(28px) saturate(160%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.7),0 1px 0 rgba(255,255,255,0.06) inset;animation:ppIn 0.18s cubic-bezier(0.34,1.2,0.64,1);}
.pp-record-row{display:flex;gap:0;border-bottom:1px solid var(--border);}
.pp-record-cell{flex:1;text-align:center;padding:8px 6px;border-right:1px solid var(--border);}
.pp-record-cell:last-child{border-right:none;}
.pp-record-val{font-family:'Bebas Neue',sans-serif;font-size:19px;color:var(--text);display:block;line-height:1;}
.pp-record-lbl{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:1px;}
.pp-nemesis{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);background:rgba(230,57,70,0.04);}
.pp-nemesis-icon{font-size:22px;flex-shrink:0;}
.pp-nemesis-info{flex:1;min-width:0;}
.pp-nemesis-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text);}
.pp-nemesis-sub{font-size:10px;color:var(--text-dim);margin-top:1px;}
.pp-nemesis-btn{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--red);background:none;border:1px solid rgba(230,57,70,0.35);border-radius:6px;padding:5px 9px;cursor:pointer;flex-shrink:0;transition:all 0.18s;}
.pp-nemesis-btn:hover{border-color:var(--red);background:rgba(230,57,70,0.08);}
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

/* WAITING ROOM HOST SETUP */
.v1-setup-block{margin-top:20px;border-top:1px solid var(--border);padding-top:16px;}
.v1-setup-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;}
.v1-rounds-row{display:flex;gap:6px;margin-bottom:4px;flex-wrap:wrap;}
.v1-rounds-btn{font-family:'Bebas Neue',sans-serif;font-size:18px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface2);color:var(--text-dim);cursor:pointer;transition:all 0.18s;letter-spacing:1px;}
.v1-rounds-btn:hover{border-color:var(--text-mid);color:var(--text);}
.v1-rounds-btn.active{border-color:var(--red);background:rgba(230,57,70,0.12);color:var(--red);}
.v1-topic-pool{display:flex;flex-direction:column;gap:6px;}
.v1-topic-opt{padding:10px 13px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all 0.18s;line-height:1.4;}
.v1-topic-opt:hover{border-color:var(--text-mid);}
.v1-topic-opt.active{border-color:var(--red);background:rgba(230,57,70,0.06);}
.v1-topic-opt-cat{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;}
.v1-topic-opt-text{font-size:13px;color:var(--text);line-height:1.4;}
.v1-topic-shuffle{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);background:none;border:none;cursor:pointer;padding:6px 0 2px;transition:color 0.18s;}
.v1-topic-shuffle:hover{color:var(--text);}
.v1-opp-arg-reveal{margin-top:10px;animation:fadeIn 0.3s ease;}

/* SCREEN TITLES */
.screen-title{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:3px;text-align:center;margin-bottom:24px;color:var(--text);}
.screen-title.gold{color:var(--gold);}

/* TOPIC PREVIEW CARD */
.topic-preview-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:24px;}
.topic-preview-card .tpc-label{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.topic-preview-card .tpc-text{font-size:17px;font-weight:500;line-height:1.4;color:var(--text);}

/* GAUNTLET INTRO HEADER */
.gauntlet-intro-header{text-align:center;margin-bottom:28px;}
.gauntlet-intro-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.gauntlet-intro-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,12vw,72px);letter-spacing:4px;line-height:1;margin:0;}
.gauntlet-intro-sub{color:var(--text-dim);margin-top:10px;font-size:15px;line-height:1.5;}

/* NEXT OPPONENT CARD */
.next-opp-card{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid rgba(244,197,66,0.25);border-radius:var(--radius);padding:14px 16px;margin-bottom:16px;}
.next-opp-icon{font-size:36px;flex-shrink:0;}
.next-opp-info{flex:1;min-width:0;}
.next-opp-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;}
.next-opp-desc{font-size:13px;color:var(--text-dim);margin-bottom:4px;line-height:1.4;}
.next-opp-topic{font-size:12px;color:var(--text-dim);font-style:italic;}
.v1-opp-typing{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-top:10px;}
.v1-opp-typing-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:var(--text-dim);}
.v1-opp-typing.is-typing{border-color:rgba(244,197,66,0.35);}
.v1-opp-typing-label.is-typing{color:var(--gold);}
@keyframes typingBounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-4px);}}
.typing-dot{width:5px;height:5px;border-radius:50%;background:var(--gold);display:inline-block;animation:typingBounce 1.2s ease-in-out infinite;}
.typing-dot:nth-child(2){animation-delay:0.15s;}
.typing-dot:nth-child(3){animation-delay:0.3s;}
.v1-typing-banner{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:var(--gold);display:flex;align-items:center;gap:6px;margin-bottom:6px;opacity:0.85;}

/* TYPING STRENGTH METER */
.strength-wrap{margin-bottom:8px;}
.strength-bar-track{height:3px;background:var(--surface2);border-radius:2px;overflow:hidden;margin-bottom:6px;}
.strength-bar-fill{height:100%;border-radius:2px;transition:width 0.35s ease,background-color 0.35s ease;}
.strength-label-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.strength-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
.strength-pct{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1px;}

/* LIVE STATS BAR */
.live-stats-bar{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:28px;}
.live-stat-item{padding:13px 10px;text-align:center;border-right:1px solid var(--border);}
.live-stat-item:last-child{border-right:none;}
.live-stat-val{font-family:'Bebas Neue',sans-serif;font-size:23px;letter-spacing:1px;line-height:1;color:var(--text);}
.live-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:4px;}
.live-pulse{display:inline-block;width:5px;height:5px;background:var(--green);border-radius:50%;margin-right:4px;vertical-align:middle;animation:blink 1.4s ease infinite;}

/* XP BREAKDOWN */
.xp-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-top:12px;}
.xp-card-header{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;}
.xp-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.xp-row:nth-child(2){animation:slideRight 0.4s 0.05s ease both;}
.xp-row:nth-child(3){animation:slideRight 0.4s 0.15s ease both;}
.xp-row:nth-child(4){animation:slideRight 0.4s 0.25s ease both;}
.xp-row:nth-child(5){animation:slideRight 0.4s 0.35s ease both;}
.xp-lbl{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:var(--text-dim);}
.xp-val{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;color:var(--green);}
.xp-total{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:10px;margin-top:4px;}
.xp-total-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;}
.xp-total-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green);letter-spacing:1px;}
@keyframes slideRight{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}

/* SIGNATURE STYLE */
.sig-card{padding:12px 14px;background:rgba(230,57,70,0.05);border:1px solid rgba(230,57,70,0.18);border-radius:var(--radius);margin-top:10px;display:flex;align-items:center;gap:12px;}
.sig-icon{font-size:22px;flex-shrink:0;}
.sig-name{font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:1px;color:var(--red);}
.sig-desc{font-size:11px;color:var(--text-dim);margin-top:1px;letter-spacing:0.2px;}

/* ARGUMENT DNA */
.dna-card{margin-top:12px;}
.dna-header{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);margin-bottom:10px;}
.dna-row{display:flex;align-items:center;gap:10px;margin-bottom:7px;}
.dna-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;color:var(--text-dim);width:82px;flex-shrink:0;}
.dna-track{flex:1;height:5px;background:var(--surface2);border-radius:3px;overflow:hidden;}
.dna-fill{height:100%;border-radius:3px;transition:width 0.9s cubic-bezier(0.34,1.1,0.64,1);}
.dna-num{font-family:'Bebas Neue',sans-serif;font-size:13px;width:28px;text-align:right;flex-shrink:0;}

/* RANKED TIER */
.tier-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;}
.tier-bronze{background:rgba(176,122,87,0.12);border:1px solid rgba(176,122,87,0.35);color:#c49a6c;}
.tier-silver{background:rgba(160,170,180,0.12);border:1px solid rgba(160,170,180,0.35);color:#a0aab4;}
.tier-gold{background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.35);color:#d4af37;}
.tier-diamond{background:rgba(90,180,255,0.12);border:1px solid rgba(90,180,255,0.35);color:#5ab4ff;}
.tier-clash-master{background:rgba(230,57,70,0.1);border:1px solid rgba(230,57,70,0.4);color:var(--red);box-shadow:0 0 10px rgba(230,57,70,0.15);}

/* ROUND FLASH OVERLAY */
.round-flash{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;pointer-events:none;background:rgba(0,0,0,0.65);animation:rfade 0.9s ease forwards;}
.round-flash-text{font-family:'Bebas Neue',sans-serif;font-size:74px;letter-spacing:8px;color:#fff;text-shadow:0 0 60px rgba(230,57,70,0.95),0 0 20px rgba(230,57,70,0.5);animation:rpunch 0.9s ease forwards;}
.round-flash-sub{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-top:6px;text-align:center;}
@keyframes rfade{0%{opacity:0;}12%{opacity:1;}72%{opacity:1;}100%{opacity:0;}}
@keyframes rpunch{0%{transform:scale(1.7);opacity:0;}12%{transform:scale(1);opacity:1;}72%{transform:scale(1);opacity:1;}100%{transform:scale(0.75);opacity:0;}}

/* COACH MODE (post-loss tip) */
.coach-tip{padding:11px 14px;background:rgba(0,119,255,0.06);border:1px solid rgba(0,119,255,0.2);border-radius:var(--radius);margin-top:10px;display:flex;gap:10px;align-items:flex-start;}
.coach-tip-icon{font-size:18px;flex-shrink:0;margin-top:1px;}
.coach-tip-text{font-size:13px;color:var(--text-mid);line-height:1.45;}
.coach-tip-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin-bottom:4px;}

/* PROPAGANDA TAGS */
.prop-tag{display:inline;border-radius:2px;padding:0 2px;cursor:help;position:relative;}
.prop-tag.solid{background:rgba(34,197,94,0.12);color:var(--green);}
.prop-tag.fallacy{background:rgba(230,57,70,0.15);color:var(--red);text-decoration:underline dotted;}
.prop-tag.weak_evidence{background:rgba(244,197,66,0.15);color:var(--gold);}
.prop-tag.emotional_bait{background:rgba(168,85,247,0.15);color:#a855f7;}
.prop-tag.killer_point{background:rgba(0,119,255,0.15);color:var(--blue);font-weight:600;}
.prop-legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius);}
.prop-legend-item{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:1px;padding:2px 6px;border-radius:2px;display:flex;align-items:center;gap:4px;}
.prop-label{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px;margin-top:8px;}

/* MMR DISPLAY */
.mmr-chip{display:inline-flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;padding:3px 10px;border-radius:100px;border:1px solid var(--border);color:var(--text-dim);background:transparent;}
.mmr-chip.bronze{border-color:rgba(176,122,87,0.5);color:#c49a6c;}
.mmr-chip.silver{border-color:rgba(160,170,180,0.5);color:#a0aab4;}
.mmr-chip.gold{border-color:rgba(212,175,55,0.5);color:#d4af37;}
.mmr-chip.diamond{border-color:rgba(90,180,255,0.5);color:#5ab4ff;}
.mmr-chip.clash-master{border-color:rgba(230,57,70,0.5);color:var(--red);}
.mmr-delta{font-family:'Bebas Neue',sans-serif;font-size:16px;animation:mmrPop 0.6s cubic-bezier(0.34,1.56,0.64,1);}
@keyframes mmrPop{from{transform:scale(0.5) translateY(6px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
.mmr-update-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-top:12px;animation:fadeIn 0.4s ease;}
.mmr-rankup{border-color:var(--gold);background:rgba(244,197,66,0.06);animation:rankUpGlow 1.2s ease;}
@keyframes rankUpGlow{0%,100%{box-shadow:none;}50%{box-shadow:0 0 24px 4px rgba(244,197,66,0.3);}}

/* SHIELD INDICATOR */
.shield-bar{display:flex;gap:4px;align-items:center;margin-top:6px;}
.shield-pip{font-size:14px;transition:filter 0.3s;}
.shield-pip.empty{filter:grayscale(1);opacity:0.25;}
.shield-row{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius);margin-top:8px;}
.shield-label{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--green);}
.shield-consumed{background:rgba(230,57,70,0.06);border-color:rgba(230,57,70,0.2);}
.shield-consumed .shield-label{color:var(--red);}

/* DYNASTY CARD */
.dynasty-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:6px;}
.dynasty-opp{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;flex:1;}
.dynasty-record{font-family:'Bebas Neue',sans-serif;font-size:16px;}
.dynasty-record .dw{color:var(--green);}
.dynasty-record .dl{color:var(--red);}

/* GHOST REVEAL */
.ghost-overlay{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.3s ease;}
.ghost-modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;}
.ghost-modal-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:3px;margin-bottom:6px;}
.ghost-arg-entry{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;}
.ghost-arg-who{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px;}
.ghost-arg-text{font-size:13px;color:var(--text-mid);line-height:1.5;}
.ghost-arg-score{font-family:'Bebas Neue',sans-serif;font-size:16px;margin-top:4px;}

/* DASHBOARD SCREEN */
.dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:20px;}
.dash-stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;text-align:center;}
.dash-stat-val{font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:1;margin-bottom:2px;}
.dash-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.dash-section-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;margin-bottom:12px;margin-top:20px;}
.dash-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.dash-action{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:all 0.2s;text-align:center;}
.dash-action:hover{transform:translateY(-2px);border-color:var(--text-dim);}
.dash-action.primary{border-color:rgba(230,57,70,0.4);}
.dash-action.primary:hover{border-color:var(--red);}
.dash-action-icon{font-size:26px;margin-bottom:8px;}
.dash-action-label{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;}
.dash-action-sub{font-size:11px;color:var(--text-dim);margin-top:2px;}
.recent-match-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:6px;}
.rm-result{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;padding:2px 7px;border-radius:3px;flex-shrink:0;}
.rm-result.win{background:rgba(34,197,94,0.1);color:var(--green);}
.rm-result.loss{background:rgba(230,57,70,0.1);color:var(--red);}
.rm-topic{flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.rm-score{font-family:'Bebas Neue',sans-serif;font-size:17px;color:var(--text-dim);flex-shrink:0;}

/* COACH FULL PANEL */
.coach-panel{background:rgba(0,119,255,0.05);border:1px solid rgba(0,119,255,0.18);border-radius:var(--radius);padding:16px;margin-top:12px;}
.coach-panel-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--blue);margin-bottom:14px;display:flex;align-items:center;gap:7px;}
.coach-row{margin-bottom:12px;}
.coach-row-label{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;}
.coach-row-label.worked{color:var(--green);}
.coach-row-label.failed{color:var(--red);}
.coach-row-label.drill{color:var(--gold);}
.coach-row-text{font-size:13px;color:var(--text-mid);line-height:1.5;}

/* USER CHIP */
.user-chip{display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:4px 10px 4px 4px;cursor:pointer;transition:all 0.2s;}
.user-chip:hover{border-color:var(--text-dim);}
.user-chip-av{width:22px;height:22px;border-radius:50%;background:var(--red-dim);border:1px solid rgba(230,57,70,0.4);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--red);font-family:'Barlow Condensed',sans-serif;flex-shrink:0;}
.user-chip-name{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* PLAYER COMMAND STRIP */
.player-cmd-strip{display:flex;align-items:center;justify-content:center;gap:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 0;margin-top:16px;margin-bottom:4px;}
.pcs-block{display:flex;flex-direction:column;align-items:center;flex:1;}
.pcs-val{font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;color:var(--text);}
.pcs-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:2px;}
.pcs-divider{width:1px;height:36px;background:var(--border);flex-shrink:0;}

/* FEED SHOW MORE */
.feed-show-more{width:100%;background:none;border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius) var(--radius);padding:8px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);cursor:pointer;transition:all 0.2s;}
.feed-show-more:hover{color:var(--text);background:var(--surface2);}

/* RADAR CHART */
.radar-wrap{display:flex;align-items:center;gap:20px;background:var(--surface2);border-radius:var(--radius);padding:16px;margin-bottom:12px;}
.radar-stats{flex:1;}
.radar-stat-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.radar-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.radar-stat-val{font-family:'Bebas Neue',sans-serif;font-size:16px;}

/* MATCH DETAILS TOGGLE */
.match-details-btn{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:space-between;margin-top:10px;}
.match-details-btn:hover{color:var(--text);border-color:var(--text-dim);}
.match-details-panel{margin-top:8px;animation:fadeIn 0.25s ease;}

/* COACH REVEAL BUTTON */
.coach-reveal-btn{width:100%;background:rgba(0,119,255,0.07);border:1px solid rgba(0,119,255,0.25);border-radius:var(--radius);padding:12px 16px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--blue);cursor:pointer;transition:all 0.2s;margin-top:12px;}
.coach-reveal-btn:hover{background:rgba(0,119,255,0.12);border-color:rgba(0,119,255,0.4);}

/* MIRROR MATCH BUTTON */
.mirror-btn{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);border-radius:var(--radius);padding:10px 24px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;cursor:pointer;transition:all 0.2s;margin-top:8px;}
.mirror-btn:hover{background:rgba(168,85,247,0.15);border-color:#a855f7;}
.mirror-btn:disabled{opacity:0.35;cursor:not-allowed;}

/* AUTO-GROW TEXTAREA */
.debate-input{min-height:90px;resize:none;overflow-y:auto;}

/* SHIELD ANIMATED */
@keyframes shieldPulse{0%,100%{filter:drop-shadow(0 0 4px rgba(34,197,94,0.4));}50%{filter:drop-shadow(0 0 10px rgba(34,197,94,0.8));}}
.shield-pip{animation:shieldPulse 2s ease-in-out infinite;}
.shield-pip.empty{animation:none;filter:none;opacity:0.2;}

/* DEVIL'S ADVOCATE TOGGLE */
.da-toggle{display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(230,57,70,0.06);border:1px solid rgba(230,57,70,0.2);border-radius:var(--radius);cursor:pointer;transition:all 0.2s;margin-bottom:12px;user-select:none;}
.da-toggle.active{background:rgba(230,57,70,0.14);border-color:rgba(230,57,70,0.5);}
.da-toggle-knob{width:36px;height:20px;border-radius:10px;background:var(--border);border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0;pointer-events:none;}
.da-toggle-knob::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform 0.2s;}
.da-toggle.active .da-toggle-knob{background:var(--red);}
.da-toggle.active .da-toggle-knob::after{transform:translateX(16px);}
.da-toggle-label{flex:1;}
.da-toggle-title{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);transition:color 0.2s;}
.da-toggle.active .da-toggle-title{color:var(--red);}
.da-toggle-sub{font-size:11px;color:var(--text-dim);margin-top:2px;line-height:1.4;}

/* UTILITY TYPOGRAPHY CLASSES */
.eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--text-dim);}
.eyebrow-sm{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text-dim);}
.bebas-title{font-family:'Bebas Neue',sans-serif;letter-spacing:3px;text-align:center;margin-bottom:20px;}

/* WHISPER MODE */
.whisper-btn{display:inline-flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:3px 9px;border-radius:100px;border:1px solid var(--border);color:var(--text-dim);background:transparent;cursor:pointer;transition:all 0.2s;}
.whisper-btn:hover{border-color:rgba(168,85,247,0.5);color:#a855f7;}
.whisper-btn.active{border-color:rgba(168,85,247,0.6);background:rgba(168,85,247,0.1);color:#a855f7;}
.whisper-feedback{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:var(--radius);padding:10px 14px;margin-top:8px;animation:fadeIn 0.3s ease;}
.whisper-feedback-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;margin-bottom:4px;}
.whisper-feedback-text{font-size:13px;color:var(--text-mid);line-height:1.5;}

/* ARGUMENT GRAVEYARD */
.graveyard-section{margin-top:10px;background:rgba(230,57,70,0.04);border:1px solid rgba(230,57,70,0.15);border-radius:var(--radius);overflow:hidden;}
.graveyard-header{display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid rgba(230,57,70,0.12);background:rgba(230,57,70,0.06);}
.graveyard-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--red);}
.graveyard-entry{padding:9px 14px;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;align-items:flex-start;gap:8px;}
.graveyard-entry:last-child{border-bottom:none;}
.graveyard-skull{font-size:13px;flex-shrink:0;margin-top:1px;opacity:0.6;}
.graveyard-text{font-size:12px;color:var(--text-dim);line-height:1.5;font-style:italic;flex:1;min-width:0;}
.graveyard-score{font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--red);flex-shrink:0;}

/* STREAK CONTINUE BANNER */
.streak-banner{background:linear-gradient(135deg,rgba(244,197,66,0.08),rgba(230,57,70,0.06));border:1px solid rgba(244,197,66,0.3);border-radius:var(--radius);padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;animation:fadeIn 0.5s ease;}
.streak-banner-fire{font-size:26px;flex-shrink:0;}
.streak-banner-text{flex:1;}
.streak-banner-count{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold);letter-spacing:2px;line-height:1.1;}
.streak-banner-sub{font-size:11px;color:var(--text-dim);margin-top:2px;}

/* TRASH TALK BUBBLE */
.trash-bubble{position:fixed;top:64px;right:16px;background:rgba(10,10,14,0.96);border:1px solid rgba(0,119,255,0.35);border-radius:4px 12px 12px 12px;padding:10px 14px;max-width:190px;font-size:13px;color:var(--text-mid);line-height:1.4;z-index:500;box-shadow:0 8px 24px rgba(0,0,0,0.5);animation:trashIn 0.35s cubic-bezier(0.34,1.4,0.64,1);}
@keyframes trashIn{from{opacity:0;transform:scale(0.8) translateX(20px);}to{opacity:1;transform:scale(1) translateX(0);}}
.trash-bubble-who{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#60a5fa;margin-bottom:4px;}
.v1-send-bubble{position:fixed;bottom:120px;left:16px;background:rgba(12,8,24,0.97);border:1px solid rgba(168,85,247,0.45);border-radius:4px 12px 12px 12px;padding:10px 14px;max-width:220px;z-index:500;box-shadow:0 8px 28px rgba(168,85,247,0.15),0 4px 16px rgba(0,0,0,0.6);animation:trashIn 0.35s cubic-bezier(0.34,1.4,0.64,1);}
.v1-send-bubble-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;margin-bottom:5px;display:block;}
.v1-send-bubble-text{font-size:13px;color:var(--text);line-height:1.4;display:block;margin-bottom:6px;}
.v1-send-copy-btn{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:4px;padding:3px 10px;cursor:pointer;transition:all 0.15s;}
.v1-send-copy-btn:hover{background:rgba(168,85,247,0.2);}

/* V1 LASER ARENA BORDER */
.v1-laser-arena{}
.v1-round-timer{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:var(--red);line-height:1;transition:color 0.3s;}
.v1-round-timer.critical{animation:timerGlow 0.6s ease-in-out infinite alternate;}
@keyframes timerGlow{from{color:#ff3333;text-shadow:0 0 8px rgba(230,57,70,0.5);}to{color:#ff0000;text-shadow:0 0 20px rgba(230,57,70,1),0 0 36px rgba(230,57,70,0.6);}}

/* MIRROR MATCH LOCK */
.mirror-locked-overlay{position:relative;}
.mirror-locked-overlay::after{content:'🔒 5 DEBATES REQUIRED';position:absolute;inset:0;background:rgba(0,0,0,0.6);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);pointer-events:none;}

/* AI CARD ENTRANCE + POP */
@keyframes aiCardIn{from{opacity:0;transform:translateY(10px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
.ai-card{animation:aiCardIn 0.28s ease both;}
.ai-card:nth-child(1){animation-delay:0.02s;}.ai-card:nth-child(2){animation-delay:0.06s;}.ai-card:nth-child(3){animation-delay:0.10s;}.ai-card:nth-child(4){animation-delay:0.14s;}.ai-card:nth-child(5){animation-delay:0.18s;}.ai-card:nth-child(6){animation-delay:0.22s;}.ai-card:nth-child(7){animation-delay:0.26s;}
.ai-card.selected{border-color:var(--red) !important;background:rgba(230,57,70,0.09) !important;transform:translateY(-3px) scale(1.02) !important;box-shadow:0 8px 24px rgba(230,57,70,0.18);}

/* RIVAL CHIP */
.rival-chip-wrap{display:flex;justify-content:center;margin-top:8px;}
.rival-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px 4px 8px;border-radius:100px;background:rgba(244,197,66,0.08);border:1px solid rgba(244,197,66,0.28);font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--gold);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
.rival-chip:hover{background:rgba(244,197,66,0.14);border-color:rgba(244,197,66,0.5);}

/* WAR ROOM MODAL */
.war-room-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.85);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease;}
.war-room-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:26px 22px;max-width:400px;width:100%;max-height:80vh;overflow-y:auto;}
.war-room-title{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:4px;margin-bottom:4px;}
.war-room-sub{font-size:13px;color:var(--text-dim);margin-bottom:18px;line-height:1.5;}
.war-room-tip{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);}
.war-room-tip:last-of-type{border-bottom:none;padding-bottom:0;}
.war-room-tip-icon{font-size:17px;flex-shrink:0;margin-top:1px;}
.war-room-tip-text{font-size:13px;color:var(--text-mid);line-height:1.5;}
.war-room-tip-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--red);margin-bottom:3px;}

/* CUSTOM SHARE OPPONENT */
.custom-share-row{display:flex;align-items:center;gap:8px;margin-top:10px;}
.custom-share-btn{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:100px;color:#a855f7;cursor:pointer;transition:all 0.2s;}
.custom-share-btn:hover{background:rgba(168,85,247,0.16);border-color:rgba(168,85,247,0.5);}

/* CARD REVEAL OVERLAY */
.card-reveal-overlay{position:fixed;inset:0;z-index:9900;background:rgba(0,0,0,0.94);backdrop-filter:blur(10px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.4s ease;}
.card-reveal-scene{perspective:900px;width:220px;height:310px;margin-bottom:20px;}
.card-reveal-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:cardFlip 0.75s 0.5s cubic-bezier(0.34,1.1,0.64,1) both;}
@keyframes cardFlip{from{transform:rotateY(180deg) scale(0.75);}to{transform:rotateY(0) scale(1);}}
.card-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;overflow:hidden;}
.card-back{background:linear-gradient(135deg,#0d0d1a,#111);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:rgba(230,57,70,0.3);transform:rotateY(180deg);}
.card-front{display:flex;flex-direction:column;background:linear-gradient(160deg,#0e0e1c,#111120);border:2px solid var(--card-border,var(--border));box-shadow:0 0 30px var(--card-glow,rgba(80,80,80,0.2));}
.card-rarity-common{--card-border:rgba(100,100,100,0.5);--card-glow:rgba(100,100,100,0.15);--card-color:#888;}
.card-rarity-uncommon{--card-border:rgba(34,197,94,0.55);--card-glow:rgba(34,197,94,0.2);--card-color:var(--green);}
.card-rarity-rare{--card-border:rgba(0,119,255,0.65);--card-glow:rgba(0,119,255,0.25);--card-color:#60a5fa;}
.card-rarity-epic{--card-border:rgba(168,85,247,0.75);--card-glow:rgba(168,85,247,0.3);--card-color:#c084fc;}
.card-rarity-legendary{--card-border:rgba(244,197,66,0.85);--card-glow:rgba(244,197,66,0.4);--card-color:var(--gold);}
.card-header-band{padding:9px 12px 8px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;}
.card-rarity-badge{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;padding:2px 6px;border-radius:100px;border:1px solid var(--card-border,var(--border));color:var(--card-color,#888);}
.card-power-num{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:1px;color:var(--card-color,#888);}
.card-art{flex:1;display:flex;align-items:center;justify-content:center;font-size:52px;position:relative;}
.card-art::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,var(--card-glow,rgba(80,80,80,0.1)) 0%,transparent 70%);}
.card-body{padding:10px 12px;}
.card-title{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:2px;line-height:1.15;margin-bottom:5px;color:var(--text);}
.card-desc{font-size:10px;color:var(--text-dim);line-height:1.5;}
.card-footer{padding:7px 12px 9px;border-top:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;}
.card-type-badge{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);}
.card-clash-logo{font-family:'Bebas Neue',sans-serif;font-size:10px;letter-spacing:3px;color:rgba(230,57,70,0.3);}
.card-reveal-info{text-align:center;}
.card-reveal-new-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--text-dim);margin-bottom:5px;}
.card-reveal-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;margin-bottom:3px;}
.card-reveal-rarity-lbl{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;}
.card-reveal-rarity-common{color:#888;}.card-reveal-rarity-uncommon{color:var(--green);}.card-reveal-rarity-rare{color:#60a5fa;}.card-reveal-rarity-epic{color:#c084fc;}.card-reveal-rarity-legendary{color:var(--gold);}
@keyframes legendaryGlow{0%,100%{box-shadow:0 0 20px var(--card-glow);}50%{box-shadow:0 0 50px var(--card-glow);}}
.card-rarity-legendary .card-front,.card-rarity-epic .card-front{animation:legendaryGlow 2s ease-in-out infinite 1.2s;}

/* PROFILE PANEL TABS */
.pp-tab-row{display:flex;border-bottom:1px solid var(--border);}
.pp-tab{flex:1;padding:9px 4px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;color:var(--text-dim);transition:all 0.18s;}
.pp-tab.active{color:var(--red);border-bottom-color:var(--red);}
.pp-tab-content{padding:12px 14px;max-height:260px;overflow-y:auto;}
.pp-cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
.pp-card-mini{background:var(--surface2);border:1.5px solid var(--border);border-radius:8px;padding:9px 6px;text-align:center;transition:transform 0.2s;}
.pp-card-mini:hover{transform:translateY(-2px);}
.pp-card-mini.rarity-uncommon{border-color:rgba(34,197,94,0.5);}
.pp-card-mini.rarity-rare{border-color:rgba(0,119,255,0.5);}
.pp-card-mini.rarity-epic{border-color:rgba(168,85,247,0.6);}
.pp-card-mini.rarity-legendary{border-color:rgba(244,197,66,0.7);background:rgba(244,197,66,0.04);}
.pp-card-mini-icon{font-size:18px;margin-bottom:3px;}
.pp-card-mini-title{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);line-height:1.3;word-break:break-word;}
.pp-card-mini-power{font-family:'Bebas Neue',sans-serif;font-size:13px;margin-top:2px;}

/* FLOATING FORGE RIVAL BUTTON */
.float-rival-btn{position:fixed;bottom:24px;right:16px;z-index:600;display:flex;align-items:center;gap:7px;padding:10px 16px;background:rgba(12,8,24,0.96);border:1px solid rgba(168,85,247,0.4);border-radius:100px;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c084fc;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(168,85,247,0.12),0 8px 32px rgba(0,0,0,0.5);backdrop-filter:blur(12px);animation:floatRivalPulse 3s ease-in-out infinite;}
@keyframes floatRivalPulse{0%,100%{box-shadow:0 4px 18px rgba(168,85,247,0.12),0 8px 32px rgba(0,0,0,0.5);}50%{box-shadow:0 4px 28px rgba(168,85,247,0.3),0 8px 40px rgba(0,0,0,0.6);}}
.float-rival-btn:hover{border-color:rgba(168,85,247,0.7);color:#d8b4fe;transform:scale(1.04);}

/* FORGE RIVAL MODAL */
.forge-rival-modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px 24px;width:min(520px,94vw);max-height:82vh;overflow-y:auto;}
.forge-rival-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:var(--red);margin:0 0 4px;}
.forge-rival-sub{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1px;color:var(--text-dim);margin:0 0 20px;line-height:1.5;}
.forge-opp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;}
.forge-opp-card{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:14px 12px;cursor:pointer;text-align:left;transition:all 0.18s;display:flex;flex-direction:column;gap:4px;}
.forge-opp-card:hover{border-color:rgba(230,57,70,0.45);background:rgba(230,57,70,0.05);transform:translateY(-1px);}
.forge-opp-icon{font-size:22px;line-height:1;margin-bottom:2px;}
.forge-opp-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text);font-weight:600;}
.forge-opp-record{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:var(--text-dim);}
.forge-close-btn{background:none;border:1px solid var(--border);color:var(--text-dim);font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:9px 20px;border-radius:6px;cursor:pointer;transition:all 0.15s;width:100%;}
.forge-close-btn:hover{border-color:rgba(255,255,255,0.2);color:var(--text);}

/* FORGE RIVAL FULL PAGE */
.forge-page{padding-bottom:40px;width:100%;overflow-x:hidden;}
.forge-header{display:flex;align-items:center;gap:14px;padding:0 0 20px;}
.forge-page-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:#a855f7;margin:0;}
.forge-page-sub{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1px;color:var(--text-mid);margin:2px 0 0;}
.forge-section{margin-bottom:16px;}
.forge-section-lbl{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text-mid);margin-bottom:8px;display:block;}
.forge-avatar-grid{display:flex;flex-wrap:wrap;gap:6px;overflow-x:auto;}
.forge-avatar-opt{font-size:22px;padding:5px 9px;border-radius:8px;background:rgba(255,255,255,0.03);border:1.5px solid transparent;cursor:pointer;transition:all 0.15s;line-height:1;}
.forge-avatar-opt.selected{border-color:#a855f7;background:rgba(168,85,247,0.12);}
.forge-avatar-opt:hover{border-color:rgba(255,255,255,0.2);}
.forge-tone-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.forge-tone-opt{padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;cursor:pointer;text-align:left;transition:all 0.18s;min-width:0;width:100%;}
.forge-tone-opt.selected{border-color:rgba(168,85,247,0.6);background:rgba(168,85,247,0.08);}
.forge-tone-opt:hover{border-color:rgba(255,255,255,0.2);}
.forge-tone-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--text);font-weight:700;display:block;word-break:break-word;}
.forge-tone-desc{font-family:'Barlow',sans-serif;font-size:12px;color:var(--text-mid);margin-top:3px;display:block;line-height:1.4;word-break:break-word;}
.forge-slider-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-right:24px;}
.forge-slider-lbl{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-mid);width:76px;flex-shrink:0;}
.forge-slider{flex:1;min-width:0;-webkit-appearance:none;appearance:none;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;outline:none;cursor:pointer;}
.forge-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#a855f7;cursor:pointer;border:none;box-shadow:0 0 6px rgba(168,85,247,0.4);}
.forge-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#a855f7;cursor:pointer;border:none;}
.forge-slider-val{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);width:28px;text-align:right;flex-shrink:0;}
.forge-diff-row{display:flex;gap:6px;}
.forge-diff-opt{flex:1;padding:10px 4px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--text-mid);cursor:pointer;text-align:center;transition:all 0.15s;}
.forge-diff-opt.sel-easy{border-color:#22c55e;color:#22c55e;background:rgba(34,197,94,0.08);}
.forge-diff-opt.sel-medium{border-color:#3b82f6;color:#3b82f6;background:rgba(59,130,246,0.08);}
.forge-diff-opt.sel-hard{border-color:#f97316;color:#f97316;background:rgba(249,115,22,0.08);}
.forge-diff-opt.sel-extreme{border-color:var(--red);color:var(--red);background:rgba(230,57,70,0.08);}
.forge-memory-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;gap:12px;}
.forge-memory-info{flex:1;min-width:0;}
.forge-memory-title{font-family:'Barlow Condensed',sans-serif;font-size:14px;letter-spacing:1px;color:var(--text);display:block;text-transform:uppercase;}
.forge-memory-desc{font-family:'Barlow',sans-serif;font-size:12px;color:var(--text-mid);margin-top:3px;display:block;}
.forge-toggle-btn{width:44px;height:26px;border-radius:13px;border:none;background:rgba(255,255,255,0.12);cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0;padding:0;}
.forge-toggle-btn.on{background:#a855f7;}
.forge-toggle-knob{position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;display:block;pointer-events:none;}
.forge-toggle-btn.on .forge-toggle-knob{transform:translateX(18px);}
/* FORGE RESULT */
.forge-bound{width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;padding:0 16px;}
.room-moderation-warning{display:flex;align-items:flex-start;gap:8px;background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.3);border-radius:var(--radius);padding:10px 14px;margin:8px 0;font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:0.5px;color:#ff6b78;line-height:1.4;}
.room-mod-icon{font-size:14px;flex-shrink:0;margin-top:1px;}
.forge-result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;}
.forge-result-avatar{font-size:48px;line-height:1;margin-bottom:10px;}
.forge-result-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:var(--text);margin-bottom:6px;}
.forge-result-diff{display:inline-block;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--text-dim);margin-bottom:16px;}
.forge-stat-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.forge-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);width:72px;text-align:right;flex-shrink:0;}
.forge-stat-bar-bg{flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;}
.forge-stat-bar-fill{height:100%;background:#a855f7;border-radius:2px;}
.forge-stat-num{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--text);width:20px;flex-shrink:0;}
.forge-mem-badge{display:inline-flex;align-items:center;gap:4px;margin-top:10px;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#a855f7;border:1px solid rgba(168,85,247,0.3);padding:2px 10px;border-radius:4px;}
/* HOT TOPIC CHIPS */
.hot-chips-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.hot-chip{display:inline-flex;align-items:center;padding:5px 12px;background:rgba(230,57,70,0.05);border:1px solid rgba(230,57,70,0.18);border-radius:100px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.5px;color:var(--text-dim);cursor:pointer;transition:all 0.15s;white-space:nowrap;}
.hot-chip:hover{background:rgba(230,57,70,0.12);border-color:rgba(230,57,70,0.4);color:var(--text);}

/* STREAK CONTINUE BANNER ON HOME */
.streak-continue-btn{display:block;width:100%;background:linear-gradient(135deg,rgba(244,197,66,0.08),rgba(230,57,70,0.06));border:1.5px solid rgba(244,197,66,0.35);border-radius:var(--radius);padding:12px 20px;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);cursor:pointer;transition:all 0.2s;text-align:center;margin-top:10px;animation:goldPulse 2.2s ease-in-out infinite;}
@keyframes goldPulse{0%,100%{box-shadow:0 0 0 0 rgba(244,197,66,0);}50%{box-shadow:0 0 14px 2px rgba(244,197,66,0.15);}}
.streak-continue-btn:hover{background:linear-gradient(135deg,rgba(244,197,66,0.14),rgba(230,57,70,0.1));border-color:var(--gold);}

/* NAV MMR RANK CHIP */
.nav-mmr-chip{display:inline-flex;align-items:center;font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:100px;border:1px solid var(--border);color:var(--text-dim);cursor:default;user-select:none;}
.nav-mmr-chip.bronze{border-color:rgba(176,122,87,0.45);color:#c49a6c;}
.nav-mmr-chip.silver{border-color:rgba(160,170,180,0.45);color:#a0aab4;}
.nav-mmr-chip.gold{border-color:rgba(212,175,55,0.5);color:#d4af37;}
.nav-mmr-chip.diamond{border-color:rgba(90,180,255,0.5);color:#5ab4ff;}
.nav-mmr-chip.clash-master{border-color:rgba(230,57,70,0.55);color:var(--red);}

/* NAV STREAK INDICATOR */
.nav-streak{display:inline-flex;align-items:center;gap:3px;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:3px 9px;border-radius:100px;border:1px solid;cursor:default;user-select:none;animation:navStreakPulse 2.5s ease-in-out infinite;}
.nav-streak.streak-fire{color:#fb923c;border-color:rgba(251,146,60,0.4);background:rgba(251,146,60,0.08);}
.nav-streak.streak-green{color:#22c55e;border-color:rgba(34,197,94,0.4);background:rgba(34,197,94,0.08);}
.nav-streak.streak-blue{color:#5ab4ff;border-color:rgba(90,180,255,0.4);background:rgba(90,180,255,0.08);}
@keyframes navStreakPulse{0%,100%{opacity:1;}50%{opacity:0.75;}}

/* INLINE ARG TAG CHIPS */
.inline-tag-row{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px;}
.inline-tag-chip{font-family:'Barlow Condensed',sans-serif;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:1px 6px;border-radius:100px;border:1px solid;}
.itc-killer_point{background:rgba(0,119,255,0.1);border-color:rgba(0,119,255,0.35);color:#60a5fa;}
.itc-solid{background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.28);color:var(--green);}
.itc-fallacy{background:rgba(230,57,70,0.1);border-color:rgba(230,57,70,0.35);color:var(--red);}
.itc-weak_evidence{background:rgba(244,197,66,0.1);border-color:rgba(244,197,66,0.28);color:var(--gold);}
.itc-emotional_bait{background:rgba(168,85,247,0.1);border-color:rgba(168,85,247,0.28);color:#c084fc;}
.spectator-banner{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.3);border-radius:var(--radius);padding:10px 16px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a855f7;margin-bottom:16px;animation:spectatorPulse 2s ease-in-out infinite alternate;}
@keyframes spectatorPulse{from{opacity:0.7;}to{opacity:1;}}
.rival-profile-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:16px;}
.rival-profile-name{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:var(--text);margin-bottom:8px;}
.rival-profile-stats{display:flex;gap:16px;font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--text-dim);letter-spacing:1px;text-transform:uppercase;flex-wrap:wrap;}
.rival-stat{text-align:center;min-width:48px;}.rival-stat-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--text);display:block;line-height:1;}
.v1-speed-row{display:flex;gap:8px;margin-bottom:6px;}
.v1-speed-btn{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:7px 14px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface2);color:var(--text-dim);cursor:pointer;transition:all 0.15s;}
.v1-speed-btn.active{border-color:var(--red);background:rgba(230,57,70,0.1);color:var(--red);}
.v1-watch-link{background:rgba(168,85,247,0.07);border:1px dashed rgba(168,85,247,0.3);border-radius:var(--radius);padding:10px 14px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:#a855f7;cursor:pointer;transition:background 0.15s;margin-top:10px;text-align:center;display:block;width:100%;box-sizing:border-box;}
.v1-watch-link:hover{background:rgba(168,85,247,0.14);}
`;




function TriangleRadar({ logic, persuasion, delivery }: { logic: number; persuasion: number; delivery: number }) {
  const size = 110;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const r = 42;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const angles = [-90, 30, 150];
  const vals = [logic / 100, persuasion / 100, delivery / 100];
  const colors = ["#5ab4ff", "#e9c46a", "#2a9d8f"];
  const outerPts = angles.map(a => ({ x: cx + r * Math.cos(toRad(a)), y: cy + r * Math.sin(toRad(a)) }));
  const innerPts = angles.map((a, i) => ({ x: cx + r * vals[i] * Math.cos(toRad(a)), y: cy + r * vals[i] * Math.sin(toRad(a)) }));
  const outerPath = outerPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  const innerPath = innerPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  const gridPts = (f: number) => angles.map(a => `${cx + r * f * Math.cos(toRad(a))},${cy + r * f * Math.sin(toRad(a))}`).join(" ");
  return (
    <svg width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      {[1, 0.66, 0.33].map(f => (
        <polygon key={f} points={gridPts(f)} fill="none" stroke={f === 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"} strokeWidth="1" />
      ))}
      {outerPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      <path d={outerPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d={innerPath} fill="rgba(230,57,70,0.13)" stroke="var(--red)" strokeWidth="1.5" strokeLinejoin="round" />
      {innerPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={colors[i]} />
      ))}
    </svg>
  );
}

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

function buildRivalPersonality(form: { name: string; tone: string; aggression: number; logicLevel: number; humorLevel: number; difficulty: string; memoryEnabled: boolean; backstory?: string }): string {
  const toneMap: Record<string, string> = {
    calm: "You debate with ice-cold composure — controlled, deliberate, and devastating in your precision. You never raise your voice.",
    aggressive: "You debate with raw relentless aggression. You hammer every vulnerability, interrupt weak logic, and apply maximum psychological pressure.",
    sarcastic: "You wield sarcasm as a weapon. Every agreement is a trap, every compliment a cut. You make opponents feel intellectually outmatched.",
    analytical: "You are a pure logic engine. You decompose every argument, expose every unsupported assumption, and dismantle with surgical precision.",
  };
  const aggrNote = form.aggression >= 8 ? "Attack hard and without mercy — leave no argument standing." : form.aggression >= 5 ? "Push back firmly and challenge weak points relentlessly." : "Let logic do the work. Pressure is measured, not frantic.";
  const logicNote = form.logicLevel >= 8 ? "Your arguments are airtight — structured, evidenced, and impossible to dismiss." : form.logicLevel >= 5 ? "Build clear logical chains with solid reasoning. Spot gaps in the opponent's arguments." : "Argue from conviction and gut. Logic matters less than impact and confidence.";
  const humorNote = form.humorLevel >= 8 ? "Use sharp cutting wit constantly. Make dismissiveness entertaining. Land punchlines mid-argument." : form.humorLevel >= 5 ? "Occasional dry humor punctuates your sharpest arguments." : "Take debate completely seriously. Zero jokes.";
  const backstoryNote = form.backstory?.trim() ? ` Background: ${form.backstory.trim()}` : "";
  return `You are ${form.name}. ${toneMap[form.tone] ?? toneMap.aggressive} ${aggrNote} ${logicNote} ${humorNote}${backstoryNote}`;
}

const TRASH_POOL = [
  "Is that the best you've got?",
  "My grandma argues better than you.",
  "You call that a point?",
  "I'm barely breaking a sweat.",
  "Come on, I expected more from you.",
  "That argument's been debunked since Tuesday.",
  "I've seen better logic from a coin flip.",
  "Nice try. Not really though.",
  "You're helping me practice my yawning.",
  "I've had more engaging conversations with my thermostat.",
  "Your argument collapsed faster than a house of cards in a hurricane.",
  "Even your allies would be embarrassed right now.",
  "Is this really your A-game?",
  "I thought you'd at least put up a fight.",
  "Genuinely, I feel bad for you.",
  "You're making this too easy.",
  "I've seen stronger arguments in a kindergarten debate.",
  "Please, take your time. I've got all day.",
  "That was... something. Not good, but something.",
  "I almost fell asleep reading that.",
  "Your logic has more holes than Swiss cheese.",
  "That's not an argument, that's a cry for help.",
  "You just contradicted yourself. Twice.",
  "Correlation is not causation. Basic stuff.",
  "That's a logical fallacy. Look it up.",
  "That's circular reasoning and you don't even see it.",
  "You're building a straw man and then burning it down. Impressive.",
  "Your premise is wrong. Your conclusion is worse.",
  "That's not evidence. That's wishful thinking.",
  "I admire your confidence. Your logic, less so.",
  "Ad hominem. Classic deflection.",
  "You're arguing emotion. I'm arguing facts.",
  "You just moved the goalposts again.",
  "That's a slippery slope and you're already at the bottom.",
  "Three words: appeal to authority.",
  "Your argument proved my point more than mine did.",
  "You're arguing from ignorance and it shows.",
  "False dichotomy. There are more than two options.",
  "That analogy doesn't hold. Try again.",
  "You're conflating two completely different things.",
  "Did you actually think before typing that?",
  "This is why we can't have nice things.",
  "My cat makes better points in its sleep.",
  "Even autocorrect gave up on you.",
  "I'm shocked you made it this far in life.",
  "You've proved that confidence and competence are unrelated.",
  "Bold of you to argue against things you clearly haven't researched.",
  "The audacity to be this wrong this confidently.",
  "I'd explain it but I don't have enough crayons.",
  "This is what happens when you skip doing the reading.",
  "I've seen more coherent thoughts in a fortune cookie.",
  "You should sue your debate teacher.",
  "Not your sharpest moment. Or is it?",
  "You're arguing against a position you don't understand.",
  "Please stop. For your own sake.",
  "This is the intellectual equivalent of a participation trophy.",
  "You have the conviction of someone who is very, very wrong.",
  "I've seen better reasoning in a horoscope.",
  "You just proved you didn't read the prompt.",
  "Just concede. You know you've lost.",
  "At this point I'm doing you a favor by not laughing.",
  "Every second you keep going, the hole gets deeper.",
  "You should have quit after round one.",
  "I don't even have to try hard. That's the embarrassing part for you.",
  "The gap between us is visible from space.",
  "You're fighting a battle you've already lost.",
  "The AI is judging you. I'm pitying you.",
  "I'm winning and I'm bored. Those two things shouldn't coexist.",
  "Watching you struggle is not as entertaining as you'd hope.",
  "You're like a final boss with zero health points.",
  "I'd debate worse on purpose but I can't figure out how.",
  "You're making me look even better. Thanks.",
  "Just accept it. It's liberating.",
  "I debated better in my sleep last night.",
  "You should have studied instead of whatever you did.",
  "This is a masterclass. Unfortunately for you.",
  "I'm not even using my strongest arguments.",
  "You're the training dummy I needed today.",
  "Giving up is always an option. Just saying.",
  "You just proved my point for me.",
  "That argument belonged in the trash.",
  "I'm not even warming up yet.",
  "You sure you want to keep going?",
  "That was painful to read. For you.",
  "Still waiting for an actual argument.",
  "Next round, try using logic this time.",
  "This is embarrassing. But keep going.",
  "You call that a rebuttal?",
  "Round over. You lost. Try again.",
  "Facts don't care about your feelings.",
  "Send help. For your argument.",
  "Was that your best? Really?",
  "Round belongs to me. Accept it.",
  "The AI judged you. I agree with the AI.",
  "You're improving. Just not fast enough.",
  "That was a bold choice. A bad choice. But bold.",
  "I've been more challenged by crossword puzzles.",
  "You're making history. Just not the good kind.",
  "Nietzsche would be disappointed.",
  "Socrates died for this? Wow.",
  "Even a broken clock is right twice a day. You're neither.",
  "I'd say 'nice try' but Kant.",
  "Your argument is a post-modern disaster.",
  "Descartes said 'I think therefore I am.' You haven't proven the first part.",
  "You're one step away from 'I just feel like...' as your main argument.",
  "Truth doesn't bend to your convenience.",
  "History disagrees with you. Loudly.",
  "This argument was tried before. It failed. Like you.",
  "Even people in the past knew better than this.",
  "You're on the wrong side of history AND this debate.",
  "If this were a courtroom, you'd be convicted by your own argument.",
  "The prosecution rests. You lost.",
  "Even Napoleon knew when to retreat. Lesson for you.",
  "Shakespeare wrote better arguments in his comedies.",
  "This is the intellectual equivalent of flat earth theory.",
  "You type like you argue: slowly and incorrectly.",
  "Your argument has the structural integrity of wet cardboard.",
  "I've read more convincing arguments on a cereal box.",
  "You're arguing with the confidence of someone who has never been right.",
  "The only thing weaker than your argument is your commitment to it.",
  "Even your backup points are embarrassing.",
  "You're proving my point every time you open your metaphorical mouth.",
  "If ignorance is bliss, you must be euphoric.",
  "You argue like you prepared for a completely different debate.",
  "I'm starting to think you're doing this on purpose.",
  "The bar was low. You went under it.",
  "Your argument is held together by vibes and hope.",
  "Every word you write digs you deeper.",
  "You've managed to be wrong in three different ways in one paragraph.",
  "Your confidence is inversely proportional to your accuracy.",
  "I'm writing this down as a cautionary tale.",
  "If this were a test, you'd fail the makeup exam too.",
  "You're not even wrong in an interesting way.",
  "This argument called. It wants to be put out of its misery.",
  "You're the reason debate coaches age faster.",
  "Do you hear yourself?",
  "Read what you just wrote. Out loud. Slowly.",
  "If you could see yourself right now, you'd concede immediately.",
  "You went all in on the wrong hand.",
  "That's a bold strategy. Let's see how it works out.",
  "You're arguing against yourself and losing.",
  "You're confusing loudness with strength.",
  "Your certainty is the funniest part.",
  "The worst part is you think you're winning.",
  "I've been more challenged by captchas.",
  "Technically speaking, that argument was a disaster.",
  "You peaked in round one. And that wasn't great either.",
  "I've argued harder with a vending machine.",
  "Your argument reached its conclusion before it started.",
  "You're running out of both rounds and ideas.",
  "I'd offer feedback but there's too much to unpack.",
  "The more you explain, the less I understand your point.",
  "At some point, typing less is a form of mercy.",
  "You're the underdog of this story. Unfortunately.",
  "Spoiler: you don't win.",
  "You argued yourself out of a good position.",
  "Your strongest point was actually my weakest. So.",
  "Take a breath. Reconsider everything.",
  "The irony is you came in confident.",
  "I hope this is a learning moment for you.",
  "Your argument would work better in a parallel universe.",
  "You're fighting facts with vibes.",
  "This is what happens when you wing a debate.",
  "I genuinely cannot tell if this is satire.",
  "You're the reason the other side wins elections.",
  "My phone's autocorrect has better arguments than you.",
  "You brought a knife to a gun fight. And dropped the knife.",
  "Every sentence you write is a gift to me.",
  "You're not losing. You're getting educated.",
  "The scary part is you probably think that was good.",
  "You're single-handedly making my case for me.",
  "I've seen better arguments from people half asleep.",
  "You're like a plot twist — surprising, but not in a good way.",
  "I'd compliment your effort but we both know.",
  "You're the plot hole in your own argument.",
  "This is a masterclass in how not to debate.",
  "Your argument has a fatal flaw. Several, actually.",
  "That argument left the building before you finished typing it.",
  "You could turn this around. You won't. But you could.",
  "Every time you argue, logic takes a personal day.",
  "The gap between what you mean and what you're saying is impressive.",
  "Your argument is so weak it needs a support group.",
  "I thought you'd at least make me sweat. I was wrong.",
  "This is the fastest someone has talked themselves out of a winning position.",
  "You're making assumptions your argument can't survive.",
  "You've achieved something rare: being wrong on multiple levels simultaneously.",
  "The only thing consistent about your argument is how bad it is.",
  "You debate like you've never heard the word 'evidence.'",
  "I'm genuinely rooting for you. But I'm also winning.",
  "See you on the leaderboard. You'll be below me.",
  "Your sources would be embarrassed to be cited here.",
  "That's not a counterargument. That's a complaint.",
  "You're so close to the right answer. Wrong direction though.",
  "I'd fact-check you but there are no facts to check.",
  "You're arguing like you lost and you're right.",
  "Each point you make makes my job easier.",
  "You've discovered a new way to be incorrect.",
  "The confidence to submit that take. Respect. Wrong. But respect.",
  "You're out here debating with draft energy.",
  "Your argument has the lifespan of a mayfly.",
  "I've met walls with better logic.",
];

function getNextTrashLine(queueRef: { current: string[] }, idxRef: { current: number }): string {
  if (idxRef.current >= queueRef.current.length) {
    const pool = TRASH_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    queueRef.current = pool;
    idxRef.current = 0;
  }
  return queueRef.current[idxRef.current++];
}

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
  { cat: "Hot Take", text: "Summer is overrated" },
  { cat: "Hot Take", text: "Introverts make better leaders" },
  { cat: "Hot Take", text: "Working from a cafe is better than working from home" },
  { cat: "Hot Take", text: "Anime is peak storytelling" },
  { cat: "Hot Take", text: "Fiction teaches us more than non-fiction" },
  { cat: "Hot Take", text: "Silence is better than small talk" },
  { cat: "Hot Take", text: "Texting is better than calling" },
  { cat: "Hot Take", text: "Weekends are overrated" },
  { cat: "Hot Take", text: "People who don't like spicy food are missing out" },
  { cat: "Hot Take", text: "Long-distance relationships can absolutely work" },
  { cat: "Hot Take", text: "Working hard beats working smart" },
  { cat: "Hot Take", text: "Astrology is as valid as psychology" },
  { cat: "Hot Take", text: "Horror movies are better than rom-coms" },
  { cat: "Hot Take", text: "City life is superior to country life" },
  { cat: "Hot Take", text: "Being an only child is better than having siblings" },
  { cat: "Hot Take", text: "The journey matters more than the destination" },
  { cat: "Hot Take", text: "Hybrid work is the worst of both worlds" },
  { cat: "Hot Take", text: "Lunch is the most important meal of the day" },
  { cat: "Hot Take", text: "Gym culture has become toxic" },
  { cat: "Hot Take", text: "Side hustles are a red flag not a green flag" },
  { cat: "Hot Take", text: "Libraries should replace most schools" },
  { cat: "Hot Take", text: "People who don't drink alcohol are more trustworthy" },
  { cat: "Hot Take", text: "Multitasking is a myth and a bad habit" },
  { cat: "Hot Take", text: "Waking up early is overrated productivity advice" },
  { cat: "Hot Take", text: "The best art comes from suffering" },
  { cat: "Hot Take", text: "Hobbies that make money ruin the hobby" },
  { cat: "Hot Take", text: "Social media followers are a meaningless metric" },
  { cat: "Hot Take", text: "True freedom requires boredom" },
  { cat: "Hot Take", text: "Adults who have never had a job struggle to empathize" },
  { cat: "Hot Take", text: "Being popular in high school is a disadvantage in life" },
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
  { cat: "Ethics", text: "Eating meat is morally equivalent to harming animals" },
  { cat: "Ethics", text: "Spying on a partner is never justified" },
  { cat: "Ethics", text: "Cultural appropriation is always harmful" },
  { cat: "Ethics", text: "Rich countries owe poor ones reparations" },
  { cat: "Ethics", text: "It is always wrong to break the law" },
  { cat: "Ethics", text: "Parents are responsible for their adult children's actions" },
  { cat: "Ethics", text: "Affirmative action is morally justified" },
  { cat: "Ethics", text: "Humans have a duty to prevent the extinction of species" },
  { cat: "Ethics", text: "Revenge is never morally justifiable" },
  { cat: "Ethics", text: "Surrogacy should be legal and unregulated" },
  { cat: "Ethics", text: "Sex work should be fully decriminalized" },
  { cat: "Ethics", text: "It is unethical to have children in a climate crisis" },
  { cat: "Ethics", text: "Corporations have the same moral obligations as people" },
  { cat: "Ethics", text: "Stealing to feed your family is morally acceptable" },
  { cat: "Ethics", text: "Governments have the right to control what citizens eat" },
  { cat: "Ethics", text: "It is ethical to use AI to make life-or-death decisions" },
  { cat: "Ethics", text: "Everyone is responsible for fighting systemic injustice" },
  { cat: "Ethics", text: "Buying luxury goods is morally wrong" },
  { cat: "Ethics", text: "Mandatory organ donation after death is ethical" },
  { cat: "Ethics", text: "Boycotts are an effective and ethical tool" },
  { cat: "Ethics", text: "Donating to charity makes you no less selfish" },
  { cat: "Ethics", text: "Lying to protect feelings is always wrong" },
  { cat: "Ethics", text: "Humans have a moral obligation to help strangers" },
  { cat: "Ethics", text: "Assisted dying is a fundamental human right" },
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
  { cat: "Philosophy", text: "Progress is always good for humanity" },
  { cat: "Philosophy", text: "Suffering gives life meaning" },
  { cat: "Philosophy", text: "Reality is a social construct" },
  { cat: "Philosophy", text: "Identity is defined by what we do not who we are" },
  { cat: "Philosophy", text: "Humans are fundamentally good" },
  { cat: "Philosophy", text: "Time is more valuable than money" },
  { cat: "Philosophy", text: "Language shapes the way we think" },
  { cat: "Philosophy", text: "Forgiveness is for you not for them" },
  { cat: "Philosophy", text: "We have no control over who we become" },
  { cat: "Philosophy", text: "Memory is more important than experience" },
  { cat: "Philosophy", text: "There is no such thing as an original idea" },
  { cat: "Philosophy", text: "The present moment is all that exists" },
  { cat: "Philosophy", text: "Purpose is found not created" },
  { cat: "Philosophy", text: "Comfort is the enemy of growth" },
  { cat: "Philosophy", text: "Competition makes us better people" },
  { cat: "Philosophy", text: "Technology is making humans less human" },
  { cat: "Philosophy", text: "Democracy is the least bad political system" },
  { cat: "Philosophy", text: "Civilization is in permanent decline" },
  { cat: "Philosophy", text: "Art matters more than science to human flourishing" },
  { cat: "Philosophy", text: "We are more than the sum of our biology" },
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
  { cat: "Pop Culture", text: "Hip-hop is the most important music genre of the last 50 years" },
  { cat: "Pop Culture", text: "TikTok has damaged attention spans irreversibly" },
  { cat: "Pop Culture", text: "Celebrity culture is a symptom of societal decline" },
  { cat: "Pop Culture", text: "Violent video games cause real-world violence" },
  { cat: "Pop Culture", text: "The music of the 90s was the best ever made" },
  { cat: "Pop Culture", text: "TV shows are now better than movies" },
  { cat: "Pop Culture", text: "Social media fame is not real fame" },
  { cat: "Pop Culture", text: "Anime has surpassed Western animation in quality" },
  { cat: "Pop Culture", text: "Superhero fatigue is real and deserved" },
  { cat: "Pop Culture", text: "K-pop is the most dominant music movement of our era" },
  { cat: "Pop Culture", text: "NFTs were a cultural embarrassment" },
  { cat: "Pop Culture", text: "Stand-up comedy is the most honest art form" },
  { cat: "Pop Culture", text: "Streaming has made us watch more but enjoy less" },
  { cat: "Pop Culture", text: "The internet killed music discovery" },
  { cat: "Pop Culture", text: "Video essays have replaced film criticism" },
  { cat: "Pop Culture", text: "Taylor Swift is the most important artist of her generation" },
  { cat: "Pop Culture", text: "Most Oscar winners don't deserve the award" },
  { cat: "Pop Culture", text: "The golden age of TV is over" },
  { cat: "Pop Culture", text: "True crime content glorifies criminals" },
  { cat: "Pop Culture", text: "Social media has made comedy impossible" },
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
  { cat: "Society", text: "Unpaid internships should be illegal" },
  { cat: "Society", text: "The gig economy exploits workers" },
  { cat: "Society", text: "Open borders would benefit the global economy" },
  { cat: "Society", text: "Nationalism is inherently dangerous" },
  { cat: "Society", text: "Democracy is failing in the modern world" },
  { cat: "Society", text: "Social media should be regulated like a utility" },
  { cat: "Society", text: "Wealth inequality is the defining crisis of our generation" },
  { cat: "Society", text: "The nuclear family is an outdated concept" },
  { cat: "Society", text: "Rent control does more harm than good" },
  { cat: "Society", text: "Universal healthcare is a human right" },
  { cat: "Society", text: "Gentrification destroys more than it creates" },
  { cat: "Society", text: "Gender roles are harmful to everyone" },
  { cat: "Society", text: "Tipping culture should be abolished" },
  { cat: "Society", text: "The welfare state breeds dependency" },
  { cat: "Society", text: "Meritocracy is a myth" },
  { cat: "Society", text: "Western values are not universal" },
  { cat: "Society", text: "We work too much and live too little" },
  { cat: "Society", text: "Social trust is collapsing in modern societies" },
  { cat: "Society", text: "Free speech absolutism causes real harm" },
  { cat: "Society", text: "The class system is alive and well in modern democracies" },
  { cat: "Society", text: "Organized religion does more harm than good" },
  { cat: "Society", text: "The age of consent should be raised globally" },
  { cat: "Society", text: "Political polarization is the biggest threat to democracy" },
  { cat: "Society", text: "Drug addiction should be treated not criminalized" },
  { cat: "Society", text: "Paparazzi should face criminal charges for invasions of privacy" },
  { cat: "Society", text: "Generational labels like 'millennial' are harmful" },
  { cat: "Society", text: "Social media is more addictive than cigarettes" },
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
  { cat: "Tech", text: "AI will replace most white-collar jobs within 20 years" },
  { cat: "Tech", text: "The smartphone is the most transformative invention of the century" },
  { cat: "Tech", text: "Elon Musk has done more harm than good for technology" },
  { cat: "Tech", text: "Quantum computing will break the internet" },
  { cat: "Tech", text: "Deepfakes are an existential threat to democracy" },
  { cat: "Tech", text: "Silicon Valley culture is toxic and needs to change" },
  { cat: "Tech", text: "Electric vehicles will not solve the climate crisis" },
  { cat: "Tech", text: "The right to be forgotten online should be global law" },
  { cat: "Tech", text: "AI should not be used in criminal sentencing" },
  { cat: "Tech", text: "The dark web does more good than harm" },
  { cat: "Tech", text: "Internet access is a basic human right" },
  { cat: "Tech", text: "We should colonize Mars before fixing Earth" },
  { cat: "Tech", text: "The algorithm knows you better than you know yourself" },
  { cat: "Tech", text: "Neuralink-style brain chips are inevitable and good" },
  { cat: "Tech", text: "Tech companies should be liable for content on their platforms" },
  { cat: "Tech", text: "Cybersecurity is the most important challenge of the next decade" },
  { cat: "Tech", text: "The 40-hour work week will be replaced by AI within 10 years" },
  { cat: "Tech", text: "Drone delivery will replace traditional logistics" },
  { cat: "Tech", text: "Virtual reality will replace physical travel" },
  { cat: "Tech", text: "3D printing will transform manufacturing more than the internet did" },
  { cat: "Sports", text: "Money has ruined professional football" },
  { cat: "Sports", text: "The Olympics should include esports" },
  { cat: "Sports", text: "Doping should be allowed in professional sports" },
  { cat: "Sports", text: "Athletes make too much money" },
  { cat: "Sports", text: "Women's sports deserve equal pay and coverage" },
  { cat: "Sports", text: "Tackle football should be banned for children" },
  { cat: "Sports", text: "Sports betting is destroying the integrity of sport" },
  { cat: "Sports", text: "VAR has ruined the flow of football" },
  { cat: "Sports", text: "Mental health should be grounds to pull out of competition" },
  { cat: "Sports", text: "The World Cup should be held every two years" },
  { cat: "Sports", text: "College athletes should be paid" },
  { cat: "Sports", text: "Boxing is too dangerous to remain legal" },
  { cat: "Sports", text: "MMA is more of a sport than boxing" },
  { cat: "Sports", text: "Golf is not a real sport" },
  { cat: "Sports", text: "The Premier League is better than any other football league" },
  { cat: "Sports", text: "Performance-enhancing drugs should be a personal choice" },
  { cat: "Sports", text: "Sports agents are ruining team loyalty" },
  { cat: "Sports", text: "Fan culture has become too toxic" },
  { cat: "Sports", text: "Athlete activism belongs on the field not off it" },
  { cat: "Sports", text: "Hosting the Olympics is a financial disaster for cities" },
  { cat: "Sports", text: "Chess is more of a sport than most recognized sports" },
  { cat: "Sports", text: "LeBron James is better than Michael Jordan" },
  { cat: "Sports", text: "Country matters more than club in football" },
  { cat: "Sports", text: "The NFL is bad for the health of America" },
  { cat: "Sports", text: "Referees have too much power in modern sport" },
  { cat: "Environment", text: "Climate change is the defining crisis of our time" },
  { cat: "Environment", text: "Individual action cannot stop climate change" },
  { cat: "Environment", text: "Nuclear power is the only viable path to net zero" },
  { cat: "Environment", text: "Veganism is the single best thing you can do for the planet" },
  { cat: "Environment", text: "Eco-anxiety is a rational response to climate change" },
  { cat: "Environment", text: "Carbon taxes are the most effective climate policy" },
  { cat: "Environment", text: "Flying should be heavily taxed to reduce emissions" },
  { cat: "Environment", text: "Rich countries must pay for the climate damage they caused" },
  { cat: "Environment", text: "Geoengineering is too dangerous to attempt" },
  { cat: "Environment", text: "Factory farming should be banned globally" },
  { cat: "Environment", text: "Plastic packaging should be completely illegal by 2030" },
  { cat: "Environment", text: "Rewilding is the most effective form of conservation" },
  { cat: "Environment", text: "Climate activists who break the law are justified" },
  { cat: "Environment", text: "The fossil fuel industry should pay reparations" },
  { cat: "Environment", text: "We have already passed the point of no return on climate" },
  { cat: "Environment", text: "Meat consumption is the leading driver of biodiversity loss" },
  { cat: "Environment", text: "Eco-friendly products are mostly greenwashing" },
  { cat: "Environment", text: "Deforestation is more dangerous than carbon emissions" },
  { cat: "Environment", text: "The green economy will create more jobs than it destroys" },
  { cat: "Environment", text: "Environmental protection should override economic growth" },
  { cat: "Economics", text: "Capitalism does more harm than good" },
  { cat: "Economics", text: "The minimum wage should be a living wage everywhere" },
  { cat: "Economics", text: "Inheritance should be heavily taxed" },
  { cat: "Economics", text: "Free trade always benefits developing nations" },
  { cat: "Economics", text: "Economic growth is incompatible with sustainability" },
  { cat: "Economics", text: "Privatization of public services always fails" },
  { cat: "Economics", text: "Unions are essential in modern economies" },
  { cat: "Economics", text: "The gig economy exploits workers" },
  { cat: "Economics", text: "A wealth tax is fair and feasible" },
  { cat: "Economics", text: "Inflation is always a government policy failure" },
  { cat: "Economics", text: "Globalization has made the world worse for most people" },
  { cat: "Economics", text: "Universal basic income would increase productivity" },
  { cat: "Economics", text: "Austerity economics never works" },
  { cat: "Economics", text: "The housing market is broken beyond repair" },
  { cat: "Economics", text: "Student debt cancellation is economically justified" },
  { cat: "Economics", text: "Cryptocurrency is a Ponzi scheme" },
  { cat: "Economics", text: "CEOs are paid astronomically more than they are worth" },
  { cat: "Economics", text: "Trickle-down economics has been proven to fail" },
  { cat: "Economics", text: "A 4-day work week would boost the economy" },
  { cat: "Economics", text: "The stock market does not reflect the real economy" },
  { cat: "Education", text: "Standardized testing should be abolished" },
  { cat: "Education", text: "University degrees are no longer worth the cost" },
  { cat: "Education", text: "Schools should teach financial literacy" },
  { cat: "Education", text: "Homework does more harm than good" },
  { cat: "Education", text: "Private schools should be banned" },
  { cat: "Education", text: "Religious education in public schools is harmful" },
  { cat: "Education", text: "Online learning is as effective as classroom learning" },
  { cat: "Education", text: "Learning a second language should be mandatory" },
  { cat: "Education", text: "Children should have a say in their own education" },
  { cat: "Education", text: "School uniforms improve educational outcomes" },
  { cat: "Education", text: "Critical thinking is more important than subject knowledge" },
  { cat: "Education", text: "Coding should be mandatory in every school" },
  { cat: "Education", text: "Traditional universities are becoming obsolete" },
  { cat: "Education", text: "Social media literacy should be taught in schools" },
  { cat: "Education", text: "Grades are a poor measure of intelligence" },
  { cat: "Education", text: "Single-sex schools perform better academically" },
  { cat: "Education", text: "Philosophy should be taught from primary school" },
  { cat: "Education", text: "School starts too early for teenagers" },
  { cat: "Education", text: "Arts education is as important as STEM" },
  { cat: "Education", text: "Teachers are the most undervalued profession in society" },
  { cat: "Health", text: "Mental health should be treated the same as physical health" },
  { cat: "Health", text: "The pharmaceutical industry does more harm than good" },
  { cat: "Health", text: "Vaccines should be mandatory" },
  { cat: "Health", text: "Sugar is more dangerous than fat" },
  { cat: "Health", text: "Therapy should be available free to all" },
  { cat: "Health", text: "The war on drugs has failed" },
  { cat: "Health", text: "Junk food advertising targeting children should be banned" },
  { cat: "Health", text: "Weight loss surgery is too readily available" },
  { cat: "Health", text: "The healthcare system is fundamentally broken" },
  { cat: "Health", text: "Alternative medicine is mostly placebo" },
  { cat: "Health", text: "Social media causes the mental health crisis in teenagers" },
  { cat: "Health", text: "Loneliness is the defining public health crisis of our era" },
  { cat: "Health", text: "Running is the best form of exercise" },
  { cat: "Health", text: "Plant-based diets are healthier than omnivore diets" },
  { cat: "Health", text: "Sleep is more important than diet and exercise combined" },
  { cat: "Health", text: "The 40-hour work week is a public health crisis" },
  { cat: "Health", text: "Burnout is caused by employers not employees" },
  { cat: "Health", text: "We overmedicate children with ADHD diagnoses" },
  { cat: "Health", text: "Addiction is a disease not a moral failing" },
  { cat: "Health", text: "Fasting is more hype than science" },
  { cat: "Law", text: "Jury trials are outdated and should be replaced" },
  { cat: "Law", text: "Life sentences without parole are unconstitutional" },
  { cat: "Law", text: "The war on drugs has been a policy disaster" },
  { cat: "Law", text: "Corporations should face criminal charges not just fines" },
  { cat: "Law", text: "The right to bear arms causes more harm than good" },
  { cat: "Law", text: "Hate speech laws infringe on free expression" },
  { cat: "Law", text: "Non-violent offenders should never be imprisoned" },
  { cat: "Law", text: "Plea bargaining corrupts the justice system" },
  { cat: "Law", text: "Policing in its current form cannot be reformed only replaced" },
  { cat: "Law", text: "International law is unenforceable and therefore useless" },
  { cat: "Law", text: "Civil lawsuits have become a tool for corporate intimidation" },
  { cat: "Law", text: "Social media companies should be liable for user-generated harm" },
  { cat: "Law", text: "Privacy laws are a decade behind technology" },
  { cat: "Law", text: "Solitary confinement is torture and should be banned" },
  { cat: "Law", text: "The legal age for everything should be 21 not 18" },
  { cat: "History", text: "Colonialism's effects are still the root cause of global inequality" },
  { cat: "History", text: "The atomic bombings of Hiroshima and Nagasaki were unjustified" },
  { cat: "History", text: "The Cold War never truly ended" },
  { cat: "History", text: "The Roman Empire was ultimately a net positive for civilization" },
  { cat: "History", text: "The French Revolution did more harm than good" },
  { cat: "History", text: "The British Empire should issue formal apologies and reparations" },
  { cat: "History", text: "History is written by the winners and always will be" },
  { cat: "History", text: "The industrial revolution was the worst thing to happen to humanity" },
  { cat: "History", text: "World War II was inevitable given the Treaty of Versailles" },
  { cat: "History", text: "Capitalism was more responsible for defeating the Soviets than Reagan" },
  { cat: "History", text: "The United Nations has been a failure" },
  { cat: "History", text: "The printing press was more transformative than the internet" },
  { cat: "History", text: "Alexander the Great caused more harm than good" },
  { cat: "History", text: "The space race was the greatest achievement of the 20th century" },
  { cat: "History", text: "Appeasement of Hitler in the 1930s was understandable" },
  { cat: "Relationships", text: "Long-distance relationships are doomed to fail" },
  { cat: "Relationships", text: "Social media kills romantic relationships" },
  { cat: "Relationships", text: "Men and women cannot be purely platonic friends" },
  { cat: "Relationships", text: "You should never stay with someone who cheated" },
  { cat: "Relationships", text: "Arranged marriages can be as successful as love marriages" },
  { cat: "Relationships", text: "Prenuptial agreements are a sign of distrust" },
  { cat: "Relationships", text: "Couples who live together before marriage are less likely to divorce" },
  { cat: "Relationships", text: "Parents should not be friends with their children" },
  { cat: "Relationships", text: "Having children is a selfish decision in 2025" },
  { cat: "Relationships", text: "Breakups via text are acceptable in the modern era" },
  { cat: "Relationships", text: "Social media makes people worse partners" },
  { cat: "Relationships", text: "Age gaps in relationships are inherently problematic" },
  { cat: "Relationships", text: "People change and no relationship survives that" },
  { cat: "Relationships", text: "Therapy should be mandatory before marriage" },
  { cat: "Relationships", text: "Polyamory is a valid relationship structure" },
  { cat: "Relationships", text: "Online dating is superior to meeting in person" },
  { cat: "Relationships", text: "True love is a choice not a feeling" },
  { cat: "Relationships", text: "Jealousy is a natural and unavoidable part of love" },
  { cat: "Relationships", text: "Parents prioritize their children over their partners" },
  { cat: "Relationships", text: "Ghosting someone is a form of emotional cruelty" },
  { cat: "Food", text: "A plant-based diet is the only ethical choice" },
  { cat: "Food", text: "Fast food is more of a cultural institution than a health problem" },
  { cat: "Food", text: "Food culture has become insufferably pretentious" },
  { cat: "Food", text: "Sugar is the tobacco of the 21st century" },
  { cat: "Food", text: "Cooking at home is a dying skill worth saving" },
  { cat: "Food", text: "The global food system is broken and needs radical change" },
  { cat: "Food", text: "Insects are the food of the future and we should embrace it" },
  { cat: "Food", text: "Food deserts are a direct result of systemic racism" },
  { cat: "Food", text: "Lab-grown meat will replace traditional meat within 20 years" },
  { cat: "Food", text: "Food influencers have made us worse at eating" },
  { cat: "Food", text: "Alcohol is more harmful than most illegal drugs" },
  { cat: "Food", text: "We waste too much food and it is entirely preventable" },
  { cat: "Food", text: "The diet industry is predatory and harmful" },
  { cat: "Food", text: "Michelin-starred restaurants are overpriced and overrated" },
  { cat: "Food", text: "Organic food is a marketing scam" },
  { cat: "International", text: "China will overtake the US as the world's dominant superpower" },
  { cat: "International", text: "NATO has outlived its usefulness" },
  { cat: "International", text: "The United Nations needs to be fundamentally reformed" },
  { cat: "International", text: "Sanctions are an ineffective foreign policy tool" },
  { cat: "International", text: "The West should not interfere in other countries' politics" },
  { cat: "International", text: "The global south has been systematically exploited by the north" },
  { cat: "International", text: "Nuclear weapons make the world safer through deterrence" },
  { cat: "International", text: "Globalization has failed ordinary workers everywhere" },
  { cat: "International", text: "The IMF and World Bank do more harm than good" },
  { cat: "International", text: "Open borders would solve more problems than they create" },
  { cat: "International", text: "Cultural imperialism is as harmful as military imperialism" },
  { cat: "International", text: "The era of American global dominance is over" },
  { cat: "International", text: "International aid creates dependency not development" },
  { cat: "International", text: "Diplomatic immunity is unjustifiable in the modern world" },
  { cat: "International", text: "The European Union is a flawed but necessary institution" },
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
  while (picked.length < 4 && pool.length > 0) {
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
  return pool.sort(() => Math.random() - 0.5);
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

async function apiAuthPatch<T>(path: string, body: unknown): Promise<T> {
  const url = `${API}/api${path}`;
  const res = await fetch(url, { method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(body) });
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
interface PropagandaTag { sentence: string; tag: string; }
interface RoundScore { round: number; score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; iq?: number; iqLabel?: string; propaganda?: PropagandaTag[]; }
interface Verdict { won: boolean; avgScore: number; avgLogic: number; avgPersuasion: number; avgDelivery: number; judgeText: string; improve: string; bestArg: string; weakArg: string; rank: string; outcome: string; coachWorked?: string; coachFailed?: string; coachDrill?: string; }
interface MmrResult { newMmr: number; delta: number; newTier: string; prevTier: string; rankUp: boolean; rankDown: boolean; }
interface ProgressionResult { shieldTokens: number; shieldConsumed: boolean; signatureTitle: string | null; dynastyStreak: number; xpGained: number; }
interface Stats { wins: number; debates: number; bestScore: number; currentStreak: number; bestStreak: number; opponentHistory: Record<string, { wins: number; losses: number }>; }
interface RoomHighlight { text: string; type: "strong" | "weak" | "wrong" | "fallacy"; note: string; }
interface RoomArgument { id: number; roomId: number; roundNum: number; playerNum: number; argumentText: string; score: number | null; logic: number | null; persuasion: number | null; delivery: number | null; rank: string | null; critique: string | null; highlights: string; }
interface RoomTaunt { id: number; text: string; fromName: string; fromPlayerNum: 1 | 2; }
interface RoomState { id: number; code: string; topicText: string; topicCat: string; player1Id: number; player2Id: number | null; player1Side: string | null; player2Side: string | null; player1Ready: boolean; player2Ready: boolean; status: string; totalRounds: number; currentRound: number; speedRound: boolean; winnerPlayerNum: number | null; player1Score: number | null; player2Score: number | null; player1Rank: string | null; player2Rank: string | null; player1Name: string; player2Name: string | null; arguments: RoomArgument[]; playerNum: 1 | 2 | null; iq1: number | null; iq2: number | null; latestTaunt: RoomTaunt | null; player1TypingAt: number | null; player2TypingAt: number | null; }
interface V1HistoryEntry { code: string; topic: string; opponentName: string; myScore: number | null; oppScore: number | null; won: boolean; date: string; myRank: string; myIQ: number | null; }
interface DebateCard { id: number; playerId: number; debateId: number | null; opponentId: string; opponentName: string; topic: string; score: number; rank: string; rarity: string; bestQuote: string; createdAt: string; }

function generateV1ShareCard(params: {
  iWon: boolean;
  myName: string;
  oppName: string;
  myRank: string;
  oppRank: string;
  myScore: number | null;
  oppScore: number | null;
  myIQ: number | null;
  oppIQ: number | null;
  topic: string;
  speedRound: boolean;
}): string {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const PAD = 60;
  const resultColor = params.iWon ? "#22c55e" : "#e63946";
  const glowRgb = params.iWon ? "34,197,94" : "230,57,70";

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, 520);
  glow.addColorStop(0, `rgba(${glowRgb},0.18)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.font = "bold 58px Impact, 'Arial Black', sans-serif";
  ctx.fillStyle = "#f0f0f0";
  ctx.textAlign = "left";
  const clW = ctx.measureText("CL").width;
  const aW = ctx.measureText("A").width;
  ctx.fillText("CL", PAD, 90);
  ctx.fillStyle = "#e63946";
  ctx.fillText("A", PAD + clW, 90);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillText("SH", PAD + clW + aW, 90);

  ctx.font = "bold 18px Arial, sans-serif";
  ctx.fillStyle = "#444";
  ctx.textAlign = "right";
  ctx.fillText(params.speedRound ? "SPEED ROUND · 1v1" : "1v1 ARENA", W - PAD, 90);

  ctx.fillStyle = resultColor;
  ctx.fillRect(PAD, 108, W - PAD * 2, 3);

  ctx.font = "bold 130px Impact, 'Arial Black', sans-serif";
  ctx.fillStyle = resultColor;
  ctx.textAlign = "center";
  ctx.fillText(params.iWon ? "VICTORY" : "DEFEATED", W / 2, 268);

  const maxTopic = 72;
  const topicText = params.topic.length > maxTopic ? params.topic.slice(0, maxTopic - 1) + "…" : params.topic;
  ctx.font = "italic 26px Arial, sans-serif";
  ctx.fillStyle = "#777";
  ctx.textAlign = "center";
  ctx.fillText(`"${topicText}"`, W / 2, 318);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(PAD, 346, W - PAD * 2, 530);
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.strokeRect(PAD, 346, W - PAD * 2, 530);

  const midX = W / 2;
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(midX, 356); ctx.lineTo(midX, 866); ctx.stroke();

  const sides = [
    { name: params.myName, rank: params.myRank, score: params.myScore, iq: params.myIQ, won: params.iWon, x: PAD + (midX - PAD) / 2, label: "YOU" },
    { name: params.oppName, rank: params.oppRank, score: params.oppScore, iq: params.oppIQ, won: !params.iWon, x: midX + (W - PAD - midX) / 2, label: "OPPONENT" },
  ];

  for (const s of sides) {
    const rankColor = s.rank === "S" ? "#f4c542" : s.rank === "A" ? "#22c55e" : s.rank === "B" ? "#60a5fa" : s.rank === "C" ? "#9ca3af" : s.rank === "D" ? "#f97316" : "#e63946";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.fillText(s.label, s.x, 390);

    if (s.won) {
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillStyle = "#f4c542";
      ctx.fillText("WINNER", s.x, 414);
    }

    ctx.font = `bold 130px Impact, 'Arial Black', sans-serif`;
    ctx.fillStyle = rankColor;
    ctx.textAlign = "center";
    ctx.fillText(s.rank, s.x, 570);

    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillStyle = "#444";
    ctx.fillText("RANK", s.x, 596);

    ctx.font = "bold 52px Impact, 'Arial Black', sans-serif";
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText(`${s.score ?? "—"}/100`, s.x, 670);

    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillStyle = "#444";
    ctx.fillText("SCORE", s.x, 692);

    ctx.font = "bold 52px Impact, 'Arial Black', sans-serif";
    ctx.fillStyle = "#777";
    ctx.fillText(`IQ ${s.iq ?? "—"}`, s.x, 762);

    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillStyle = s.won ? "#e0e0e0" : "#444";
    ctx.fillText(s.name.toUpperCase().slice(0, 14), s.x, 830);
  }

  ctx.font = "bold 16px Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText(window.location.hostname.replace(/^www\./, "").toUpperCase(), W / 2, 1038);

  return canvas.toDataURL("image/png");
}

function scoreTypingStrength(text: string): { score: number; label: string; color: string } {
  if (!text.trim()) return { score: 0, label: "Start writing…", color: "var(--text-dim)" };
  let score = 0;
  score += Math.min(36, Math.floor(text.length / 11));
  const powerWords = ["however","evidence","research","because","therefore","clearly","furthermore","moreover","demonstrates","contrary","data","fact","shows","study","prove","argue","significantly","critical","essential","crucial","undeniable","consider","perspective","impact","assert","contend","challenge","counter","rebut","refute","support"];
  const lower = text.toLowerCase();
  let wb = 0;
  for (const w of powerWords) { if (lower.includes(w)) wb += 4; }
  score += Math.min(34, wb);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  score += Math.min(20, sentences * 4);
  score = Math.min(99, score);
  if (score < 20) return { score, label: "Weak", color: "#e63946" };
  if (score < 44) return { score, label: "Decent", color: "#f4a261" };
  if (score < 67) return { score, label: "Strong", color: "#e9c46a" };
  if (score < 84) return { score, label: "Killer", color: "#2a9d8f" };
  return { score, label: "ELITE", color: "#0077ff" };
}

function getSignatureStyle(logic: number, persuasion: number, delivery: number, won: boolean): { name: string; icon: string; desc: string } {
  if (logic >= 75 && logic > persuasion + 8) return { name: "Evidence Machine", icon: "🔬", desc: "Data-driven. Methodical. Unshakeable." };
  if (persuasion >= 75 && persuasion > logic + 8) return { name: "The Pivot", icon: "🌀", desc: "Fluid. Adaptive. Always finds the angle." };
  if (delivery >= 75 && logic >= 65 && persuasion >= 65) return { name: "The Orator", icon: "🎤", desc: "Commanding. Polished. Born for the arena." };
  if (logic >= 72 && delivery >= 70) return { name: "The Prosecutor", icon: "⚖️", desc: "Precise. Relentless. No argument survives." };
  if (logic + persuasion + delivery >= 225) return { name: "Iron Curtain", icon: "🛡️", desc: "No gaps. No weakness. Total dominance." };
  if (!won && logic < 42) return { name: "Chaos Agent", icon: "⚡", desc: "Unpredictable. Dangerous. Rules optional." };
  return { name: "Scrapper", icon: "🥊", desc: "Raw. Determined. Never backs down." };
}

function getRankedTier(score: number): { tier: string; cls: string; icon: string } {
  if (score >= 85) return { tier: "Clash Master", cls: "tier-clash-master", icon: "👑" };
  if (score >= 70) return { tier: "Diamond", cls: "tier-diamond", icon: "💎" };
  if (score >= 55) return { tier: "Gold", cls: "tier-gold", icon: "🥇" };
  if (score >= 40) return { tier: "Silver", cls: "tier-silver", icon: "🥈" };
  return { tier: "Bronze", cls: "tier-bronze", icon: "🥉" };
}

function calcXP(logic: number, persuasion: number, delivery: number, won: boolean, streak: number) {
  const logicXP = Math.round(logic * 0.5);
  const persuasionXP = Math.round(persuasion * 0.5);
  const deliveryXP = Math.round(delivery * 0.4);
  const streakBonus = won && streak >= 2 ? streak * 10 : 0;
  const winBonus = won ? 50 : 0;
  return { logic: logicXP, persuasion: persuasionXP, delivery: deliveryXP, streak: streakBonus + winBonus, total: logicXP + persuasionXP + deliveryXP + streakBonus + winBonus };
}

type Screen = "home" | "setup" | "matchmaking" | "debate" | "verdict" | "leaderboard" | "replay" | "gauntlet-intro" | "gauntlet-between" | "gauntlet-final" | "multiplayer-lobby" | "multiplayer-waiting" | "multiplayer-debate" | "multiplayer-results" | "dashboard" | "forge-rival" | "forge-rival-result";

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
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showCoachReveal, setShowCoachReveal] = useState(false);
  const [mirrorMatchMode, setMirrorMatchMode] = useState(false);
  const lastUserArgsRef = useRef<string[]>([]);
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
  const [liveOnline, setLiveOnline] = useState(() => 840 + Math.floor(Math.random() * 360));
  const [liveToday, setLiveToday] = useState(() => 2340 + Math.floor(Math.random() * 1200));
  const [showRoundFlash, setShowRoundFlash] = useState<number | null>(null);
  const [sigStyle, setSigStyle] = useState<{ name: string; icon: string; desc: string } | null>(null);
  const [earnedXP, setEarnedXP] = useState<{ logic: number; persuasion: number; delivery: number; streak: number; total: number } | null>(null);
  const [mmrResult, setMmrResult] = useState<MmrResult | null>(null);
  const [progressionResult, setProgressionResult] = useState<ProgressionResult | null>(null);
  const [propagandaTags, setPropagandaTags] = useState<PropagandaTag[][]>([]);
  const [showGhostReveal, setShowGhostReveal] = useState(false);

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
  const [roomModerationWarning, setRoomModerationWarning] = useState("");
  const [v1RoundTimeLeft, setV1RoundTimeLeft] = useState<number | null>(null);
  const v1RoundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const v1TimerStartedRound = useRef<number | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomJoinCode, setRoomJoinCode] = useState("");
  const [v1SubScreen, setV1SubScreen] = useState<"" | "join">("");
  const [waitingTopics, setWaitingTopics] = useState<{cat: string; text: string}[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [v1Tab, setV1Tab] = useState<"play" | "history">("play");
  const [v1History, setV1History] = useState<V1HistoryEntry[]>(() => { try { return JSON.parse(localStorage.getItem("clash-1v1-history") || "[]"); } catch { return []; } });
  const [devilsAdvocateMode, setDevilsAdvocateMode] = useState(false);
  const [whisperMode, setWhisperMode] = useState(false);
  const [whisperFeedback, setWhisperFeedback] = useState<{score: number; text: string} | null>(null);
  const [showWarRoom, setShowWarRoom] = useState(false);
  const [trashTalkBubble, setTrashTalkBubble] = useState<string | null>(null);
  const [v1SendLine, setV1SendLine] = useState<string | null>(null);
  const lastTrashRoundRef = useRef(0);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trashQueueRef = useRef<string[]>([]);
  const trashIdxRef = useRef(0);
  const viewingArgsAfterMatch = useRef(false);
  const [viewingArgsMode, setViewingArgsMode] = useState(false);
  const [myTrashBubble, setMyTrashBubble] = useState<string | null>(null);
  const [incomingTaunt, setIncomingTaunt] = useState<RoomTaunt | null>(null);
  const lastSeenTauntIdRef = useRef(0);
  const [graveyardArgs, setGraveyardArgs] = useState<{text: string; round: number; score: number}[]>([]);
  const [newCard, setNewCard] = useState<DebateCard | null>(null);
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [showForgeRival, setShowForgeRival] = useState(false);
  const [forgeForm, setForgeForm] = useState({
    name: "",
    avatar: "🤖",
    tone: "aggressive" as "calm" | "aggressive" | "sarcastic" | "analytical",
    aggression: 7,
    logicLevel: 6,
    humorLevel: 3,
    difficulty: "medium" as "easy" | "medium" | "hard" | "extreme",
    memoryEnabled: false,
    backstory: "",
  });
  const [createdRival, setCreatedRival] = useState<{
    id: number; shareCode: string; name: string; avatar: string; tone: string;
    aggression: number; logicLevel: number; humorLevel: number; difficulty: string; memoryEnabled: boolean;
  } | null>(null);
  const [forgeCreating, setForgeCreating] = useState(false);
  const [forgeError, setForgeError] = useState("");
  const [profileTab, setProfileTab] = useState<"overview" | "cards" | "graveyard">("overview");
  const [profileCards, setProfileCards] = useState<DebateCard[]>([]);
  const [profileCardsLoading, setProfileCardsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingVerdictRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submitArgumentRef = useRef<((forcedText?: string) => Promise<void>) | null>(null);
  const submitRoomArgRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    document.body.style.visibility = "visible";
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

  // Restore auth session on mount — load the account's own player profile
  useEffect(() => {
    try {
      const token = localStorage.getItem("clash-auth-token");
      if (!token) return;
      (async () => {
        try {
          const me = await apiAuthGet<{userId: number; playerId: number; email: string}>("/auth/me");
          setAuthUser({ email: me.email, playerId: me.playerId });
          const profile = await apiAuthGet<PlayerProfile>("/auth/player");
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
          }
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
    const spectateParam = params.get("spectate");
    if (spectateParam && spectateParam.length === 6) {
      apiGet<RoomState>(`/1v1/room/${spectateParam.toUpperCase()}`)
        .then(room => {
          setCurrentRoom(room);
          setRoomPlayerNum(null);
          if (room.status === "complete") setScreen("multiplayer-results");
          else if (room.status === "debating") setScreen("multiplayer-debate");
          else setScreen("multiplayer-waiting");
        })
        .catch(() => {});
    }
    const customAIParam = params.get("customAI");
    if (customAIParam) {
      try {
        const d = JSON.parse(atob(customAIParam));
        if (d.n && d.p) {
          setCustomOpponent({ name: d.n, personality: d.p, diff: d.d || "medium", icon: d.i || "🎭" });
          setSelectedAI("custom");
          setDisplayTopics(pickTopics());
          setSetupStep(0);
          setScreen("setup");
        }
      } catch { /* ignore malformed */ }
    }
    const rivalParam = params.get("rival");
    if (rivalParam && rivalParam.length > 0) {
      apiGet<{ id: number; shareCode: string; name: string; avatar: string; tone: string; aggression: number; logicLevel: number; humorLevel: number; difficulty: string; memoryEnabled: boolean }>(`/rivals/${rivalParam.toUpperCase()}`)
        .then((rival) => {
          const personality = buildRivalPersonality({ name: rival.name, tone: rival.tone, aggression: rival.aggression, logicLevel: rival.logicLevel, humorLevel: rival.humorLevel, difficulty: rival.difficulty, memoryEnabled: rival.memoryEnabled });
          setCustomOpponent({ name: rival.name, personality, diff: rival.difficulty as "easy" | "medium" | "hard" | "extreme", icon: rival.avatar });
          setSelectedAI("custom");
          setDisplayTopics(pickTopics());
          setSetupStep(1);
          setScreen("setup");
        })
        .catch(() => {});
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
        const room = await apiAuthGet<RoomState>(`/1v1/room/${currentRoom.code}`);
        setCurrentRoom(room);
        if (room.status === "debating" && screen === "multiplayer-waiting") setScreen("multiplayer-debate");
        if (room.status === "complete" && screen !== "multiplayer-results" && !viewingArgsAfterMatch.current) setScreen("multiplayer-results");
        if (room.latestTaunt && room.latestTaunt.id > lastSeenTauntIdRef.current && room.latestTaunt.fromPlayerNum !== room.playerNum) {
          lastSeenTauntIdRef.current = room.latestTaunt.id;
          setIncomingTaunt(room.latestTaunt);
          setTimeout(() => setIncomingTaunt(null), 5000);
        }
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

  // Load player profile from DB on mount — skip device-based load if already logged in (auth effect handles it)
  useEffect(() => {
    const token = localStorage.getItem("clash-auth-token");
    if (token) return;
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

  // Browser back button — stay in-app instead of navigating away
  useEffect(() => {
    window.history.pushState(null, document.title, window.location.pathname);
    const onPop = () => {
      reset();
      window.history.pushState(null, document.title, window.location.pathname);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Clean up timer when leaving the debate screen
  useEffect(() => {
    if (screen !== "multiplayer-debate") stopV1RoundTimer();
  }, [screen]);

  // Trash talk bubbles — 1v1 multiplayer only
  useEffect(() => {
    if (screen !== "multiplayer-debate") { setTrashTalkBubble(null); return; }
    const show = () => {
      setV1SendLine(getNextTrashLine(trashQueueRef, trashIdxRef));
      setTimeout(() => setV1SendLine(null), 8000);
    };
    const delay = 8000 + Math.random() * 6000;
    const t = setTimeout(() => {
      show();
      const iv = setInterval(() => { show(); }, 14000 + Math.random() * 8000);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [screen]);

  // 1v1 round trash talk — show "send this" bubble after each round completes
  useEffect(() => {
    if (screen !== "multiplayer-debate" || !currentRoom) return;
    const round = currentRoom.currentRound;
    if (round > 1 && round > lastTrashRoundRef.current) {
      lastTrashRoundRef.current = round;
      const line = getNextTrashLine(trashQueueRef, trashIdxRef);
      setV1SendLine(line);
      const t = setTimeout(() => setV1SendLine(null), 6000);
      return () => clearTimeout(t);
    }
    return;
  }, [currentRoom?.currentRound, screen]);

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

  const handleForgeCreate = useCallback(async () => {
    if (!forgeForm.name.trim()) return;
    setForgeCreating(true);
    setForgeError("");
    try {
      const data = await apiPost<{ id: number; shareCode: string; name: string; avatar: string; tone: string; aggression: number; logicLevel: number; humorLevel: number; difficulty: string; memoryEnabled: boolean }>("/rivals", {
        name: forgeForm.name.trim(),
        avatar: forgeForm.avatar,
        tone: forgeForm.tone,
        aggression: forgeForm.aggression,
        logicLevel: forgeForm.logicLevel,
        humorLevel: forgeForm.humorLevel,
        difficulty: forgeForm.difficulty,
        memoryEnabled: forgeForm.memoryEnabled,
        creatorDeviceId: getOrCreateDeviceId(),
      });
      setCreatedRival(data);
      setScreen("forge-rival-result");
    } catch {
      setForgeError("Failed to create rival. Try again.");
    } finally {
      setForgeCreating(false);
    }
  }, [forgeForm]);


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
            setTimeout(() => {
              submitArgumentRef.current?.();
            }, 80);
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

    const isMirror = mirrorMatchMode;

    const currentAI = isMirror
      ? { id: "mirror", icon: "🪞", name: "The Mirror", diff: "hard" as const, diffLabel: "Hard", timer: 135, desc: "An AI trained on your own arguments.", personality: "" }
      : aiId === "custom"
        ? { id: "custom", icon: customOpponent.icon || "🎭", name: customOpponent.name || "Custom Opponent", diff: customOpponent.diff, diffLabel: customOpponent.diff.charAt(0).toUpperCase() + customOpponent.diff.slice(1), timer: 120, desc: "Your custom opponent.", personality: customOpponent.personality }
        : AI_OPPONENTS.find((a) => a.id === aiId);
    if (!currentAI || (!isMirror && !currentAI.personality) || !topic || !side) return;

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
    setMirrorMatchMode(false);
    setGraveyardArgs([]);
    setWhisperFeedback(null);
    setWhisperMode(false);
    setScreen("matchmaking");

    const sideLabel = side === "for" ? "FOR" : "AGAINST";
    const oppSide = side === "for" ? "AGAINST" : "FOR";

    try {
      const storedArgs: string[] = (() => {
        try { return JSON.parse(localStorage.getItem("clash-last-args") || "[]"); } catch { return []; }
      })();
      const userArguments = lastUserArgsRef.current.length > 0 ? lastUserArgsRef.current : storedArgs;

      const [result] = await Promise.all([
        isMirror
          ? apiPost<{ text: string }>("/debate/mirror-match-start", {
              userArguments,
              topic: topic.text,
              userSide: sideLabel,
              totalRounds: rounds,
            })
          : apiPost<{ text: string }>("/debate/start", {
              personality: devilsAdvocateMode
                ? `${currentAI.personality}\n\nIMPORTANT: For this debate you are arguing the SAME side as the user (${sideLabel}). Act as their ally — but expose weaknesses, steelman alternative views, and push them to make stronger, more nuanced arguments. Challenge them to improve, not to defeat them.`
                : currentAI.personality,
              topic: topic.text,
              userSide: sideLabel,
              oppSide: devilsAdvocateMode ? sideLabel : oppSide,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAI, selectedTopic, selectedSide, selectedRounds, devilsAdvocateMode]);

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
        roundScore: { score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; propaganda?: PropagandaTag[] };
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

      const newRoundScores: RoundScore[] = [...roundScores, { round: roundNumber, ...roundScore, propaganda: roundScore.propaganda || [] }];
      setRoundScores(newRoundScores);
      if (roundScore.score < 40) {
        setGraveyardArgs(prev => [...prev, { text: userMsg, round: roundNumber, score: roundScore.score }]);
      }
      if (roundScore.propaganda && roundScore.propaganda.length > 0) {
        setPropagandaTags(prev => [...prev, roundScore.propaganda!]);
      }
      if (whisperMode) {
        apiPost<{ feedback: string; score: number }>("/debate/whisper-score", {
          argument: userMsg,
          topic: selectedTopic?.text ?? "",
          userSide: sideLabel,
          round: roundNumber,
        }).then(w => setWhisperFeedback({ score: w.score, text: w.feedback })).catch(() => {});
      }
      playSound(roundScore.score >= 60 ? "round-win" : "round-loss");
      if (roundScore.score >= 95) unlockAch("perfect-round");
      setMessages([...newMessages, { role: "ai", text: aiText }]);
      lastUserArgsRef.current = [...newMessages.filter(m => m.role === "user").map(m => m.text)];

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

  // Keep submitArgumentRef in sync so the timer can call the latest version
  useEffect(() => { submitArgumentRef.current = submitArgument; }, [submitArgument]);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveOnline(n => Math.max(600, Math.min(1800, n + Math.floor(Math.random() * 40) - 20)));
      setLiveToday(n => n + Math.floor(Math.random() * 3) + 1);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (roundScores.length > 0 && screen === "debate") {
      const next = roundScores.length + 1;
      if (next <= selectedRounds) {
        setShowRoundFlash(next);
        const t = setTimeout(() => setShowRoundFlash(null), 900);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundScores.length]);

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
      const judgeVerdict = await apiPost<{ verdict: string; improve: string; rank: string; outcome: string; coachWorked?: string; coachFailed?: string; coachDrill?: string }>("/debate/verdict", {
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
        coachWorked: judgeVerdict.coachWorked,
        coachFailed: judgeVerdict.coachFailed,
        coachDrill: judgeVerdict.coachDrill,
      });

      const finalRank = judgeVerdict.rank || (won ? "B" : "D");

      const nextStreak = won ? (stats.currentStreak ?? 0) + 1 : 0;
      setSigStyle(getSignatureStyle(avgLogic, avgPersuasion, avgDelivery, won));
      setEarnedXP(calcXP(avgLogic, avgPersuasion, avgDelivery, won, nextStreak));
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
        const isLoggedIn = !!localStorage.getItem("clash-auth-token");
        const savePayload = {
          deviceId: getOrCreateDeviceId(),
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
        };
        (isLoggedIn ? apiAuthPost("/debates/save", savePayload) : apiPost("/debates/save", savePayload))
          .then(() => {
            if (isLoggedIn) {
              apiAuthGet<PlayerProfile>("/auth/player").then((p) => setPlayer(p)).catch(() => {});
              // Update MMR ranking
              apiAuthPost<MmrResult>("/rankings/update", { won, avgScore, avgLogic, avgPersuasion, avgDelivery, opponentDifficulty: ai?.diff || "medium" })
                .then((mmr) => setMmrResult(mmr)).catch(() => {});
              // Update progression (shield tokens, dynasty, title)
              apiAuthPost<ProgressionResult>("/progression/post-debate", { won, avgScore, currentStreak: won ? (stats.currentStreak ?? 0) + 1 : 0, opponentId: selectedAI || "unknown" })
                .then((prog) => setProgressionResult(prog)).catch(() => {});
            } else {
              apiGet<PlayerProfile>(`/players/${getOrCreateDeviceId()}`).then((p) => setPlayer(p)).catch(() => {});
            }
          }).catch(() => {});
      }
      // Save user arguments for Mirror Match
      try {
        const userArgs = _msgs.filter(m => m.role === "user").map(m => m.text);
        localStorage.setItem("clash-last-args", JSON.stringify(userArgs.slice(0, 10)));
      } catch {}

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
        setShowMatchDetails(false);
        setShowCoachReveal(false);
        setScreen("verdict");
        if (authUser) {
          try {
            const ai = AI_OPPONENTS.find(a => a.id === selectedAI);
            const bestQuote = _msgs.filter(m => m.role === "user").slice(-1)[0]?.text || "";
            const generated = await apiAuthPost<DebateCard>("/cards/generate", {
              opponentId: selectedAI,
              opponentName: ai?.name || selectedAI,
              topic: selectedTopic?.text || "",
              score: avgScore,
              rank: judgeVerdict.rank || (won ? "B" : "D"),
              bestQuote: bestQuote.slice(0, 200),
              won,
              streak: stats.currentStreak,
            });
            setNewCard(generated);
            setTimeout(() => setShowCardReveal(true), 1200);
          } catch {}
        }
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
    setMmrResult(null);
    setProgressionResult(null);
    setPropagandaTags([]);
    setShowGhostReveal(false);
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
      const data = await apiAuthPost<{token: string; email: string; playerId: number}>("/auth/login", { email: authEmail, password: authPassword });
      localStorage.setItem("clash-auth-token", data.token);
      setAuthUser({ email: data.email, playerId: data.playerId });
      try {
        const profile = await apiAuthGet<PlayerProfile>("/auth/player");
        setPlayer(profile);
        if (profile.stats.debates > 0) {
          setStats({ wins: profile.stats.wins, debates: profile.stats.debates, bestScore: profile.stats.bestScore, currentStreak: profile.stats.currentStreak ?? 0, bestStreak: profile.stats.bestStreak ?? 0, opponentHistory: profile.stats.opponentHistory });
        }
      } catch {}
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
        try { await apiAuthPatch("/players/username", { username: clean }); } catch {}
      }
      try {
        const profile = await apiAuthGet<PlayerProfile>("/auth/player");
        setPlayer(profile);
      } catch {}
      setShowAuthModal(false);
      setAuthEmail(""); setAuthPassword(""); setRegUsername("");
    } catch (e) { setAuthError((e as Error).message); }
    finally { setAuthLoading(false); }
  };

  const logoutFn = () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith("clash-") || k.startsWith("clash_"))
      .forEach(k => localStorage.removeItem(k));
    setAuthUser(null);
    setPlayer(null);
    setShowAuthModal(false);
    setShowProfilePanel(false);
    setStats({ wins: 0, debates: 0, bestScore: 0, currentStreak: 0, bestStreak: 0, opponentHistory: {} });
  };

  const shuffleWaitingTopics = () => {
    const pool = TOPIC_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    setWaitingTopics(pool.slice(0, 3));
  };

  const setRoomTopicFn = async (topic: { cat: string; text: string }) => {
    if (!currentRoom || roomPlayerNum !== 1) return;
    setCurrentRoom(prev => prev ? { ...prev, topicText: topic.text, topicCat: topic.cat } : prev);
    if (topic.cat === "Custom") {
      setWaitingTopics(prev => {
        const filtered = prev.filter(t => t.cat !== "Custom");
        return [{ cat: "Custom", text: topic.text }, ...filtered].slice(0, 3);
      });
    }
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/set-topic`, { topicText: topic.text, topicCat: topic.cat });
    } catch (e) {
      setRoomError((e as Error).message);
      setCurrentRoom(prev => prev ? { ...prev, topicText: currentRoom.topicText, topicCat: currentRoom.topicCat } : prev);
    }
  };

  const setRoomRoundsFn = async (rounds: number) => {
    if (!currentRoom || roomPlayerNum !== 1) return;
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/set-rounds`, { totalRounds: rounds });
      setCurrentRoom(prev => prev ? { ...prev, totalRounds: rounds } : prev);
    } catch {}
  };

  const setSpeedRoundFn = async (speedRound: boolean) => {
    if (!currentRoom || roomPlayerNum !== 1) return;
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/set-speed`, { speedRound });
      setCurrentRoom(prev => prev ? { ...prev, speedRound } : prev);
    } catch {}
  };

  const createRoom = async (opts?: { topicText?: string; topicCat?: string; speedRound?: boolean }) => {
    setRoomLoading(true); setRoomError("");
    try {
      const data = await apiAuthPost<{code: string}>("/1v1/create", { totalRounds: 3, ...opts });
      const room = await apiAuthGet<RoomState>(`/1v1/room/${data.code}`);
      const pool = TOPIC_POOL.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      setWaitingTopics(pool.slice(0, 3));
      setCurrentRoom(room);
      setRoomPlayerNum(1);
      setScreen("multiplayer-waiting");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomLoading(false); }
  };

  const rematchRoom = async () => {
    if (!currentRoom) return;
    await createRoom({ topicText: currentRoom.topicText, topicCat: currentRoom.topicCat });
  };

  const joinRoom = async () => {
    if (!roomJoinCode || roomJoinCode.length !== 6) return;
    setRoomLoading(true); setRoomError("");
    try {
      const data = await apiAuthPost<{code: string; playerNum: number}>("/1v1/join", { code: roomJoinCode });
      const room = await apiAuthGet<RoomState>(`/1v1/room/${data.code}`);
      setCurrentRoom(room);
      setRoomPlayerNum(data.playerNum as 1 | 2);
      setScreen(room.status === "debating" ? "multiplayer-debate" : "multiplayer-waiting");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomLoading(false); }
  };

  const setRoomSide = async (side: "for" | "against") => {
    if (!currentRoom) return;
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/sides`, { side });
      const opp: "for" | "against" = side === "for" ? "against" : "for";
      setCurrentRoom(prev => prev ? { ...prev, player1Side: side, player2Side: opp } : prev);
    } catch (e) { setRoomError((e as Error).message); }
  };

  const markReady = async () => {
    if (!currentRoom) return;
    try { await apiAuthPost(`/1v1/${currentRoom.code}/ready`, {}); }
    catch (e) { setRoomError((e as Error).message); }
  };

  const checkRoomMessage = (text: string): string | null => {
    const t = text.toLowerCase().replace(/[*@#!$%^&_\-+=|\\<>]+/g, "");
    const blocked: RegExp[] = [
      /\bkys\b/,
      /kill\s+your\s*self/,
      /\b(i('ll| will| am going to|'m going to))\s+(kill|murder|hurt|destroy)\s+(you|u)\b/,
      /\bdie\s+(you|bitch|cunt|asshole|motherfucker)\b/,
      /\b(rape|molest)\b/,
      /\bfuck\s+you\b/,
      /\bfuck\s+off\b/,
      /\bgo\s+fuck\s+your/,
      /\b(shit|ass)\s*hole\b.*\byou\b/,
      /you'?re?\s+(a\s+)?(fucking\s+)?(worthless|subhuman|piece\s+of\s+shit|trash|waste\s+of)/,
      /\bn[i1!]+g{1,}[ae]+r?\b/,
      /\bn[i1!]+g{2,}\b/,
      /\bf[a4]+g+(ot)?\b/,
      /\bretard\b/,
      /\bcunt\b/,
      /\b(black|brown|dark)\s+(monkey|ape|gorilla|chimp|chimpanzee|baboon)\b/,
      /\b(monkey|ape|gorilla|chimp|baboon)\s+(go\s+back|people|person|belong)\b/,
      /go\s+back\s+to\s+(africa|your\s+(country|jungle|cage))/,
      /\b(cotton\s*pick|porch\s*monk|jungle\s*bunn|tree\s*swing)\b/,
      /\b(sp[i1]+c|w[e3]+tb[a4]+ck|ch[i1]+nk|g[o0]{2,}k|k[i1]+k[e3]+|cr[a4]+ck[e3]+r\s+ass|sand\s*n[i1]+g)\b/,
      /\b(towel\s*head|raghead|camel\s*jock|sand\s*monkey)\b/,
      /\b(zipperhead|slope\s+eye|slant\s+eye)\b/,
      /\bsubhuman\b/,
      /you\s+(are\s+)?(not\s+even\s+)?(a\s+)?(real\s+)?(human|person)\b.*\b(black|brown|asian|jewish|muslim)\b/,
    ];
    for (const pat of blocked) {
      if (pat.test(t)) {
        return "Keep it fierce, not abusive. Strong arguments win debates — personal attacks don't.";
      }
    }
    return null;
  };

  const stopV1RoundTimer = () => {
    if (v1RoundTimerRef.current) { clearInterval(v1RoundTimerRef.current); v1RoundTimerRef.current = null; }
    setV1RoundTimeLeft(null);
    v1TimerStartedRound.current = null;
  };

  const startV1RoundTimerIfNeeded = (round: number) => {
    if (v1TimerStartedRound.current === round) return;
    if (v1RoundTimerRef.current) clearInterval(v1RoundTimerRef.current);
    v1TimerStartedRound.current = round;
    setV1RoundTimeLeft(currentRoom?.speedRound ? 60 : 300);
    v1RoundTimerRef.current = setInterval(() => {
      setV1RoundTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          setTimeout(() => {
            if (submitRoomArgRef.current) submitRoomArgRef.current();
          }, 80);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitRoomArg = async () => {
    if (!currentRoom || !roomArgInput.trim() || roomSubmitting) return;
    const modWarning = checkRoomMessage(roomArgInput);
    if (modWarning) {
      setRoomModerationWarning(modWarning);
      return;
    }
    setRoomModerationWarning("");
    stopV1RoundTimer();
    setRoomSubmitting(true);
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/argue`, { argumentText: roomArgInput.trim() });
      setRoomArgInput("");
    } catch (e) { setRoomError((e as Error).message); }
    finally { setRoomSubmitting(false); }
  };

  // Keep submitRoomArgRef in sync so the timer can call the latest version
  useEffect(() => { submitRoomArgRef.current = submitRoomArg; }, [submitRoomArg]);

  const forfeitRoom = async () => {
    if (!currentRoom) return;
    try {
      await apiAuthPost(`/1v1/${currentRoom.code}/forfeit`, {});
      const room = await apiAuthGet<RoomState>(`/1v1/room/${currentRoom.code}`);
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
  const trimmed = usernameInput.trim();
  if (trimmed.length < 2) { 
    setUsernameError("Must be at least 2 characters."); 
    return; 
  }
  
  setUsernameError("");
  
  try {
    const isLoggedIn = !!localStorage.getItem("clash-auth-token");
    if (isLoggedIn) {
      await apiAuthPatch("/players/username", { username: trimmed });
    } else {
      const deviceId = getOrCreateDeviceId();
      await apiPost("/players/register", { deviceId });
      await apiPatch("/players/username", { deviceId, username: trimmed });
    }
    
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
          {(stats.currentStreak ?? 0) >= 2 && (() => {
            const s = stats.currentStreak;
            const cls = s >= 10 ? "streak-blue" : s >= 5 ? "streak-green" : "streak-fire";
            return (
              <span className={`nav-streak ${cls}`}>
                🔥{s}
              </span>
            );
          })()}
          {authUser ? (
            <>
              {mmrResult && (
                <span className={`nav-mmr-chip ${mmrResult.newTier.toLowerCase().replace(" ", "-")}`}>
                  {mmrResult.newTier.toUpperCase()}
                </span>
              )}
              <button
                className="user-chip"
                onClick={() => { setUsernameInput(player?.username || ""); setUsernameError(""); setProfileTab("overview"); setShowProfilePanel(p => !p); }}
              >
                <span className="user-chip-av">{(player?.username || authUser.email)[0].toUpperCase()}</span>
                <span className="user-chip-name">{player?.username || authUser.email.split("@")[0]}</span>
              </button>
            </>
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
            <div className="home-modes">
              <button
                className="home-mode-btn red"
                onClick={() => { setV1SubScreen(""); setV1Tab("play"); setRoomError(""); setRoomJoinCode(""); setScreen("multiplayer-lobby"); }}
              >
                <span className="home-mode-icon">⚔</span>
                <div className="home-mode-title red">1V1</div>
                <div className="home-mode-sub">vs Human</div>
              </button>
              <button
                className="home-mode-btn gold"
                onClick={() => { setGauntletNextSide(null); setScreen("gauntlet-intro"); }}
              >
                <span className="home-mode-icon">🏆</span>
                <div className="home-mode-title gold">Gauntlet</div>
                <div className="home-mode-sub">6 opponents</div>
              </button>
              <button
                className="home-mode-btn purple"
                title={stats.debates < 5 ? `Unlocks after ${5 - stats.debates} more debate${5 - stats.debates !== 1 ? "s" : ""}` : "Fight an AI trained on your own argument style"}
                disabled={stats.debates < 5}
                onClick={() => {
                  if (stats.debates < 5) return;
                  setMirrorMatchMode(true);
                  setDisplayTopics(pickTopics());
                  setSetupStep(1);
                  setScreen("setup");
                }}
              >
                <span className="home-mode-icon">🪞</span>
                <div className="home-mode-title purple">Mirror</div>
                <div className="home-mode-sub">{stats.debates < 5 ? `${5 - stats.debates} left` : "Your style"}</div>
              </button>
            </div>
          </div>
          {/* RIVAL CHIP */}
          {authUser && (() => {
            const rivalEntry = Object.entries(stats.opponentHistory ?? {})
              .filter(([, h]) => (h as {wins:number;losses:number}).losses > 0)
              .sort((a, b) => (b[1] as {wins:number;losses:number}).losses - (a[1] as {wins:number;losses:number}).losses)[0];
            const rival = rivalEntry ? AI_OPPONENTS.find(a => a.id === rivalEntry[0]) : null;
            if (!rival) return null;
            const rh = rivalEntry[1] as {wins:number;losses:number};
            return (
              <div className="rival-chip-wrap">
                <button
                  className="rival-chip"
                  onClick={() => { setSelectedAI(rival.id); setDisplayTopics(pickTopics()); setSetupStep(0); setScreen("setup"); }}
                  title={`${rh.losses} loss${rh.losses !== 1 ? "es" : ""} — get revenge`}
                >
                  Rival: {rival.icon} {rival.name} · {rh.losses}L
                </button>
              </div>
            );
          })()}

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
                  <div className="featured-meta-row">
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
                {(feedExpanded ? feedItems : feedItems.slice(0, 3)).map((item, i) => (
                  <div key={i} className="feed-item" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="feed-icon">{item.icon}</span>
                    <span className="feed-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                    <span className={`feed-badge ${item.badgeClass}`}>{item.badge}</span>
                    <span className="feed-time">{item.time}</span>
                  </div>
                ))}
              </div>
              {feedItems.length > 3 && (
                <button
                  className="feed-show-more"
                  onClick={() => setFeedExpanded(e => !e)}
                >
                  {feedExpanded ? "Show less ↑" : `Show ${feedItems.length - 3} more ↓`}
                </button>
              )}
            </div>

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
          <div className="setup-steps">
            <div className={`setup-step-node ${setupStep > 0 ? "done" : "active"}`}>1</div>
            <div className={`setup-step-seg ${setupStep > 0 ? "done" : ""}`} />
            <div className={`setup-step-node ${setupStep > 1 ? "done" : setupStep === 1 ? "active" : ""}`}>2</div>
            <div className={`setup-step-seg ${setupStep > 1 ? "done" : ""}`} />
            <div className={`setup-step-node ${setupStep === 2 ? "active" : ""}`}>3</div>
          </div>
          {setupStep === 0 && (
            <>
              <p className="section-label">Choose your opponent</p>
              {nemesisBot && (
                <div className="nemesis-card" style={{ marginBottom: "16px", cursor: "pointer" }} onClick={() => { setSelectedAI(nemesisBot.id); setSetupStep(1); }}>
                  <div className="nemesis-icon">{nemesisBot.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nemesis-name" style={{ color: "var(--red)" }}>Rematch · {nemesisBot.name}</div>
                    <div className="nemesis-sub">{nemesisBot.losses} loss{nemesisBot.losses !== 1 ? "es" : ""} · Unfinished business</div>
                  </div>
                  <button className="nemesis-rematch" onClick={(e) => { e.stopPropagation(); setSelectedAI(nemesisBot.id); setSetupStep(1); }}>
                    Go →
                  </button>
                </div>
              )}
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
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button className="btn btn-ghost" onClick={() => setScreen("home")}>← Home</button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!selectedAI}
                  onClick={() => setSetupStep(selectedTopic ? 2 : 1)}
                >
                  {selectedTopic ? "Next: Pick Side →" : "Next: Pick Topic →"}
                </button>
              </div>
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
              <div className="topic-preview-card">
                <div className="tpc-label">Topic</div>
                <div className="tpc-text">{selectedTopic?.text}</div>
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
              <div
                className={`da-toggle${devilsAdvocateMode ? " active" : ""}`}
                onClick={() => setDevilsAdvocateMode(p => !p)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setDevilsAdvocateMode(p => !p); }}
              >
                <div className="da-toggle-knob" />
                <div className="da-toggle-label">
                  <div className="da-toggle-title">Devil's Advocate</div>
                  <div className="da-toggle-sub">AI argues YOUR side — stress-test your own position</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "17px", letterSpacing: "4px", padding: "18px 32px" }}
                  disabled={!selectedSide}
                  onClick={() => launchMatchmaking()}
                >
                  START CLASH
                </button>
                <button className="btn btn-ghost" style={{ alignSelf: "flex-start", fontSize: "13px" }} onClick={() => setSetupStep(1)}>← Back</button>
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
              {(() => {
                const s = scoreTypingStrength(inputText);
                return (
                  <>
                    <div className="strength-wrap">
                      <div className="strength-label-row">
                        <span className="strength-lbl" style={{ color: s.score > 0 ? s.color : "var(--text-dim)" }}>{s.label}</span>
                        {s.score > 0 && <span className="strength-pct" style={{ color: s.color }}>{s.score}</span>}
                      </div>
                      <div className="strength-bar-track">
                        <div className="strength-bar-fill" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                    {whisperFeedback && (
                      <div className="whisper-feedback">
                        <div className="whisper-feedback-lbl">🔇 Whisper — Round {roundScores.length} coaching (score: {whisperFeedback.score})</div>
                        <div className="whisper-feedback-text">{whisperFeedback.text}</div>
                      </div>
                    )}
                  </>
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
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
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
                  <button
                    className={`whisper-btn${whisperMode ? " active" : ""}`}
                    onClick={() => { setWhisperMode(p => !p); setWhisperFeedback(null); }}
                    title="Whisper Mode: get private coaching on your argument before AI responds"
                  >
                    {whisperMode ? "🔇 Whisper ON" : "🔇 Whisper"}
                  </button>
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
          <div className={`verdict-card ${verdict.won ? "win-card" : "lose-card"}`}>
            {progressionResult && progressionResult.dynastyStreak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(244,197,66,0.07)", border: "1px solid rgba(244,197,66,0.2)", borderRadius: "var(--radius)", marginBottom: "12px" }}>
                <span style={{ fontSize: "20px" }}>👑</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "2px" }}>Debate Dynasty</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "18px", letterSpacing: "2px", color: "var(--gold)" }}>{progressionResult.dynastyStreak} Consecutive Wins</div>
                </div>
              </div>
            )}
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

            {/* MATCH DETAILS COLLAPSIBLE */}
            <button className="match-details-btn" onClick={() => setShowMatchDetails(m => !m)}>
              <span>Match Details</span>
              <span>{showMatchDetails ? "▲" : "▼"}</span>
            </button>
            {showMatchDetails && (
              <div className="match-details-panel">
                <div className="verdict-moments" style={{ marginBottom: "12px" }}>
                  <div className="best-arg">
                    <div className="arg-label best">✓ Best Moment</div>
                    <div style={{ fontSize: "13px", color: "var(--text-mid)" }}>{verdict.bestArg}</div>
                  </div>
                  <div className="worst-arg">
                    <div className="arg-label worst">✗ Fatal Flaw</div>
                    <div style={{ fontSize: "13px", color: "var(--text-mid)" }}>{verdict.weakArg}</div>
                  </div>
                </div>

                <div style={{ background: "rgba(0,119,255,0.07)", border: "1px solid rgba(0,119,255,0.2)", borderRadius: "var(--radius)", padding: "10px 14px", display: "flex", gap: "10px", alignItems: "baseline", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--blue)", whiteSpace: "nowrap" }}>IMPROVE</span>
                  <span style={{ fontSize: "14px", color: "var(--text-mid)" }}>{verdict.improve}</span>
                </div>

                <div className="coach-panel">
                  <div className="coach-panel-title"><span>🎯</span> COACH ANALYSIS</div>
                  {verdict.coachWorked && (
                    <div className="coach-row">
                      <div className="coach-row-label worked">✓ What Worked</div>
                      <div className="coach-row-text">{verdict.coachWorked}</div>
                    </div>
                  )}
                  {verdict.coachFailed && (
                    <div className="coach-row">
                      <div className="coach-row-label failed">✗ What Failed</div>
                      <div className="coach-row-text">{verdict.coachFailed}</div>
                    </div>
                  )}
                  {(verdict.coachDrill || verdict.improve) && (
                    <div className="coach-row">
                      <div className="coach-row-label drill">⚡ Drill for Next Match</div>
                      <div className="coach-row-text">{verdict.coachDrill || verdict.improve}</div>
                    </div>
                  )}
                  {!verdict.coachWorked && !verdict.coachFailed && (
                    <div className="coach-row">
                      <div className="coach-row-label drill">⚡ Focus Area</div>
                      <div className="coach-row-text">{verdict.improve || "Ground your claims with concrete evidence in each round."}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0 10px" }}>
                  {(() => { const tier = getRankedTier(verdict.avgScore); return <span className={`tier-badge ${tier.cls}`}>{tier.icon} {tier.tier}</span>; })()}
                  <div style={{ display: "flex", gap: "14px" }}>
                    {[{ label: "Logic", val: verdict.avgLogic, color: "#5ab4ff" }, { label: "Persuasion", val: verdict.avgPersuasion, color: "#e9c46a" }, { label: "Delivery", val: verdict.avgDelivery, color: "#2a9d8f" }].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dna-card">
                  <div className="dna-header">Argument DNA</div>
                  {[
                    { label: "Logic", val: verdict.avgLogic, color: "#5ab4ff" },
                    { label: "Persuasion", val: verdict.avgPersuasion, color: "#e9c46a" },
                    { label: "Delivery", val: verdict.avgDelivery, color: "#2a9d8f" },
                  ].map(({ label, val, color }) => (
                    <div className="dna-row" key={label}>
                      <span className="dna-label">{label}</span>
                      <div className="dna-track">
                        <div className="dna-fill" style={{ width: `${val}%`, backgroundColor: color }} />
                      </div>
                      <span className="dna-num" style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
                {sigStyle && (
                  <div className="sig-card" style={{ marginTop: "8px" }}>
                    <div className="sig-icon">{sigStyle.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "2px" }}>Your Style</div>
                      <div className="sig-name">{sigStyle.name}</div>
                      <div className="sig-desc">{sigStyle.desc}</div>
                    </div>
                  </div>
                )}
                {earnedXP && (
                  <div className="xp-card" style={{ marginTop: "8px" }}>
                    <div className="xp-card-header">XP Earned</div>
                    <div className="xp-row"><span className="xp-lbl">Logic Bonus</span><span className="xp-val">+{earnedXP.logic}</span></div>
                    <div className="xp-row"><span className="xp-lbl">Persuasion Bonus</span><span className="xp-val">+{earnedXP.persuasion}</span></div>
                    <div className="xp-row"><span className="xp-lbl">Delivery Bonus</span><span className="xp-val">+{earnedXP.delivery}</span></div>
                    {earnedXP.streak > 0 && <div className="xp-row"><span className="xp-lbl">{verdict.won ? "Win Bonus" : "Streak Bonus"}</span><span className="xp-val">+{earnedXP.streak}</span></div>}
                    <div className="xp-total">
                      <span className="xp-total-lbl">Total XP</span>
                      <span className="xp-total-val">+{earnedXP.total}</span>
                    </div>
                  </div>
                )}
                {roundScores.length > 0 && propagandaTags.some(t => t.length > 0) && (
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: "10px", width: "100%", fontSize: "12px", letterSpacing: "2px" }}
                    onClick={() => setShowGhostReveal(true)}
                  >
                    🔍 Ghost Reveal — See Hidden Argument Tags
                  </button>
                )}
              </div>
            )}

            {/* MMR UPDATE CARD — only for logged-in users */}
            {mmrResult && (
              <div className={`mmr-update-card${mmrResult.rankUp ? " mmr-rankup" : ""}`}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "10px" }}>
                  Ranked Rating
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`mmr-chip ${mmrResult.newTier.toLowerCase().replace(" ", "-")}`}>
                    {mmrResult.newTier.toUpperCase()}
                  </span>
                  <span className="mmr-delta" style={{ color: mmrResult.delta >= 0 ? "var(--green)" : "var(--red)" }}>
                    {mmrResult.delta >= 0 ? "+" : ""}{mmrResult.delta} MMR
                  </span>
                  {mmrResult.rankUp && <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", color: "var(--gold)" }}>▲ RANK UP</span>}
                  {mmrResult.rankDown && <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", color: "var(--red)" }}>▼ RANK DOWN</span>}
                </div>
              </div>
            )}

            {/* SHIELD TOKEN DISPLAY — only if progression returned data */}
            {progressionResult && (progressionResult.shieldTokens > 0 || progressionResult.shieldConsumed) && (
              <div className={`shield-row${progressionResult.shieldConsumed ? " shield-consumed" : ""}`}>
                <div>
                  <div className="shield-label">{progressionResult.shieldConsumed ? "🛡 Shield Consumed" : "🛡 Shield Tokens"}</div>
                  <div className="shield-bar">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className={`shield-pip${i < progressionResult.shieldTokens ? "" : " empty"}`}>🛡</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SIGNATURE TITLE — only if earned */}
            {progressionResult?.signatureTitle && (
              <div style={{ padding: "10px 14px", background: "rgba(244,197,66,0.07)", border: "1px solid rgba(244,197,66,0.25)", borderRadius: "var(--radius)", marginTop: "10px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "4px" }}>Title Earned</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", letterSpacing: "3px", color: "var(--gold)" }}>{progressionResult.signatureTitle}</div>
              </div>
            )}

          </div>

          {suddenDeathAvailable && (
            <button className="sudden-btn" onClick={launchSuddenDeath}>
              <span className="sudden-title">⚡ SUDDEN DEATH</span>
              <span className="sudden-sub">Score is close — one overtime round decides everything</span>
            </button>
          )}

          <div className="verdict-actions">
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={instantRematch}>⚡ Instant Rematch</button>
            <div className="verdict-actions-primary">
              <button className="btn btn-secondary" onClick={swapSidesRematch}>↕ Swap Sides</button>
              <button className="btn btn-secondary" onClick={() => setScreen("replay")}>↺ Replay</button>
            </div>
            <div className="verdict-actions-secondary">
              <button className="btn btn-ghost" onClick={shareImage}>Share Card</button>
              <button className="btn btn-ghost" onClick={reset}>Home</button>
            </div>
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
            <h2 className="screen-title">1V1 CHALLENGE</h2>

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
                    <div className="lobby-card create" onClick={() => createRoom()}>
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
                    <div className="v1-history-stats" style={{ marginTop: badges.length > 0 ? "20px" : 0 }}>
                      <div className="v1-history-stat">
                        <span className="v1-history-stat-val">{v1History.length}</span>
                        <div className="v1-history-stat-lbl">Played</div>
                      </div>
                      <div className="v1-history-stat">
                        <span className="v1-history-stat-val green">{v1History.filter(e => e.won).length}</span>
                        <div className="v1-history-stat-lbl">Wins</div>
                      </div>
                      <div className="v1-history-stat">
                        <span className="v1-history-stat-val red">{v1History.filter(e => !e.won).length}</span>
                        <div className="v1-history-stat-lbl">Losses</div>
                      </div>
                      {v1History.length >= 2 && (
                        <div className="v1-history-stat">
                          <span className="v1-history-stat-val gold">
                            {Math.round((v1History.filter(e => e.won).length / v1History.length) * 100)}%
                          </span>
                          <div className="v1-history-stat-lbl">Win Rate</div>
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

            <div className="v1-lobby-footer">
              <button className="btn btn-home" onClick={reset}>← Home</button>
              <button className="btn btn-primary" onClick={() => { setV1Tab("play"); setV1SubScreen(""); createRoom(); }}>⚔ Create</button>
              <button className="btn btn-ghost" onClick={() => { setV1Tab("play"); setV1SubScreen("join"); }}>🔗 Join Room</button>
            </div>
          </div>
        );
      })()}

      {/* MULTIPLAYER WAITING ROOM */}
      {screen === "multiplayer-waiting" && currentRoom && (
        <div className="screen">
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
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

            {roomPlayerNum === 1 && (
              <button
                className="v1-watch-link"
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?spectate=${currentRoom.code}`;
                  navigator.clipboard.writeText(url).catch(() => {});
                  setShareToast("Spectator link copied!");
                  setTimeout(() => setShareToast(""), 2500);
                }}
              >
                👁 Copy spectator / watch-live link
              </button>
            )}

            {roomPlayerNum === null && (
              <div className="spectator-banner" style={{ marginBottom: "12px" }}>SPECTATING LIVE · {currentRoom.code}</div>
            )}

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
                  Topic · {currentRoom.topicCat} · {currentRoom.totalRounds} Round{currentRoom.totalRounds !== 1 ? "s" : ""}
                </span>
                <br />
                <strong>"{currentRoom.topicText}"</strong>
              </div>
            )}

            {currentRoom.status === "waiting" && roomPlayerNum === 1 && (
              <div className="v1-setup-block">
                <div className="v1-setup-lbl">Rounds</div>
                <div className="v1-rounds-row">
                  {[1,2,3,4,5,7,12,15].map(r => (
                    <button
                      key={r}
                      className={`v1-rounds-btn${currentRoom.totalRounds === r ? " active" : ""}`}
                      onClick={() => setRoomRoundsFn(r)}
                    >{r}</button>
                  ))}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "1px", color: "var(--text-dim)", marginBottom: "12px" }}>
                  {currentRoom.totalRounds} round{currentRoom.totalRounds !== 1 ? "s" : ""} · Give Up unlocks at round 3
                </div>

                <div className="v1-setup-lbl">Timer Mode</div>
                <div className="v1-speed-row">
                  <button
                    className={`v1-speed-btn${!currentRoom.speedRound ? " active" : ""}`}
                    onClick={() => setSpeedRoundFn(false)}
                  >Standard · 5 min</button>
                  <button
                    className={`v1-speed-btn${currentRoom.speedRound ? " active" : ""}`}
                    onClick={() => setSpeedRoundFn(true)}
                  >Speed · 60 sec</button>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "1px", color: "var(--text-dim)", marginBottom: "14px" }}>
                  {currentRoom.speedRound ? "60 seconds per round — auto-submits when timer expires" : "5 minutes per round"}
                </div>

                <div className="v1-setup-lbl" style={{ marginTop: "4px" }}>Topic</div>
                <div className="v1-topic-banner" style={{ marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)" }}>Current · {currentRoom.topicCat}</span>
                  <br />
                  <strong style={{ fontSize: "13px" }}>"{currentRoom.topicText}"</strong>
                </div>
                <div className="v1-topic-pool">
                  {waitingTopics.map((t) => (
                    <div
                      key={t.text}
                      className={`v1-topic-opt${currentRoom.topicText === t.text ? " active" : ""}`}
                      onClick={() => setRoomTopicFn(t)}
                    >
                      <div className="v1-topic-opt-cat">{t.cat}</div>
                      <div className="v1-topic-opt-text">"{t.text}"</div>
                    </div>
                  ))}
                </div>
                <button className="v1-topic-shuffle" onClick={shuffleWaitingTopics}>↻ Shuffle topics</button>
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "6px" }}>Custom Topic</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={customTopicInput}
                      onChange={e => setCustomTopicInput(e.target.value)}
                      placeholder="Type any debate topic…"
                      maxLength={120}
                      style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "9px 12px", fontSize: "13px", color: "var(--text)", fontFamily: "'Barlow',sans-serif", outline: "none" }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && customTopicInput.trim()) {
                          setRoomTopicFn({ cat: "Custom", text: customTopicInput.trim() });
                          setCustomTopicInput("");
                        }
                      }}
                    />
                    <button
                      style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.35)", borderRadius: "var(--radius)", color: "var(--red)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "9px 14px", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s" }}
                      onClick={() => {
                        if (customTopicInput.trim()) {
                          setRoomTopicFn({ cat: "Custom", text: customTopicInput.trim() });
                          setCustomTopicInput("");
                        }
                      }}
                    >Set</button>
                  </div>
                </div>
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
        const maxCR = currentRoom.status === "complete" ? currentRoom.currentRound : currentRoom.currentRound - 1;
        for (let r = 1; r <= maxCR; r++) {
          if (myArgs.find(a => a.roundNum === r) && oppArgs.find(a => a.roundNum === r)) completedRounds.push(r);
        }
        return (
          <div className="screen v1-laser-arena">
            {incomingTaunt && myRoundArg && currentRoom.status !== "complete" && (
              <div className="trash-bubble">
                <div className="trash-bubble-who">{incomingTaunt.fromName}</div>
                {incomingTaunt.text}
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  {["💀","🔥","🤡","👀","😭","💅"].map(emoji => (
                    <button key={emoji} onClick={async () => {
                      setIncomingTaunt(null);
                      setMyTrashBubble(emoji);
                      setTimeout(() => setMyTrashBubble(null), 4000);
                      try { await apiAuthPost(`/1v1/${currentRoom.code}/taunt`, { text: emoji }); }
                      catch { /* best-effort */ }
                    }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "2px 5px", fontSize: "15px", cursor: "pointer", lineHeight: 1.3, transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            )}
            {myTrashBubble && myRoundArg && currentRoom.status !== "complete" && (
              <div className="trash-bubble" style={{ right: "auto", left: "16px", borderRadius: "12px 4px 12px 12px", borderColor: "rgba(168,85,247,0.35)" }}>
                <div className="trash-bubble-who" style={{ color: "#a855f7" }}>You</div>
                {myTrashBubble}
              </div>
            )}
            {v1SendLine && myRoundArg && currentRoom.status !== "complete" && (
              <div className="v1-send-bubble">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span className="v1-send-bubble-text" style={{ flex: 1, marginBottom: 0 }}>{v1SendLine}</span>
                  <button onClick={() => setV1SendLine(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 0 0 2px", flexShrink: 0 }}>✕</button>
                </div>
                <button className="v1-send-copy-btn" style={{ marginTop: "8px" }} onClick={async () => {
                  if (!currentRoom) return;
                  const text = v1SendLine!;
                  setV1SendLine(null);
                  setMyTrashBubble(text);
                  setTimeout(() => setMyTrashBubble(null), 5000);
                  try { await apiAuthPost(`/1v1/${currentRoom.code}/taunt`, { text }); }
                  catch { /* best-effort */ }
                }}>Send</button>
              </div>
            )}
            <div className="v1-arena-header">
              <div>
                <div className="v1-round-badge">Round {currentRoom.currentRound}/{currentRoom.totalRounds}</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "11px", letterSpacing: "2px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  {currentRoom.topicCat}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {viewingArgsMode ? (
                  <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 14px" }} onClick={() => { viewingArgsAfterMatch.current = false; setViewingArgsMode(false); setScreen("multiplayer-results"); }}>
                    ← Results
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 14px" }} onClick={() => setScreen("multiplayer-waiting")}>
                    Room Info
                  </button>
                )}
                <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "6px 14px" }} onClick={reset}>
                  Home
                </button>
              </div>
            </div>

            <div className="v1-topic-banner">
              <strong>"{currentRoom.topicText}"</strong>
            </div>

            {roomPlayerNum === null && (
              <div className="spectator-banner">SPECTATING LIVE · {currentRoom.player1Name} vs {currentRoom.player2Name || "…"}</div>
            )}

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

            {currentRoom.status === "debating" && roomPlayerNum === null && (
              <div className="v1-opp-typing" style={{ textAlign: "center" }}>
                <div className="waiting-dots">
                  <div className="waiting-dot" /><div className="waiting-dot" /><div className="waiting-dot" />
                </div>
                <span className="v1-opp-typing-label">Round {currentRoom.currentRound} in progress…</span>
              </div>
            )}

            {currentRoom.status === "debating" && roomPlayerNum !== null && (
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
                  {oppRoundArg ? (
                    <div className="v1-opp-arg-reveal">
                      <div className="v1-arg-entry">
                        <div className="v1-arg-who opp">
                          {oppName} ({oppSide?.toUpperCase()}) · Round {currentRoom.currentRound}
                          {oppRoundArg.score ? ` · Rank ${oppRoundArg.rank} · ${oppRoundArg.score}/100` : " · Judged ✓"}
                        </div>
                        <div className="v1-arg-text">
                          {oppRoundArg.score
                            ? renderWithHighlights(oppRoundArg.argumentText, (() => { try { return JSON.parse(oppRoundArg.highlights || "[]"); } catch { return []; } })())
                            : oppRoundArg.argumentText}
                        </div>
                        {oppRoundArg.critique && <div className="v1-arg-critique">{oppRoundArg.critique}</div>}
                      </div>
                    </div>
                  ) : (() => {
                    const oppTypingAt = roomPlayerNum === 1 ? currentRoom.player2TypingAt : currentRoom.player1TypingAt;
                    const oppIsTyping = !!oppTypingAt && Date.now() - oppTypingAt < 4000;
                    return (
                      <div className={`v1-opp-typing${oppIsTyping ? " is-typing" : ""}`}>
                        {oppIsTyping ? (
                          <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                          </div>
                        ) : (
                          <div className="waiting-dots">
                            <div className="waiting-dot" /><div className="waiting-dot" /><div className="waiting-dot" />
                          </div>
                        )}
                        <span className={`v1-opp-typing-label${oppIsTyping ? " is-typing" : ""}`}>
                          {oppIsTyping ? `${oppName} is typing...` : `Waiting for ${oppName}...`}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  {(() => {
                    const oppTypingAt = roomPlayerNum === 1 ? currentRoom.player2TypingAt : currentRoom.player1TypingAt;
                    const oppIsTyping = !!oppTypingAt && Date.now() - oppTypingAt < 4000;
                    return oppIsTyping ? (
                      <div className="v1-typing-banner">
                        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                        <span>{oppName} is also typing</span>
                      </div>
                    ) : null;
                  })()}
                  <p className="section-label">Round {currentRoom.currentRound} — Argue {mySide?.toUpperCase()}</p>
                  <textarea
                    className="debate-input"
                    rows={5}
                    value={roomArgInput}
                    onChange={(e) => {
                      setRoomArgInput(e.target.value);
                      if (roomModerationWarning) setRoomModerationWarning("");
                      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
                      typingDebounceRef.current = setTimeout(() => {
                        apiAuthPost(`/1v1/${currentRoom.code}/typing`, {}).catch(() => {});
                      }, 300);
                      startV1RoundTimerIfNeeded(currentRoom.currentRound);
                    }}
                    placeholder={`Make your argument ${mySide?.toUpperCase() || ""}…`}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submitRoomArg(); }}
                  />
                  {roomModerationWarning && (
                    <div className="room-moderation-warning">
                      <span className="room-mod-icon">⚠</span>
                      <span>{roomModerationWarning}</span>
                    </div>
                  )}
                  <div className="input-footer">
                    {v1RoundTimeLeft !== null ? (
                      <span className={`v1-round-timer${v1RoundTimeLeft <= 30 ? " critical" : ""}`}>
                        {Math.floor(v1RoundTimeLeft / 60)}:{String(v1RoundTimeLeft % 60).padStart(2, "0")}
                      </span>
                    ) : (
                      roomArgInput.length > 0 && <span className="char-count">{roomArgInput.length} chars</span>
                    )}
                    <div className="submit-row">
                      {currentRoom.currentRound >= 3 && (
                        <button className="btn btn-ghost" onClick={() => { if (window.confirm("Give up? Your opponent wins this match.")) forfeitRoom(); }}>
                          Give Up
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        disabled={!roomArgInput.trim() || roomSubmitting || !!roomModerationWarning}
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
            {roomPlayerNum !== null && (
              <div className="rival-profile-card">
                <div className="rival-profile-name">{oppName}</div>
                <div className="rival-profile-stats">
                  <div className="rival-stat">
                    <span className="rival-stat-val" style={{ color: oppRank === "S" ? "var(--gold)" : oppRank === "A" ? "var(--green)" : oppRank === "B" ? "#60a5fa" : "var(--text)" }}>{oppRank}</span>
                    Rank
                  </div>
                  <div className="rival-stat">
                    <span className="rival-stat-val">{oppScore ?? 0}</span>
                    Avg Score
                  </div>
                  <div className="rival-stat">
                    <span className="rival-stat-val">{oppIQ ?? "—"}</span>
                    Debate IQ
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {roomPlayerNum !== null && (
                <button className="btn btn-primary" disabled={roomLoading} onClick={rematchRoom}>
                  {roomLoading ? "Creating…" : "⚔ Rematch (same topic)"}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => { viewingArgsAfterMatch.current = true; setViewingArgsMode(true); setScreen("multiplayer-debate"); }}>View Arguments</button>
              {roomPlayerNum !== null && (
                <button className="btn btn-secondary" onClick={() => {
                  const uri = generateV1ShareCard({
                    iWon,
                    myName,
                    oppName,
                    myRank,
                    oppRank,
                    myScore,
                    oppScore,
                    myIQ,
                    oppIQ,
                    topic: currentRoom.topicText,
                    speedRound: !!currentRoom.speedRound,
                  });
                  const a = document.createElement("a");
                  a.href = uri;
                  a.download = `clash-1v1-${currentRoom.code}.png`;
                  a.click();
                }}>Share Card</button>
              )}
              <button className="btn btn-secondary" onClick={() => {
                const iWon2 = currentRoom.winnerPlayerNum === roomPlayerNum;
                const myN = roomPlayerNum === 1 ? currentRoom.player1Name : (currentRoom.player2Name || "You");
                const oppN = roomPlayerNum === 1 ? (currentRoom.player2Name || "Opponent") : currentRoom.player1Name;
                const myS = roomPlayerNum === 1 ? currentRoom.player1Score : currentRoom.player2Score;
                const oppS = roomPlayerNum === 1 ? currentRoom.player2Score : currentRoom.player1Score;
                const myI = roomPlayerNum === 1 ? currentRoom.iq1 : currentRoom.iq2;
                const text = `CLASH 1v1 RESULT\n${iWon2 ? "VICTORY" : "DEFEATED"} · ${myN} vs ${oppN}\nTopic: "${currentRoom.topicText}"\nScore: ${myS ?? 0} vs ${oppS ?? 0} · Debate IQ: ${myI ?? "—"}\nPlay at: ${window.location.origin}`;
                navigator.clipboard.writeText(text).catch(() => {});
                setShareToast("Result copied!");
                setTimeout(() => setShareToast(""), 2500);
              }}>↗ Share Text</button>
              <button className="btn btn-ghost" onClick={reset}>Home</button>
            </div>
          </div>
        );
      })()}

      {/* REPLAY */}
      {screen === "replay" && verdict && (
        <div className="screen">
          <h2 className="bebas-title" style={{ fontSize: "36px" }}>REPLAY</h2>

          <div className="replay-intro">
            <div>
              <div className="eyebrow" style={{ marginBottom: "6px" }}>
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
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: "16px" }} onClick={() => setScreen("verdict")}>← Back</button>
        </div>
      )}

      {/* GAUNTLET INTRO */}
      {screen === "gauntlet-intro" && (
        <div className="screen">
          <div className="gauntlet-intro-header">
            <div className="gauntlet-intro-eyebrow">Challenge Mode</div>
            <h2 className="gauntlet-intro-title">⚔ THE GAUNTLET</h2>
            <p className="gauntlet-intro-sub">Face all 6 opponents back-to-back. 3 rounds each. No respawn.</p>
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
          <div className="topic-preview-card" style={{ marginBottom: "16px" }}>
            <div className="tpc-label">Topic 1</div>
            <div className="tpc-text">"{tournamentTopics[0]?.text || "Topics are picked when you begin"}"</div>
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
            <div className="eyebrow" style={{ marginBottom: "6px" }}>
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

          <div className="topic-preview-card" style={{ marginBottom: "20px" }}>
            <div className="tpc-label">Next — Opponent {tournamentBotIndex + 2} of 6</div>
            {(() => {
              const nextBot = AI_OPPONENTS.find((a) => a.id === TOURNAMENT_BOT_ORDER[tournamentBotIndex + 1])!;
              return (
                <div className="next-opp-card">
                  <span className="next-opp-icon">{nextBot.icon}</span>
                  <div className="next-opp-info">
                    <div className="next-opp-name">{nextBot.name}</div>
                    <div className="next-opp-desc">{nextBot.desc}</div>
                    <div className="next-opp-topic">Topic: "{tournamentTopics[tournamentBotIndex + 1]?.text}"</div>
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
            <div className="gauntlet-intro-header" style={{ marginBottom: "32px" }}>
              <div className="gauntlet-intro-eyebrow" style={{ color: "var(--text-dim)" }}>Gauntlet Complete</div>
              <div className="gauntlet-intro-title">⚔ GAUNTLET</div>
              <div className="gauntlet-intro-title" style={{ color: "var(--gold)", marginBottom: "16px" }}>COMPLETE</div>
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
          <h2 className="screen-title">LEADERBOARD</h2>

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
          <button className="btn btn-ghost" style={{ marginTop: "20px", width: "100%" }} onClick={reset}>← Home</button>
        </div>
      )}
    </div>
    {shareToast && <div className="share-toast">{shareToast}</div>}

      {/* round-flash intentionally removed */}
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
          {stats.debates > 0 && (
            <div className="pp-record-row">
              <div className="pp-record-cell">
                <span className="pp-record-val">{Math.round((stats.wins / stats.debates) * 100)}%</span>
                <div className="pp-record-lbl">Win Rate</div>
              </div>
              <div className="pp-record-cell">
                <span className="pp-record-val" style={{ color: stats.debates - stats.wins === 0 ? "var(--green)" : "var(--red)" }}>{stats.debates - stats.wins}</span>
                <div className="pp-record-lbl">Losses</div>
              </div>
              {(stats.currentStreak ?? 0) >= 2 && (
                <div className="pp-record-cell">
                  <span className="pp-record-val" style={{ color: (stats.currentStreak ?? 0) >= 5 ? "#ef4444" : "#fb923c" }}>🔥{stats.currentStreak}</span>
                  <div className="pp-record-lbl">Streak</div>
                </div>
              )}
              <div className="pp-record-cell">
                <span className="pp-record-val" style={{ color: "var(--gold)" }}>{stats.bestStreak || "—"}</span>
                <div className="pp-record-lbl">Best Run</div>
              </div>
            </div>
          )}
          {nemesisBot && (
            <div className="pp-nemesis">
              <div className="pp-nemesis-icon">{nemesisBot.icon}</div>
              <div className="pp-nemesis-info">
                <div className="pp-nemesis-name">{nemesisBot.name}</div>
                <div className="pp-nemesis-sub">{nemesisBot.losses} loss{nemesisBot.losses !== 1 ? "es" : ""} · Nemesis</div>
              </div>
              <button className="pp-nemesis-btn" onClick={() => { setShowProfilePanel(false); setSelectedAI(nemesisBot.id); setSetupStep(1); setScreen("setup"); }}>
                Rematch →
              </button>
            </div>
          )}
          <div className="pp-tab-row">
            <button className={`pp-tab${profileTab === "overview" ? " active" : ""}`} onClick={() => setProfileTab("overview")}>Overview</button>
            <button className={`pp-tab${profileTab === "cards" ? " active" : ""}`} onClick={() => {
              setProfileTab("cards");
              if (profileCards.length === 0 && !profileCardsLoading) {
                setProfileCardsLoading(true);
                apiAuthGet<DebateCard[]>("/cards/collection").then(c => { setProfileCards(c); setProfileCardsLoading(false); }).catch(() => setProfileCardsLoading(false));
              }
            }}>Cards</button>
            <button className={`pp-tab${profileTab === "graveyard" ? " active" : ""}`} onClick={() => setProfileTab("graveyard")}>Graveyard</button>
          </div>
          {profileTab === "overview" && (
            <div className="pp-tab-content">
              <div className="pp-section-lbl">Display Name</div>
              <div className="pp-username-row" style={{ marginBottom: "0" }}>
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
              {sigStyle && (
                <div style={{ marginTop: "10px" }}>
                  <div className="pp-section-lbl">Signature Style</div>
                  <div className="sig-card" style={{ padding: "8px 12px", marginTop: "4px" }}>
                    <span className="sig-icon" style={{ fontSize: "18px" }}>{sigStyle.icon}</span>
                    <div>
                      <div className="sig-name" style={{ fontSize: "13px" }}>{sigStyle.name}</div>
                      <div className="sig-desc" style={{ fontSize: "10px" }}>{sigStyle.desc}</div>
                    </div>
                  </div>
                </div>
              )}
              {mmrResult && (
                <div style={{ marginTop: "10px" }}>
                  <div className="pp-section-lbl">Rank</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span className={`mmr-chip ${mmrResult.newTier.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "12px" }}>
                      {mmrResult.newTier.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "18px", color: "var(--text)" }}>{mmrResult.newMmr}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", color: mmrResult.delta >= 0 ? "var(--green)" : "var(--red)" }}>
                      {mmrResult.delta >= 0 ? "+" : ""}{mmrResult.delta}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {profileTab === "cards" && (
            <div className="pp-tab-content">
              {profileCardsLoading ? (
                <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "20px 0", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "2px" }}>LOADING...</div>
              ) : profileCards.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "12px", padding: "20px 0", lineHeight: 1.5 }}>
                  Win debates to earn collectible cards.
                </div>
              ) : (
                <div className="pp-cards-grid">
                  {profileCards.map(c => {
                    const aiOpp = AI_OPPONENTS.find(a => a.id === c.opponentId);
                    const rarColor = c.rarity === "Legendary" ? "var(--gold)" : c.rarity === "Epic" ? "#c084fc" : c.rarity === "Rare" ? "#60a5fa" : c.rarity === "Uncommon" ? "var(--green)" : "#666";
                    return (
                      <div key={c.id} className={`pp-card-mini rarity-${c.rarity.toLowerCase()}`} title={`vs ${c.opponentName} · ${c.topic} · Score: ${c.score}`}>
                        <div className="pp-card-mini-icon">{aiOpp?.icon || "⚔️"}</div>
                        <div className="pp-card-mini-title">{c.opponentName}</div>
                        <div className="pp-card-mini-power" style={{ color: rarColor }}>{c.score}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {profileTab === "graveyard" && (
            <div className="pp-tab-content">
              {graveyardArgs.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "12px", padding: "20px 0", lineHeight: 1.5 }}>
                  Arguments that scored below 40 will be buried here.
                </div>
              ) : (
                graveyardArgs.map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 0", borderBottom: i < graveyardArgs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: "13px", opacity: 0.5, flexShrink: 0 }}>💀</span>
                    <div style={{ flex: 1, fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{g.text.length > 90 ? g.text.slice(0, 90) + "…" : g.text}"
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "14px", color: "var(--red)", flexShrink: 0 }}>{g.score}</span>
                  </div>
                ))
              )}
            </div>
          )}
          <button className="pp-logout" onClick={logoutFn}>Log Out</button>
        </div>
      </>
    )}

    {/* CARD REVEAL OVERLAY */}
    {showCardReveal && newCard && (
      <div className="card-reveal-overlay" onClick={() => setShowCardReveal(false)}>
        <div className="eyebrow" style={{ letterSpacing: "5px", marginBottom: "16px" }}>
          Card Unlocked
        </div>
        <div className={`card-reveal-scene card-rarity-${newCard.rarity.toLowerCase()}`} onClick={(e) => e.stopPropagation()}>
          <div className="card-reveal-inner">
            <div className="card-face card-back">CLASH</div>
            <div className="card-face card-front">
              <div className="card-header-band">
                <span className="card-rarity-badge">{newCard.rarity}</span>
                <span className="card-power-num">{newCard.score}</span>
              </div>
              <div className="card-art">
                {AI_OPPONENTS.find(a => a.id === newCard.opponentId)?.icon || "⚔️"}
              </div>
              <div className="card-body">
                <div className="card-title">vs {newCard.opponentName}</div>
                <div className="card-desc">
                  {newCard.bestQuote
                    ? `"${newCard.bestQuote.slice(0, 60)}${newCard.bestQuote.length > 60 ? "…" : ""}"`
                    : newCard.topic.slice(0, 60)}
                </div>
              </div>
              <div className="card-footer">
                <span className="card-type-badge">Rank {newCard.rank}</span>
                <span className="card-clash-logo">CLASH</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card-reveal-info">
          <div className="card-reveal-name">vs {newCard.opponentName}</div>
          <div className={`card-reveal-rarity-lbl card-reveal-rarity-${newCard.rarity.toLowerCase()}`}>
            {newCard.rarity} Card
          </div>
          <div style={{ marginTop: "20px", color: "var(--text-dim)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", letterSpacing: "2px" }}>
            Tap anywhere to continue
          </div>
        </div>
      </div>
    )}


    {/* GHOST REVEAL MODAL */}
    {showGhostReveal && (
      <div className="ghost-overlay" onClick={() => setShowGhostReveal(false)}>
        <div className="ghost-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ghost-modal-title">🔍 GHOST REVEAL</div>
          <p style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "18px", lineHeight: 1.5 }}>
            Hidden argument tags detected in your debate. These reveal patterns the AI identified in real-time.
          </p>
          {propagandaTags.length === 0 ? (
            <div style={{ color: "var(--text-dim)", fontSize: "13px" }}>No tags detected in this debate.</div>
          ) : (
            propagandaTags.map((tags, ri) => (
              <div key={ri} style={{ marginBottom: "14px" }}>
                <div className="prop-label">Round {ri + 1}</div>
                {tags.map((t, j) => {
                  const cls = t.tag === "killer_point" ? "killer_point" : t.tag === "fallacy" ? "fallacy" : t.tag === "weak_evidence" ? "weak_evidence" : t.tag === "emotional_bait" ? "emotional_bait" : "solid";
                  const label = t.tag === "killer_point" ? "⚡ Killer Point" : t.tag === "fallacy" ? "⚠ Fallacy" : t.tag === "weak_evidence" ? "⚡ Weak Evidence" : t.tag === "emotional_bait" ? "💔 Emotional Bait" : "✓ Solid";
                  return (
                    <div key={j} className="ghost-arg-entry">
                      <span className={`prop-tag ${cls}`}>{label}</span>
                      <div className="ghost-arg-text" style={{ marginTop: "6px" }}>"{t.sentence}"</div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <button className="btn btn-ghost" style={{ marginTop: "8px", width: "100%" }} onClick={() => setShowGhostReveal(false)}>Close</button>
        </div>
      </div>
    )}

    {/* DASHBOARD SCREEN */}
    {screen === "dashboard" && (
      <div className="screen">
        <h2 className="bebas-title" style={{ fontSize: "32px" }}>DASHBOARD</h2>

        <div className="dash-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-val">{stats.debates}</div>
            <div className="dash-stat-lbl">Debates</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-val" style={{ color: "var(--green)" }}>{stats.wins}</div>
            <div className="dash-stat-lbl">Wins</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-val" style={{ color: "var(--red)" }}>{stats.debates - stats.wins}</div>
            <div className="dash-stat-lbl">Losses</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-val" style={{ color: "var(--gold)" }}>{stats.bestScore || "—"}</div>
            <div className="dash-stat-lbl">Best Score</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-val" style={{ color: stats.debates > 0 ? "var(--text)" : "var(--text-dim)" }}>
              {stats.debates > 0 ? Math.round((stats.wins / stats.debates) * 100) + "%" : "—"}
            </div>
            <div className="dash-stat-lbl">Win Rate</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-val" style={{ color: (stats.currentStreak ?? 0) >= 3 ? "#ef4444" : "var(--text)" }}>
              {(stats.currentStreak ?? 0) >= 1 ? `🔥${stats.currentStreak}` : stats.currentStreak || 0}
            </div>
            <div className="dash-stat-lbl">Streak</div>
          </div>
        </div>

        <div className="dash-section-title">QUICK PLAY</div>
        <div className="dash-action-grid">
          <div className="dash-action primary" onClick={() => { setDisplayTopics(pickTopics()); setSetupStep(0); setScreen("setup"); }}>
            <div className="dash-action-icon">⚔️</div>
            <div className="dash-action-label">VS AI</div>
            <div className="dash-action-sub">Classic debate</div>
          </div>
          <div className="dash-action" onClick={() => { setGauntletNextSide(null); setScreen("gauntlet-intro"); }}>
            <div className="dash-action-icon">🏆</div>
            <div className="dash-action-label">Gauntlet</div>
            <div className="dash-action-sub">6 opponents</div>
          </div>
          <div className="dash-action" onClick={() => { setV1SubScreen(""); setV1Tab("play"); setScreen("multiplayer-lobby"); }}>
            <div className="dash-action-icon">🤜</div>
            <div className="dash-action-label">1v1</div>
            <div className="dash-action-sub">Challenge a friend</div>
          </div>
          <div className="dash-action" onClick={() => setScreen("leaderboard")}>
            <div className="dash-action-icon">📊</div>
            <div className="dash-action-label">Leaderboard</div>
            <div className="dash-action-sub">Global rankings</div>
          </div>
        </div>

        {/* OPPONENT HISTORY */}
        {stats.opponentHistory && Object.keys(stats.opponentHistory).length > 0 && (
          <>
            <div className="dash-section-title">OPPONENT RECORD</div>
            {Object.entries(stats.opponentHistory).map(([id, rec]) => {
              const opp = AI_OPPONENTS.find(a => a.id === id);
              if (!opp) return null;
              const total = rec.wins + rec.losses;
              const winRate = total > 0 ? Math.round((rec.wins / total) * 100) : 0;
              return (
                <div key={id} className="dynasty-row" onClick={() => { setSelectedAI(id); setSetupStep(1); setScreen("setup"); }} style={{ cursor: "pointer" }}>
                  <span style={{ fontSize: "20px" }}>{opp.icon}</span>
                  <span className="dynasty-opp">{opp.name}</span>
                  <span className="dynasty-record">
                    <span className="dw">{rec.wins}W</span> <span className="dl">{rec.losses}L</span>
                  </span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", color: winRate >= 60 ? "var(--green)" : winRate <= 40 ? "var(--red)" : "var(--text-dim)" }}>
                    {winRate}%
                  </span>
                </div>
              );
            })}
          </>
        )}

        {/* ACHIEVEMENTS */}
        {unlockedAchs.length > 0 && (
          <>
            <div className="dash-section-title">ACHIEVEMENTS ({unlockedAchs.length}/{ACHIEVEMENTS.length})</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ACHIEVEMENTS.map(a => {
                const unlocked = unlockedAchs.includes(a.id);
                return (
                  <div key={a.id} title={a.name} style={{ padding: "8px 12px", background: unlocked ? "var(--surface)" : "transparent", border: `1px solid ${unlocked ? "var(--border)" : "rgba(255,255,255,0.05)"}`, borderRadius: "var(--radius)", opacity: unlocked ? 1 : 0.3, fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{a.icon}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "1px" }}>{a.name}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <button className="btn btn-ghost" style={{ marginTop: "20px", width: "100%" }} onClick={reset}>← Home</button>
      </div>
    )}

    {screen === "forge-rival" && (
      <div className="screen forge-page">
        <div style={{ textAlign: "center", paddingBottom: "20px" }}>
          <p className="forge-page-title">FORGE YOUR RIVAL</p>
          <p className="forge-page-sub">Design your opponent. Share it with the world.</p>
        </div>
        <div className="forge-bound">
        <div className="forge-section">
          <span className="forge-section-lbl">Name</span>
          <input
            className="custom-input"
            type="text"
            placeholder='e.g. "The Strategist" or "Chaos Lawyer"'
            maxLength={40}
            style={{ width: "100%", boxSizing: "border-box" }}
            value={forgeForm.name}
            onChange={(e) => setForgeForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="forge-section">
          <span className="forge-section-lbl">Avatar</span>
          <div className="forge-avatar-grid">
            {["🤖", "👾", "💀", "🦾", "🧠", "👁️", "⚡", "🔥", "🌀", "🎭", "👹", "🐺", "🦊", "🐉", "💎", "🌑"].map((em) => (
              <button
                key={em}
                className={`forge-avatar-opt${forgeForm.avatar === em ? " selected" : ""}`}
                onClick={() => setForgeForm((f) => ({ ...f, avatar: em }))}
              >{em}</button>
            ))}
          </div>
        </div>
        <div className="forge-section">
          <span className="forge-section-lbl">Debate Tone</span>
          <div className="forge-tone-grid">
            {([
              { id: "calm", name: "Cold & Controlled", desc: "Precise, measured, quietly devastating" },
              { id: "aggressive", name: "Relentless", desc: "Max pressure, attacks every weak point" },
              { id: "sarcastic", name: "Sharp & Cutting", desc: "Wit as a weapon. Every word stings." },
              { id: "analytical", name: "Logic Engine", desc: "Pure reasoning. Demolishes bad logic." },
            ] as const).map((t) => (
              <button
                key={t.id}
                className={`forge-tone-opt${forgeForm.tone === t.id ? " selected" : ""}`}
                onClick={() => setForgeForm((f) => ({ ...f, tone: t.id }))}
              >
                <span className="forge-tone-name">{t.name}</span>
                <span className="forge-tone-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="forge-section">
          <span className="forge-section-lbl">Behavior</span>
          {([
            { key: "aggression", label: "Aggression" },
            { key: "logicLevel", label: "Logic" },
            { key: "humorLevel", label: "Humor" },
          ] as const).map(({ key, label }) => (
            <div key={key} className="forge-slider-row">
              <span className="forge-slider-lbl">{label}</span>
              <input
                type="range" min={1} max={10} step={1}
                className="forge-slider"
                value={forgeForm[key] as number}
                onChange={(e) => setForgeForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
              />
              <span className="forge-slider-val">{forgeForm[key]}</span>
            </div>
          ))}
        </div>
        <div className="forge-section">
          <span className="forge-section-lbl">Difficulty</span>
          <div className="forge-diff-row">
            {(["easy", "medium", "hard", "extreme"] as const).map((d) => (
              <button
                key={d}
                className={`forge-diff-opt${forgeForm.difficulty === d ? ` sel-${d}` : ""}`}
                onClick={() => setForgeForm((f) => ({ ...f, difficulty: d }))}
              >{d}</button>
            ))}
          </div>
        </div>
        <div className="forge-section">
          <div className="forge-memory-row">
            <div className="forge-memory-info">
              <span className="forge-memory-title">Memory</span>
              <span className="forge-memory-desc">{forgeForm.memoryEnabled ? "Remembers your past arguments" : "Resets every match"}</span>
            </div>
            <button
              className={`forge-toggle-btn${forgeForm.memoryEnabled ? " on" : ""}`}
              onClick={() => setForgeForm((f) => ({ ...f, memoryEnabled: !f.memoryEnabled }))}
            >
              <span className="forge-toggle-knob" />
            </button>
          </div>
        </div>
        <div className="forge-section">
          <span className="forge-section-lbl">Backstory (optional)</span>
          <textarea
            className="custom-input"
            rows={3}
            placeholder="Give your rival a backstory, quirks, or extra personality details..."
            maxLength={300}
            value={forgeForm.backstory}
            onChange={(e) => setForgeForm((f) => ({ ...f, backstory: e.target.value }))}
            style={{ resize: "none", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div className="forge-section">
          <button
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "13px", letterSpacing: "3px", padding: "14px" }}
            disabled={!forgeForm.name.trim() || forgeCreating}
            onClick={handleForgeCreate}
          >
            {forgeCreating ? "FORGING..." : "CREATE RIVAL →"}
          </button>
          {forgeError && (
            <p style={{ color: "var(--red)", fontSize: "12px", marginTop: "8px", textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif" }}>
              {forgeError}
            </p>
          )}
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: "10px" }} onClick={() => setScreen("home")}>← Back</button>
        </div>
        </div>{/* end forge-bound */}
      </div>
    )}

    {screen === "forge-rival-result" && createdRival && (
      <div className="screen forge-page">
        <div style={{ textAlign: "center", paddingBottom: "20px" }}>
          <p className="forge-page-title">RIVAL FORGED</p>
          <p className="forge-page-sub">Your opponent is ready for battle.</p>
        </div>
        <div className="forge-section">
          <div className="forge-result-card">
            <div className="forge-result-avatar">{createdRival.avatar}</div>
            <div className="forge-result-name">{createdRival.name}</div>
            <div className="forge-result-diff">{createdRival.difficulty.toUpperCase()}</div>
            <div style={{ marginTop: "8px" }}>
              {([
                { label: "Aggression", val: createdRival.aggression },
                { label: "Logic", val: createdRival.logicLevel },
                { label: "Humor", val: createdRival.humorLevel },
              ]).map(({ label, val }) => (
                <div key={label} className="forge-stat-row">
                  <span className="forge-stat-lbl">{label}</span>
                  <div className="forge-stat-bar-bg">
                    <div className="forge-stat-bar-fill" style={{ width: `${val * 10}%` }} />
                  </div>
                  <span className="forge-stat-num">{val}</span>
                </div>
              ))}
            </div>
            {createdRival.memoryEnabled && (
              <div className="forge-mem-badge">Memory On</div>
            )}
          </div>
        </div>
        <div className="forge-section" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "13px", letterSpacing: "3px", padding: "14px" }}
            onClick={() => {
              const personality = buildRivalPersonality({ name: createdRival.name, tone: createdRival.tone, aggression: createdRival.aggression, logicLevel: createdRival.logicLevel, humorLevel: createdRival.humorLevel, difficulty: createdRival.difficulty, memoryEnabled: createdRival.memoryEnabled });
              setCustomOpponent({ name: createdRival.name, personality, diff: createdRival.difficulty as "easy" | "medium" | "hard" | "extreme", icon: createdRival.avatar });
              setSelectedAI("custom");
              setDisplayTopics(pickTopics());
              setSetupStep(1);
              setScreen("setup");
            }}
          >
            PLAY NOW →
          </button>
          <button
            className="btn btn-secondary"
            style={{ width: "100%", fontSize: "13px", letterSpacing: "3px", padding: "14px" }}
            onClick={() => {
              const link = `${window.location.origin}/play?rival=${createdRival.shareCode}`;
              navigator.clipboard.writeText(link).catch(() => {});
              setShareToast("Share link copied!");
              setTimeout(() => setShareToast(""), 3000);
            }}
          >
            SHARE NOW
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "11px", letterSpacing: "2px" }}
            onClick={() => {
              setCreatedRival(null);
              setForgeForm({ name: "", avatar: "🤖", tone: "aggressive", aggression: 7, logicLevel: 6, humorLevel: 3, difficulty: "medium", memoryEnabled: false, backstory: "" });
              setScreen("forge-rival");
            }}
          >
            FORGE ANOTHER
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", fontSize: "11px", letterSpacing: "2px" }} onClick={() => setScreen("home")}>← Home</button>
        </div>
        <div className="forge-section" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "1px", color: "var(--text-dim)" }}>
            Share code: <span style={{ color: "var(--text)", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "3px" }}>{createdRival.shareCode}</span>
          </p>
        </div>
      </div>
    )}

    {screen === "home" && (
      <button
        className="float-rival-btn"
        onClick={() => setScreen("forge-rival")}
        title="Forge Your Rival"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="12" rx="2"/>
          <rect x="8" y="3" width="8" height="5" rx="1.5"/>
          <line x1="12" y1="3" x2="12" y2="8"/>
          <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none"/>
          <path d="M9 17h6"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
      </button>
    )}

    {showForgeRival && (
      <div className="modal-backdrop" onClick={() => setShowForgeRival(false)}>
        <div className="forge-rival-modal" onClick={(e) => e.stopPropagation()}>
          <p className="forge-rival-title">FORGE YOUR RIVAL</p>
          <p className="forge-rival-sub">Designate your nemesis. Track the record. Settle the score.</p>
          <div className="forge-opp-grid">
            {AI_OPPONENTS.map(ai => {
              const h = ((stats.opponentHistory ?? {}) as Record<string, {wins:number;losses:number}>)[ai.id];
              return (
                <button
                  key={ai.id}
                  className="forge-opp-card"
                  onClick={() => {
                    setSelectedAI(ai.id);
                    setDisplayTopics(pickTopics());
                    setSetupStep(0);
                    setScreen("setup");
                    setShowForgeRival(false);
                  }}
                >
                  <span className="forge-opp-icon">{ai.icon}</span>
                  <span className="forge-opp-name">{ai.name}</span>
                  {h && (h.wins > 0 || h.losses > 0) && (
                    <span className="forge-opp-record">{h.wins}W · {h.losses}L</span>
                  )}
                </button>
              );
            })}
          </div>
          <button className="forge-close-btn" onClick={() => setShowForgeRival(false)}>CANCEL</button>
        </div>
      </div>
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
