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
 * The Prosper core — a black hole. A dark event horizon ringed by a bright photon rim and a
 * swirling gold→emerald accretion disk in the orbital plane. Self-lit and always turning: the
 * gravitational well the whole system falls toward.
 */
function Core() {
  const disk = useRef<THREE.Group>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    if (disk.current && !prefersReduced()) disk.current.rotation.y += d * 0.5; // accretion swirl
    if (halo.current) { const s = prefersReduced() ? 1 : 1 + Math.sin(state.clock.elapsedTime * 0.7) * 0.03; halo.current.scale.setScalar(s); }
  });
  const flat: [number, number, number] = [-Math.PI / 2, 0, 0];
  const DS = THREE.DoubleSide, ADD = THREE.AdditiveBlending;
  return (
    <group position={CENTER}>
      {/* event horizon — the dark heart, and a soft shadow just outside it */}
      <mesh><sphereGeometry args={[0.6, 48, 48]} /><meshBasicMaterial color={'#04070a'} /></mesh>
      <mesh><sphereGeometry args={[0.74, 48, 48]} /><meshBasicMaterial color={'#04070a'} transparent opacity={0.5} depthWrite={false} /></mesh>
      {/* photon ring — the bright rim of the hole */}
      <mesh rotation={flat}><ringGeometry args={[0.62, 0.71, 140]} /><meshBasicMaterial color={'#fff1d2'} transparent opacity={0.95} side={DS} depthWrite={false} blending={ADD} /></mesh>
      {/* accretion disk — concentric glow bands, gold inside → emerald out */}
      <mesh rotation={flat}><ringGeometry args={[0.73, 1.06, 140]} /><meshBasicMaterial color={GOLD} transparent opacity={0.34} side={DS} depthWrite={false} blending={ADD} /></mesh>
      <mesh rotation={flat}><ringGeometry args={[1.06, 1.5, 140]} /><meshBasicMaterial color={EMERALD_GLOW} transparent opacity={0.2} side={DS} depthWrite={false} blending={ADD} /></mesh>
      <mesh ref={halo} rotation={flat}><ringGeometry args={[1.5, 2.15, 140]} /><meshBasicMaterial color={EMERALD} transparent opacity={0.09} side={DS} depthWrite={false} blending={ADD} /></mesh>
      {/* swirling hot arcs — the disk turning */}
      <group ref={disk}>
        <mesh rotation={flat}><ringGeometry args={[0.8, 1.22, 96, 1, 0, 1.25]} /><meshBasicMaterial color={'#ffe6ac'} transparent opacity={0.5} side={DS} depthWrite={false} blending={ADD} /></mesh>
        <mesh rotation={flat}><ringGeometry args={[0.92, 1.4, 96, 1, Math.PI, 1.0]} /><meshBasicMaterial color={'#7df0c4'} transparent opacity={0.4} side={DS} depthWrite={false} blending={ADD} /></mesh>
      </group>
    </group>
  );
}

/** A single dashed orbit path (a solar-system line), optionally sitting on a funnel curve. */
function dashedLoop(radius: number, o: { color: string; opacity: number; dash?: number; gap?: number; y?: number }): THREE.Line {
  const seg = Math.max(140, Math.round(radius * 46));
  const pts: THREE.Vector3[] = [];
  const yy = o.y ?? 0;
  for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, yy, Math.sin(a) * radius)); }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = new THREE.LineDashedMaterial({ color: new THREE.Color(o.color), transparent: true, opacity: o.opacity, dashSize: o.dash ?? 0.16, gapSize: o.gap ?? 0.12, depthWrite: false, blending: THREE.AdditiveBlending });
  const line = new THREE.Line(g, m); line.computeLineDistances(); return line;
}

/** Orbital system — thin dashed solar-system paths, plus a wormhole funnel dipping toward the hole. */
function Orbits() {
  const lines = useMemo(() => {
    const arr: THREE.Line[] = [];
    // wormhole funnel — concentric dashed rings dipping down toward the black hole
    const funnelY = (r: number) => -Math.pow(Math.max(0, 1 - r / RING), 1.5) * 1.5;
    [4.5, 3.85, 3.2, 2.6, 2.05].forEach((r, i) => arr.push(dashedLoop(r, { color: '#3fdca0', opacity: 0.14 + i * 0.03, dash: 0.11, gap: 0.15, y: funnelY(r) })));
    // main node orbit — the path the elements ride
    arr.push(dashedLoop(RING, { color: '#8bf0c8', opacity: 0.9, dash: 0.2, gap: 0.13 }));
    // outer solar-system orbits
    arr.push(dashedLoop(RING + 1.5, { color: '#c9a24b', opacity: 0.3, dash: 0.16, gap: 0.2 }));
    arr.push(dashedLoop(RING + 3.0, { color: '#c9a24b', opacity: 0.14, dash: 0.12, gap: 0.28 }));
    return arr;
  }, []);
  return <group>{lines.map((l, i) => <primitive key={i} object={l} />)}</group>;
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
        {/* soft colour seat */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}><ringGeometry args={[0.42, 0.66, 44]} /><meshBasicMaterial color={color} transparent opacity={hover ? 0.28 : 0.12} depthWrite={false} /></mesh>
        {/* refined gold base ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}><torusGeometry args={[0.5, 0.012, 8, 60]} /><meshStandardMaterial color={GOLD} emissive={GOLD_DEEP} emissiveIntensity={hover ? 0.7 : 0.34} metalness={1} roughness={0.28} /></mesh>
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
    if (spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.26;
  });
  return (
    <group>
      <ambientLight intensity={0.28} color={EMERALD} />
      <directionalLight position={[6, 10, 6]} intensity={1.05} color={GOLD} />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color={EMERALD} />
      <group position={ATLAS_OFFSET}>
        <group ref={spin}>
          <Core />
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
        <EffectComposer enableNormalPass={false} multisampling={8}>
          <Bloom intensity={0.6} luminanceThreshold={0.52} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
