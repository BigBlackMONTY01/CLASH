import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
.input-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;}
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

  .lb-row{gap:10px;padding:12px;}
  .lb-score{font-size:20px;}

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

/* Personal record */
.nemesis-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:10px;}
.nemesis-icon{font-size:26px;flex-shrink:0;}
.nemesis-name{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.nemesis-sub{font-size:12px;color:var(--text-dim);}
.nemesis-rematch{margin-left:auto;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--red);background:none;border:1px solid rgba(230,57,70,0.4);border-radius:var(--radius);padding:6px 12px;cursor:pointer;flex-shrink:0;touch-action:manipulation;}
.nemesis-rematch:hover{border-color:var(--red);background:rgba(230,57,70,0.06);}
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

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
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
  stats: { debates: number; wins: number; bestScore: number; avgScore: number; opponentHistory: Record<string, { wins: number; losses: number }> };
}
interface LbEntry { id: number; username: string | null; deviceId: string; wins: number; totalDebates: number; bestScore: number; score: number; }
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
interface RoundScore { round: number; score: number; logic: number; persuasion: number; delivery: number; best: string; weak: string; }
interface Verdict { won: boolean; avgScore: number; avgLogic: number; avgPersuasion: number; avgDelivery: number; judgeText: string; improve: string; bestArg: string; weakArg: string; rank: string; outcome: string; }
interface Stats { wins: number; debates: number; bestScore: number; opponentHistory: Record<string, { wins: number; losses: number }>; }

type Screen = "home" | "setup" | "matchmaking" | "debate" | "verdict" | "leaderboard" | "replay" | "gauntlet-intro" | "gauntlet-between" | "gauntlet-final";

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
  const [stats, setStats] = useState<Stats>({ wins: 0, debates: 0, bestScore: 0, opponentHistory: {} });
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingVerdictRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Load shared result from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get("share");
    if (share) {
      try {
        const d = JSON.parse(atob(share));
        setSharedResult({ topic: d.t, opponentId: d.oid, opponent: d.o, side: d.s, score: d.sc, rank: d.r, outcome: d.out, judge: d.j, rounds: d.rounds });
      } catch { /* ignore malformed share params */ }
    }
  }, []);

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
      let target = { debates: 100, winRate: 0, topics: 10 };
      try {
        const gs = await apiGet<GlobalStats>("/stats/global");
        if (!cancelled) {
          target = {
            debates: Math.max(gs.totalDebates, 1),
            winRate: gs.globalWinRate || 0,
            topics: Math.max(gs.uniqueTopics, 1),
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

  // Load leaderboard when that screen opens
  useEffect(() => {
    if (screen !== "leaderboard") return;
    setLbLoading(true);
    apiGet<LbEntry[]>("/leaderboard")
      .then((data) => { setLbData(data); setLbLoading(false); })
      .catch(() => setLbLoading(false));
  }, [screen]);

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
      const raw = e instanceof Error ? e.message : "Something went wrong";
      const isRate = raw.includes("429") || raw.toLowerCase().includes("quota") || raw.toLowerCase().includes("rate");
      setError(isRate
        ? "The AI is rate-limited right now. Wait a moment, then tap Retry."
        : "Couldn't reach the AI. Check your connection and tap Retry.");
      // Stay on matchmaking screen so the user can retry without losing their setup
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
    const avgScore = Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length);
    const avgLogic = Math.round(scores.reduce((s, r) => s + r.logic, 0) / scores.length);
    const avgPersuasion = Math.round(scores.reduce((s, r) => s + r.persuasion, 0) / scores.length);
    const avgDelivery = Math.round(scores.reduce((s, r) => s + r.delivery, 0) / scores.length);
    const won = avgScore >= 65;

    try {
      const userArguments = _msgs.filter((m) => m.role === "user").map((m) => m.text);
      const judgeVerdict = await apiPost<{ verdict: string; improve: string; rank: string; outcome: string }>("/debate/verdict", {
        topic: selectedTopic?.text ?? "",
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

      setStats((prev) => {
        const oppHistory = { ...(prev.opponentHistory || {}) };
        const oppId = selectedAI || "";
        if (oppId) {
          oppHistory[oppId] = {
            wins: (oppHistory[oppId]?.wins || 0) + (won ? 1 : 0),
            losses: (oppHistory[oppId]?.losses || 0) + (won ? 0 : 1),
          };
        }
        return {
          wins: prev.wins + (won ? 1 : 0),
          debates: prev.debates + 1,
          bestScore: Math.max(prev.bestScore, avgScore),
          opponentHistory: oppHistory,
        };
      });

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

  const reset = () => {
    stopTimer();
    if (pendingVerdictRef.current) { clearTimeout(pendingVerdictRef.current); pendingVerdictRef.current = null; }
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
    if (trimmed.length < 2) { setUsernameError("Must be at least 2 characters."); return; }
    try {
      const updated = await apiPatch<PlayerProfile>("/players/username", { deviceId, username: trimmed });
      setPlayer(updated);
      setShowUsernameModal(false);
      setUsernameInput("");
      setUsernameError("");
    } catch (err: unknown) {
      setUsernameError((err as Error).message || "That name is taken.");
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
    setTimeout(() => setShareToast(""), 3000);
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {stats.debates > 0 && (
            <div className="nav-rank">{stats.wins}W {stats.debates - stats.wins}L</div>
          )}
          <button
            className={`profile-pill${player?.username ? " named" : ""}`}
            onClick={() => { setUsernameInput(player?.username || ""); setUsernameError(""); setShowUsernameModal(true); }}
          >
            <span className="pill-icon">👤</span>
            {player?.username || "Set Name"}
          </button>
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
                Start Debate
              </button>
              <button className="btn btn-secondary" onClick={() => setScreen("leaderboard")}>
                Leaderboard
              </button>
            </div>
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
                    <span className="lbl">Best Score</span>
                  </div>
                  <div className="stat-card">
                    <span className="val">{Math.round((stats.wins / stats.debates) * 100)}%</span>
                    <span className="lbl">Win Rate</span>
                  </div>
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
              <div className="topic-grid">
                {displayTopics.map((t, i) => {
                  const rating = getTopicRating(t.text);
                  return (
                    <div key={i} className={`topic-card ${selectedTopic?.text === t.text ? "selected" : ""}`} onClick={() => setSelectedTopic(t)}>
                      <div className="t-cat">{t.cat}</div>
                      <div className="t-text">{t.text}</div>
                      <div className={`topic-rating rating-${rating.toLowerCase()}`}>{rating}</div>
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
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-ghost" onClick={() => setSetupStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!selectedSide} onClick={() => launchMatchmaking()}>
                  ⚡ Start Clash
                </button>
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
                  <button className="btn btn-ghost" onClick={reset}>Forfeit</button>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
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

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={instantRematch}>⚡ Instant Rematch</button>
            <button className="btn btn-secondary" onClick={swapSidesRematch}>↕ Swap Sides</button>
            <button className="btn btn-secondary" onClick={() => setScreen("replay")}>📋 Replay</button>
            <button className="btn btn-secondary" onClick={shareResult}>🔗 Share</button>
            <button className="btn btn-ghost" onClick={() => { setSetupStep(0); setScreen("setup"); setMessages([]); setRoundScores([]); setVerdict(null); }}>New Match</button>
            <button className="btn btn-ghost" onClick={reset}>Home</button>
          </div>
        </div>
      )}

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
            <div className="stat-card"><span className="val gold">{stats.bestScore || "—"}</span><span className="lbl">Best Score</span></div>
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
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", letterSpacing: "2px", marginBottom: "8px" }}>NO PLAYERS YET</div>
              <div style={{ fontSize: "13px" }}>Finish a debate to appear on the leaderboard.</div>
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
                  <div className="lb-meta">{p.wins} win{p.wins !== 1 ? "s" : ""} · {p.totalDebates} debate{p.totalDebates !== 1 ? "s" : ""}</div>
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
