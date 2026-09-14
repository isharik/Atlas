import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { ZONES } from '@/data/ecosystem';
import type { ZoneId } from '@/store/useAtlas';
import type { ZoneMeta } from '@/data/ecosystem';
import { ZoneGlyph } from '@/components/ui/icons';
import { useAudio } from '@/audio/AudioProvider';

const GOLD = new THREE.Color('#e4c877');
const GOLD_DEEP = new THREE.Color('#9a7a34');
const EMERALD = new THREE.Color('#2fbf8f');
const EMERALD_GLOW = new THREE.Color('#38e0a0');
// wormhole / particle-orbit palette (cinematic, restrained — teal primary, gold a rare accent)
const TEAL = new THREE.Color('#35D8C0');
const TEAL_LT = new THREE.Color('#69E7E0');
const GOLD_WARM = new THREE.Color('#C9A85A');
const HORIZON = '#020505';
const CENTER = new THREE.Vector3(0, 0, 0);
const ATLAS_OFFSET: [number, number, number] = [5.1, 0, 0]; // model centre — sits right of the camera axis, giving the copy room at left
const CAM_LOOK = new THREE.Vector3(3.2, -0.75, 0); // fixed look point (left of + below the model, so the orbital reads upper-right)
const RING = 5.2;

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function FitParent() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const setSize = useThree((s) => s.setSize);
  useEffect(() => {
    const parent = gl.domElement.parentElement;
    const apply = () => {
      const w = parent?.clientWidth || 800;
      const h = parent?.clientHeight || 600;
      gl.setSize(w, h, true);
      const cam = camera as THREE.PerspectiveCamera;
      if (cam.isPerspectiveCamera) { cam.aspect = w / h; cam.updateProjectionMatrix(); }
      setSize(w, h);
    };
    apply();
    const raf = requestAnimationFrame(apply);
    const ro = parent ? new ResizeObserver(apply) : null;
    if (parent && ro) ro.observe(parent);
    window.addEventListener('resize', apply);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); window.removeEventListener('resize', apply); };
  }, [gl, camera, setSize]);
  return null;
}

/**
 * The Prosper core — a restrained cinematic black hole. A near-black event horizon with a thin
 * teal accretion ring, a warm-gold hot arc, a gravitational-lens rim, a photon arc bent over the
 * top, and a little dust drifting inward. Small (~12% of the orbit) — the anchor, never the star.
 */
function Core() {
  const disk = useRef<THREE.Group>(null!);
  const lens = useRef<THREE.Mesh>(null!);
  const infall = useRef<THREE.Points>(null!);
  const inData = useMemo(() => {
    const N = 30;
    const arr = new Float32Array(N * 3);
    const st = Array.from({ length: N }, () => ({ r: 0.9 + Math.random() * 1.4, a: Math.random() * Math.PI * 2, sp: 0.14 + Math.random() * 0.22 }));
    return { N, arr, st };
  }, []);
  const inGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(inData.arr, 3)); return g; }, [inData]);
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05), reduce = prefersReduced();
    if (disk.current && !reduce) disk.current.rotation.y += d * 0.18; // slow accretion rotation
    if (lens.current) { const s = reduce ? 1 : 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02; lens.current.scale.setScalar(s); } // faint shimmer
    if (infall.current && !reduce) {
      const { N, arr, st } = inData;
      for (let i = 0; i < N; i++) {
        const p = st[i]; p.r -= p.sp * d; p.a += d * (0.6 / p.r);
        if (p.r < 0.5) { p.r = 1.5 + Math.random() * 0.9; p.a = Math.random() * Math.PI * 2; }
        arr[i * 3] = Math.cos(p.a) * p.r; arr[i * 3 + 1] = (Math.random() - 0.5) * 0.02; arr[i * 3 + 2] = Math.sin(p.a) * p.r;
      }
      inGeo.attributes.position.needsUpdate = true;
    }
  });
  const flat: [number, number, number] = [-Math.PI / 2, 0, 0];
  const DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
  return (
    <group position={CENTER}>
      {/* event horizon — dark sphere + a faint rim shadow for spherical depth */}
      <mesh><sphereGeometry args={[0.55, 48, 48]} /><meshBasicMaterial color={HORIZON} /></mesh>
      <mesh><sphereGeometry args={[0.6, 48, 48]} /><meshBasicMaterial color={HORIZON} transparent opacity={0.55} depthWrite={false} /></mesh>
      {/* gravitational-lens rim — a thin bright edge hugging the horizon */}
      <mesh ref={lens} rotation={flat}><ringGeometry args={[0.55, 0.61, 200]} /><meshBasicMaterial color={TEAL_LT} transparent opacity={0.45} side={DS} depthWrite={false} blending={ADD} /></mesh>
      {/* accretion disk — thin teal band with a warm hot arc; rotates slowly */}
      <group ref={disk}>
        <mesh rotation={flat}><ringGeometry args={[0.62, 0.92, 200]} /><meshBasicMaterial color={TEAL} transparent opacity={0.16} side={DS} depthWrite={false} blending={ADD} /></mesh>
        <mesh rotation={flat}><ringGeometry args={[0.6, 0.86, 150, 1, 0.1, 1.15]} /><meshBasicMaterial color={'#f0e4c4'} transparent opacity={0.4} side={DS} depthWrite={false} blending={ADD} /></mesh>
        <mesh rotation={flat}><ringGeometry args={[0.64, 0.8, 150, 1, Math.PI + 0.2, 0.7]} /><meshBasicMaterial color={GOLD_WARM} transparent opacity={0.28} side={DS} depthWrite={false} blending={ADD} /></mesh>
      </group>
      {/* photon arc bent over the top toward the viewer */}
      <mesh rotation={[0.32, 0, 0]}><ringGeometry args={[0.58, 0.63, 160]} /><meshBasicMaterial color={TEAL_LT} transparent opacity={0.22} side={DS} depthWrite={false} blending={ADD} /></mesh>
      {/* dust drifting inward */}
      <points ref={infall} geometry={inGeo}><pointsMaterial size={0.035} color={TEAL_LT} transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={ADD} /></points>
    </group>
  );
}

/** One orbital ring made of many tiny particles — varied colour, brightness and radius, mostly dim. */
function ringPoints(radius: number, count: number, size: number, goldChance: number): THREE.Points {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.06;
    const r = radius * (1 + (Math.random() - 0.5) * 0.05);
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.09; pos[i * 3 + 2] = Math.sin(a) * r;
    if (Math.random() < goldChance) c.copy(GOLD_WARM); else c.copy(Math.random() < 0.28 ? TEAL_LT : TEAL);
    const bright = Math.random() < 0.09 ? 1 : 0.22 + Math.random() * 0.32; // only a few glow strongly
    const fade = 0.45 + Math.random() * 0.55;                               // irregular gaps + darkening
    const m = bright * fade;
    col[i * 3] = c.r * m; col[i * 3 + 1] = c.g * m; col[i * 3 + 2] = c.b * m;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
}

// concentric particle orbits — inner tight around the hole, outer progressively wider; gold grows outward
const RING_CFG = [
  { r: 1.5, n: 80, size: 0.04, gold: 0, speed: 0.05 },
  { r: 2.3, n: 120, size: 0.042, gold: 0.01, speed: 0.04 },
  { r: 3.2, n: 160, size: 0.046, gold: 0.02, speed: 0.032 },
  { r: 4.2, n: 200, size: 0.05, gold: 0.03, speed: 0.026 },
  { r: RING, n: 250, size: 0.052, gold: 0.05, speed: 0.02 },
  { r: 6.8, n: 310, size: 0.055, gold: 0.12, speed: 0.015 },
  { r: 8.4, n: 370, size: 0.058, gold: 0.2, speed: 0.011 },
];

/** Orbital system — concentric particle trails, each drifting at its own slow speed. */
function Orbits() {
  const rings = useMemo(() => RING_CFG.map((c) => ({ pts: ringPoints(c.r, c.n, c.size, c.gold), speed: c.speed })), []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame((state, dt) => {
    if (prefersReduced()) return;
    const d = Math.min(dt, 0.05);
    rings.forEach((r, i) => {
      const g = groups.current[i]; if (!g) return;
      g.rotation.y += d * r.speed;                                   // particles travel along the path
      const mat = (g.children[0] as THREE.Points).material as THREE.PointsMaterial;
      mat.opacity = 0.82 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.14; // gentle shimmer
    });
  });
  return <group>{rings.map((r, i) => <group key={i} ref={(el) => (groups.current[i] = el)}><primitive object={r.pts} /></group>)}</group>;
}

/** Faint background space dust — the deepest layer of the hierarchy. */
function SpaceDust() {
  const pts = useMemo(() => {
    const N = 240, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 2 + Math.random() * 10.5, a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 3.4; pos[i * 3 + 2] = Math.sin(a) * r;
      c.copy(Math.random() < 0.14 ? GOLD_WARM : (Math.random() < 0.5 ? TEAL_LT : TEAL));
      const m = 0.05 + Math.random() * 0.16;
      col[i * 3] = c.r * m; col[i * 3 + 1] = c.g * m; col[i * 3 + 2] = c.b * m;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 0.04, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  }, []);
  return <primitive object={pts} />;
}

/** Distinct 3D emblem per node — each stage of the journey gets its own object, not a shared chart. */
function Emblem({ icon, color, hover }: { icon: string; color: THREE.Color; hover: boolean }) {
  const tetra = useMemo(() => new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(0.34, 0)), []);
  const ei = hover ? 0.95 : 0.5;
  const metal = (m = 0.7, r = 0.3) => <meshStandardMaterial color={color} emissive={color} emissiveIntensity={ei} metalness={m} roughness={r} flatShading />;
  const gold = (i = 0.5) => <meshStandardMaterial color={GOLD} emissive={GOLD_DEEP} emissiveIntensity={hover ? i + 0.3 : i} metalness={1} roughness={0.28} />;

  switch (icon) {
    // Curator — an accountable figure / beacon: a plinth, a tapered body, a glowing head.
    case 'curator':
      return (
        <group>
          <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.2, 0.24, 0.08, 20]} /><meshStandardMaterial color={'#0c1a13'} metalness={0.6} roughness={0.5} /></mesh>
          <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.1, 0.17, 0.48, 20]} />{metal(0.5, 0.4)}</mesh>
          <mesh position={[0, 0.64, 0]}><sphereGeometry args={[0.13, 24, 24]} />{metal(0.3, 0.25)}</mesh>
          <mesh position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.19, 0.012, 10, 40]} />{gold(0.55)}</mesh>
        </group>
      );
    // Strategy — a thesis with direction: a poised tetrahedron with gold edges.
    case 'strategy':
      return (
        <group>
          <mesh position={[0, 0.42, 0]}><tetrahedronGeometry args={[0.34, 0]} />{metal(0.4, 0.3)}</mesh>
          <lineSegments position={[0, 0.42, 0]} geometry={tetra}>
            <lineBasicMaterial color={GOLD} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
          </lineSegments>
        </group>
      );
    // Vault — the on-chain vehicle: a solid cube with a gold seam band and a dial.
    case 'vault':
      return (
        <group>
          <mesh position={[0, 0.34, 0]}><boxGeometry args={[0.44, 0.44, 0.44]} />{metal(0.7, 0.3)}</mesh>
          <mesh position={[0, 0.34, 0]}><boxGeometry args={[0.47, 0.09, 0.47]} />{gold(0.5)}</mesh>
          <mesh position={[0, 0.34, 0.23]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.03, 20]} />{gold(0.7)}</mesh>
        </group>
      );
    // Track record — accumulating, verifiable history: stacked discs growing over time.
    case 'track': {
      const discs = [0.3, 0.25, 0.2, 0.15];
      return (
        <group>
          {discs.map((r, i) => (
            <mesh key={i} position={[0, 0.08 + i * 0.12, 0]}>
              <cylinderGeometry args={[r, r + 0.02, 0.09, 28]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={ei * (0.6 + i * 0.14)} metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );
    }
    // p{VAULT} — conviction, priced: a struck coin on edge, slowly flipping.
    case 'pvault':
      return (
        <group position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh><cylinderGeometry args={[0.3, 0.3, 0.07, 40]} />{metal(0.95, 0.22)}</mesh>
          <mesh><torusGeometry args={[0.3, 0.028, 14, 48]} />{gold(0.65)}</mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.16, 0.014, 10, 40]} />{gold(0.55)}</mesh>
        </group>
      );
    // Performance market — an active, rising market: a proper ascending bar chart.
    case 'market': {
      const bars = [0.26, 0.4, 0.32, 0.56];
      return (
        <group>
          {bars.map((h, i) => (
            <mesh key={i} position={[-0.21 + i * 0.14, h / 2, 0]}>
              <boxGeometry args={[0.1, h, 0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={ei} metalness={0.6} roughness={0.32} />
            </mesh>
          ))}
        </group>
      );
    }
    default:
      return (
        <mesh position={[0, 0.34, 0]}><octahedronGeometry args={[0.3, 0]} />{metal()}</mesh>
      );
  }
}

/** Per-emblem idle spin — gentle, so the whole system stays calm; the coin turns a touch more. */
const SPIN: Record<string, number> = { pvault: 0.32, strategy: 0.16, vault: 0.13, track: 0.15, market: 0.12, curator: 0.12 };

function AtlasNode({ zone, angle, onOpen }: { zone: ZoneMeta; angle: number; onOpen: () => void }) {
  const grp = useRef<THREE.Group>(null!);
  const island = useRef<THREE.Group>(null!);
  const emblem = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);
  const color = useMemo(() => new THREE.Color(zone.color), [zone.color]);
  const pos = useMemo(() => new THREE.Vector3(CENTER.x + Math.cos(angle) * RING, 0, CENTER.z + Math.sin(angle) * RING), [angle]);

  useFrame((_state, dt) => {
    if (!grp.current || !island.current) return;
    // no vertical bob — nodes sit steady on the orbit plane so the scene reads clean
    grp.current.position.y = pos.y;
    const target = hover ? 1.1 : 1;
    const s = island.current.scale.x + (target - island.current.scale.x) * Math.min(1, dt * 9);
    island.current.scale.setScalar(s);
    if (emblem.current && !prefersReduced()) emblem.current.rotation.y += Math.min(dt, 0.05) * (SPIN[zone.icon] ?? 0.14);
  });

  const enter = () => { setHover(true); document.body.style.cursor = 'pointer'; };
  const leave = () => { setHover(false); document.body.style.cursor = 'auto'; };

  return (
    <group ref={grp} position={[pos.x, pos.y, pos.z]}>
      <mesh onPointerOver={(e) => { e.stopPropagation(); enter(); }} onPointerOut={leave} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
        <cylinderGeometry args={[0.78, 0.78, 2.6, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={island}>
        {/* grounding contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><circleGeometry args={[0.62, 40]} /><meshBasicMaterial color={'#000000'} transparent opacity={0.42} depthWrite={false} /></mesh>
        {/* thin, subtle orbital ring under the node — a small object floating in space, no big halo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}><ringGeometry args={[0.4, 0.5, 48]} /><meshBasicMaterial color={color} transparent opacity={hover ? 0.22 : 0.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}><ringGeometry args={[0.47, 0.485, 60]} /><meshBasicMaterial color={TEAL_LT} transparent opacity={hover ? 0.5 : 0.28} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
        {/* the distinct emblem */}
        <group ref={emblem}>
          <Emblem icon={zone.icon} color={color} hover={hover} />
        </group>
      </group>

      <Html center distanceFactor={9.5} position={[0, 1.5, 0]} zIndexRange={[20, 0]}>
        <button onMouseEnter={enter} onMouseLeave={leave} onClick={onOpen} aria-label={`Open ${zone.label}`} data-hover={hover ? 'true' : 'false'} className="atlas-node-card"
          style={{ ['--nc' as string]: zone.color } as React.CSSProperties}>
          <span className="atlas-node-card__icon"><ZoneGlyph icon={zone.icon} size={15} /></span>
          <span className="atlas-node-card__text">
            <span className="atlas-node-card__label">{zone.label}</span>
            <span className="atlas-node-card__meta">{zone.glyph} <span className="atlas-node-card__dot">·</span> OPEN</span>
          </span>
        </button>
      </Html>
    </group>
  );
}

function Scene({ onOpen }: { onOpen: (id: ZoneId) => void }) {
  const spin = useRef<THREE.Group>(null!);
  useFrame((state, dt) => {
    // camera is fixed — aim it, then keep the whole system revolving. This is the centrepiece,
    // so it always spins (even under reduced-motion): a single slow, smooth rotation, no jitter.
    state.camera.lookAt(CAM_LOOK);
    // very slow, premium drift for the node system; the particle rings carry the visible motion
    if (spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.05;
  });
  return (
    <group>
      <ambientLight intensity={0.3} color={TEAL} />
      <directionalLight position={[6, 10, 6]} intensity={0.9} color={GOLD} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={TEAL} />
      <group position={ATLAS_OFFSET}>
        <SpaceDust />
        <Core />
        <group ref={spin}>
          <Orbits />
          {ZONES.map((z, i) => (
            <AtlasNode key={z.id} zone={z} angle={(i / ZONES.length) * Math.PI * 2 - Math.PI / 2} onOpen={() => onOpen(z.id)} />
          ))}
        </group>
      </group>
    </group>
  );
}

export function AtlasHero({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const navigate = useNavigate();
  const { click } = useAudio();
  const open = (id: ZoneId) => { click(); navigate(`/zone/${id}`); };
  const mask = 'radial-gradient(130% 130% at 70% 48%, #000 60%, rgba(0,0,0,0.5) 80%, transparent 95%)';

  return (
    <div className={className} style={{ WebkitMaskImage: mask, maskImage: mask, ...style }}>
      {/* frameloop stays 'always' so the system keeps spinning — browsers already throttle rAF in a backgrounded tab */}
      <Canvas frameloop="always" dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ fov: 42, near: 0.1, far: 120, position: [3.2, 6.6, 13.2] }}>
        <FitParent />
        <Suspense fallback={null}>
          <Scene onOpen={open} />
        </Suspense>
        {/* multisampling 8 = HD anti-aliased edges through the postprocessing pass (canvas AA doesn't reach the composer) */}
        {/* restrained bloom — enough to feel cinematic, not neon */}
        <EffectComposer enableNormalPass={false} multisampling={8}>
          <Bloom intensity={0.42} luminanceThreshold={0.62} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
