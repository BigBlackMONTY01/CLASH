import { useRef, useEffect } from "react";

const DURATION = 5000;
const PX = 2;

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  color: string;
  size: number;
}

function emitSparks(list: Spark[], x: number, y: number, n: number) {
  const colors = ["#ff4655", "#f4c542", "#ffffff", "#ff9800", "#ffdd44"];
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.9;
    const spd = 1.2 + Math.random() * 3.5;
    list.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1.8,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 2,
    });
  }
}

type Pose = "idle" | "walk1" | "walk2" | "atk" | "hit" | "win" | "fall";

function drawSoldier(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  facing: 1 | -1,
  pose: Pose,
  alpha = 1,
  tilt = 0,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(facing, 1);

  const p = PX;

  // Leg animation
  let legLH = 11 * p, legRH = 11 * p;
  let legLY = 7 * p, legRY = 7 * p;
  if (pose === "walk1") { legLH = 7 * p; legRH = 13 * p; legLY = 7 * p; legRY = 5 * p; }
  if (pose === "walk2") { legLH = 13 * p; legRH = 7 * p; legLY = 5 * p; legRY = 7 * p; }

  // Sword arm rotation
  let sRot = 0;
  if (pose === "idle") sRot = -0.15;
  if (pose === "walk1" || pose === "walk2") sRot = -0.1;
  if (pose === "atk") sRot = 0.45;
  if (pose === "hit") sRot = -0.55;
  if (pose === "win") sRot = -1.0;
  if (pose === "fall") sRot = 0.4;

  // Helmet
  ctx.fillStyle = "#b0392b";
  ctx.fillRect(-5 * p, -17 * p, 10 * p, 4 * p);
  ctx.fillStyle = "#8b1a1a";
  ctx.fillRect(-6 * p, -14 * p, 12 * p, 2 * p);
  // Plume
  ctx.fillStyle = "#e63946";
  ctx.fillRect(3 * p, -20 * p, 2 * p, 4 * p);

  // Face
  ctx.fillStyle = "#e8c8a0";
  ctx.fillRect(-4 * p, -12 * p, 8 * p, 7 * p);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(1 * p, -10 * p, 2 * p, 2 * p); // eye (toward enemy)

  // Body armor
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-5 * p, -5 * p, 10 * p, 12 * p);
  ctx.fillStyle = "#505060";
  ctx.fillRect(-4 * p, -4 * p, 2 * p, 5 * p); // highlight stripe

  // Shield (left arm – away from enemy)
  ctx.fillStyle = "#55667a";
  ctx.fillRect(-12 * p, -5 * p, 7 * p, 12 * p);
  ctx.fillStyle = "#7a90a8";
  ctx.fillRect(-11 * p, -4 * p, 4 * p, 6 * p);
  ctx.fillStyle = "#3a4a5a";
  ctx.fillRect(-12 * p, -5 * p, 7 * p, 1 * p);
  ctx.fillRect(-12 * p, 6 * p, 7 * p, 1 * p);

  // Sword arm (right – toward enemy)
  ctx.save();
  ctx.translate(6 * p, -2 * p);
  ctx.rotate(sRot);
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(0, 0, 4 * p, 4 * p); // upper arm
  // Blade (pointing right toward opponent)
  ctx.fillStyle = "#d0d8e8";
  ctx.fillRect(3 * p, -1 * p, 18 * p, 2 * p);
  ctx.fillStyle = "#b0b8c8";
  ctx.fillRect(3 * p, 0, 18 * p, 1 * p); // darker edge
  // Guard
  ctx.fillStyle = "#a0a8b0";
  ctx.fillRect(3 * p, -3 * p, 2 * p, 7 * p);
  ctx.restore();

  // Legs
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-5 * p, legLY, 4 * p, legLH);
  ctx.fillRect(1 * p, legRY, 4 * p, legRH);
  // Boots
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(-6 * p, legLY + legLH, 6 * p, 3 * p);
  ctx.fillRect(0, legRY + legRH, 6 * p, 3 * p);

  ctx.restore();
}

function drawClash(ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) {
  if (intensity <= 0) return;
  const r = 18 * intensity;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${Math.min(1, intensity)})`);
  g.addColorStop(0.3, `rgba(255,220,60,${intensity * 0.85})`);
  g.addColorStop(0.65, `rgba(230,57,70,${intensity * 0.5})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,255,160,${intensity * 0.85})`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const len = (5 + Math.random() * 9) * intensity;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();
}

export function V1BattleButton({ onClick }: { onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const prevTRef = useRef<number>(0);
  const sparks = useRef<Spark[]>([]);
  const emitted = useRef({ c1: false, c2: false, c3: false, c4: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Ground = bottom of boots. Waist is passed as y.
    const WAIST_Y = 42;
    const CX = W / 2;
    const LFX = CX - 28; // left soldier fight x
    const RFX = CX + 28; // right soldier fight x
    const CLASH_X = CX;
    const CLASH_Y = WAIST_Y - 4 * PX; // sword level (approx)

    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = (elapsed % DURATION) / DURATION;

      // Detect loop restart
      if (t < prevTRef.current - 0.05) {
        emitted.current = { c1: false, c2: false, c3: false, c4: false };
        sparks.current = [];
      }
      prevTRef.current = t;

      ctx.clearRect(0, 0, W, H);

      // Defaults
      let lx = -18, rx = RFX;
      let lp: Pose = "idle", rp: Pose = "idle";
      let la = 1, ra = 1;
      let lt = 0, rt = 0;

      // ── PHASE: 0.00–0.28  Left soldier marches in ──────────────────
      if (t < 0.28) {
        const ft = t / 0.28;
        lx = -18 + ft * (LFX + 18);
        const step = Math.floor(ft * 14) % 2;
        lp = step === 0 ? "walk1" : "walk2";
        rp = "idle";
      }

      // ── PHASE: 0.28–0.35  Face-off pause ───────────────────────────
      else if (t < 0.35) {
        lx = LFX; rp = "idle"; lp = "idle";
      }

      // ── PHASE: 0.35–0.50  Exchange 1 ───────────────────────────────
      else if (t < 0.50) {
        const ft = (t - 0.35) / 0.15;
        const shk = Math.sin(ft * Math.PI * 7) * 3;
        lx = LFX + shk;
        rx = RFX - shk;
        lp = ft < 0.45 ? "atk" : "hit";
        rp = ft < 0.45 ? "hit" : "atk";
        const ci1 = Math.max(0, 1 - Math.abs(ft - 0.22) * 8);
        const ci2 = Math.max(0, 1 - Math.abs(ft - 0.72) * 8);
        if (ci1 > 0.7 && !emitted.current.c1) {
          emitted.current.c1 = true;
          emitSparks(sparks.current, CLASH_X, CLASH_Y, 10);
        }
        if (ci2 > 0.7 && !emitted.current.c2) {
          emitted.current.c2 = true;
          emitSparks(sparks.current, CLASH_X, CLASH_Y, 8);
        }
        drawClash(ctx, CLASH_X, CLASH_Y, Math.max(ci1, ci2));
      }

      // ── PHASE: 0.50–0.66  Exchange 2 (more intense) ────────────────
      else if (t < 0.66) {
        const ft = (t - 0.50) / 0.16;
        const shk = Math.sin(ft * Math.PI * 9) * 4.5;
        lx = LFX + shk;
        rx = RFX - shk;
        lp = ft < 0.3 ? "atk" : ft < 0.6 ? "hit" : "atk";
        rp = ft < 0.3 ? "hit" : ft < 0.6 ? "atk" : "hit";
        const ci1 = Math.max(0, 1 - Math.abs(ft - 0.18) * 8);
        const ci2 = Math.max(0, 1 - Math.abs(ft - 0.55) * 8);
        const ci3 = Math.max(0, 1 - Math.abs(ft - 0.88) * 8);
        if (ci1 > 0.7 && !emitted.current.c3) {
          emitted.current.c3 = true;
          emitSparks(sparks.current, CLASH_X, CLASH_Y, 13);
        }
        if (ci2 > 0.7 && !emitted.current.c4) {
          emitted.current.c4 = true;
          emitSparks(sparks.current, CLASH_X - 4, CLASH_Y - 3, 9);
        }
        drawClash(ctx, CLASH_X, CLASH_Y, Math.max(ci1, ci2, ci3));
      }

      // ── PHASE: 0.66–0.76  Decisive blow ────────────────────────────
      else if (t < 0.76) {
        const ft = (t - 0.66) / 0.10;
        lx = LFX + ft * 10;      // left pushes forward
        rx = RFX + ft * 14;      // right pushed back
        lp = "atk"; rp = "hit";
        const flash = Math.max(0, 1 - Math.abs(ft - 0.2) * 7);
        drawClash(ctx, CX + ft * 8, CLASH_Y, flash);
        if (flash > 0.55) emitSparks(sparks.current, CX + ft * 8, CLASH_Y, 2);
      }

      // ── PHASE: 0.76–0.90  Victory / fall ───────────────────────────
      else if (t < 0.90) {
        const ft = (t - 0.76) / 0.14;
        lx = LFX + 10;
        rx = RFX + 14 + ft * 12;
        lp = "win"; rp = "fall";
        rt = ft * 0.85;
        ra = 1 - ft * 0.35;
      }

      // ── PHASE: 0.90–1.00  Fade out and reset ───────────────────────
      else {
        const ft = (t - 0.90) / 0.10;
        la = 1 - ft;
        ra = (0.65) * (1 - ft);
        lx = LFX + 10; rx = RFX + 26;
        lp = "win"; rp = "fall";
        rt = 0.85 * (1 - ft * 0.3);
      }

      // Update sparks
      sparks.current = sparks.current.filter(s => s.life > 0);
      for (const s of sparks.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.28;
        s.life -= 0.028;
      }

      // Draw sparks
      for (const s of sparks.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life) * 0.95;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        ctx.restore();
      }

      // Draw right soldier behind left during fight
      drawSoldier(ctx, rx, WAIST_Y, -1, rp, ra, rt);
      drawSoldier(ctx, lx, WAIST_Y, 1, lp, la, lt);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <button className="v1-home-btn" onClick={onClick}>
      <canvas
        ref={canvasRef}
        width={360}
        height={72}
        style={{
          display: "block",
          width: "100%",
          height: "72px",
          imageRendering: "pixelated",
        }}
      />
      <span className="v1-battle-label">1V1 Challenge</span>
    </button>
  );
}
