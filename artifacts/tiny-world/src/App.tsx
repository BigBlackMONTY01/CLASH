import { useState, useEffect, useRef } from "react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');`;

const css = `
${FONT_IMPORT}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #080807;
  --surface:   #101009;
  --surface2:  #161512;
  --rule:      rgba(255,255,255,0.07);
  --rule-warm: rgba(200,180,140,0.12);
  --text:      #cfc8b8;
  --text-dim:  #6e6558;
  --text-faint:#3a352c;
  --rust:      #b5532a;
  --rust-dim:  rgba(181,83,42,0.15);
  --gold-mute: #987a3a;
  --gold-dim:  rgba(152,122,58,0.15);
  --blood:     #7a2e2e;
  --blood-dim: rgba(122,46,46,0.15);
  --teal:      #3a7a6e;
  --teal-dim:  rgba(58,122,110,0.15);
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Libre Baskerville', Georgia, serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── LAYOUT ── */
.app {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 28px 100px;
}

/* ── HEADER ── */
.header {
  padding: 72px 0 56px;
  border-bottom: 1px solid var(--rule-warm);
  margin-bottom: 52px;
}

.header-label {
  font-family: 'Courier Prime', monospace;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 28px;
}

.title {
  font-family: 'Bitter', serif;
  font-weight: 700;
  font-size: clamp(2.8rem, 7vw, 5.2rem);
  line-height: 0.92;
  letter-spacing: -0.03em;
  color: var(--text);
  margin-bottom: 28px;
}
.title span {
  display: block;
  color: var(--rust);
}

.subtitle {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--text-dim);
  line-height: 1.7;
  max-width: 380px;
}

/* ── INPUT ── */
.input-section {
  margin-bottom: 48px;
}

.field-label {
  font-family: 'Courier Prime', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-dim);
  display: block;
  margin-bottom: 10px;
}

.input-field {
  display: block;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--rule-warm);
  border-radius: 0;
  padding: 16px 18px;
  color: var(--text);
  font-family: 'Libre Baskerville', serif;
  font-size: 1rem;
  line-height: 1.65;
  resize: none;
  outline: none;
  min-height: 90px;
  transition: border-color 0.2s;
  margin-bottom: 12px;
}
.input-field:focus { border-color: rgba(200,180,140,0.3); }
.input-field::placeholder { color: var(--text-faint); font-style: italic; }
.input-field:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-simulate {
  display: block;
  width: 100%;
  background: var(--rust);
  border: none;
  color: #f0ebe0;
  font-family: 'Courier Prime', monospace;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 15px 24px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border-radius: 0;
}
.btn-simulate:hover:not(:disabled) { background: #c45e32; }
.btn-simulate:disabled { opacity: 0.25; cursor: not-allowed; }

.error-msg {
  margin-top: 12px;
  font-size: 0.88rem;
  color: #a05050;
  font-style: italic;
  padding: 10px 14px;
  border-left: 2px solid var(--blood);
  background: var(--blood-dim);
}

/* ── LOADING ── */
.loading {
  padding: 64px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}
.loading-bar-wrap {
  width: 100%;
  height: 2px;
  background: var(--rule-warm);
  margin-bottom: 28px;
  overflow: hidden;
}
.loading-bar {
  height: 100%;
  background: var(--rust);
  animation: loadSweep 1.8s ease-in-out infinite;
  width: 35%;
}
@keyframes loadSweep {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(185%); }
  100% { transform: translateX(400%); }
}
.loading-phrase {
  font-family: 'Courier Prime', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--rust);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.loading-sub {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--text-dim);
}

/* ── SIMULATION ── */
.simulation {
  animation: fadeIn 0.4s ease both;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* SIM HEADER */
.sim-header {
  padding-bottom: 40px;
  border-bottom: 1px solid var(--rule-warm);
  margin-bottom: 48px;
}
.sim-civ-label {
  font-family: 'Courier Prime', monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--rust);
  margin-bottom: 14px;
  opacity: 0.8;
}
.sim-name {
  font-family: 'Bitter', serif;
  font-weight: 700;
  font-size: clamp(2rem, 5vw, 3.6rem);
  line-height: 0.95;
  letter-spacing: -0.025em;
  color: var(--text);
  margin-bottom: 18px;
}
.sim-tagline {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--text-dim);
  line-height: 1.65;
  margin-bottom: 32px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--rule-warm);
}
.stat-item {
  padding: 16px 18px;
  border-right: 1px solid var(--rule-warm);
}
.stat-item:last-child { border-right: none; }
.stat-val {
  display: block;
  font-family: 'Bitter', serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.3;
}
.stat-key {
  display: block;
  font-family: 'Courier Prime', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
  opacity: 0.6;
}

/* ── ERAS ── */
.eras-label {
  font-family: 'Courier Prime', monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-dim);
  opacity: 0.5;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.eras-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule-warm);
}

.era {
  display: grid;
  grid-template-columns: 3px 1fr;
  gap: 0 20px;
  margin-bottom: 4px;
  animation: fadeIn 0.4s ease both;
}
.era:nth-child(1) { animation-delay: 0.04s; }
.era:nth-child(2) { animation-delay: 0.08s; }
.era:nth-child(3) { animation-delay: 0.12s; }
.era:nth-child(4) { animation-delay: 0.16s; }
.era:nth-child(5) { animation-delay: 0.20s; }
.era:nth-child(6) { animation-delay: 0.24s; }
.era:nth-child(7) { animation-delay: 0.28s; }
.era:nth-child(8) { animation-delay: 0.32s; }

.era-gutter {
  background: var(--text-faint);
  flex-shrink: 0;
}
.era.catastrophe .era-gutter { background: var(--blood); }
.era.golden .era-gutter      { background: var(--gold-mute); }
.era.founding .era-gutter    { background: var(--teal); }
.era.discovery .era-gutter   { background: #4a7a5a; }
.era.renaissance .era-gutter { background: #4a607a; }

.era-body-wrap {
  padding: 20px 0 20px 0;
  border-bottom: 1px solid var(--rule);
}
.era:last-child .era-body-wrap { border-bottom: none; }

.era-meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.era-type-tag {
  font-family: 'Courier Prime', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 2px 7px;
  border: 1px solid var(--rule-warm);
  color: var(--text-dim);
}
.era.catastrophe .era-type-tag { border-color: rgba(122,46,46,0.4); color: #a06060; }
.era.golden .era-type-tag      { border-color: rgba(152,122,58,0.4); color: #a0883a; }
.era.founding .era-type-tag    { border-color: rgba(58,122,110,0.35); color: #4a9a8e; }
.era.discovery .era-type-tag   { border-color: rgba(74,122,90,0.35); color: #4a9a6e; }
.era.renaissance .era-type-tag { border-color: rgba(74,96,122,0.35); color: #607aaa; }

.era-year-txt {
  font-family: 'Courier Prime', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  opacity: 0.45;
}
.era-title {
  font-family: 'Bitter', serif;
  font-weight: 500;
  font-size: 1.05rem;
  color: var(--text);
  margin-bottom: 9px;
  line-height: 1.3;
}
.era-text {
  font-size: 0.97rem;
  color: var(--text-dim);
  line-height: 1.8;
}
.era-text em { color: var(--text); font-style: italic; }

/* ── FATE ── */
.fate-block {
  margin: 52px 0 40px;
  padding: 28px 0;
  border-top: 1px solid var(--rule-warm);
  border-bottom: 1px solid var(--rule-warm);
}
.fate-label {
  font-family: 'Courier Prime', monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-dim);
  opacity: 0.5;
  margin-bottom: 14px;
}
.fate-text {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: var(--text);
  line-height: 1.75;
}

/* ── RESET ── */
.btn-reset {
  background: none;
  border: 1px solid var(--rule-warm);
  color: var(--text-dim);
  font-family: 'Courier Prime', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  border-radius: 0;
}
.btn-reset:hover {
  border-color: var(--rust);
  color: var(--rust);
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--rule-warm); }
`;

const LOADING_PHRASES = [
  "Consulting the elder gods…",
  "Weaving the threads of fate…",
  "Summoning empires from the void…",
  "Carving history into obsidian…",
  "The stars align above a new world…",
  "Blood is spilled. Legends are born…",
];

interface Era { year: string; type: string; title: string; body: string; }
interface Simulation {
  name: string; tagline: string; duration: string;
  population_peak: string; territory: string;
  eras: Era[]; fate: string;
}

export default function App() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (status === "loading") {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i = (i + 1) % LOADING_PHRASES.length;
        setPhraseIdx(i);
      }, 2200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  const simulate = async () => {
    if (!input.trim()) return;
    setStatus("loading"); setError(""); setSimulation(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(b.error || `HTTP ${res.status}`);
      }
      setSimulation(await res.json());
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const reset = () => { setStatus("idle"); setSimulation(null); setInput(""); setError(""); };

  const renderBody = (text: string) =>
    text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*")
        ? <em key={i}>{part.slice(1, -1)}</em>
        : part
    );

  const eraClass = (type: string) =>
    ["catastrophe", "decline"].includes(type) ? "catastrophe"
    : type === "golden" ? "golden"
    : type === "founding" ? "founding"
    : type === "discovery" ? "discovery"
    : type === "renaissance" ? "renaissance"
    : type === "end" ? "end"
    : "";

  return (
    <div className="app">
      <header className="header">
        <p className="header-label">The Oracle of Ages / World Simulator</p>
        <h1 className="title">
          Tiny<br />
          <span>World</span>
        </h1>
        <p className="subtitle">Speak one sentence. Watch a thousand years unfold.</p>
      </header>

      {status !== "done" && (
        <div className="input-section">
          <label className="field-label" htmlFor="civ-input">Describe your civilization</label>
          <textarea
            id="civ-input"
            className="input-field"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. A society of blind astronomers who navigate entirely by sound…"
            disabled={status === "loading"}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); simulate(); } }}
          />
          <button
            className="btn-simulate"
            onClick={simulate}
            disabled={status === "loading" || !input.trim()}
          >
            {status === "loading" ? "Consulting the Oracle…" : "Begin the simulation →"}
          </button>
          {status === "error" && <div className="error-msg">{error}</div>}
        </div>
      )}

      {status === "loading" && (
        <div className="loading">
          <div className="loading-bar-wrap">
            <div className="loading-bar" />
          </div>
          <p className="loading-phrase">{LOADING_PHRASES[phraseIdx]}</p>
          <p className="loading-sub">A thousand years takes but a moment…</p>
        </div>
      )}

      {status === "done" && simulation && (
        <div className="simulation">
          <div className="sim-header">
            <p className="sim-civ-label">Chronicle</p>
            <h2 className="sim-name">{simulation.name}</h2>
            <p className="sim-tagline">"{simulation.tagline}"</p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-val">{simulation.duration}</span>
                <span className="stat-key">Duration</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{simulation.population_peak}</span>
                <span className="stat-key">Peak pop.</span>
              </div>
              <div className="stat-item">
                <span className="stat-val">{simulation.territory}</span>
                <span className="stat-key">Territory</span>
              </div>
            </div>
          </div>

          <p className="eras-label">The Chronicle</p>

          <div>
            {(simulation.eras || []).map((era, i) => (
              <div key={i} className={`era ${eraClass(era.type)}`}>
                <div className="era-gutter" />
                <div className="era-body-wrap">
                  <div className="era-meta">
                    <span className="era-type-tag">{era.type}</span>
                    <span className="era-year-txt">{era.year}</span>
                  </div>
                  <h3 className="era-title">{era.title}</h3>
                  <p className="era-text">{renderBody(era.body)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="fate-block">
            <p className="fate-label">Final Reckoning</p>
            <p className="fate-text">"{simulation.fate}"</p>
          </div>

          <button className="btn-reset" onClick={reset}>
            ← Summon another world
          </button>
        </div>
      )}
    </div>
  );
}
