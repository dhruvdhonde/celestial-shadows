import { CONFIG } from './config.js';

export function degToRad(d){ return d * Math.PI / 180; }
export function radToDeg(r){ return r * 180 / Math.PI; }

export function angularRadiusDeg(radius_km, dist_km){
  // alpha rad = atan(R/d)
  const a = Math.atan2(radius_km, dist_km);
  return radToDeg(a);
}

export function kmToScene(km){
  return km * CONFIG.sceneScale;
}

export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
