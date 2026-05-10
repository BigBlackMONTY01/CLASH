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
interface Verdict { won: boolean; avgScore: number; avgLogic: number; avgPersuasion: number; avgDelivery: number; judgeText: string; improve: string; bestArg: string; weakArg: string; rank: string; outcome: string; }
interface Stats { wins: number; debates: number; bestScore: number; }

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
  const [stats, setStats] = useState<Stats>({ wins: 0, debates: 0, bestScore: 0 });
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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
      setError(e instanceof Error ? e.message : "Something went wrong");
      setScreen("setup");
      setSetupStep(2);
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
        setTimeout(() => generateVerdict(newRoundScores, newMessages), 4000);
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

      setStats((prev) => ({
        wins: prev.wins + (won ? 1 : 0),
        debates: prev.debates + 1,
        bestScore: Math.max(prev.bestScore, avgScore),
      }));

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

  return (
    <>
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
            <div style={{ marginTop: "14px" }}>
              <button
                style={{ background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius)", padding: "10px 24px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", width: "100%", maxWidth: "340px" }}
                onClick={() => { setGauntletNextSide(null); setScreen("gauntlet-intro"); }}
              >
                ⚔ Gauntlet Mode — All 6 Bots
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
                onClick={() => setSetupStep(1)}
              >
                Next: Pick Topic →
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

          {matchCountdown > 0 ? (
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
        <div className="screen">
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
    {shareToast && <div className="share-toast">{shareToast}</div>}
    </>
  );
}
