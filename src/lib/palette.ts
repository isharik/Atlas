import * as THREE from 'three';

/** NOVAFALL:IRIS colors as THREE.Color for use in materials/lights. */
export const C = {
  void: new THREE.Color('#101113'),
  abyss: new THREE.Color('#16171b'),
  forest900: new THREE.Color('#14121c'),
  forest700: new THREE.Color('#1e1b2e'),
  forest500: new THREE.Color('#3a3560'),
  emeraldGlow: new THREE.Color('#67e8f9'),
  emeraldBright: new THREE.Color('#67e8f9'),
  gold: new THREE.Color('#67e8f9'),
  goldBright: new THREE.Color('#8fefff'),
  parchment: new THREE.Color('#ffffff'),
  navy: new THREE.Color('#1e1b2e'),
  accent: new THREE.Color('#605a8c'),
  accentBright: new THREE.Color('#8b82c4'),
} as const;

export const hex = {
  emeraldGlow: '#67e8f9',
  emeraldBright: '#67e8f9',
  gold: '#67e8f9',
  goldBright: '#8fefff',
  parchment: '#ffffff',
  accent: '#605a8c',
};
