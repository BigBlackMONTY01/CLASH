import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  { icon: "🎓", name: "The Professor",  desc: "Calm, methodical, academic. Dismantles your logic with precision.",          diff: "medium",  diffLabel: "Medium"  },
  { icon: "🏛️", name: "The Politician", desc: "Dodges, pivots, and spins. Masters emotional rhetoric.",                     diff: "medium",  diffLabel: "Medium"  },
  { icon: "⚖️", name: "The Prosecutor", desc: "Aggressive, relentless. Finds your weakest point and hammers it.",           diff: "hard",    diffLabel: "Hard"    },
  { icon: "🔮", name: "The Philosopher",desc: "Questions your fundamental assumptions. Makes you doubt everything.",         diff: "hard",    diffLabel: "Hard"    },
  { icon: "😈", name: "The Devil",      desc: "Chaotic. Takes the most extreme opposing position. Unpredictable.",           diff: "easy",    diffLabel: "Easy"    },
  { icon: "🔬", name: "The Debunker",   desc: "Data-obsessed. Demands sources. Fact-checks everything in real time.",       diff: "extreme", diffLabel: "Extreme" },
];

const FEATURES = [
  { icon: "🧠", name: "Argument DNA",    desc: "Every match scores your Logic, Persuasion, and Delivery separately. Find your weakness. Drill it." },
  { icon: "⚡", name: "Argument IQ",     desc: "Every argument you make gets an IQ score. Are you arguing at 140 or 85? You'll know." },
  { icon: "🔍", name: "Ghost Reveal",    desc: "After each match, see hidden tags on your arguments — Fallacy, Killer Point, Emotional Bait — detected in real-time." },
  { icon: "🎯", name: "Coach Mode",      desc: "AI coach breaks down what worked, what failed, and gives you a specific drill for your next match." },
  { icon: "📈", name: "Ranked MMR",      desc: "Climb from Bronze to Clash Master. Every win/loss adjusts your rating. Your rank is earned, not given." },
  { icon: "🛡️", name: "Shield System",  desc: "Win streaks earn Shield Tokens. Lose one? Your rank is protected — once." },
  { icon: "⚔️", name: "Gauntlet Mode",  desc: "Face 6 opponents back to back. No breaks. No mercy. One run. Prove you can outlast them all." },
  { icon: "🤝", name: "1v1 Challenge",   desc: "Create a private room, share the code, and debate a real human. Real-time scoring. Real trash talk." },
];

const LP_CSS = `
:root {
  --lp-bg:#080808; --lp-surface:#111; --lp-surface2:#181818;
  --lp-red:#e63946; --lp-red2:#ff4655; --lp-gold:#f4c542;
  --lp-text:#f0f0f0; --lp-dim:#555; --lp-mid:#888;
  --lp-border:#1e1e1e; --lp-green:#22c55e;
}

.lp-laser {
  position:fixed; width:14px; height:14px; border-radius:50%;
  background:var(--lp-red); pointer-events:none; z-index:9997;
  box-shadow:0 0 8px 4px rgba(230,57,70,0.9),0 0 24px 8px rgba(230,57,70,0.5),0 0 60px 20px rgba(230,57,70,0.2);
  animation:lp-laser-pulse 0.6s ease-in-out infinite;
}
@keyframes lp-laser-pulse {
  0%,100%{box-shadow:0 0 8px 4px rgba(230,57,70,0.9),0 0 24px 8px rgba(230,57,70,0.5),0 0 60px 20px rgba(230,57,70,0.2);}
  50%{box-shadow:0 0 14px 7px rgba(255,70,85,1),0 0 40px 14px rgba(230,57,70,0.7),0 0 80px 30px rgba(230,57,70,0.3);}
}
.lp-laser-caught { animation:lp-laser-burst 0.45s ease-out forwards !important; }
@keyframes lp-laser-burst {
  0%  { transform:scale(1);   opacity:1; }
  40% { transform:scale(4);   opacity:0.9; }
  100%{ transform:scale(0.1); opacity:0; }
}

.lp-grain {
  position:fixed; inset:0; pointer-events:none; z-index:9998;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

.lp-wrap { background:var(--lp-bg); color:var(--lp-text); font-family:'Barlow',sans-serif; overflow-x:hidden; min-height:100vh; }
.lp-nav { position:sticky; top:0; z-index:100; background:rgba(8,8,8,0.9); backdrop-filter:blur(12px); border-bottom:1px solid var(--lp-border); padding:0 24px; height:56px; display:flex; align-items:center; justify-content:space-between; }
.lp-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:4px; color:var(--lp-text); }
.lp-logo span { color:var(--lp-red); }
.lp-nav-cta { background:var(--lp-red); color:#fff; border:none; border-radius:4px; padding:8px 20px; font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:background 0.2s; text-decoration:none; display:inline-block; }
.lp-nav-cta:hover { background:var(--lp-red2); }

/* HERO */
.lp-hero { padding:80px 24px 60px; text-align:center; max-width:640px; margin:0 auto; position:relative; }
.lp-hero-eyebrow { font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:4px; text-transform:uppercase; color:var(--lp-red); margin-bottom:16px; }
.lp-hero-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(72px,12vw,120px); line-height:0.9; letter-spacing:4px; margin:0 0 8px; }
.lp-hero-title .line2 { color:var(--lp-red); display:block; }
.lp-hero-sub { font-size:18px; color:var(--lp-mid); line-height:1.6; margin:16px 0 32px; max-width:480px; margin-left:auto; margin-right:auto; }
.lp-hero-cta { display:inline-flex; align-items:center; gap:10px; background:var(--lp-red); color:#fff; border:none; border-radius:6px; padding:16px 32px; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
.lp-hero-cta:hover { background:var(--lp-red2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(230,57,70,0.4); }
.lp-hero-sub-cta { display:block; margin-top:12px; font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--lp-dim); }

/* MARQUEE */
.lp-marquee-wrap { overflow:hidden; border-top:1px solid var(--lp-border); border-bottom:1px solid var(--lp-border); background:var(--lp-surface); padding:10px 0; }
.lp-marquee-track { display:flex; gap:0; animation:lp-marquee 32s linear infinite; width:max-content; }
.lp-marquee-wrap:hover .lp-marquee-track { animation-play-state:paused; }
.lp-marquee-item { display:flex; align-items:center; gap:8px; padding:0 28px; white-space:nowrap; border-right:1px solid var(--lp-border); }
.lp-marquee-cat { font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; padding:2px 6px; border-radius:2px; background:var(--lp-red); color:#fff; flex-shrink:0; }
.lp-marquee-text { font-size:13px; color:var(--lp-mid); }
@keyframes lp-marquee { from{transform:translateX(0);} to{transform:translateX(-50%);} }

/* STATS BAR */
.lp-stats-bar { display:flex; justify-content:center; gap:0; border-bottom:1px solid var(--lp-border); }
.lp-stat-item { text-align:center; padding:24px 32px; border-right:1px solid var(--lp-border); }
.lp-stat-item:last-child { border-right:none; }
.lp-stat-val { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:2px; line-height:1; display:block; }
.lp-stat-lbl { font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:var(--lp-dim); margin-top:4px; display:block; }

/* SECTIONS */
.lp-section { padding:60px 24px; max-width:760px; margin:0 auto; }
.lp-section-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,6vw,52px); letter-spacing:3px; margin:0 0 8px; }
.lp-section-title span { color:var(--lp-red); }
.lp-section-sub { font-size:15px; color:var(--lp-mid); margin-bottom:36px; line-height:1.6; }

/* HOW IT WORKS */
.lp-how-steps { display:flex; flex-direction:column; gap:0; }
.lp-how-step { display:flex; gap:20px; padding:24px 0; border-bottom:1px solid var(--lp-border); }
.lp-how-step:last-child { border-bottom:none; }
.lp-how-num { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:2px; color:var(--lp-red); line-height:1; flex-shrink:0; width:48px; }
.lp-how-title { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
.lp-how-body { font-size:14px; color:var(--lp-mid); line-height:1.6; }

/* OPPONENTS GRID */
.lp-opp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; }
.lp-opp-card { background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:8px; padding:20px; transition:all 0.2s; cursor:default; }
.lp-opp-card:hover { border-color:#2a2a2a; transform:translateY(-2px); }
.lp-opp-icon { font-size:28px; margin-bottom:10px; }
.lp-opp-name { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
.lp-opp-diff { display:inline-block; font-family:'Barlow Condensed',sans-serif; font-size:9px; letter-spacing:2px; padding:2px 6px; border-radius:2px; margin-bottom:8px; }
.lp-opp-diff.easy { background:rgba(34,197,94,0.15); color:var(--lp-green); }
.lp-opp-diff.medium { background:rgba(244,197,66,0.15); color:var(--lp-gold); }
.lp-opp-diff.hard { background:rgba(230,57,70,0.15); color:var(--lp-red); }
.lp-opp-diff.extreme { background:rgba(255,0,0,0.2); color:#ff4444; }
.lp-opp-desc { font-size:12px; color:var(--lp-mid); line-height:1.5; }

/* FEATURES GRID */
.lp-feat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }
.lp-feat-card { background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:8px; padding:20px; transition:border-color 0.2s; }
.lp-feat-card:hover { border-color:#2a2a2a; }
.lp-feat-icon { font-size:26px; margin-bottom:10px; }
.lp-feat-name { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }
.lp-feat-desc { font-size:13px; color:var(--lp-mid); line-height:1.6; }

/* RANKS */
.lp-ranks { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
.lp-rank { width:52px; height:52px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:2px; border:2px solid; transition:transform 0.2s; cursor:default; }
.lp-rank:hover { transform:scale(1.1); }
.lp-rank.s { background:rgba(255,215,0,0.12); border-color:#ffd700; color:#ffd700; }
.lp-rank.a { background:rgba(34,197,94,0.1); border-color:#22c55e; color:#22c55e; }
.lp-rank.b { background:rgba(90,180,255,0.1); border-color:#5ab4ff; color:#5ab4ff; }
.lp-rank.c { background:rgba(244,197,66,0.1); border-color:#f4c542; color:#f4c542; }
.lp-rank.d { background:rgba(230,100,57,0.1); border-color:#e66439; color:#e66439; }
.lp-rank.f { background:rgba(230,57,70,0.1); border-color:#e63946; color:#e63946; }

/* LEADERBOARD PREVIEW */
.lp-lb-row { display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--lp-surface); border:1px solid var(--lp-border); border-radius:6px; margin-bottom:6px; }
.lp-lb-rank { font-family:'Bebas Neue',sans-serif; font-size:18px; color:var(--lp-dim); width:24px; flex-shrink:0; }
.lp-lb-rank.gold { color:var(--lp-gold); }
.lp-lb-rank.silver { color:#a0aab4; }
.lp-lb-rank.bronze { color:#c49a6c; }
.lp-lb-name { flex:1; font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; letter-spacing:1px; }
.lp-lb-wins { font-family:'Bebas Neue',sans-serif; font-size:16px; color:var(--lp-green); flex-shrink:0; }
.lp-lb-score { font-family:'Bebas Neue',sans-serif; font-size:14px; color:var(--lp-gold); flex-shrink:0; margin-left:6px; }

/* CTA SECTION */
.lp-cta-section { background:var(--lp-surface); border-top:1px solid var(--lp-border); border-bottom:1px solid var(--lp-border); padding:64px 24px; text-align:center; }
.lp-cta-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(48px,8vw,80px); letter-spacing:4px; margin-bottom:12px; }
.lp-cta-title span { color:var(--lp-red); }
.lp-cta-sub { font-size:16px; color:var(--lp-mid); margin-bottom:32px; }

/* FOOTER */
.lp-footer { padding:24px; text-align:center; border-top:1px solid var(--lp-border); }
.lp-footer-text { font-family:'Barlow Condensed',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--lp-dim); }

/* FLOATING BADGE */
.lp-floating-badge {
  position:fixed; bottom:24px; right:24px; z-index:200;
  background:var(--lp-red); color:#fff; border:none; border-radius:100px;
  padding:12px 24px; font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px;
  cursor:pointer; box-shadow:0 4px 24px rgba(230,57,70,0.5); transition:all 0.2s;
  text-decoration:none; display:block;
  animation:lp-badge-pulse 2s ease-in-out infinite;
}
.lp-floating-badge:hover { background:var(--lp-red2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(230,57,70,0.6); }
@keyframes lp-badge-pulse {
  0%,100%{box-shadow:0 4px 24px rgba(230,57,70,0.5);}
  50%{box-shadow:0 4px 36px rgba(230,57,70,0.8);}
}

/* PULSE DOT */
.lp-live-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--lp-green); margin-right:6px; animation:lp-dot-pulse 1.4s ease-in-out infinite; vertical-align:middle; }
@keyframes lp-dot-pulse {
  0%,100%{opacity:1;transform:scale(1);}
  50%{opacity:0.5;transform:scale(0.7);}
}

/* TIER BADGES */
.lp-tier-grid { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:24px; }
.lp-tier-badge { padding:8px 18px; border-radius:100px; font-family:'Barlow Condensed',sans-serif; font-size:12px; letter-spacing:2px; font-weight:700; border:1px solid; }
.lp-tier-badge.bronze { border-color:rgba(176,122,87,0.5); color:#c49a6c; background:rgba(176,122,87,0.08); }
.lp-tier-badge.silver { border-color:rgba(160,170,180,0.5); color:#a0aab4; background:rgba(160,170,180,0.08); }
.lp-tier-badge.gold { border-color:rgba(212,175,55,0.5); color:#d4af37; background:rgba(212,175,55,0.08); }
.lp-tier-badge.diamond { border-color:rgba(90,180,255,0.5); color:#5ab4ff; background:rgba(90,180,255,0.08); }
.lp-tier-badge.clash-master { border-color:rgba(230,57,70,0.5); color:var(--lp-red); background:rgba(230,57,70,0.08); }

@media(max-width:600px){
  .lp-stats-bar{flex-wrap:wrap;}
  .lp-stat-item{flex:1 1 40%;border-right:none;border-bottom:1px solid var(--lp-border);}
  .lp-how-step{flex-direction:column;gap:8px;}
  .lp-hero{padding:48px 20px 40px;}
}
`;

if (typeof document !== "undefined") {
  const _lpStyle = document.createElement("style");
  _lpStyle.id = "lp-css";
  if (!document.getElementById("lp-css")) {
    _lpStyle.textContent = LP_CSS;
    document.head.appendChild(_lpStyle);
  }
}

export default function Landing() {
  useLayoutEffect(() => { document.body.style.visibility = "visible"; }, []);
  const laserRef = useRef<HTMLDivElement>(null);
  const catchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [lbData, setLbData] = useState<LbEntry[]>([]);
  const [statsDisplay, setStatsDisplay] = useState({ debates: 0, winRate: 0, players: 0 });

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = LP_CSS;
    document.body.style.visibility = "visible";
    return () => { if (style.parentNode) style.parentNode.removeChild(style); };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!laserRef.current) return;
      laserRef.current.style.left = `${e.clientX - 7}px`;
      laserRef.current.style.top = `${e.clientY - 7}px`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleLaserClick = () => {
    if (!laserRef.current || laserRef.current.classList.contains("lp-laser-caught")) return;
    laserRef.current.classList.add("lp-laser-caught");
    if (catchTimerRef.current) clearTimeout(catchTimerRef.current);
    catchTimerRef.current = setTimeout(() => {
      if (laserRef.current) laserRef.current.classList.remove("lp-laser-caught");
    }, 500);
  };

  useEffect(() => {
    (async () => {
      try {
        const url = `${API}/api/stats/global`;
        const res = await fetch(url);
        if (res.ok) {
          const data: GlobalStats = await res.json();
          setStats(data);
          const steps = 40;
          let step = 0;
          const iv = setInterval(() => {
            step++;
            const ease = 1 - Math.pow(1 - step / steps, 3);
            setStatsDisplay({
              debates: Math.round(data.totalDebates * ease),
              winRate: Math.round((data.globalWinRate || 0) * ease),
              players: Math.round((data.activePlayers || 0) * ease),
            });
            if (step >= steps) clearInterval(iv);
          }, 20);
        }
      } catch {}
    })();
    (async () => {
      try {
        const url = `${API}/api/leaderboard`;
        const res = await fetch(url);
        if (res.ok) {
          const data: LbEntry[] = await res.json();
          setLbData(data.slice(0, 5));
        }
      } catch {}
    })();
  }, []);

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="lp-wrap">
      <div className="lp-grain" />
      <div className="lp-laser" ref={laserRef} onClick={handleLaserClick} />

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-logo">CL<span>A</span>SH</div>
        <a className="lp-nav-cta" href={APP_URL}>Play Free →</a>
      </nav>

      {/* MARQUEE */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee-track">
          {marqueeItems.map((item, i) => (
            <div key={i} className="lp-marquee-item">
              <span className="lp-marquee-cat">{item.catLabel}</span>
              <span className="lp-marquee-text">"{item.text}"</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-eyebrow">The AI Debate Arena</div>
        <h1 className="lp-hero-title">
          ARGUE.<span className="line2">WIN.</span>
        </h1>
        <p className="lp-hero-sub">
          Debate AI opponents that actually push back. Get scored on Logic, Persuasion, and Delivery.
          Climb the ranks. Earn your title.
        </p>
        <a className="lp-hero-cta" href={APP_URL}>
          Start Debating →
        </a>
        <span className="lp-hero-sub-cta">
          <span className="lp-live-dot" />
          Free to play · No sign-up required
        </span>
      </section>

      {/* LIVE STATS BAR */}
      <div className="lp-stats-bar">
        <div className="lp-stat-item">
          <span className="lp-stat-val">{statsDisplay.debates > 0 ? statsDisplay.debates.toLocaleString() : "—"}</span>
          <span className="lp-stat-lbl">Total Debates</span>
        </div>
        <div className="lp-stat-item">
          <span className="lp-stat-val" style={{ color: "var(--lp-green)" }}>{statsDisplay.winRate > 0 ? `${statsDisplay.winRate}%` : "—"}</span>
          <span className="lp-stat-lbl">Avg Win Rate</span>
        </div>
        <div className="lp-stat-item">
          <span className="lp-stat-val">{statsDisplay.players > 0 ? statsDisplay.players.toLocaleString() : "—"}</span>
          <span className="lp-stat-lbl">Active Players</span>
        </div>
        <div className="lp-stat-item">
          <span className="lp-stat-val">6</span>
          <span className="lp-stat-lbl">AI Opponents</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="lp-section">
        <h2 className="lp-section-title">HOW IT <span>WORKS</span></h2>
        <p className="lp-section-sub">Three steps. Zero mercy.</p>
        <div className="lp-how-steps">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="lp-how-step">
              <div className="lp-how-num">{i + 1}</div>
              <div>
                <div className="lp-how-title">{step.title}</div>
                <div className="lp-how-body">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OPPONENTS */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <h2 className="lp-section-title">YOUR <span>OPPONENTS</span></h2>
        <p className="lp-section-sub">Choose your challenger. Each one will tear apart your arguments differently.</p>
        <div className="lp-opp-grid">
          {OPPONENTS.map((opp) => (
            <div key={opp.name} className="lp-opp-card">
              <div className="lp-opp-icon">{opp.icon}</div>
              <div className="lp-opp-name">{opp.name}</div>
              <div className={`lp-opp-diff ${opp.diff}`}>{opp.diffLabel}</div>
              <div className="lp-opp-desc">{opp.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <h2 className="lp-section-title">BUILT TO <span>IMPROVE YOU</span></h2>
        <p className="lp-section-sub">CLASH isn't just a game. It's a training ground.</p>
        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.name} className="lp-feat-card">
              <div className="lp-feat-icon">{f.icon}</div>
              <div className="lp-feat-name">{f.name}</div>
              <div className="lp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RANK SYSTEM */}
      <section className="lp-section" style={{ paddingTop: 0, textAlign: "center" }}>
        <h2 className="lp-section-title">THE <span>RANK SYSTEM</span></h2>
        <p className="lp-section-sub">Every debate earns you a rank from S to F. Reach Clash Master and you've earned the right to call yourself a debater.</p>
        <div className="lp-ranks">
          {[["S","s"],["A","a"],["B","b"],["C","c"],["D","d"],["F","f"]].map(([r, cls]) => (
            <div key={r} className={`lp-rank ${cls}`}>{r}</div>
          ))}
        </div>
        <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--lp-mid)" }}>Ranked MMR: climb from Bronze → Silver → Gold → Diamond → Clash Master</p>
        <div className="lp-tier-grid">
          {["bronze","silver","gold","diamond","clash-master"].map(tier => (
            <span key={tier} className={`lp-tier-badge ${tier}`}>{tier === "clash-master" ? "Clash Master" : tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
          ))}
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      {lbData.length > 0 && (
        <section className="lp-section" style={{ paddingTop: 0 }}>
          <h2 className="lp-section-title">TOP <span>DEBATERS</span></h2>
          <p className="lp-section-sub">Can you crack the top 10?</p>
          {lbData.map((entry, i) => {
            const rankCls = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
            const name = entry.username || `GUEST#${entry.deviceId.slice(-4).toUpperCase()}`;
            return (
              <div key={entry.id} className="lp-lb-row">
                <span className={`lp-lb-rank ${rankCls}`}>{i === 0 ? "👑" : `#${i + 1}`}</span>
                <span className="lp-lb-name">{name}</span>
                <span className="lp-lb-wins">{entry.wins}W</span>
                <span className="lp-lb-score">{entry.bestScore}</span>
              </div>
            );
          })}
          <a href={APP_URL} style={{ display: "block", textAlign: "center", marginTop: "16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--lp-dim)", textDecoration: "none" }}>
            See Full Leaderboard →
          </a>
        </section>
      )}

      {/* CTA SECTION */}
      <div className="lp-cta-section">
        <h2 className="lp-cta-title">READY TO <span>CLASH?</span></h2>
        <p className="lp-cta-sub">Free. No download. No sign-up. Just you vs. the AI.</p>
        <a className="lp-hero-cta" href={APP_URL}>
          Enter the Arena →
        </a>
        <div style={{ marginTop: "16px", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "11px", letterSpacing: "2px", color: "var(--lp-dim)" }}>
          Sign up to track your MMR, earn titles, and appear on the leaderboard.
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-text">CLASH · The AI Debate Arena · {new Date().getFullYear()}</div>
      </footer>

      {/* FLOATING CTA */}
      <a className="lp-floating-badge" href={APP_URL}>⚡ Play Now</a>
    </div>
  );
}
