import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
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
const ATLAS_OFFSET: [number, number, number] = [3.9, 0, 0]; // shifts the whole model right, clear of the hero copy
const ORBIT_TARGET: [number, number, number] = [3.9, 0.4, 0];
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
 * The Prosper core — a solid, faceted value-core caught inside a slow wireframe shell.
 * Reads as a real 3D object with depth: a glowing gold heart, a counter-rotating emerald
 * lattice around it, a tilted gold meridian ring, and a scatter of light points. A visual
 * anchor with mass, not a flat diagram.
 */
function Core() {
  const heart = useRef<THREE.Mesh>(null!);
  const shell = useRef<THREE.Group>(null!);
  const meridian = useRef<THREE.Group>(null!);

  const pointPos = useMemo(() => {
    const N = 46;
    const gAng = Math.PI * (3 - Math.sqrt(5));
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gAng * i;
      const R = 1.5;
      arr[i * 3] = Math.cos(th) * r * R;
      arr[i * 3 + 1] = y * R;
      arr[i * 3 + 2] = Math.sin(th) * r * R;
    }
    return arr;
  }, []);

  const shellEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.5, 1)), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const reduce = prefersReduced();
    if (heart.current) {
      const s = reduce ? 1 : 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.035; // gentle breathing
      heart.current.scale.setScalar(s);
      if (!reduce) heart.current.rotation.y += d * 0.28;
    }
    if (shell.current && !reduce) { shell.current.rotation.y -= d * 0.12; shell.current.rotation.x = 0.3; }
    if (meridian.current && !reduce) meridian.current.rotation.z += d * 0.2;
  });

  return (
    <group position={CENTER}>
      {/* glowing faceted heart */}
      <mesh ref={heart}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.55} metalness={0.9} roughness={0.25} flatShading />
      </mesh>
      {/* inner glass halo around the heart */}
      <mesh>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={EMERALD_GLOW} emissive={EMERALD} emissiveIntensity={0.3} metalness={0.2} roughness={0.1} transparent opacity={0.12} depthWrite={false} flatShading />
      </mesh>
      {/* counter-rotating wireframe lattice shell */}
      <group ref={shell}>
        <lineSegments geometry={shellEdges}>
          <lineBasicMaterial color={EMERALD_GLOW} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[pointPos, 3]} count={pointPos.length / 3} /></bufferGeometry>
          <pointsMaterial size={0.05} color={'#8cf0c8'} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
      </group>
      {/* tilted gold meridian ring, spinning in its own plane */}
      <group ref={meridian} rotation={[Math.PI * 0.32, 0, 0]}>
        <mesh><torusGeometry args={[1.72, 0.018, 12, 160]} /><meshStandardMaterial color={GOLD} emissive={GOLD_DEEP} emissiveIntensity={0.6} metalness={1} roughness={0.28} /></mesh>
      </group>

      <pointLight position={[1.6, 1.2, 2]} intensity={1.3} distance={8} color={GOLD} />
      <pointLight position={[-1.4, -0.6, -1]} intensity={0.8} distance={6} color={EMERALD} />
    </group>
  );
}

/** Orbital system — thin, precise rings with a clear hierarchy + travelling teal points. */
function Orbits() {
  const dots = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 6;
  useFrame((state) => {
    if (!dots.current) return;
    const t = prefersReduced() ? 0 : state.clock.elapsedTime * 0.055;
    for (let i = 0; i < count; i++) {
      const a = (i / count + t) * Math.PI * 2;
      dummy.position.set(CENTER.x + Math.cos(a) * RING, 0.02, CENTER.z + Math.sin(a) * RING);
      dummy.scale.setScalar(0.07);
      dummy.updateMatrix();
      dots.current.setMatrixAt(i, dummy.matrix);
    }
    dots.current.instanceMatrix.needsUpdate = true;
  });
  const flat = [-Math.PI / 2, 0, 0] as [number, number, number];
  return (
    <group>
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[2.7, 0.004, 8, 180]} /><meshBasicMaterial color={GOLD_DEEP} transparent opacity={0.12} depthWrite={false} /></mesh>
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[RING, 0.007, 10, 240]} /><meshBasicMaterial color={EMERALD} transparent opacity={0.34} depthWrite={false} /></mesh>
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[RING + 2.5, 0.004, 8, 220]} /><meshBasicMaterial color={GOLD} transparent opacity={0.08} depthWrite={false} /></mesh>
      <instancedMesh ref={dots} args={[undefined, undefined, count]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color={EMERALD_GLOW.getStyle()} transparent opacity={0.9} depthWrite={false} /></instancedMesh>
    </group>
  );
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

/** Per-emblem idle spin — coins flip briskly, figures/charts turn slowly for readability. */
const SPIN: Record<string, number> = { pvault: 0.9, strategy: 0.5, vault: 0.35, track: 0.3, market: 0.22, curator: 0.2 };

function AtlasNode({ zone, angle, onOpen }: { zone: ZoneMeta; angle: number; onOpen: () => void }) {
  const grp = useRef<THREE.Group>(null!);
  const island = useRef<THREE.Group>(null!);
  const emblem = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);
  const color = useMemo(() => new THREE.Color(zone.color), [zone.color]);
  const pos = useMemo(() => new THREE.Vector3(CENTER.x + Math.cos(angle) * RING, 0, CENTER.z + Math.sin(angle) * RING), [angle]);

  useFrame((state, dt) => {
    if (!grp.current || !island.current) return;
    const reduce = prefersReduced();
    const bob = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.7 + angle) * 0.04;
    grp.current.position.y = pos.y + bob;
    const target = hover ? 1.1 : 1;
    const s = island.current.scale.x + (target - island.current.scale.x) * Math.min(1, dt * 9);
    island.current.scale.setScalar(s);
    if (emblem.current && !reduce) emblem.current.rotation.y += Math.min(dt, 0.05) * (SPIN[zone.icon] ?? 0.3);
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

      <Html center distanceFactor={11} position={[0, 1.5, 0]} zIndexRange={[20, 0]}>
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
  const interacting = useRef(false);
  useFrame((_state, dt) => {
    // model breathes with a slow auto-spin, paused while the user is dragging (interruptible)
    if (spin.current && !interacting.current && !prefersReduced()) spin.current.rotation.y += Math.min(dt, 0.05) * 0.07;
  });
  return (
    <group>
      <ambientLight intensity={0.28} color={EMERALD} />
      <directionalLight position={[6, 10, 6]} intensity={1.05} color={GOLD} />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color={EMERALD} />
      <OrbitControls
        makeDefault
        target={ORBIT_TARGET}
        enablePan={false}
        enableZoom
        minDistance={7}
        maxDistance={24}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI * 0.52}
        onStart={() => { interacting.current = true; }}
        onEnd={() => { interacting.current = false; }}
      />
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

  // only render the scene while it's actually on screen and the tab is visible
  const wrapRef = useRef<HTMLDivElement>(null);
  const onScreen = useRef(true);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setActive(onScreen.current && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting; apply(); }, { threshold: 0.04 });
    io.observe(el);
    document.addEventListener('visibilitychange', apply);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', apply); };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', WebkitMaskImage: mask, maskImage: mask, ...style }}>
      <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.4]} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }} camera={{ fov: 40, near: 0.1, far: 120, position: [3.0, 5.2, 14.5] }}>
        <FitParent />
        <Suspense fallback={null}>
          <Scene onOpen={open} />
        </Suspense>
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom intensity={0.62} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
      {/* discoverability: the model is now orbit + zoom interactive */}
      <div aria-hidden className="font-mono" style={{
        position: 'absolute', right: 18, bottom: 16, display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(195,207,199,0.6)',
        border: '1px solid var(--border)', borderRadius: 999, padding: '5px 11px',
        background: 'rgba(12,18,15,0.42)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--emerald-glow)' }} />
        Drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
