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
const ATLAS_OFFSET: [number, number, number] = [3.3, 0, 0]; // shifts the whole model right, clear of the hero copy
const RING = 5.2;

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
 * The Prosper core — a small wireframe "matrix" globe: points on a sphere joined by
 * thin teal lines, slowly rotating on its own. Lightweight and open — a visual anchor,
 * never a solid object. A faint radial glow seats it in the dark.
 */
function Core() {
  const globe = useRef<THREE.Group>(null!);
  const GR = 1.25; // globe radius

  const { pointPos, linePos } = useMemo(() => {
    const N = 54;
    const pts: THREE.Vector3[] = [];
    const gAng = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gAng * i;
      pts.push(new THREE.Vector3(Math.cos(th) * r * GR, y * GR, Math.sin(th) * r * GR));
    }
    const pointPos = new Float32Array(N * 3);
    pts.forEach((p, i) => { pointPos[i * 3] = p.x; pointPos[i * 3 + 1] = p.y; pointPos[i * 3 + 2] = p.z; });
    const segs: number[] = [];
    const thr = (0.62 * GR) ** 2;
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (pts[i].distanceToSquared(pts[j]) < thr) segs.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
    return { pointPos, linePos: new Float32Array(segs) };
  }, []);

  useFrame((_state, dt) => {
    const d = Math.min(dt, 0.05); // clamp so a paused→resumed frame doesn't jump
    if (globe.current) { globe.current.rotation.y += d * 0.16; globe.current.rotation.x = 0.32; } // always looping
  });

  return (
    <group position={CENTER}>
      <group ref={globe}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[linePos, 3]} count={linePos.length / 3} /></bufferGeometry>
          <lineBasicMaterial color={EMERALD_GLOW} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[pointPos, 3]} count={pointPos.length / 3} /></bufferGeometry>
          <pointsMaterial size={0.055} color={'#8cf0c8'} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
      </group>

      <pointLight position={[1.6, 1.2, 2]} intensity={1.2} distance={7} color={GOLD} />
      <pointLight position={[-1.4, -0.6, -1]} intensity={0.8} distance={6} color={EMERALD} />
    </group>
  );
}

/** Orbital system — thin, precise rings with a clear hierarchy + travelling teal points. */
function Orbits() {
  const dots = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = 6;
  useFrame((state) => {
    if (!dots.current) return;
    const t = reduce ? 0 : state.clock.elapsedTime * 0.055;
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
      {/* inner faint guide */}
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[2.7, 0.004, 8, 180]} /><meshBasicMaterial color={GOLD_DEEP} transparent opacity={0.12} depthWrite={false} /></mesh>
      {/* main active orbit — the most prominent path (teal) */}
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[RING, 0.007, 10, 240]} /><meshBasicMaterial color={EMERALD} transparent opacity={0.34} depthWrite={false} /></mesh>
      {/* outer boundary — very faint */}
      <mesh position={CENTER} rotation={flat}><torusGeometry args={[RING + 2.5, 0.004, 8, 220]} /><meshBasicMaterial color={GOLD} transparent opacity={0.08} depthWrite={false} /></mesh>
      {/* intentional teal points along the main orbit */}
      <instancedMesh ref={dots} args={[undefined, undefined, count]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color={EMERALD_GLOW.getStyle()} transparent opacity={0.9} depthWrite={false} /></instancedMesh>
    </group>
  );
}

function AtlasNode({ zone, angle, onOpen }: { zone: ZoneMeta; angle: number; onOpen: () => void }) {
  const grp = useRef<THREE.Group>(null!);
  const island = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const color = useMemo(() => new THREE.Color(zone.color), [zone.color]);
  const pos = useMemo(() => new THREE.Vector3(CENTER.x + Math.cos(angle) * RING, 0, CENTER.z + Math.sin(angle) * RING), [angle]);
  // consistent, tidy data-bars (deterministic per node — not random noise)
  const bars = useMemo(() => {
    const heights = [0.32, 0.52, 0.4, 0.6, 0.36];
    return heights.map((h, i) => ({ x: -0.26 + i * 0.13, h, w: 0.072 }));
  }, []);

  useFrame((state, dt) => {
    if (!grp.current || !island.current) return;
    const bob = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.7 + angle) * 0.04;
    grp.current.position.y = pos.y + bob;
    const target = hover ? 1.09 : 1;
    const s = island.current.scale.x + (target - island.current.scale.x) * Math.min(1, dt * 9);
    island.current.scale.setScalar(s);
  });

  const enter = () => { setHover(true); document.body.style.cursor = 'pointer'; };
  const leave = () => { setHover(false); document.body.style.cursor = 'auto'; };

  return (
    <group ref={grp} position={[pos.x, pos.y, pos.z]}>
      <mesh onPointerOver={(e) => { e.stopPropagation(); enter(); }} onPointerOut={leave} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
        <cylinderGeometry args={[0.72, 0.72, 2.4, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={island}>
        {/* grounding contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.26, 0]}><circleGeometry args={[0.92, 40]} /><meshBasicMaterial color={'#000000'} transparent opacity={0.4} depthWrite={false} /></mesh>
        {/* soft colour seat */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]}><ringGeometry args={[0.55, 0.86, 40]} /><meshBasicMaterial color={color} transparent opacity={hover ? 0.2 : 0.08} depthWrite={false} /></mesh>
        {/* clean hex platform */}
        <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.56, 0.66, 0.2, 6]} /><meshStandardMaterial color={'#0a1610'} metalness={0.55} roughness={0.5} flatShading /></mesh>
        {/* refined gold outline */}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.56, 0.011, 6, 6]} /><meshStandardMaterial color={GOLD} emissive={GOLD_DEEP} emissiveIntensity={hover ? 0.7 : 0.32} metalness={1} roughness={0.28} /></mesh>
        {/* consistent data bars */}
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, 0]}><boxGeometry args={[b.w, b.h, b.w]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.8 : 0.4} metalness={0.6} roughness={0.35} /></mesh>
        ))}
      </group>

      <Html center distanceFactor={11} position={[0, 1.35, 0]} zIndexRange={[20, 0]}>
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
  const { camera } = useThree();
  const spin = useRef<THREE.Group>(null!);
  const target = useMemo(() => new THREE.Vector3(2.6, 0.2, 0), []);
  useFrame((state, dt) => {
    const px = state.pointer.x, py = state.pointer.y;
    camera.position.x += (2.6 + px * 1.0 - camera.position.x) * 0.03;
    camera.position.y += (6.9 - py * 0.7 - camera.position.y) * 0.03;
    camera.lookAt(target);
    if (spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.09; // whole model loops; clamp for paused→resume
  });
  return (
    <group>
      <ambientLight intensity={0.26} color={EMERALD} />
      <directionalLight position={[6, 10, 6]} intensity={1.0} color={GOLD} />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color={EMERALD} />
      {/* offset shifts the model right; inner group rotates continuously around the globe */}
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
  const mask = 'radial-gradient(130% 130% at 66% 46%, #000 58%, rgba(0,0,0,0.5) 78%, transparent 94%)';

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
    <div ref={wrapRef} className={className} style={{ WebkitMaskImage: mask, maskImage: mask, ...style }}>
      <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ fov: 40, near: 0.1, far: 120, position: [2.6, 6.9, 16.5] }}>
        <FitParent />
        <Suspense fallback={null}>
          <Scene onOpen={open} />
        </Suspense>
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.62} luminanceThreshold={0.5} luminanceSmoothing={0.92} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
