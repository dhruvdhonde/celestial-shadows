import { CONFIG } from './config.js';
import { angularRadiusDeg } from './helpers.js';

// computes umb/pen radii at moon distance using similar triangles
export function computeUmbraPenumbraAtDist(moonDist_km, sunDist_km){
  const Re = CONFIG.EARTH_RADIUS_KM;
  const Rs = CONFIG.SUN_RADIUS_KM;
  const Des = sunDist_km;
  const Lumbra = (Re * Des) / Math.max(1e-6, (Rs - Re));
  const rUmbra = Math.max(0, Re * (1 - moonDist_km / Lumbra)); // radius at moon dist
  // penumbra radius approximate via angular spread
  const sun_ang = Math.atan2(Rs, Des);
  const pen_extra = Math.tan(sun_ang) * moonDist_km;
  const rPenumbra = rUmbra + pen_extra;
  return { Lumbra, rUmbra, rPenumbra };
}

// circle-circle overlap area (for obscuration fraction)
export function circleOverlapArea(r1, r2, d){
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2)**2;
  const r1sq = r1*r1, r2sq = r2*r2;
  const alpha = Math.acos(clamp((d*d + r1sq - r2sq) / (2*d*r1), -1,1));
  const beta  = Math.acos(clamp((d*d + r2sq - r1sq) / (2*d*r2), -1,1));
  const area = r1sq*alpha + r2sq*beta - 0.5 * Math.sqrt(Math.max(0, (-d+r1+r2)*(d+r1-r2)*(d-r1+r2)*(d+r1+r2)));
  return area;
}

function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
