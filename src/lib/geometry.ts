import * as THREE from 'three';

/** Position of zone node i of n around a horizontal ring of a given radius. */
export function orbitPosition(i: number, n: number, radius: number, yJitter = 0): THREE.Vector3 {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return new THREE.Vector3(
    Math.cos(a) * radius,
    Math.sin(i * 1.7) * yJitter,
    Math.sin(a) * radius,
  );
}

/** A gentle catenary-ish curve between two points, bowed toward the world center. */
export function arcBetween(a: THREE.Vector3, b: THREE.Vector3, lift = 1.2): THREE.CatmullRomCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  // pull the midpoint toward center and lift it a little
  mid.multiplyScalar(0.72);
  mid.y += lift;
  return new THREE.CatmullRomCurve3([a, mid, b]);
}

export const damp = THREE.MathUtils.damp;
export const lerp = THREE.MathUtils.lerp;
export const clamp = THREE.MathUtils.clamp;
