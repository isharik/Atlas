import { useEffect, useRef } from 'react';

/**
 * Lightweight wireframe "matrix" globe — points on a sphere joined by thin teal
 * lines, slowly rotating. Canvas 2D (composites everywhere, cheap, no React
 * re-renders). Acts as a visual anchor, never a solid object.
 */
export function NetworkGlobe({ size = 260, className, style, points = 46, spin = 0.16 }: {
  size?: number; className?: string; style?: React.CSSProperties; points?: number; spin?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const c = size / 2;
    const R = size * 0.34;

    // fibonacci sphere
    const pts: { x: number; y: number; z: number }[] = [];
    const gAng = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < points; i++) {
      const y = 1 - (i / (points - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gAng * i;
      pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }
    // edges — join near neighbours (keeps the mesh sparse & organic)
    const edges: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2 + (pts[i].z - pts[j].z) ** 2;
        if (d < 0.34) edges.push([i, j]);
      }
    }

    let raf = 0;
    let yaw = 0.4, running = true;
    const draw = (dt: number) => {
      yaw += spin * dt; // ambient loop always runs (kept on by request)
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const tilt = 0.42, cosX = Math.cos(tilt), sinX = Math.sin(tilt);
      ctx.clearRect(0, 0, size, size);

      // subtle glow
      const g = ctx.createRadialGradient(c, c, R * 0.2, c, c, R * 1.7);
      g.addColorStop(0, 'rgba(47,191,143,0.10)');
      g.addColorStop(1, 'rgba(47,191,143,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c, c, R * 1.7, 0, Math.PI * 2); ctx.fill();

      const proj = pts.map((p) => {
        let x = p.x * cosY + p.z * sinY;
        let z = -p.x * sinY + p.z * cosY;
        const y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;
        return { sx: c + x * R, sy: c + y * R, depth: (z + 1) / 2 };
      });

      // edges
      for (const [a, b] of edges) {
        const pa = proj[a], pb = proj[b];
        const dep = (pa.depth + pb.depth) / 2;
        ctx.strokeStyle = `rgba(56,224,160,${0.06 + dep * 0.22})`;
        ctx.lineWidth = 0.6 + dep * 0.5;
        ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy); ctx.stroke();
      }
      // points
      for (const p of proj) {
        const r = 0.7 + p.depth * 1.7;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,240,200,${0.25 + p.depth * 0.65})`;
        ctx.fill();
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      draw(dt);
      if (running) raf = requestAnimationFrame(loop);
    };
    draw(0);
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running) { last = performance.now(); raf = requestAnimationFrame(loop); }
      else cancelAnimationFrame(raf);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  }, [size, points, spin]);

  return <canvas ref={ref} className={className} style={{ width: size, height: size, display: 'block', ...style }} aria-hidden />;
}
